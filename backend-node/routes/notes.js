'use strict';

const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const multer    = require('multer');
const mammoth   = require('mammoth');
const Anthropic = require('@anthropic-ai/sdk');

const router      = express.Router();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

/* ── multer for .docx uploads ──────────────────────────────── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ['.docx', '.doc'].includes(ext) ? cb(null, true) : cb(new Error('Only .docx/.doc accepted'));
  },
});

/* ═══════════════════════════════════════════════════════════════
   SHARED: Claude client helper
═══════════════════════════════════════════════════════════════ */
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here')
    throw new Error('ANTHROPIC_API_KEY not configured — edit backend-node/.env');
  return new Anthropic({ apiKey });
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — mammoth: docx → full HTML (exact verbatim content)
═══════════════════════════════════════════════════════════════ */
const MAMMOTH_OPTS = {
  styleMap: [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Heading 4'] => h4:fresh",
    "p[style-name='List Paragraph'] => ul > li:fresh",
    "r[style-name='Strong']    => strong",
    "b                         => strong",
    "i                         => em",
  ],
  convertImage: mammoth.images.imgElement(image =>
    image.read('base64').then(data =>
      ({ src: `data:${image.contentType};base64,${data}` })
    )
  ),
};

/* ═══════════════════════════════════════════════════════════════
   STEP 2a — simple heading-based split (no AI needed)
   Returns notes array if reliable (≥2 notes found), else null.
═══════════════════════════════════════════════════════════════ */
function splitByHeadings(html) {
  const headingRe = /<(h[1-4])[^>]*>([\s\S]*?)<\/h[1-4]>/gi;
  const matches   = [...html.matchAll(headingRe)];
  if (matches.length < 2) return null;

  const notes = [];
  for (let i = 0; i < matches.length; i++) {
    const m     = matches[i];
    const title = stripTags(m[2]).trim();
    if (!title) continue;

    const bodyStart = m.index + m[0].length;
    const bodyEnd   = matches[i + 1] ? matches[i + 1].index : html.length;
    const body      = html.slice(bodyStart, bodyEnd).trim() || '<p></p>';

    // Extract note number from title if present
    const numMatch  = title.match(/^(\d+)[.\s\-:)]+/);
    const noteNum   = numMatch ? parseInt(numMatch[1], 10) : i + 1;
    const cleanTitle = numMatch ? title.slice(numMatch[0].length).trim() : title;

    notes.push({ note_number: noteNum, title: cleanTitle || title, body });
  }
  return notes.length >= 2 ? notes : null;
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2b — Claude boundary detection ONLY
   Claude reads plain text, returns [{note_number, title, heading_text}]
   Server then slices the original mammoth HTML at those boundaries.
   Content is NEVER rewritten — 100% verbatim from mammoth.
