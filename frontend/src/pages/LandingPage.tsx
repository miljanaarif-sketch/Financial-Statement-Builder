interface Props {
  onUpload: () => void;
  onConnect: () => void;
}

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Mapping',            desc: 'Smart engine auto-maps your chart of accounts to IFRS/GAAP categories.' },
  { icon: '📋', title: 'Automated Financial Notes',      desc: 'Disclosure notes built automatically from your data.' },
  { icon: '📊', title: 'Balance Sheet & P&L Generation', desc: 'Full statements calculated with cross-check tie-outs.' },
  { icon: '📈', title: 'Multi-Period Comparative',        desc: 'Prior-year columns generated from your comparative trial balance.' },
  { icon: '✅', title: 'Audit-Ready Output',              desc: 'IFRS-compliant formatting with audit trail included.' },
  { icon: '🔮', title: 'Smart Forecasting & Analytics',  desc: 'KPI insights and variance analysis built in.' },
];

const TRUST = [
  { icon: '🛡️', label: 'Trusted by finance teams worldwide', sub: 'Secure. Accurate. Compliant.' },
  { icon: '📘', label: 'IFRS Compliant' },
  { icon: '🔒', label: 'SOC 2 Type II' },
  { icon: '🏅', label: 'ISO 27001 Certified' },
  { icon: '🏦', label: 'Bank-Grade Security' },
];

export default function LandingPage({ onUpload }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ─── TOP HALF — white ─────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#ffffff', paddingBottom: 48 }}>

        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px', borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 14,
            }}>FS</div>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', letterSpacing: '-.3px' }}>FinStatement</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#1557a0',
              background: 'rgba(21,87,160,.1)', borderRadius: 4, padding: '2px 7px', letterSpacing: '.5px',
            }}>PRO</span>
          </div>
          <button onClick={onUpload} style={{
            padding: '9px 24px', borderRadius: 8, border: 'none',
            background: '#1557a0', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Get Started</button>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 48px 0', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 26,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '.6px' }}>AI-POWERED FINANCIAL REPORTING</span>
          </div>

          <h1 style={{
            margin: '0 0 20px', fontSize: 'clamp(34px, 5vw, 58px)',
            fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-1.5px',
          }}>
            Welcome to{' '}
            <span style={{ color: '#1557a0' }}>Financial Statement</span>{' '}
            <span style={{ color: '#1557a0' }}>Builder</span>
          </h1>

          <p style={{
            maxWidth: 600, margin: '0 auto 0',
            fontSize: 17, color: '#64748b', lineHeight: 1.7,
          }}>
            Transform raw ledger data into complete IFRS-ready financial statements, disclosures, notes, and management reports — powered by intelligent automation.
          </p>
        </div>

        {/* Feature grid */}
        <div style={{
          maxWidth: 920, margin: '52px auto 0', padding: '0 48px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: '20px 18px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ─── BOTTOM HALF — green ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #047857 100%)',
        padding: '56px 48px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Enter button + Powered by NAWRAS — TOP of green section */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          marginBottom: 56,
        }}>
          <button
            onClick={onUpload}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '20px 60px', borderRadius: 50, border: 'none',
              background: '#fff',
              color: '#1557a0', fontSize: 18, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 12px 45px rgba(0,0,0,.25), 0 0 0 4px rgba(255,255,255,.2)',
              letterSpacing: '-.2px', whiteSpace: 'nowrap',
              transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 55px rgba(0,0,0,.35), 0 0 0 4px rgba(255,255,255,.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 45px rgba(0,0,0,.25), 0 0 0 4px rgba(255,255,255,.2)';
            }}
          >
            Enter Platform
            <span style={{ fontSize: 20 }}>→</span>
          </button>

          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Powered by <span style={{ color: '#fff', fontWeight: 800 }}>NAWRAS</span>
          </div>
        </div>

        {/* Trust badges row */}
        <div style={{
          display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: 900, width: '100%', marginBottom: 48,
          background: 'rgba(255,255,255,.06)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,.1)',
          padding: '20px 32px',
        }}>
          {TRUST.map((t, i) => (
            <div key={t.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 28px', flex: '1 1 auto',
              borderRight: i < TRUST.length - 1 ? '1px solid rgba(255,255,255,.12)' : 'none',
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5', textAlign: 'center', lineHeight: 1.3 }}>{t.label}</span>
              {t.sub && <span style={{ fontSize: 10, color: '#6ee7b7', textAlign: 'center' }}>{t.sub}</span>}
            </div>
          ))}
        </div>

        {/* Audit Ready badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          marginBottom: 48,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
          }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#a7f3d0', letterSpacing: '.5px' }}>Audit Ready</div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 0, maxWidth: 700, width: '100%',
          borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 40,
        }}>
          {[
            { val: '4',    label: 'Statements',    sub: 'Auto-generated' },
            { val: '<60s', label: 'Time to Report', sub: 'Upload → export' },
            { val: 'IFRS', label: 'Framework',      sub: '+ US GAAP' },
            { val: '3',    label: 'Export Formats', sub: 'Excel · PDF · Word' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center', padding: '0 20px',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.12)' : 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#34d399', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, fontSize: 12, color: 'rgba(255,255,255,.3)', textAlign: 'center' }}>
          FinStatement Pro · IFRS · US GAAP · Audit Ready
        </div>
      </div>

    </div>
  );
}
