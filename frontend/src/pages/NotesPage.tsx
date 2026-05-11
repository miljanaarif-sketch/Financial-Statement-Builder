import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import api from '../api/client';
import type { AppSession, Note } from '../types';

/* ── TipTap rich-text editor ─────────────────────────────────── */
function NoteEditor({ note, onChange }: { note: Note; onChange: (body: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: note.body,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (label: string, active: boolean, action: () => void) => (
    <button
      key={label}
      onMouseDown={e => { e.preventDefault(); action(); }}
      style={{
        padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 5,
        border: `1px solid ${active ? '#1557a0' : '#e2e8f0'}`,
        background: active ? '#1557a0' : '#fff', color: active ? '#fff' : '#374151',
        cursor: 'pointer',
      }}
    >{label}</button>
  );

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {btn('B',       editor.isActive('bold'),                  () => editor.chain().focus().toggleBold().run())}
        {btn('I',       editor.isActive('italic'),                () => editor.chain().focus().toggleItalic().run())}
        {btn('H2',      editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('• List',  editor.isActive('bulletList'),            () => editor.chain().focus().toggleBulletList().run())}
        {btn('1. List', editor.isActive('orderedList'),           () => editor.chain().focus().toggleOrderedList().run())}
      </div>
      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Import Panel — two tabs: Upload .docx  |  Paste Text (AI)
═══════════════════════════════════════════════════════════════ */
function ImportPanel({ sessionId, onImported }: {
  sessionId:  string;
  onImported: (notes: Note[]) => void;
}) {
  const [tab, setTab]         = useState<'upload' | 'paste'>('upload');
  const [status, setStatus]   = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [text, setText]       = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setStatus('idle'); setMessage(''); };

  /* ── Upload .docx ─────────────────────────────────────────── */
  const doUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx', 'doc'].includes(ext || '')) {
      setStatus('error'); setMessage('Only .docx / .doc files are supported.'); return;
    }
    setStatus('busy'); setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('session_id', sessionId);
      const res = await api.post('/notes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onImported(res.data.notes as Note[]);
      setStatus('done');
      setMessage(`✓  ${res.data.count} notes loaded from "${file.name}" — exact content preserved`);
    } catch (err: unknown) {
      setStatus('error');
      setMessage((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Upload failed.');
    }
  };

  /* ── Paste + AI parse ─────────────────────────────────────── */
  const doParse = async () => {
    if (!text.trim()) return;
    setStatus('busy'); setMessage('');
    try {
      const res = await api.post('/notes/ai-parse', { text, session_id: sessionId });
      onImported(res.data.notes as Note[]);
      setStatus('done');
      setMessage(`✓  ${res.data.count} notes parsed and loaded`);
      setText('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Parse failed. Check API key in backend .env');
    }
  };

  const tabBtn = (key: 'upload' | 'paste', label: string) => (
    <button
      onClick={() => { setTab(key); reset(); }}
      style={{
        padding: '8px 20px', fontSize: 13, fontWeight: tab === key ? 700 : 500,
        color: tab === key ? '#1557a0' : '#64748b',
        borderBottom: `2px solid ${tab === key ? '#1557a0' : 'transparent'}`,
        border: 'none', background: 'none', cursor: 'pointer', marginBottom: -1,
      }}
    >{label}</button>
  );

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Tab strip */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 20px', background: '#f8fafc' }}>
        {tabBtn('upload', '📄  Upload .docx  (recommended — exact)')}
        {tabBtn('paste',  '✦  Paste Text  (AI parse)')}
      </div>

      <div style={{ padding: 20 }}>

        {/* ── UPLOAD TAB ─────────────────────────────────────── */}
        {tab === 'upload' && (
          <>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              mammoth converts the Word document to exact HTML — <strong>no content is changed, omitted, or restructured.</strong>
              {' '}Note boundaries are detected automatically (Claude assists only if needed).
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) doUpload(f); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#1557a0' : status === 'busy' ? '#93c5fd' : '#cbd5e1'}`,
                borderRadius: 8, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: status === 'busy' ? 'default' : 'pointer',
                background: dragging ? '#eff6ff' : '#fafafa',
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 32 }}>{status === 'busy' ? '⏳' : '📄'}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1a2332' }}>
                  {status === 'busy' ? 'Processing document…' : 'Drop your .docx here or click to browse'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  All notes reproduced verbatim — tables, paragraphs, lists preserved
                </div>
              </div>
              {status === 'busy' && <div className="spinner" style={{ width: 20, height: 20, marginLeft: 'auto' }} />}
            </div>
            <input ref={fileRef} type="file" accept=".docx,.doc" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) doUpload(f); e.target.value = ''; }} />
          </>
        )}

        {/* ── PASTE TAB ──────────────────────────────────────── */}
        {tab === 'paste' && (
          <>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              Paste your full notes text. Claude AI will reproduce it verbatim into structured notes.
              For best fidelity, use <strong>Upload .docx</strong> instead.
            </div>

            <textarea
              value={text}
              onChange={e => { setText(e.target.value); reset(); }}
              disabled={status === 'busy'}
              placeholder={`Paste all notes here, e.g.:\n\n1  ACTIVITIES\nAl Obeikan Printing and Packing Company...\n\n2  BASIS OF PREPARATION\nThe consolidated financial statements...`}
              style={{
                width: '100%', height: 180, padding: '10px 12px', boxSizing: 'border-box',
                border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13,
                fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical',
                outline: 'none', color: '#1a2332',
              }}
              onFocus={e  => (e.target.style.borderColor = '#1557a0')}
              onBlur={e   => (e.target.style.borderColor = '#e2e8f0')}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {text.trim() ? `${text.trim().split(/\s+/).length.toLocaleString()} words` : 'Supports any format'}
              </div>
              <button
                className="btn-primary"
                onClick={doParse}
                disabled={!text.trim() || status === 'busy'}
                style={{ padding: '8px 22px', fontSize: 13,
                  background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none',
                  opacity: (!text.trim() || status === 'busy') ? 0.6 : 1 }}
              >
                {status === 'busy'
                  ? <span style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div className="spinner" style={{ width:14, height:14 }} /> Parsing…
                    </span>
                  : '✦  Parse with Claude →'}
              </button>
            </div>
          </>
        )}

        {/* Status message */}
        {message && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 6, fontSize: 12,
            background: status === 'done' ? '#f0fdf4' : '#fef2f2',
            color:      status === 'done' ? '#16a34a' : '#dc2626',
            border:     `1px solid ${status === 'done' ? '#bbf7d0' : '#fca5a5'}`,
          }}>{message}</div>
        )}
      </div>
    </div>
  );
}

