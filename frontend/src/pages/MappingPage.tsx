import { useState, useEffect } from 'react';
import api from '../api/client';
import type { AppSession, AccountMapping, AccountSuggestion } from '../types';

/* ── helpers ──────────────────────────────────────────────────── */
// Only BS and IS are in scope; CF and Equity are excluded from mapping
const STMT_LABELS: Record<string, string> = {
  balance_sheet:    'Balance Sheet',
  income_statement: 'Income Statement',
  unmapped:         'Exclude / Unmapped',
};

const STMT_COLORS: Record<string, string> = {
  balance_sheet:    '#1557a0',
  income_statement: '#7c3aed',
  unmapped:         '#94a3b8',
};

// Normalise confidence: backend may return 0-1 fractions or 0-100 integers
const toPercent = (c: number): number => Math.round(c <= 1 ? c * 100 : c);
const confClass = (c: number) => { const p = toPercent(c); return p >= 85 ? 'badge-green' : p >= 60 ? 'badge-yellow' : 'badge-red'; };

type Mode = 'choose' | 'auto_review' | 'manual' | 'review';

interface Props {
  session: AppSession; setSession: (s: AppSession) => void;
  onNext: () => void; onBack: () => void;
}

export default function MappingPage({ session, setSession, onNext, onBack }: Props) {
  const [mode, setMode]           = useState<Mode>('choose');
  const [categories, setCategories] = useState<Record<string, Record<string, string[]>>>({});
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState('');
  const [filterStmt, setFilterStmt] = useState('all');
  const [lowOnly, setLowOnly]     = useState(false);

  useEffect(() => {
    api.get('/mapping/options').then(r => setCategories(r.data.options || {})).catch(() => {});
  }, []);

  // Normalize suggestion: if account_name looks like a pure number and account_code is empty, swap them
  const normalizeSugg = (s: AccountSuggestion): AccountSuggestion => {
    const nameIsNum = /^\d+$/.test(String(s.account_name || '').trim());
    const codeEmpty = !String(s.account_code || '').trim();
    if (nameIsNum && codeEmpty) return { ...s, account_code: String(s.account_name), account_name: '' };
    if (nameIsNum && !codeEmpty) return { ...s, account_code: String(s.account_name), account_name: String(s.account_code) };
    return s;
  };

  const suggestions: AccountSuggestion[] = (session.suggestions || []).map(normalizeSugg);

  // Only BS and IS are in scope; demote any CF / equity / other suggestions to unmapped
  const VALID_STMTS = new Set(['balance_sheet', 'income_statement', 'unmapped']);
  const normalizeStmt = (stmt: string) => VALID_STMTS.has(stmt) ? stmt : 'unmapped';

  const mappings: AccountMapping[] = session.mappings?.length
    ? session.mappings.map(m => ({ ...m, statement: normalizeStmt(m.statement) }))
    : suggestions.map(s => ({
        account_code: s.account_code, account_name: s.account_name,
        statement: normalizeStmt(s.suggested_statement), category: s.suggested_category,
        subcategory: s.suggested_subcategory, sign: s.sign,
      }));

  /* ── stats ────────────────────────────────────────────────── */
  const unmapped   = mappings.filter(m => m.statement === 'unmapped').length;
  const mapped     = mappings.length - unmapped;
  const lowConf    = suggestions.filter(s => toPercent(s.confidence ?? 1) < 70).length;
  const avgConf    = suggestions.length ? Math.round(suggestions.reduce((a, s) => a + toPercent(s.confidence ?? 1), 0) / suggestions.length) : 100;

  const byStatement: Record<string, number> = {};
  mappings.forEach(m => { byStatement[m.statement] = (byStatement[m.statement] || 0) + 1; });

  /* ── update one mapping ───────────────────────────────────── */
  const updateMapping = (idx: number, field: keyof AccountMapping, value: string | number) => {
    const updated = [...mappings];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'statement') { updated[idx].category = ''; updated[idx].subcategory = ''; }
    if (field === 'category')  { updated[idx].subcategory = ''; }
    setSession({ ...session, mappings: updated });
  };

  /* ── save and go ──────────────────────────────────────────── */
  const saveAndContinue = async () => {
    setSaving(true);
    try {
      await api.post('/mapping/save', { session_id: session.session_id, mappings });
      onNext();
    } catch { alert('Save failed — is the backend running?'); }
    finally { setSaving(false); }
  };

  /* ── filtered rows for manual table ──────────────────────── */
  const indexed = mappings.map((m, i) => ({ m, i, s: suggestions[i] }));
  const filtered = indexed.filter(({ m, s }) => {
    const q = filter.toLowerCase();
    return (
      (!q || m.account_name.toLowerCase().includes(q) || m.account_code.toLowerCase().includes(q)) &&
      (filterStmt === 'all' || m.statement === filterStmt) &&
      (!lowOnly || toPercent(s?.confidence ?? 1) < 70)
    );
  });

  /* ────────────────────────────────────────────────────────── */
  /* VIEW: CHOOSE MODE                                          */
  /* ────────────────────────────────────────────────────────── */
  if (mode === 'choose') {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#1a2332' }}>Account Mapping</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            {mappings.length} accounts detected from your trial balance. Choose how to map them.
          </p>
        </div>

        {/* Confidence summary bar */}
        <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Overall Mapping Confidence</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: avgConf >= 80 ? '#16a34a' : avgConf >= 60 ? '#d97706' : '#dc2626' }}>{avgConf}%</span>
            </div>
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avgConf}%`, background: avgConf >= 80 ? '#16a34a' : avgConf >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 4, transition: 'width .5s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            {[{ l: 'Total', v: mappings.length, c: '#1a2332' }, { l: 'Mapped', v: mapped, c: '#16a34a' }, { l: 'Low Confidence', v: lowConf, c: '#d97706' }, { l: 'Unmapped', v: unmapped, c: '#dc2626' }].map(k => (
              <div key={k.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two mode cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* AUTO */}
          <div
            onClick={() => setMode('auto_review')}
            style={{ cursor: 'pointer', borderRadius: 14, border: '2px solid #bfdbfe', background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', padding: '28px 24px', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1557a0'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(21,87,160,.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>🤖</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f', marginBottom: 8 }}>Automated Mapping</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>
              Let the AI map all {mappings.length} accounts automatically using keyword matching and fuzzy logic. Review the summary, then generate your statements.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {[
                `✓  ${mapped} accounts mapped automatically`,
                `✓  ${avgConf}% average confidence score`,
                lowConf > 0 ? `⚠  ${lowConf} accounts below 70% confidence` : '✓  All accounts high confidence',
              ].map(t => (
                <div key={t} style={{ fontSize: 12, color: t.startsWith('⚠') ? '#d97706' : '#16a34a', fontWeight: 500 }}>{t}</div>
              ))}
            </div>
            <div style={{ background: '#1557a0', color: '#fff', borderRadius: 8, padding: '11px 18px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
              Use Automated Mapping →
            </div>
          </div>

          {/* MANUAL */}
          <div
            onClick={() => setMode('manual')}
            style={{ cursor: 'pointer', borderRadius: 14, border: '2px solid #d1fae5', background: 'linear-gradient(135deg, #f0fdf4, #f0fdf4)', padding: '28px 24px', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(22,163,74,.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d1fae5'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>✍️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#14532d', marginBottom: 8 }}>Review &amp; Correct</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>
              Start from the AI suggestions, then manually review and override any mappings. Ideal for non-standard charts of accounts or first-time setups.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {[
                '✓  AI pre-fills all suggestions',
                '✓  Override statement, category, subcategory',
                '✓  Filter by confidence or statement',
              ].map(t => (
                <div key={t} style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>{t}</div>
              ))}
            </div>
            <div style={{ background: '#16a34a', color: '#fff', borderRadius: 8, padding: '11px 18px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
              Review &amp; Correct →
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button className="btn-secondary" onClick={onBack}>← Back to Import</button>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────── */
  /* VIEW: AUTO REVIEW                                          */
  /* ────────────────────────────────────────────────────────── */
  if (mode === 'auto_review') {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setMode('choose')}>← Change Mode</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2332' }}>Automated Mapping — Summary</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>AI has mapped all accounts. Review the breakdown below.</div>
          </div>
        </div>

        {/* Breakdown by statement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(STMT_LABELS).map(([key, label]) => {
            const count = byStatement[key] || 0;
            const pct = mappings.length ? Math.round((count / mappings.length) * 100) : 0;
            return (
              <div key={key} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${STMT_COLORS[key]}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: STMT_COLORS[key] }}>{count}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginTop: 3, lineHeight: 1.3 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{pct}% of accounts</div>
              </div>
            );
          })}
        </div>

        {/* Confidence distribution */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2332', marginBottom: 12 }}>Confidence Distribution</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'High (≥85%)', count: suggestions.filter(s => toPercent(s.confidence ?? 1) >= 85).length, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Medium (60–84%)', count: suggestions.filter(s => { const p = toPercent(s.confidence ?? 1); return p >= 60 && p < 85; }).length, color: '#d97706', bg: '#fffbeb' },
              { label: 'Low (<60%)', count: suggestions.filter(s => toPercent(s.confidence ?? 1) < 60).length, color: '#dc2626', bg: '#fef2f2' },
            ].map(b => (
              <div key={b.label} style={{ flex: 1, background: b.bg, borderRadius: 8, padding: '12px 14px', border: `1px solid ${b.color}22` }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: b.color }}>{b.count}</div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginTop: 3 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Low confidence accounts */}
        {lowConf > 0 && (
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#d97706', marginBottom: 10 }}>
              ⚠ {lowConf} accounts with low confidence — consider reviewing
            </div>
            <div style={{ maxHeight: 160, overflowY: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Account</th><th>Auto-Mapped To</th><th style={{ textAlign: 'center' }}>Confidence</th></tr></thead>
                <tbody>
                  {suggestions.filter(s => toPercent(s.confidence ?? 1) < 70).map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{s.account_name}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{STMT_LABELS[s.suggested_statement]} › {s.suggested_subcategory}</td>
                      <td style={{ textAlign: 'center' }}><span className={`badge ${confClass(s.confidence ?? 1)}`}>{toPercent(s.confidence ?? 1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setMode('manual')}>
                ✍ Open Manual Correction for these accounts
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={() => setMode('choose')}>← Back</button>
          <button className="btn-primary" onClick={() => setMode('review')} style={{ padding: '10px 28px' }}>
            Review &amp; Confirm →
          </button>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────── */
  /* VIEW: MANUAL TABLE                                         */
  /* ────────────────────────────────────────────────────────── */
  if (mode === 'manual') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px - 56px)', minHeight: 0, gap: 10 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setMode('choose')}>← Change Mode</button>
          <input className="form-input" style={{ width: 200 }} placeholder="🔍 Search account…"
            value={filter} onChange={e => setFilter(e.target.value)} />
          <select className="form-input" style={{ width: 170 }} value={filterStmt} onChange={e => setFilterStmt(e.target.value)}>
            <option value="all">All Statements</option>
            {Object.entries(STMT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} />
            Low confidence only
          </label>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
            {filtered.length} / {mappings.length} accounts
          </div>
        </div>

        {/* Table — fills remaining height */}
        <div style={{ flex: 1, minHeight: 0, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 960 }}>
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Code</th>
                  <th style={{ width: 220 }}>Account Name</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Balance</th>
                  <th style={{ width: 150 }}>Statement</th>
                  <th style={{ width: 180 }}>Category</th>
                  <th style={{ width: 190 }}>Subcategory</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Sign</th>
                  <th style={{ width: 70, textAlign: 'center' }}>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ m, i, s }) => {
                  const cats    = categories[m.statement] || {};
                  const subcats = (cats[m.category] || []) as string[];
                  const conf    = s?.confidence ?? 100;
                  const balance = (s as any)?.balance;
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{m.account_code}</td>
                      <td style={{ fontWeight: 500 }}>{m.account_name}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: (balance ?? 0) < 0 ? '#dc2626' : '#374151' }}>
                        {balance !== undefined ? Number(balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ''}
                      </td>
                      <td>
                        <select className="form-input" style={{ padding: '4px 7px', fontSize: 12 }}
                          value={m.statement} onChange={e => updateMapping(i, 'statement', e.target.value)}>
                          {Object.entries(STMT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="form-input" style={{ padding: '4px 7px', fontSize: 12 }}
                          value={m.category} onChange={e => updateMapping(i, 'category', e.target.value)}>
                          <option value="">— Select —</option>
                          {Object.keys(cats).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="form-input" style={{ padding: '4px 7px', fontSize: 12 }}
                          value={m.subcategory} onChange={e => updateMapping(i, 'subcategory', e.target.value)}>
                          <option value="">— Select —</option>
                          {subcats.map((sc: string) => <option key={sc} value={sc}>{sc}</option>)}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <select className="form-input" style={{ padding: '3px 5px', fontSize: 11, width: 54 }}
                          value={m.sign} onChange={e => updateMapping(i, 'sign', Number(e.target.value))}>
                          <option value={1}>+1</option>
                          <option value={-1}>-1</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${confClass(conf)}`}>{toPercent(conf)}%</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No accounts match the filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <button className="btn-secondary" onClick={() => setMode('choose')}>← Back</button>
          <button className="btn-primary" onClick={() => setMode('review')} style={{ padding: '10px 28px' }}>
            Review &amp; Confirm →
          </button>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────── */
  /* VIEW: REVIEW & CONFIRM                                     */
  /* ────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}
          onClick={() => setMode(mode === 'review' ? (session.mappings?.length ? 'manual' : 'auto_review') : 'manual')}>
          ← Edit Mappings
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2332' }}>Review &amp; Confirm Mappings</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Check the final mapping before generating your statements.</div>
        </div>
      </div>

      {/* Grouped summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(STMT_LABELS).map(([stmt, stmtLabel]) => {
          const rows = mappings.filter(m => m.statement === stmt);
          if (!rows.length) return null;
          const grouped: Record<string, AccountMapping[]> = {};
          rows.forEach(r => { grouped[r.category] = [...(grouped[r.category] || []), r]; });

          return (
            <div key={stmt} className="card" style={{ overflow: 'hidden', borderTop: `3px solid ${STMT_COLORS[stmt]}` }}>
              <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: STMT_COLORS[stmt] }}>{stmtLabel}</span>
                <span className="badge badge-blue">{rows.length} accounts</span>
              </div>
              <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(grouped).map(([cat, accs]) => (
                  <div key={cat}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>{cat}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {accs.map((a, i) => {
                        const sugg = suggestions.find(s => s.account_code === a.account_code || s.account_name === a.account_name);
                        const conf = sugg?.confidence ?? 100;
                        return (
                          <div key={i} style={{
                            background: toPercent(conf) < 70 ? '#fffbeb' : '#f0f9ff',
                            border: `1px solid ${conf < 70 ? '#fcd34d' : '#bfdbfe'}`,
                            borderRadius: 6, padding: '3px 10px',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            <span style={{ fontSize: 12, color: '#374151' }}>{a.account_name}</span>
                            <span style={{ fontSize: 10, color: toPercent(conf) < 70 ? '#d97706' : '#1557a0', fontWeight: 700 }}>{toPercent(conf)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unmapped warning */}
      {unmapped > 0 && (
        <div className="alert alert-warn">
          ⚠ <strong>{unmapped} account{unmapped > 1 ? 's' : ''} will be excluded</strong> (mapped to "Unmapped"). They won't appear in the statements.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={() => setMode('manual')}>← Edit Mappings</button>
        <button
          className="btn-primary"
          onClick={saveAndContinue}
          disabled={saving}
          style={{ padding: '10px 32px', fontSize: 14, background: '#16a34a' }}
        >
          {saving
            ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
            : '✓ Confirm & Generate Statements →'}
        </button>
      </div>
    </div>
  );
}
