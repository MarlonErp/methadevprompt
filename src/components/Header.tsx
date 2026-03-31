import React from 'react';
import { Zap, LogOut, History, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  view: 'generator' | 'history';
  onViewChange: (v: 'generator' | 'history') => void;
}

export function Header({ view, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <Zap size={22} />
          </div>
          <span className="header-title">DevPrompt</span>
          <span className="header-badge">AI</span>
        </div>

        <nav className="header-nav">
          <button
            id="nav-generator"
            className={`nav-btn ${view === 'generator' ? 'active' : ''}`}
            onClick={() => onViewChange('generator')}
          >
            <Wand2 size={16} />
            Gerar
          </button>
          <button
            id="nav-history"
            className={`nav-btn ${view === 'history' ? 'active' : ''}`}
            onClick={() => onViewChange('history')}
          >
            <History size={16} />
            Histórico
          </button>
        </nav>

        <div className="header-user">
          {user?.photoURL && (
            <img src={user.photoURL} alt="avatar" className="user-avatar" />
          )}
          {!user?.photoURL && (
            <div className="user-avatar-fallback">
              {user?.email?.[0].toUpperCase()}
            </div>
          )}
          <span className="user-email">{user?.displayName || user?.email?.split('@')[0]}</span>
          <button id="logout-btn" className="logout-btn" onClick={signOut} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
