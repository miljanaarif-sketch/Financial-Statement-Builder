import { useState } from 'react';
import { DEFAULT_NOTES } from './data/defaultNotes';
import LandingPage from './pages/LandingPage';
import ConnectPage from './pages/ConnectPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadPage from './pages/UploadPage';
import MappingPage from './pages/MappingPage';
import StatementsPage from './pages/StatementsPage';
import NotesPage from './pages/NotesPage';
import ExportPage from './pages/ExportPage';
import type { AppSession } from './types';

type View = 'landing' | 'connect' | 'app';

const INITIAL_SESSION: AppSession = {
  session_id: '',
  entity_name: '',
  activities: '',
  period_end: '',
  prior_period_end: '',
  currency: 'SAR',
  uploads: {},
  suggestions: [],
  mappings: [],
  statements: null,
  notes: DEFAULT_NOTES,
  step: 0,
};

const STEPS = [
  { label: 'Data Import',     icon: '⬆', desc: 'Upload accounting files' },
  { label: 'Account Mapping', icon: '⇄', desc: 'Map to chart of accounts' },
  { label: 'Statements',      icon: '≡', desc: 'Review financial statements' },
  { label: 'Notes',           icon: '✎', desc: 'Edit disclosure notes' },
  { label: 'Export',          icon: '⤓', desc: 'Download reports' },
];

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [session, setSession] = useState<AppSession>(INITIAL_SESSION);

  const goTo = (step: number) => {
    if (step <= session.step) setSession(s => ({ ...s, step }));
  };

  const reset = () => {
    setSession(INITIAL_SESSION);
    setView('landing');
  };

  // ── Landing page ────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <LandingPage
        onUpload={() => setView('app')}
        onConnect={() => setView('connect')}
      />
    );
  }

  // ── ERP connect flow ────────────────────────────────────────
  if (view === 'connect') {
    return (
      <ConnectPage
        session={session}
        setSession={setSession}
        onBack={() => setView('landing')}
        onConnected={() => { setView('app'); setSession(s => ({ ...s, step: 1 })); }}
      />
    );
  }

  // ── Main app shell ──────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar steps={STEPS} currentStep={session.step} onStepClick={goTo} onHome={reset} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          entityName={session.entity_name}
          periodEnd={session.period_end}
          currency={session.currency}
          step={session.step}
          stepLabel={STEPS[session.step]?.label}
          onHome={reset}
        />

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', background: '#f0f2f5' }}>
          {session.step === 0 && (
            <UploadPage session={session} setSession={setSession}
              onNext={() => setSession(s => ({ ...s, step: 1 }))} />
          )}
          {session.step === 1 && (
            <MappingPage session={session} setSession={setSession}
              onNext={() => setSession(s => ({ ...s, step: 2 }))}
              onBack={() => setSession(s => ({ ...s, step: 0 }))} />
          )}
          {session.step === 2 && (
            <StatementsPage session={session} setSession={setSession}
              onNext={() => setSession(s => ({ ...s, step: 3 }))}
              onBack={() => setSession(s => ({ ...s, step: 1 }))} />
          )}
          {session.step === 3 && (
            <NotesPage session={session} setSession={setSession}
              onNext={() => setSession(s => ({ ...s, step: 4 }))}
              onBack={() => setSession(s => ({ ...s, step: 2 }))} />
          )}
          {session.step === 4 && (
            <ExportPage session={session}
              onBack={() => setSession(s => ({ ...s, step: 3 }))}
              onReset={reset} />
          )}
        </main>
      </div>
    </div>
  );
}
