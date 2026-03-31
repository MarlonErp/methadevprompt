import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PromptsProvider } from './contexts/PromptsContext';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { GeneratorPage } from './components/GeneratorPage';
import { HistoryPage } from './components/HistoryPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'generator' | 'history'>('generator');

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#zap-grad)" />
            <defs>
              <linearGradient id="zap-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <PromptsProvider>
      <div className="app">
        <Header view={view} onViewChange={setView} />
        <main className="app-main">
          {view === 'generator' ? <GeneratorPage /> : <HistoryPage />}
        </main>
      </div>
    </PromptsProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
