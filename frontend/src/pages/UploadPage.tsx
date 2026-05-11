import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api/client';
import type { AppSession, FileType } from '../types';

/* ── Financial data file types (CSV / XLS / XLSX) ────────────── */
const FILE_TYPES: {
  value: FileType; label: string; desc: string; icon: string;
  required?: boolean; badge?: string;
}[] = [
  { value: 'trial_balance',       label: 'Trial Balance',       icon: '📋', desc: 'Account codes, names, debit/credit balances', required: true },
  { value: 'trial_balance_prior', label: 'Prior Year TB',        icon: '📅', desc: 'Prior year trial balance for comparative columns', badge: 'COMPARATIVE' },
  { value: 'mapping_file',        label: 'Mapping File',         icon: '🗂️', desc: 'Pre-defined account → category assignments', badge: 'RECOMMENDED' },
  { value: 'ar_aging',            label: 'AR Aging',             icon: '👥', desc: 'Customer receivables with aging buckets' },
  { value: 'ap_aging',            label: 'AP Aging',             icon: '🏢', desc: 'Vendor payables with aging buckets' },
  { value: 'fixed_assets',        label: 'Fixed Assets',         icon: '🏭', desc: 'Asset register with cost and depreciation' },
];

const CURRENCIES = [
  { code: 'SAR', label: 'SAR – Saudi Riyal' },
  { code: 'AED', label: 'AED – UAE Dirham' },
  { code: 'KWD', label: 'KWD – Kuwaiti Dinar' },
  { code: 'BHD', label: 'BHD – Bahraini Dinar' },
  { code: 'OMR', label: 'OMR – Omani Rial' },
  { code: 'QAR', label: 'QAR – Qatari Riyal' },
  { code: 'JOD', label: 'JOD – Jordanian Dinar' },
  { code: 'EGP', label: 'EGP – Egyptian Pound' },
  { code: 'USD', label: 'USD – US Dollar' },
  { code: 'EUR', label: 'EUR – Euro' },
  { code: 'GBP', label: 'GBP – British Pound' },
  { code: 'CHF', label: 'CHF – Swiss Franc' },
  { code: 'AUD', label: 'AUD – Australian Dollar' },
  { code: 'CAD', label: 'CAD – Canadian Dollar' },
  { code: 'NZD', label: 'NZD – New Zealand Dollar' },
  { code: 'SGD', label: 'SGD – Singapore Dollar' },
  { code: 'INR', label: 'INR – Indian Rupee' },
  { code: 'ZAR', label: 'ZAR – South African Rand' },
  { code: 'TRY', label: 'TRY – Turkish Lira' },
  { code: 'MYR', label: 'MYR – Malaysian Ringgit' },
  { code: 'PKR', label: 'PKR – Pakistani Rupee' },
];

interface Props {
  session: AppSession;
  setSession: (s: AppSession) => void;
  onNext: () => void;
}