/* ── Props ───────────────────────────────────────────────────── */
interface Props {
  session:    AppSession;
  setSession: (s: AppSession) => void;
  onNext:     () => void;
  onBack:     () => void;
}

/* ── Main page ───────────────────────────────────────────────── */
export default function NotesPage({ session, setSession, onNext, onBack }: Props) {
  const [saving,   setSaving]   = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  const notes: Note[] = session.notes || [];

  const updateNote = (idx: number, field: keyof Note, value: string | number) =>
    setSession({ ...session, notes: notes.map((n, i) => i === idx ? { ...n, [field]: value } : n) });

  const addNote = () => {
    const n: Note = { note_number: notes.length + 1, title: 'New Note', body: '<p></p>' };
    setSession({ ...session, notes: [...notes, n] });
    setExpanded(notes.length);
  };

  const removeNote = (idx: number) => {
    const updated = notes.filter((_, i) => i !== idx).map((n, i) => ({ ...n, note_number: i + 1 }));
    setSession({ ...session, notes: updated });
    setExpanded(null);
  };

  const moveNote = (idx: number, dir: -1 | 1) => {
    const updated = [...notes];
    const target  = idx + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setSession({ ...session, notes: updated.map((n, i) => ({ ...n, note_number: i + 1 })) });
    setExpanded(target);
  };

  const handleImported = (imported: Note[]) => {
    setSession({ ...session, notes: imported.map((n, i) => ({ ...n, note_number: n.note_number ?? i + 1 })) });
    setExpanded(0);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/notes/save', { session_id: session.session_id, notes });
      onNext();
    } catch { alert('Failed to save notes. Is the backend running?'); }
    finally  { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a2332' }}>Notes to Financial Statements</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Upload your .docx for exact reproduction, or paste text for AI parsing.
          </p>
        </div>
        <button className="btn-success" onClick={addNote}>+ Add Note</button>
      </div>

      {/* ── Import panel ───────────────────────────────────────── */}
      <ImportPanel sessionId={session.session_id} onImported={handleImported} />

      {/* ── Empty state ────────────────────────────────────────── */}
      {notes.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No notes yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Upload your .docx or paste text above to get started.</div>
        </div>
      )}

      {/* ── Note cards ─────────────────────────────────────────── */}
      {notes.map((note, idx) => (
        <div key={idx} className="card" style={{ overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              cursor: 'pointer', background: expanded === idx ? '#f0f6ff' : '#fff',
              borderBottom: expanded === idx ? '1px solid #e2e8f0' : 'none',
              transition: 'background .15s',
            }}
          >
            {/* Editable note number badge */}
            <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
              <input
                type="text"
                value={note.note_number}
                onChange={e => updateNote(idx, 'note_number', e.target.value as unknown as number)}
                title="Click to edit note number"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: '#1557a0', color: '#fff',
                  fontWeight: 700, fontSize: 13, textAlign: 'center',
                  border: '2px solid transparent', outline: 'none', cursor: 'text', padding: 0,
                  transition: 'border-color .15s',
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#93c5fd'}
                onBlur={e  => (e.target as HTMLInputElement).style.borderColor = 'transparent'}
              />
            </div>

            {/* Title */}
            <input
              className="form-input"
              style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 600, fontSize: 14, color: '#1a2332', padding: 0 }}
              value={note.title}
              onClick={e => e.stopPropagation()}
              onChange={e => updateNote(idx, 'title', e.target.value)}
              placeholder="Note title…"
            />

            {/* Controls */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => moveNote(idx, -1)} disabled={idx === 0}>↑</button>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => moveNote(idx, 1)} disabled={idx === notes.length - 1}>↓</button>
              <button
                style={{ padding: '4px 10px', fontSize: 12, borderRadius: 5, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                onClick={() => removeNote(idx)}>✕ Remove</button>
            </div>

            <span style={{ color: '#94a3b8', fontSize: 14 }}>{expanded === idx ? '▲' : '▼'}</span>
          </div>

          {expanded === idx && (
            <div style={{ padding: '14px 16px' }}>
              <NoteEditor
                key={`note-${idx}-${note.title}`}
                note={note}
                onChange={body => updateNote(idx, 'body', body)}
              />
            </div>
          )}
        </div>
      ))}

      {/* ── Navigation ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Statements</button>
        <button className="btn-primary" onClick={save} disabled={saving} style={{ padding: '10px 28px', fontSize: 14 }}>
          {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : 'Save Notes & Export →'}
        </button>
      </div>
    </div>
  );
}