═══════════════════════════════════════════════════════════════ */
async function splitWithClaudeBoundaries(html, plainText, client) {
  // Only send the first portion to Claude — we just need headings/titles
  const sampleText = plainText.slice(0, 8000);

  const msg = await client.messages.create({
    model:      'claude-haiku-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `This is a financial statements notes document.

Your ONLY task: identify each note's number, title, and the EXACT heading text as it appears in the document.

Return ONLY a valid JSON array — no explanation, no markdown code fences:
[
  {"note_number": 1, "title": "ACTIVITIES",              "heading_text": "1  ACTIVITIES"},
  {"note_number": 2, "title": "BASIS OF PREPARATION",   "heading_text": "2  BASIS OF PREPARATION"},
  ...
]

Rules:
- "heading_text" = the EXACT text of the heading line as it appears (copy it verbatim)
- "title" = the heading text WITHOUT the leading number
- Include ALL notes you can find
- Do NOT include any body text

Document text (first portion):
---
${sampleText}
---

Return ONLY the JSON array.`,
    }],
  });

  const raw = msg.content?.[0]?.text || '';
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const boundaries = JSON.parse(jsonStr);

  if (!Array.isArray(boundaries) || boundaries.length < 2) return null;

  // Now slice the mammoth HTML at each boundary using the heading_text markers
  const notes = [];

  for (let i = 0; i < boundaries.length; i++) {
    const b    = boundaries[i];
    const next = boundaries[i + 1];

    // Find the heading text in the HTML (inside any tag)
    const escapedHeading = b.heading_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const headingRe = new RegExp(escapedHeading, 'i');
    const headingMatch = html.match(headingRe);
    if (!headingMatch) continue;

    const headingIdx = html.search(headingRe);

    // Find where this heading tag ends
    const tagEnd = html.indexOf('>', headingIdx);
    // Go to end of closing tag
    const closingTagEnd = html.indexOf('</', tagEnd);
    const afterHeading  = html.indexOf('>', closingTagEnd) + 1;

    // Find start of next note
    let bodyEnd = html.length;
    if (next) {
      const nextEscaped = next.heading_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
      const nextRe  = new RegExp(nextEscaped, 'i');
      const nextIdx = html.search(nextRe);
      if (nextIdx !== -1) {
        // Find the opening tag start for the next heading
        const tagOpen = html.lastIndexOf('<', nextIdx);
        bodyEnd = tagOpen > afterHeading ? tagOpen : nextIdx;
      }
    }

    const body = html.slice(afterHeading, bodyEnd).trim() || '<p></p>';
    // Ensure note_number is always a valid integer (never undefined/null)
    const num = parseInt(b.note_number, 10);
    notes.push({ note_number: isNaN(num) ? i + 1 : num, title: b.title || '', body });
  }

  return notes.length >= 2 ? notes : null;
}

/* ── helpers ─────────────────────────────────────────────────── */
function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/* ═══════════════════════════════════════════════════════════════
   POST /notes/upload
   Upload a .docx — mammoth converts to HTML, Claude (if needed)
   identifies boundaries. Content is 100% verbatim.
═══════════════════════════════════════════════════════════════ */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file received' });
    const { session_id } = req.body;

    // ── 1. Convert docx → full HTML (verbatim, exact formatting) ──
    const htmlResult  = await mammoth.convertToHtml({ buffer: req.file.buffer }, MAMMOTH_OPTS);
    const textResult  = await mammoth.extractRawText({ buffer: req.file.buffer });
    const html        = htmlResult.value;
    const plainText   = textResult.value;

    // ── 2a. Try simple heading split first (fast, no API) ─────────
    let notes = splitByHeadings(html);

    // ── 2b. Fallback: Claude boundary detection ────────────────────
    if (!notes) {
      try {
        const client = getClient();
        notes = await splitWithClaudeBoundaries(html, plainText, client);
      } catch (aiErr) {
        console.warn('[notes/upload] Claude boundary detection failed:', aiErr.message);
      }
    }

    // ── 2c. Last resort: whole document as one note ────────────────
    if (!notes) {
      notes = [{ note_number: 1, title: 'Notes to the Financial Statements', body: html }];
    }

    // ── 2d. Normalise: ensure note_number is always a valid integer ──
    notes = notes.map((n, i) => {
      const num = parseInt(n.note_number, 10);
      return { ...n, note_number: isNaN(num) ? i + 1 : num };
    });

    // ── 3. Persist ────────────────────────────────────────────────
    if (session_id) {
      const dir = path.join(UPLOADS_DIR, session_id);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'notes.json'), JSON.stringify(notes, null, 2));
    }

    res.json({
      ok:       true,
      count:    notes.length,
      notes,
      warnings: htmlResult.messages.filter(m => m.type === 'warning').map(m => m.message),
    });
  } catch (err) {
    console.error('[notes/upload]', err);
    res.status(500).json({ detail: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /notes/ai-parse
   Paste raw text → Claude reproduces it VERBATIM into structured notes.
   Strict prompt: no omissions, no rewrites, exact wording.
═══════════════════════════════════════════════════════════════ */
router.post('/ai-parse', async (req, res) => {
  try {
    const { text, session_id } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ detail: 'No text provided' });

    const client = getClient();

    // Send in chunks if very long (Claude context limit)
    const MAX_CHARS = 14000;
    const chunks    = [];
    for (let i = 0; i < text.length; i += MAX_CHARS) chunks.push(text.slice(i, i + MAX_CHARS));

    let allNotes = [];
    let noteOffset = 0;

    for (const chunk of chunks) {
      const isFirst = chunk === chunks[0];

      const prompt = `You are a financial statement notes reproduction engine.

CRITICAL RULES — you MUST follow these without exception:
1. Reproduce EVERY WORD of the content VERBATIM — no omissions, no summarisation, no paraphrasing
2. Preserve the EXACT wording, sequence, and structure of the original
3. Split into individual notes by their numbered headings
4. Format body content as clean HTML: <p> for paragraphs, <strong> for bold, <em> for italic, <ul><li> for bullet points, <table><tr><td> for tables
5. Do NOT add, remove, or change any words
6. Include ALL paragraphs — even long ones must be reproduced in full
7. Return ONLY a valid JSON array — no markdown, no explanation

Each note object:
{
  "note_number": <integer>,
  "title": <heading text without leading number>,
  "body": <complete HTML content of the note — ALL text verbatim>
}

${isFirst ? '' : `This is a continuation. Previous notes ended at note ${noteOffset}. Continue numbering from there.`}

Document text:
---
${chunk}
---

Return ONLY the JSON array.`;

      const msg = await client.messages.create({
        model:      'claude-haiku-4-5',
        max_tokens: 8192,
        messages:   [{ role: 'user', content: prompt }],
      });

      const raw = msg.content?.[0]?.text || '';
      const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          allNotes = [...allNotes, ...parsed];
          noteOffset = allNotes.length;
        }
      } catch {
        console.error('[notes/ai-parse] JSON parse failed for chunk, raw:\n', jsonStr.slice(0, 300));
      }
    }

    if (!allNotes.length)
      return res.status(500).json({ detail: 'Could not parse notes. Try the .docx upload instead.' });

    // Renumber sequentially
    allNotes = allNotes.map((n, i) => ({ ...n, note_number: n.note_number ?? i + 1 }));

    if (session_id) {
      const dir = path.join(UPLOADS_DIR, session_id);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'notes.json'), JSON.stringify(allNotes, null, 2));
    }

    res.json({ ok: true, count: allNotes.length, notes: allNotes });
  } catch (err) {
    console.error('[notes/ai-parse]', err);
    res.status(500).json({ detail: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /notes/save
═══════════════════════════════════════════════════════════════ */
router.post('/save', (req, res) => {
  try {
    const { session_id, notes } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const dir = path.join(UPLOADS_DIR, session_id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stmtPath = path.join(dir, 'statements.json');
    if (fs.existsSync(stmtPath)) {
      const saved = JSON.parse(fs.readFileSync(stmtPath, 'utf8'));
      saved.notes = notes;
      fs.writeFileSync(stmtPath, JSON.stringify(saved, null, 2));
    }

    fs.writeFileSync(path.join(dir, 'notes.json'), JSON.stringify(notes, null, 2));
    res.json({ ok: true, count: notes.length });
  } catch (err) {
    console.error('[notes/save]', err);
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
