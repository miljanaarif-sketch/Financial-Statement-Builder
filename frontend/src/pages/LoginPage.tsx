import { useState } from 'react';

interface Props {
  onLogin: () => void;
}

const APP_USERNAME = import.meta.env.VITE_APP_USERNAME || 'galaxy';
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || '123456';

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === APP_USERNAME && password === APP_PASSWORD) {
        onLogin();
      } else {
        setError('Incorrect username or password. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  const isReady = username.length > 0 && password.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0fdf4 100%)',
    }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 15,
          }}>FS</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', letterSpacing: '-.3px' }}>FinStatement</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#1557a0',
            background: 'rgba(21,87,160,.1)', borderRadius: 4, padding: '2px 7px', letterSpacing: '.5px',
          }}>PRO</span>
        </div>
      </nav>

      {/* Card */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: '48px 48px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.04)',
        }}>

          {/* Lock icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 24,
          }}>🔐</div>

          <h1 style={{
            margin: '0 0 8px', fontSize: 26, fontWeight: 800,
            color: '#0f172a', letterSpacing: '-.5px',
          }}>Welcome back</h1>
          <p style={{ margin: '0 0 32px', fontSize: 15, color: '#64748b' }}>
            Sign in to access the platform
          </p>

          <form onSubmit={handleSubmit}>

            {/* Username field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 8,
              }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter username"
                autoFocus
                autoComplete="username"
                style={{
                  width: '100%', padding: '13px 16px',
                  borderRadius: 12, fontSize: 15,
                  border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
                  outline: 'none', boxSizing: 'border-box',
                  color: '#0f172a', background: '#f8fafc',
                  transition: 'border-color .15s',
                }}
                onFocus={e => { if (!error) (e.target as HTMLInputElement).style.borderColor = '#3b82f6'; }}
                onBlur={e  => { if (!error) (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'; }}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 8,
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '13px 48px 13px 16px',
                    borderRadius: 12, fontSize: 15,
                    border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
                    outline: 'none', boxSizing: 'border-box',
                    color: '#0f172a', background: '#f8fafc',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => { if (!error) (e.target as HTMLInputElement).style.borderColor = '#3b82f6'; }}
                  onBlur={e  => { if (!error) (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'; }}
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: '#94a3b8', padding: 4,
                  }}
                >{showPw ? '🙈' : '👁️'}</button>
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: '#ef4444', fontWeight: 500,
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isReady}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 12, border: 'none',
                background: loading || !isReady
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg, #1557a0, #2563eb)',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: loading || !isReady ? 'not-allowed' : 'pointer',
                transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin .7s linear infinite',
                  }} />
                  Verifying...
                </>
              ) : 'Sign In →'}
            </button>

          </form>

          {/* Powered by */}
          <div style={{
            marginTop: 32, textAlign: 'center',
            fontSize: 11, fontWeight: 600, color: '#cbd5e1',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Powered by <span style={{ color: '#94a3b8', fontWeight: 800 }}>NAWRAS</span>
          </div>
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