export default function UploadPage({ session, setSession, onNext }: Props) {
  const [selectedType,    setSelectedType]    = useState<FileType>('trial_balance');
  const [uploading,       setUploading]       = useState(false);
  const [error,           setError]           = useState('');
  const [previewType,     setPreviewType]      = useState<FileType | null>(null);
  const [showValidation,  setShowValidation]  = useState(false);

  // Notes-document upload state (separate from financial files)
  const [notesUploading,  setNotesUploading]  = useState(false);
  const [notesStatus,     setNotesStatus]     = useState<'idle' | 'done' | 'error'>('idle');
  const [notesMsg,        setNotesMsg]        = useState('');
  const [notesDragging,   setNotesDragging]   = useState(false);
  const [notesFilename,   setNotesFilename]   = useState('');
  const notesFileRef = useRef<HTMLInputElement>(null);

  /* ── Financial file upload ─────────────────────────────────── */
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('file_type', selectedType);
      if (session.session_id) form.append('session_id', session.session_id);
      const res  = await api.post('/upload/', form);
      const data = res.data;
      const refreshSuggestions = selectedType === 'trial_balance' ||
        (selectedType === 'mapping_file' && data.tb_reprocessed);

      let newPeriodEnd      = session.period_end;
      let newPriorPeriodEnd = session.prior_period_end;
      if (selectedType === 'trial_balance' && data.date_columns?.length) {
        const cols = data.date_columns;
        const toInputDate = (col: { date: string }) => col.date.slice(0, 10);
        if (cols.length >= 2) {
          if (!newPeriodEnd)      newPeriodEnd      = toInputDate(cols[cols.length - 1]);
          if (!newPriorPeriodEnd) newPriorPeriodEnd = toInputDate(cols[cols.length - 2]);
        } else if (cols.length === 1) {
          if (!newPeriodEnd)      newPeriodEnd = toInputDate(cols[0]);
        }
      }

      setSession({
        ...session,
        session_id:       data.session_id,
        period_end:       newPeriodEnd,
        prior_period_end: newPriorPeriodEnd,
        uploads:          { ...session.uploads, [selectedType]: data },
        suggestions:      refreshSuggestions ? data.suggestions : session.suggestions,
        mappings:         refreshSuggestions
          ? data.suggestions.map((s: any) => ({
              account_code: s.account_code, account_name: s.account_name,
              statement: s.suggested_statement, category: s.suggested_category,
              subcategory: s.suggested_subcategory, sign: s.sign,
            }))
          : session.mappings,
      });
      setPreviewType(selectedType);
    } catch (e: any) {
      if (!e.response) {
        setError('Cannot reach the backend server.\n  cd FinancialStatementGenerator\\backend-node\n  node server.js');
      } else {
        const detail = e.response?.data?.detail || e.message || 'Unknown error';
        setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
    } finally { setUploading(false); }
  }, [selectedType, session, setSession]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  /* ── Notes document upload (.docx) ─────────────────────────── */
  const uploadNotesDoc = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx', 'doc'].includes(ext || '')) {
      setNotesStatus('error'); setNotesMsg('Only .docx / .doc files are supported.'); return;
    }
    setNotesUploading(true); setNotesStatus('idle'); setNotesMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (session.session_id) fd.append('session_id', session.session_id);
      const res = await api.post('/notes/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSession({ ...session, notes: res.data.notes });
      setNotesFilename(file.name);
      setNotesStatus('done');
      setNotesMsg(`${res.data.count} notes loaded — will auto-populate the Notes step`);
    } catch (err: unknown) {
      setNotesStatus('error');
      setNotesMsg(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Upload failed.'
      );
    } finally { setNotesUploading(false); }
  };

  /* ── Validation ────────────────────────────────────────────── */
  const hasTB         = !!session.uploads?.trial_balance;
  const missingEntity = !session.entity_name.trim();
  const missingPeriod = !session.period_end;
  const canProceed    = hasTB && !missingEntity && !missingPeriod;
  const hasNotes      = (session.notes || []).length > 0;

  const handleContinue = () => {
    if (!canProceed) { setShowValidation(true); return; }
    onNext();
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Entity Details ────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#1557a0', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Entity Details</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Entity / Company Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input className="form-input" placeholder="e.g. Acme Corporation Ltd"
              value={session.entity_name}
              onChange={e => { setShowValidation(false); setSession({ ...session, entity_name: e.target.value }); }}
              style={showValidation && missingEntity ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.15)' } : {}} />
            {showValidation && missingEntity && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>⚠ Required</div>}
          </div>
          <div>
            <label className="form-label">Current Year End <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="date" className="form-input"
              value={session.period_end}
              onChange={e => {
                setShowValidation(false);
                const cur = e.target.value;
                let prior = session.prior_period_end;
                if (cur) {
                  const d = new Date(cur + 'T00:00:00');
                  d.setFullYear(d.getFullYear() - 1);
                  prior = d.toISOString().slice(0, 10);
                }
                setSession({ ...session, period_end: cur, prior_period_end: prior });
              }}
              style={showValidation && missingPeriod ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.15)' } : {}} />
            {showValidation && missingPeriod && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>⚠ Required</div>}
          </div>
          <div>
            <label className="form-label">
              Prior Year End
              {session.prior_period_end && (
                <span style={{ marginLeft: 6, fontSize: 10, color: '#1557a0', fontWeight: 700, background: '#eff6ff', padding: '1px 5px', borderRadius: 4 }}>AUTO</span>
              )}
            </label>
            <input type="date" className="form-input"
              value={session.prior_period_end || ''}
              onChange={e => setSession({ ...session, prior_period_end: e.target.value })} />
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Leave blank if single year</div>
          </div>
          <div>
            <label className="form-label">Reporting Currency</label>
            <select className="form-input"
              value={session.currency} onChange={e => setSession({ ...session, currency: e.target.value })}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Activities — optional, pre-populates Note 1 */}
        <div style={{ marginTop: 14 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Principal Activities
            <span style={{ fontSize: 10, color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '1px 6px', borderRadius: 4 }}>OPTIONAL</span>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>— pre-fills Note 1 in the Notes step</span>
          </label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Describe what the company does, e.g. Al Obeikan Printing and Packing Company is engaged in the production and sale of packaging materials including duplex cartons, rigid plastic packaging, flexible and film packaging for food and beverages…"
            value={session.activities || ''}
            onChange={e => {
              const txt = e.target.value;
              // Update Note 1 body live so it reflects whatever is typed here
              const updatedNotes = (session.notes || []).map((n, i) =>
                i === 0 ? { ...n, body: txt ? `<p>${txt}</p>` : '<p>[Describe the principal activities of the Company here.]</p>' } : n
              );
              setSession({ ...session, activities: txt, notes: updatedNotes });
            }}
            style={{ resize: 'vertical', minHeight: 64, fontFamily: 'inherit', fontSize: 13 }}
          />
        </div>
      </div>

      {/* ── Financial Files ───────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#1557a0', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Financial Data</h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>— CSV, XLS, XLSX</span>
        </div>

        {/* File type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
          {FILE_TYPES.map(ft => {
            const uploaded    = !!session.uploads?.[ft.value];
            const active      = selectedType === ft.value;
            const accentColor = ft.value === 'mapping_file' ? '#7c3aed'
                              : ft.value === 'trial_balance_prior' ? '#0891b2'
                              : '#1557a0';
            const badgeColor  = ft.value === 'trial_balance_prior'
                              ? { color: '#0891b2', bg: '#ecfeff' }
                              : { color: '#7c3aed', bg: '#ede9fe' };
            return (
              <button key={ft.value} onClick={() => setSelectedType(ft.value)} style={{
                padding: '14px 12px', borderRadius: 8, textAlign: 'left',
                border: `2px solid ${active ? accentColor : uploaded ? '#86efac' : '#e2e8f0'}`,
                background: active ? (ft.value === 'mapping_file' ? '#f5f3ff' : ft.value === 'trial_balance_prior' ? '#ecfeff' : '#eff6ff') : uploaded ? '#f0fdf4' : '#fafafa',
                cursor: 'pointer', transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{ft.icon}</span>
                  {ft.required && !uploaded && <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>REQUIRED</span>}
                  {ft.badge && !uploaded   && <span style={{ fontSize: 9, color: badgeColor.color, fontWeight: 700, background: badgeColor.bg, padding: '1px 5px', borderRadius: 4 }}>{ft.badge}</span>}
                  {uploaded               && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: active ? accentColor : '#1a2332', marginBottom: 2 }}>{ft.label}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{ft.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Drop zone */}
        <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #dbeafe', borderTopColor: '#1557a0', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <div style={{ fontWeight: 600, color: '#1557a0' }}>Processing {FILE_TYPES.find(f => f.value === selectedType)?.label}…</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{FILE_TYPES.find(f => f.value === selectedType)?.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1a2332', marginBottom: 4 }}>
                Drop your <span style={{ color: '#1557a0' }}>{FILE_TYPES.find(f => f.value === selectedType)?.label}</span> here
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>or click to browse — CSV, XLS, XLSX</div>
            </>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: 12, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <strong>⚠ Upload failed</strong>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, fontFamily: 'monospace', background: 'rgba(0,0,0,.05)', padding: '8px 10px', borderRadius: 5, width: '100%' }}>{error}</pre>
          </div>
        )}
      </div>

      {/* ── Notes Document ────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#059669', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Standard Notes Template</h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>— .docx</span>
          <span style={{ fontSize: 10, color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 7px', borderRadius: 4, marginLeft: 2 }}>OPTIONAL</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
          Upload your standard notes Word document. Notes will be pre-loaded in Step 4 — exact content, no omissions.
        </div>

        {/* Notes drop zone */}
        <div
          onDragOver={e  => { e.preventDefault(); setNotesDragging(true); }}
          onDragLeave={() => setNotesDragging(false)}
          onDrop={e => {
            e.preventDefault(); setNotesDragging(false);
            const f = e.dataTransfer.files?.[0]; if (f) uploadNotesDoc(f);
          }}
          onClick={() => !notesUploading && notesFileRef.current?.click()}
          style={{
            border: `2px dashed ${notesDragging ? '#059669' : hasNotes ? '#6ee7b7' : '#cbd5e1'}`,
            borderRadius: 8, padding: '18px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            cursor: notesUploading ? 'default' : 'pointer',
            background: notesDragging ? '#f0fdf4' : hasNotes ? '#f0fdf4' : '#fafafa',
            transition: 'all .15s',
          }}
        >
          <div style={{ fontSize: 30, flexShrink: 0 }}>
            {notesUploading ? '⏳' : hasNotes ? '✅' : '📄'}
          </div>
          <div style={{ flex: 1 }}>
            {hasNotes ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#065f46' }}>
                  {(session.notes || []).length} notes loaded from "{notesFilename || 'document'}"
                </div>
                <div style={{ fontSize: 12, color: '#059669', marginTop: 2 }}>
                  Will auto-populate Step 4 — drop a new file to replace
                </div>
              </>
            ) : notesUploading ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Processing notes document…</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Extracting notes structure</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Drop your notes .docx here or click to browse</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Supported: .docx, .doc — all notes reproduced verbatim</div>
              </>
            )}
          </div>
          {notesUploading && <div className="spinner" style={{ width: 20, height: 20, flexShrink: 0 }} />}
        </div>
        <input
          ref={notesFileRef}
          type="file" accept=".docx,.doc"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadNotesDoc(f); e.target.value = ''; }}
        />

        {notesMsg && (
          <div style={{
            marginTop: 10, padding: '7px 12px', borderRadius: 6, fontSize: 12,
            background: notesStatus === 'done'  ? '#f0fdf4' : '#fef2f2',
            color:      notesStatus === 'done'  ? '#059669' : '#dc2626',
            border:     `1px solid ${notesStatus === 'done' ? '#6ee7b7' : '#fca5a5'}`,
          }}>
            {notesStatus === 'done' ? '✓ ' : '✕ '}{notesMsg}
          </div>
        )}
      </div>

      {/* ── Imported Files Summary ────────────────────────────── */}
      {Object.keys(session.uploads || {}).length > 0 && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, background: '#16a34a', borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Imported Files</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>File Type</th><th>Filename</th><th>Rows</th><th>Status</th><th>Preview</th></tr>
            </thead>
            <tbody>
              {FILE_TYPES.filter(f => session.uploads?.[f.value]).map(ft => {
                const u = session.uploads[ft.value]!;
                return (
                  <tr key={ft.value}>
                    <td><span style={{ fontWeight: 600 }}>{ft.icon} {ft.label}</span></td>
                    <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{u.filename}</td>
                    <td><span className="badge badge-blue">{u.row_count} rows</span></td>
                    <td><span className="badge badge-green">✓ Ready</span></td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => setPreviewType(previewType === ft.value ? null : ft.value)}>
                        {previewType === ft.value ? 'Hide' : 'Preview'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {previewType && session.uploads[previewType] && (
            <div style={{ marginTop: 14, border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>{session.uploads[previewType]!.preview.columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {session.uploads[previewType]!.preview.rows.map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Action bar ───────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {!hasTB && (
            <div className="alert alert-info">
              ℹ Upload a Trial Balance to continue. All other files are optional.
            </div>
          )}
          {hasTB && showValidation && !canProceed && (
            <div className="alert alert-error">
              ⚠ Please fill in Entity Name and Current Year End before continuing.
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={handleContinue}
          style={{ padding: '10px 28px', fontSize: 14, opacity: canProceed ? 1 : 0.65, flexShrink: 0 }}>
          Continue to Account Mapping →
        </button>
      </div>
    </div>
  );
}
