import  { useState } from 'react';
import { Playground } from './components/Playground';
import { DiffView } from './components/DiffView';

type Tab = 'playground' | 'diff';

export default function App() {
  const [tab, setTab] = useState<Tab>('playground');

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__mark" aria-hidden="true">◈</span>
            <span className="app-logo__name">DevPortal</span>
            <span className="app-logo__badge">Inference Suite</span>
          </div>
          <nav className="app-nav" aria-label="Main navigation">
            <button
              className={`nav-tab ${tab === 'playground' ? 'nav-tab--active' : ''}`}
              onClick={() => setTab('playground')}
              aria-selected={tab === 'playground'}
              role="tab"
            >
              Playground
            </button>
            <button
              className={`nav-tab ${tab === 'diff' ? 'nav-tab--active' : ''}`}
              onClick={() => setTab('diff')}
              aria-selected={tab === 'diff'}
              role="tab"
            >
              Diff view
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main" role="main" tabIndex={-1}>
        {tab === 'playground' ? <Playground /> : <DiffView />}
      </main>
    </div>
  );
}
