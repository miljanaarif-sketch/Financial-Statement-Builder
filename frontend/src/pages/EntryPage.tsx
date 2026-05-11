interface Props {
  onUpload: () => void;
  onConnect: () => void;
  onBack: () => void;
}

export default function EntryPage({ onUpload, onConnect, onBack }: Props) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px', background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,.05)',
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', fontSize: 14, fontWeight: 500,
        }}>
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 14,
          }}>FS</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>FinStatement</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#1557a0',
            background: 'rgba(21,87,160,.1)', borderRadius: 4, padding: '2px 7px',
          }}>PRO</span>
        </div>
        <div style={{ width: 60 }} />
      </nav>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px',
      }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(21,87,160,.08)', border: '1px solid rgba(21,87,160,.2)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1557a0' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1557a0', letterSpacing: '.6px' }}>GET STARTED</span>
          </div>
          <h1 style={{
            margin: '0 0 14px', fontSize: 38, fontWeight: 800,
            color: '#0f172a', letterSpacing: '-1px',
          }}>How would you like to start?</h1>
          <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>
            Choose how you want to bring your financial data in
          </p>
        </div>

        {/* Two cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 24, maxWidth: 820, width: '100%',
        }}>

          {/* Upload card */}
          <div
            onClick={onUpload}
            style={{
              background: '#fff', border: '2px solid #e2e8f0',
              borderRadius: 20, padding: '36px 32px', cursor: 'pointer',
              transition: 'all .22s', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = '#3b82f6';
              el.style.transform = 'translateY(-5px)';
              el.style.boxShadow = '0 20px 50px rgba(21,87,160,.13)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = '#e2e8f0';
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16, marginBottom: 20,
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>📂</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Upload Your Data</div>
            <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 24 }}>
              Drag & drop your CSV or Excel files — trial balance, AR aging, AP aging and fixed assets. We handle the rest automatically.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
              {['CSV', 'XLS', 'XLSX', 'Trial Balance', 'AR/AP Aging', 'Fixed Assets'].map(t => (
                <span key={t} style={{
                  background: '#eff6ff', borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, fontWeight: 600, color: '#1557a0',
                }}>{t}</span>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #1557a0, #2563eb)',
              color: '#fff', borderRadius: 12, padding: '14px 24px',
              fontWeight: 700, fontSize: 15,
            }}>
              Start with Upload <span style={{ fontSize: 18 }}>→</span>
            </div>
          </div>

          {/* Connect ERP card */}
          <div
            onClick={onConnect}
            style={{
              background: '#fff', border: '2px solid #e2e8f0',
              borderRadius: 20, padding: '36px 32px', cursor: 'pointer',
              transition: 'all .22s', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = '#22c55e';
              el.style.transform = 'translateY(-5px)';
              el.style.boxShadow = '0 20px 50px rgba(22,101,52,.11)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = '#e2e8f0';
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              }}>🔗</div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#16a34a',
                background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.25)',
                borderRadius: 6, padding: '4px 10px', letterSpacing: '.5px',
              }}>LIVE SYNC</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Connect Your ERP</div>
            <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 24 }}>
              API-connect directly to your accounting system. Pull live data and generate statements on demand — always up to date.
            </div>

            {/* Available sources */}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 10 }}>Available Sources</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { name: 'QuickBooks', color: '#2CA01C' },
                { name: 'Xero',       color: '#13B5EA' },
                { name: 'SAP',        color: '#008FD3' },
                { name: 'Oracle',     color: '#C74634' },
                { name: 'Sage',       color: '#00B050' },
                { name: 'NetSuite',   color: '#F7961E' },
                { name: 'Odoo',       color: '#714B67' },
              ].map(s => (
                <span key={s.name} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, fontWeight: 600, color: '#374151',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  {s.name}
                </span>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#16a34a', color: '#fff', borderRadius: 12, padding: '14px 24px',
              fontWeight: 700, fontSize: 15,
            }}>
              Connect Now <span style={{ fontSize: 18 }}>→</span>
            </div>
          </div>

        </div>

        {/* Powered by */}
        <div style={{ marginTop: 40, fontSize: 11, fontWeight: 600, color: '#cbd5e1', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Powered by <span style={{ color: '#94a3b8', fontWeight: 800 }}>NAWRAS</span>
        </div>
      </div>
    </div>
  );
}
