import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface RoadmapAuthProps {
  onSuccess: (email: string) => void;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'reset';
type SocialProvider = 'google' | 'apple' | 'facebook' | 'spotify' | 'twitter';

export const RoadmapAuth: React.FC<RoadmapAuthProps> = ({ onSuccess, onClose }) => {
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const redirectTo = `${window.location.origin}?roadmap=1`;

  const handleSocial = async (provider: SocialProvider) => {
    setError('');
    setSocialLoading(provider);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (err) { setError(err.message); setSocialLoading(null); }
  };

  const handleEmail = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) onSuccess(data.user.email ?? email);
    } else if (mode === 'signin') {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError('Invalid email or password.'); setLoading(false); return; }
      if (data.user) onSuccess(data.user.email ?? email);
    } else if (mode === 'reset') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}?roadmap=1`,
      });
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess('Reset link sent — check your email.');
    }
    setLoading(false);
  };

  // ── Shared styles ──────────────────────────────────────────────────
  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', backdropFilter: 'blur(10px)',
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-card, #111120)',
    border: '1px solid rgba(200,168,75,0.18)',
    borderRadius: '20px',
    padding: '40px 32px 36px',
    maxWidth: '420px', width: '100%',
    position: 'relative',
    boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
  };

  const socialBtn = (bg: string, color: string, border?: string): React.CSSProperties => ({
    width: '100%', padding: '13px 16px',
    background: bg, color,
    border: border ?? 'none',
    borderRadius: '10px',
    fontWeight: 600, fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    marginBottom: '10px',
    transition: 'opacity 0.15s, transform 0.15s',
    letterSpacing: '0.01em',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '9px',
    padding: '12px 14px',
    color: 'var(--ink-bright, #f5f2ea)',
    fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', marginBottom: '10px',
  };

  const isBusy = (p: SocialProvider) => socialLoading === p;

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={card}>

        {/* Close */}
        <button type="button" onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 18,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.35)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
        }}>×</button>

        {/* Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #c8a84b, #a07830)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: '1.1rem', fontWeight: 900,
            color: '#0d0d0d', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em',
          }}>S</div>
          <h2 style={{ color: 'var(--ink-bright, #f5f2ea)', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 6px' }}>
            {showEmail && mode === 'signup' ? 'Create your account' :
             showEmail && mode === 'reset' ? 'Reset password' :
             showEmail ? 'Sign in with email' :
             'Sign in to SWRV'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem', margin: 0 }}>
            Your roadmap saves automatically when signed in
          </p>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)',
            borderRadius: '8px', padding: '10px 14px',
            color: '#ff7070', fontSize: '0.84rem', marginBottom: '16px',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(80,200,120,0.1)', border: '1px solid rgba(80,200,120,0.25)',
            borderRadius: '8px', padding: '10px 14px',
            color: '#6ee09d', fontSize: '0.84rem', marginBottom: '16px',
          }}>{success}</div>
        )}

        {!showEmail ? (
          /* ── Social-first view ── */
          <>
            {/* Apple */}
            <button
              type="button"
              style={socialBtn('#fff', '#000')}
              onClick={() => handleSocial('apple')}
              disabled={!!socialLoading}
            >
              {isBusy('apple') ? '...' : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </>
              )}
            </button>

            {/* Google */}
            <button
              type="button"
              style={socialBtn('rgba(255,255,255,0.07)', 'var(--ink-bright, #f5f2ea)', '1px solid rgba(255,255,255,0.12)')}
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
            >
              {isBusy('google') ? '...' : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Facebook */}
            <button
              type="button"
              style={socialBtn('#1877F2', '#fff')}
              onClick={() => handleSocial('facebook')}
              disabled={!!socialLoading}
            >
              {isBusy('facebook') ? '...' : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </>
              )}
            </button>

            {/* Spotify */}
            <button
              type="button"
              style={socialBtn('#1DB954', '#fff')}
              onClick={() => handleSocial('spotify')}
              disabled={!!socialLoading}
            >
              {isBusy('spotify') ? '...' : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Continue with Spotify
                </>
              )}
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              style={socialBtn('#000', '#fff', '1px solid rgba(255,255,255,0.15)')}
              onClick={() => handleSocial('twitter')}
              disabled={!!socialLoading}
            >
              {isBusy('twitter') ? '...' : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Continue with X (Twitter)
                </>
              )}
            </button>

            {/* Email divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <button
              type="button"
              onClick={() => setShowEmail(true)}
              style={socialBtn('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.55)', '1px solid rgba(255,255,255,0.08)')}
            >
              Continue with Email
            </button>
          </>
        ) : (
          /* ── Email / password view ── */
          <>
            {mode === 'signup' && (
              <input style={inputStyle} type="text" placeholder="Your name"
                value={fullName} onChange={e => setFullName(e.target.value)}
                autoComplete="given-name" />
            )}

            <input style={inputStyle} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmail()}
              autoComplete="email" autoFocus />

            {mode !== 'reset' && (
              <input style={inputStyle} type="password"
                placeholder={mode === 'signup' ? 'Create a password (min 8 chars)' : '••••••••'}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmail()}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
            )}

            <button type="button" disabled={loading} onClick={handleEmail} style={{
              width: '100%', padding: '13px',
              background: 'var(--accent-1, #c8a84b)',
              color: '#0d0d0d', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, marginBottom: '12px', letterSpacing: '0.03em',
            }}>
              {loading ? '...' :
               mode === 'signup' ? 'Create Account' :
               mode === 'reset' ? 'Send Reset Link' : 'Sign In'}
            </button>

            {/* Mode switcher */}
            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>
              {mode === 'signin' && (
                <>
                  <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-1, #c8a84b)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    Create an account
                  </button>
                  {' · '}
                  <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.82rem' }}>
                    Forgot password?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button type="button" onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-1, #c8a84b)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'reset' && (
                <button type="button" onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.82rem' }}>
                  Back to sign in
                </button>
              )}
            </div>

            <button type="button" onClick={() => { setShowEmail(false); setError(''); setSuccess(''); }}
              style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.8rem', padding: '4px' }}>
              ← All sign-in options
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '20px', marginBottom: 0 }}>
          By signing in you agree to SWRV's terms. Your data stays yours.
        </p>
      </div>
    </div>
  );
};
