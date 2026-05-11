'use strict';

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

const { parseFile, extractTrialBalance, extractArAging, extractApAging, extractFixedAssets, extractMappingFile } = require('../services/dataParser');
const { mapAccounts, applyExternalMapping } = require('../services/accountMapper');

const router  = express.Router();
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv', '.xlsx', '.xls'].includes(ext)) cb(null, true);
    else cb(new Error('Only CSV, XLS and XLSX files are accepted'));
  },
});

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function sessionDir(sid) {
  const dir = path.join(UPLOADS_DIR, sid);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Build mapping suggestions for a set of TB records ────────────────────────
function buildSuggestions(tbRecords, sessionId) {
  const dir     = sessionDir(sessionId);
  const mapPath = path.join(dir, 'mapping_file.json');

  let suggestions;
  if (fs.existsSync(mapPath)) {
    const { records: extMappings } = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    suggestions = applyExternalMapping(tbRecords, extMappings);
  } else {
    suggestions = mapAccounts(tbRecords);
  }

  // Attach actual balances for the frontend display
  suggestions.forEach((s, i) => { s.balance = tbRecords[i]?.balance ?? 0; });
  return suggestions;
}

router.post('/', upload.single('file'), (req, res) => {
  try {
    const file      = req.file;
    const fileType  = req.body.file_type || 'trial_balance';
    const sessionId = req.body.session_id || uuidv4();

    if (!file) return res.status(400).json({ detail: 'No file uploaded' });

    const parsed = parseFile(file.buffer, file.originalname);
    const dir    = sessionDir(sessionId);

    let records   = [];
    let extraMeta = {};

    // ── Trial Balance ───────────────────────────────────────────────────────
    if (fileType === 'trial_balance') {
      const tbResult = extractTrialBalance(parsed);

      records = tbResult.records;
      if (!records.length)
        return res.status(422).json({ detail: 'Could not extract any accounts from this file. Ensure it has account name and balance columns.' });

      // ── Auto-save embedded mapping if present ───────────────────────────
      // If the file has its own "Mapping" column (e.g., "BS1105-Cash and bank"),
      // save it as the mapping file so every account gets 100% confidence.
      if (tbResult.embeddedMappings && tbResult.embeddedMappings.length > 0) {
        fs.writeFileSync(
          path.join(dir, 'mapping_file.json'),
          JSON.stringify({ records: tbResult.embeddedMappings, meta: { source: 'embedded' } }, null, 2)
        );
        extraMeta.embedded_mapping_count = tbResult.embeddedMappings.length;
      }

      // ── Save prior year TB if found ─────────────────────────────────────
      if (tbResult.priorRecords && tbResult.priorRecords.length > 0) {
        fs.writeFileSync(
          path.join(dir, 'trial_balance_prior.json'),
          JSON.stringify({ records: tbResult.priorRecords, meta: parsed.meta }, null, 2)
        );
        extraMeta.prior_period_count = tbResult.priorRecords.length;
        extraMeta.date_columns = tbResult.dateColumns;
      }

      // ── Build mapping suggestions ───────────────────────────────────────
      const suggestions = buildSuggestions(records, sessionId);
      extraMeta.suggestions = suggestions;

      // ── Stats: confidence breakdown ─────────────────────────────────────
      const highConf    = suggestions.filter(s => s.confidence >= 0.90).length;
      const lowConf     = suggestions.filter(s => s.confidence < 0.70 && s.suggested_statement !== 'unmapped').length;
      const unmappedCnt = suggestions.filter(s => s.suggested_statement === 'unmapped').length;
      extraMeta.mapping_stats = {
        total:        suggestions.length,
        high_conf:    highConf,
        low_conf:     lowConf,
        unmapped:     unmappedCnt,
        avg_conf:     Math.round((suggestions.reduce((s, m) => s + (m.confidence || 0), 0) / suggestions.length) * 100),
      };

    // ── Standalone Mapping File ─────────────────────────────────────────────
    } else if (fileType === 'mapping_file') {
      records = extractMappingFile(parsed);
      if (!records.length)
        return res.status(422).json({ detail: 'Could not extract mappings from this file. Expected columns: account code, account name, sub account / category, statement.' });

      // Save BEFORE building suggestions so buildSuggestions picks it up
      fs.writeFileSync(path.join(dir, 'mapping_file.json'), JSON.stringify({ records, meta: parsed.meta }, null, 2));

      // Re-generate suggestions if TB already exists for this session
      const tbPath = path.join(dir, 'trial_balance.json');
      if (fs.existsSync(tbPath)) {
        const { records: tbRecords } = JSON.parse(fs.readFileSync(tbPath, 'utf8'));
        const suggestions = buildSuggestions(tbRecords, sessionId);
        suggestions.forEach((s, i) => { s.balance = tbRecords[i]?.balance ?? 0; });
        extraMeta.suggestions      = suggestions;
        extraMeta.tb_reprocessed   = true;
      }

    // ── Prior Year Trial Balance (standalone upload) ────────────────────────
    } else if (fileType === 'trial_balance_prior') {
      const tbResult = extractTrialBalance(parsed);
      records = tbResult.records;
      if (!records.length)
        return res.status(422).json({ detail: 'Could not extract any accounts from this prior year trial balance.' });
      // Save directly as trial_balance_prior.json
      fs.writeFileSync(
        path.join(dir, 'trial_balance_prior.json'),
        JSON.stringify({ records, meta: parsed.meta }, null, 2)
      );
      extraMeta.prior_period_count = records.length;

    // ── Other file types ────────────────────────────────────────────────────
    } else if (fileType === 'ar_aging') {
      records = extractArAging(parsed);
    } else if (fileType === 'ap_aging') {
      records = extractApAging(parsed);
    } else if (fileType === 'fixed_assets') {
      records = extractFixedAssets(parsed);
    }

    // Persist to session (don't overwrite prior TB with the same key)
    if (fileType !== 'mapping_file' && fileType !== 'trial_balance_prior') {
      fs.writeFileSync(
        path.join(dir, `${fileType}.json`),
        JSON.stringify({ records, meta: parsed.meta }, null, 2)
      );
    }

    // Build preview (first 10 rows)
    const previewRows = parsed.rows.slice(0, 10).map(r =>
      parsed.headers.map(h => String(r[h] ?? ''))
    );

    res.json({
      session_id:       sessionId,
      file_type:        fileType,
      filename:         file.originalname,
      row_count:        records.length,
      preview:          { columns: parsed.headers, rows: previewRows },
      detected_columns: parsed.meta,
      ...(extraMeta.suggestions        ? { suggestions:            extraMeta.suggestions        } : {}),
      ...(extraMeta.tb_reprocessed     ? { tb_reprocessed:         true                         } : {}),
      ...(extraMeta.embedded_mapping_count != null ? { embedded_mapping_count: extraMeta.embedded_mapping_count } : {}),
      ...(extraMeta.prior_period_count != null     ? { prior_period_count:     extraMeta.prior_period_count     } : {}),
      ...(extraMeta.date_columns       ? { date_columns:           extraMeta.date_columns       } : {}),
      ...(extraMeta.mapping_stats      ? { mapping_stats:          extraMeta.mapping_stats      } : {}),
    });
  } catch (err) {
    console.error('[upload]', err);
    res.status(422).json({ detail: err.message });
  }
});

module.exports = router;
