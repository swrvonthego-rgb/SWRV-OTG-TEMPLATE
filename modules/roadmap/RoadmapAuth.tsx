import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface RoadmapAuthProps {
  /** Called with the user's email after successful sign-in or sign-up */
  onSuccess: (email: string) => void;
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

export const RoadmapAuth: React.FC<RoadmapAuthProps> = ({ onSuccess, onClose }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) onSuccess(data.user.email ?? email);
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError('Invalid email or password.'); setLoading(false); return; }
      if (data.user) onSuccess(data.user.email ?? email);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    // After Google auth, redirect back to the main site with roadmap auto-opened.
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}?roadmap=1`,
      },
    });
    if (err) setError(err.message);
  };

  const cardStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(8px)',
  };

  const boxStyle: React.CSSProperties = {
    background: 'var(--bg-card, #16162a)',
    border: '1px solid var(--accent-soft, rgba(255,215,0,0.15))',
    borderRadius: '16px',
    padding: '36px 30px 32px',
    maxWidth: '400px',
    width: '100%',
    position: 'relative',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: 'var(--ink-bright, #f5f2ea)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'var(--ink-mid, #999)',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '5px',
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '12px', marginTop: '4px',
    background: 'var(--accent-1, #c8a84b)',
    color: 'var(--bg-deep, #0d0d0d)',
    border: 'none', borderRadius: '8px',
    fontWeight: 700, fontSize: '0.9rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    letterSpacing: '0.04em',
  };

  const btnGoogle: React.CSSProperties = {
    width: '100%', padding: '11px', marginTop: '10px',
    background: 'transparent',
    color: 'var(--ink-base, #ccc)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    fontWeight: 600, fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  };

  const dividerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    margin: '14px 0 4px',
    color: 'var(--ink-dim, #555)',
    fontSize: '0.75rem',
  };

  return (
    <div style={cardStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={boxStyle}>
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none',
            color: 'var(--ink-dim, #666)', cursor: 'pointer', fontSize: '1.2rem',
          }}
          aria-label="Close"
        >×</button>

        <div style={{ marginBottom: '22px' }}>
          <div style={{ color: 'var(--accent-1, #c8a84b)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
            SWRV Account
          </div>
          <h2 style={{ color: 'var(--ink-bright, #f5f2ea)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {mode === 'signin' ? 'Sign in to save your roadmap' : 'Create your SWRV account'}
          </h2>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '8px', padding: '10px 14px',
            color: '#ff7070', fontSize: '0.85rem', marginBottom: '14px',
          }}>
            {error}
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label style={labelStyle}>Your Name</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="First name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
        )}

        <div>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="email"
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            type="password"
            placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        <button type="button" style={btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={dividerStyle}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <button type="button" style={btnGoogle} onClick={handleGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.82rem', color: 'var(--ink-dim, #666)' }}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-1, #c8a84b)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" onClick={() => { setMode('signin'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-1, #c8a84b)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
