import React, { useState } from 'react';
import { Mail, Lock, Chrome, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      const rawMsg = err.message || '';
      // Signup succeeded but email confirmation is required
      if (rawMsg === 'CONFIRM_EMAIL') {
        setSuccess('✅ Conta criada! Verifique seu email para confirmar o cadastro.');
        setMode('login');
        return;
      }
      let msg: string;
      if (rawMsg.includes('Database error')) {
        msg = 'Serviço temporariamente indisponível. O banco de dados pode estar pausado — tente novamente em alguns minutos.';
      } else if (rawMsg.includes('Email não confirmado')) {
        msg = rawMsg;
      } else if (rawMsg.includes('Invalid login credentials')) {
        msg = 'Email ou senha inválidos.';
      } else if (rawMsg.includes('User already registered')) {
        msg = 'Este email já está em uso.';
      } else if (rawMsg.includes('Password should be at least')) {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (rawMsg.includes('Email not confirmed')) {
        msg = 'Verifique seu email para confirmar o cadastro.';
      } else if (rawMsg.includes('Signups not allowed')) {
        msg = 'Cadastro de novos usuários está desabilitado no momento.';
      } else if (rawMsg.includes('rate limit') || rawMsg.includes('too many requests')) {
        msg = 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
      } else {
        msg = rawMsg || 'Ocorreu um erro. Tente novamente.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('Erro ao entrar com Google.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap size={28} />
          </div>
          <h1 className="auth-title">MethaDevPrompt</h1>
        </div>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Entre para gerar prompts otimizados com IA'
            : 'Crie sua conta e comece a gerar prompts'}
        </p>

        <button id="google-signin-btn" className="google-btn" onClick={handleGoogle} disabled={loading}>
          <Chrome size={20} />
          Continuar com Google
        </button>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">Email</label>
            <div className="field-input-wrap">
              <Mail size={16} className="field-icon" />
              <input
                id="email-input"
                type="email"
                className="field-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Senha</label>
            <div className="field-input-wrap">
              <Lock size={16} className="field-icon" />
              <input
                id="password-input"
                type={showPass ? 'text' : 'password'}
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="field-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {success && <p className="auth-success">{success}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button id="auth-submit-btn" type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-spinner" />
            ) : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          <button
            id="auth-mode-toggle"
            className="auth-switch-btn"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
          >
            {mode === 'login' ? ' Cadastre-se' : ' Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}
