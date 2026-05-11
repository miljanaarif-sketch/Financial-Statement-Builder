import { useState, useEffect } from 'react';
import api from '../api/client';
import type { AppSession, Statements } from '../types';

type Tab = 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity';

// ── Number formatter: negatives in (brackets), zero = em dash ────────────────
const fmt = (n: number) =>
  n < 0  ? `(${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
  : n === 0 ? '—'
  : n.toLocaleString(undefined, { minimumFractionDigits: 2 });

type RowType = 'item' | 'section-head' | 'subtotal' | 'total' | 'grand' | 'divider' | 'group';

// ── Table row — 3-column layout: Label | Current Year | Prior Year ─────────
// hp (hasPrior) controls whether the 3rd column is rendered
function R({ label, val, prior, indent = 0, t = 'item', hp = false }: {
  label: string;
  val?: number;
  prior?: number;
  indent?: number;
  t?: RowType;
  hp?: boolean;
}) {
  const cols = hp ? 3 : 2;

  if (t === 'divider') return <tr><td colSpan={cols + 1} style={{ padding: '6px 0' }} /></tr>;

  if (t === 'section-head') return (
    <tr>
      <td colSpan={cols + 1} style={{
        padding: '10px 16px 3px', fontSize: 11, fontWeight: 700, color: '#374151',
        textTransform: 'uppercase', letterSpacing: '.6px', borderTop: '1px solid #d1d5db',
      }}>{label}</td>
    </tr>
  );

  if (t === 'group') return (
    <tr><td colSpan={cols + 1} style={{
      padding: '8px 16px 2px', fontSize: 11, fontWeight: 800,
      color: '#1a2332', textTransform: 'uppercase', letterSpacing: '.6px',
      background: '#f8fafc', borderTop: '2px solid #d1d5db',
    }}>{label}</td></tr>
  );

  const isTotal = t === 'grand' || t === 'total' || t === 'subtotal';
  const fw      = isTotal ? 700 : undefined;
  const fs      = t === 'grand' ? 13 : 12;
  const clr     = '#1a2332';
  const negClr  = '#dc2626';

  let rowStyle: React.CSSProperties = {};
  if      (t === 'grand')    rowStyle = { borderTop: '2px solid #1a2332', borderBottom: '3px double #1a2332' };
  else if (t === 'total')    rowStyle = { borderTop: '1px solid #94a3b8', borderBottom: '2px solid #1a2332' };
  else if (t === 'subtotal') rowStyle = { borderTop: '1px solid #d1d5db' };
  else                       rowStyle = { borderBottom: '1px solid #f1f5f9' };

  return (
    <tr
      style={rowStyle}
      onMouseEnter={e => { if (t === 'item') (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
      onMouseLeave={e => { if (t === 'item') (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      {/* Label */}
      <td style={{
        padding: '5px 16px',
        paddingLeft: t === 'item' ? `${28 + indent * 12}px` : 16,
        fontSize: fs, fontWeight: fw, color: clr,
      }}>
        {label}
      </td>

      {/* Current year */}
      <td style={{
        padding: '5px 16px', textAlign: 'right', width: 155,
        fontFamily: 'monospace', fontSize: fs, fontWeight: fw,
        color: val !== undefined && val < 0 ? negClr : clr,
      }}>
        {val !== undefined ? fmt(val) : ''}
      </td>

      {/* Prior year — only rendered when hp=true */}
      {hp && (
        <td style={{
          padding: '5px 16px', textAlign: 'right', width: 145,
          fontFamily: 'monospace', fontSize: fs, fontWeight: fw ? 400 : undefined,
          color: prior !== undefined && prior < 0 ? negClr : '#64748b',
        }}>
          {prior !== undefined ? fmt(prior) : ''}
        </td>
      )}
    </tr>
  );
}

// ── Section block ────────────────────────────────────────────────────────────
function Sect({ title, sec, priorSec, hp = false }: {
  title: string; sec: any; priorSec?: any; hp?: boolean;
}) {
  const priorMap: Record<string, number> = {};
  if (priorSec) for (const it of (priorSec.items || [])) priorMap[it.label] = it.amount;

  return <>
    <R label={title} t="section-head" hp={hp} />
    {sec.items.map((it: any, i: number) => (
      <R key={i} label={it.label} val={it.amount} prior={priorMap[it.label]} indent={1} hp={hp} />
    ))}
    <R label={`Total ${title}`} val={sec.total} prior={priorSec?.total} t="subtotal" hp={hp} />
  </>;
}

// ── KPI mini card ────────────────────────────────────────────────────────────
function Kpi({ label, val, curr }: { label: string; val: number; curr: string }) {
  const neg = val < 0;
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '10px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: neg ? '#dc2626' : '#1a2332', lineHeight: 1, fontFamily: 'monospace' }}>
        {neg
          ? `(${Math.abs(val).toLocaleString(undefined, { maximumFractionDigits: 0 })})`
          : val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{curr}</div>
    </div>
  );
}

interface Props {
  session: AppSession; setSession: (s: AppSession) => void;
  onNext: () => void; onBack: () => void;
}

export default function StatementsPage({ session, setSession, onNext, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('balance_sheet');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const stmts: Statements | null = session.statements;
  const c   = session.currency || 'SAR';
  const hp  = !!stmts?.prior_balance_sheet;   // has prior year data

  useEffect(() => { if (!stmts) generate(); }, []);

  const generate = async () => {
    setGenerating(true); setError('');
    try {
      const res = await api.post('/statements/generate', {
        session_id:       session.session_id,
        entity_name:      session.entity_name,
        period_end:       session.period_end,
        prior_period_end: session.prior_period_end || '',
        currency:         session.currency,
        mappings:         session.mappings,
      });
      // Preserve any notes the user already imported (Step 1 upload or Step 4 import).
      // Only fall back to the auto-generated notes if nothing was loaded yet.
      const keepNotes = (session.notes && session.notes.length > 0)
        ? session.notes
        : (res.data.notes || []);
      setSession({ ...session, statements: res.data.statements, notes: keepNotes });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Generation failed — is the backend running?');
    } finally { setGenerating(false); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'balance_sheet',    label: 'Balance Sheet'      },
    { key: 'income_statement', label: 'Income Statement'   },
    { key: 'cash_flow',        label: 'Cash Flow'          },
    { key: 'equity',           label: 'Changes in Equity'  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px - 56px)', minHeight: 0, gap: 10 }}>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2332' }}>{session.entity_name || 'Financial Statements'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Period ending {session.period_end} · {c}</div>
        </div>
        <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={generate} disabled={generating}>
          {generating ? '⟳ Regenerating…' : '⟳ Regenerate'}
        </button>
      </div>

      {/* ── KPI strip ────────────────────────────────────────── */}
      {stmts && (
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Kpi label="Total Assets"      val={stmts.balance_sheet.total_assets}         curr={c} />
          <Kpi label="Net Income"        val={stmts.income_statement.net_income}         curr={c} />
          <Kpi label="Total Equity"      val={stmts.balance_sheet.total_equity}          curr={c} />
          <Kpi label="Net Cash Flow"     val={stmts.cash_flow.net_change_in_cash}        curr={c} />
          <Kpi label="Gross Profit"      val={stmts.income_statement.gross_profit}       curr={c} />
          <Kpi label="Total Liabilities" val={stmts.balance_sheet.total_liabilities}     curr={c} />
        </div>
      )}

      {/* ── Alerts ───────────────────────────────────────────── */}
      {error && <div className="alert alert-error" style={{ flexShrink: 0 }}>⚠ {error}</div>}
      {stmts && Math.abs(stmts.balance_sheet.balance_check) < 0.01 && (
        <div className="alert alert-success" style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12 }}>
          ✓ Balance Sheet ties out — Assets = Liabilities + Equity
        </div>
      )}
      {stmts && Math.abs(stmts.balance_sheet.balance_check) > 0.01 && (
        <div className="alert alert-warn" style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12 }}>
          ⚠ Imbalance: {c} {Math.abs(stmts.balance_sheet.balance_check).toLocaleString(undefined, { minimumFractionDigits: 2 })} — check unmapped accounts
        </div>
      )}

      {/* ── Generating spinner ────────────────────────────────── */}
      {generating && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #dbeafe', borderTopColor: '#1557a0', borderRadius: '50%', animation: 'spin .7s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, color: '#1557a0' }}>Generating statements…</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Mapping accounts and calculating tie-outs</div>
        </div>
      )}

      {/* ── Statements card ───────────────────────────────────── */}
      {stmts && !generating && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Tab bar + column headers */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', flexShrink: 0, alignItems: 'stretch' }}>
            {TABS.map(t => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '10px 22px', fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
                  color: tab === t.key ? '#1557a0' : '#6b7280',
                  borderBottom: `2px solid ${tab === t.key ? '#1557a0' : 'transparent'}`,
                  marginBottom: -2, border: 'none', background: 'none', cursor: 'pointer',
                  transition: 'all .15s', whiteSpace: 'nowrap',
                }}>
                {t.label}
              </button>
            ))}

            {/* Column headers pushed right — aligned with table columns */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 16, gap: 0 }}>
              <div style={{
                width: 155, textAlign: 'right', fontSize: 11, fontWeight: 700,
                color: '#1557a0', letterSpacing: '.4px', fontFamily: 'monospace',
                paddingRight: 0,
              }}>
                {session.period_end || 'Current Year'}
              </div>
              {hp && (
                <div style={{
                  width: 145, textAlign: 'right', fontSize: 11, fontWeight: 700,
                  color: '#94a3b8', letterSpacing: '.4px', fontFamily: 'monospace',
                }}>
                  {session.prior_period_end || 'Prior Year'}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable statement body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <colgroup>
                <col />                               {/* label — fluid */}
                <col style={{ width: 155 }} />        {/* current year */}
                {hp && <col style={{ width: 145 }} />} {/* prior year */}
              </colgroup>
              <tbody>

                {/* ══ BALANCE SHEET ════════════════════════════ */}
                {tab === 'balance_sheet' && (() => {
                  const bs  = stmts.balance_sheet;
                  const pbs = stmts.prior_balance_sheet;
                  return <>
                    <R label="ASSETS" t="group" hp={hp} />
                    {['Non-Current Assets', 'Current Assets'].filter(s => bs.sections[s]).map(s => (
                      <Sect key={s} title={s} sec={bs.sections[s]} priorSec={pbs?.sections?.[s]} hp={hp} />
                    ))}
                    <R label="TOTAL ASSETS" val={bs.total_assets} prior={pbs?.total_assets} t="grand" hp={hp} />

                    <R label="" t="divider" hp={hp} />
                    <R label="EQUITY" t="group" hp={hp} />
                    {bs.sections['Equity'] && (
                      <Sect title="Equity" sec={bs.sections['Equity']} priorSec={pbs?.sections?.['Equity']} hp={hp} />
                    )}
                    <R label="TOTAL EQUITY" val={bs.total_equity} prior={pbs?.total_equity} t="total" hp={hp} />

                    <R label="" t="divider" hp={hp} />
                    <R label="LIABILITIES" t="group" hp={hp} />
                    {['Non-Current Liabilities', 'Current Liabilities'].filter(s => bs.sections[s]).map(s => (
                      <Sect key={s} title={s} sec={bs.sections[s]} priorSec={pbs?.sections?.[s]} hp={hp} />
                    ))}
                    <R label="TOTAL LIABILITIES"              val={bs.total_liabilities}             prior={pbs?.total_liabilities}             t="total" hp={hp} />
                    <R label="TOTAL EQUITY AND LIABILITIES"   val={bs.total_liabilities_and_equity}  prior={pbs?.total_liabilities_and_equity}  t="grand" hp={hp} />
                  </>;
                })()}

                {/* ══ INCOME STATEMENT ══════════════════════════ */}
                {tab === 'income_statement' && (() => {
                  const is  = stmts.income_statement;
                  const pis = stmts.prior_income_statement;
                  const rev  = is.sections['Revenue'];
                  const cos  = is.sections['Cost of Sales'];
                  const opex = is.sections['Operating Expenses'];
                  const fin  = is.sections['Finance Costs'];
                  const tax  = is.sections['Income Tax'];
                  const prev = (sec: string) => pis?.sections?.[sec];
                  const priorItem = (sec: string, lbl: string) =>
                    prev(sec)?.items?.find((i: any) => i.label === lbl)?.amount;

                  return <>
                    {/* Revenue */}
                    {rev && rev.items.length === 1 && (
                      <R label={rev.items[0].label} val={rev.items[0].amount} prior={prev('Revenue')?.items?.[0]?.amount} t="subtotal" hp={hp} />
                    )}
                    {rev && rev.items.length > 1 && <>
                      <R label="Revenue" t="section-head" hp={hp} />
                      {rev.items.map((it: any, i: number) => (
                        <R key={i} label={it.label} val={it.amount} prior={priorItem('Revenue', it.label)} indent={1} hp={hp} />
                      ))}
                      <R label="Total Revenue" val={rev.total} prior={prev('Revenue')?.total} t="subtotal" hp={hp} />
                    </>}

                    {/* Cost of Sales */}
                    {cos && cos.items.length === 1 && (
                      <R label={cos.items[0].label} val={cos.items[0].amount} prior={prev('Cost of Sales')?.items?.[0]?.amount} hp={hp} />
                    )}
                    {cos && cos.items.length > 1 && <>
                      <R label="Cost of Revenue" t="section-head" hp={hp} />
                      {cos.items.map((it: any, i: number) => (
                        <R key={i} label={it.label} val={it.amount} prior={priorItem('Cost of Sales', it.label)} indent={1} hp={hp} />
                      ))}
                      <R label="Total Cost of Revenue" val={cos.total} prior={prev('Cost of Sales')?.total} t="subtotal" hp={hp} />
                    </>}

                    <R label="GROSS PROFIT / (LOSS)"                      val={is.gross_profit} prior={pis?.gross_profit} t="grand" hp={hp} />
                    <R label="" t="divider" hp={hp} />

                    {/* Operating Expenses */}
                    {opex?.items.map((it: any, i: number) => (
                      <R key={i} label={it.label} val={it.amount} prior={priorItem('Operating Expenses', it.label)} indent={1} hp={hp} />
                    ))}
                    <R label="OPERATING PROFIT / (LOSS)"                  val={is.ebit}        prior={pis?.ebit}        t="total" hp={hp} />
                    <R label="" t="divider" hp={hp} />

                    {/* Finance */}
                    {fin?.items.map((it: any, i: number) => (
                      <R key={i} label={it.label} val={it.amount} prior={priorItem('Finance Costs', it.label)} indent={1} hp={hp} />
                    ))}
                    <R label="PROFIT / (LOSS) BEFORE ZAKAT AND INCOME TAX" val={is.ebt}        prior={pis?.ebt}        t="total" hp={hp} />

                    {/* Tax */}
                    {tax?.items.map((it: any, i: number) => (
                      <R key={i} label={it.label} val={it.amount} prior={priorItem('Income Tax', it.label)} indent={1} hp={hp} />
                    ))}
                    <R label="NET PROFIT / (LOSS) FOR THE YEAR"            val={is.net_income}  prior={pis?.net_income}  t="grand" hp={hp} />
                  </>;
                })()}

                {/* ══ CASH FLOW ══════════════════════════════════ */}
                {tab === 'cash_flow' && (() => {
                  const cf  = stmts.cash_flow;
                  const pcf = stmts.prior_cash_flow;
                  return <>
                    {['Operating Activities', 'Investing Activities', 'Financing Activities']
                      .filter(s => cf.sections[s])
                      .map(s => (
                        <Sect key={s} title={s} sec={cf.sections[s]} priorSec={pcf?.sections?.[s]} hp={hp} />
                      ))}
                    <R label="NET CHANGE IN CASH AND CASH EQUIVALENTS" val={cf.net_change_in_cash} prior={pcf?.net_change_in_cash} t="grand" hp={hp} />
                  </>;
                })()}

                {/* ══ CHANGES IN EQUITY ══════════════════════════ */}
                {tab === 'equity' && (() => {
                  const eq = stmts.equity_statement;
                  return <>
                    <R label="Opening Equity"             val={eq.opening_equity}           hp={hp} />
                    <R label="Net Income for the Period"  val={eq.net_income}               hp={hp} />
                    <R label="Dividends Declared"         val={-Math.abs(eq.dividends)}     hp={hp} />
                    <R label="Other Movements"            val={eq.other_movements}          hp={hp} />
                    <R label="CLOSING EQUITY"             val={eq.closing_equity}           t="grand" hp={hp} />
                  </>;
                })()}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Unmapped warning ──────────────────────────────────── */}
      {stmts && stmts.unmapped?.length > 0 && (
        <div className="alert alert-warn" style={{ flexShrink: 0, fontSize: 12, padding: '6px 12px' }}>
          ⚠ {stmts.unmapped.length} unmapped account{stmts.unmapped.length > 1 ? 's' : ''} excluded —
          {stmts.unmapped.slice(0, 4).map((u: any) => ` ${u.account_name}`).join(', ')}
          {stmts.unmapped.length > 4 ? ` +${stmts.unmapped.length - 4} more` : ''}
        </div>
      )}

      {/* ── Action bar ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0, paddingTop: 4 }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Mapping</button>
        <button className="btn-primary" onClick={onNext} disabled={!stmts} style={{ padding: '10px 28px' }}>
          Continue to Notes →
        </button>
      </div>
    </div>
  );
}
