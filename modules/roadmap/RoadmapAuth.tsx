import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface RoadmapAuthProps {
  onSuccess: (email: string) => void;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'reset';
type SocialProvider = 'google' | 'github' | 'facebook' | 'spotify' | 'twitter' | 'discord' | 'linkedin' | 'twitch';

// ── SVG icons ─────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SpotifyIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.111 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

// ── Provider config ────────────────────────────────────────────────────────────

interface ProviderConfig {
  id: SocialProvider;
  label: string;
  bg: string;
  color: string;
  border?: string;
  icon: React.FC;
  size: 'full' | 'half';
}

const PROVIDERS: ProviderConfig[] = [
  { id: 'google',   label: 'Continue with Google',  bg: 'rgba(255,255,255,0.07)', color: 'var(--ink-bright, #f5f2ea)', border: '1px solid rgba(255,255,255,0.12)', icon: GoogleIcon,   size: 'full' },
  { id: 'spotify',  label: 'Continue with Spotify', bg: '#1DB954', color: '#fff', icon: SpotifyIcon,  size: 'full' },
  { id: 'facebook', label: 'Facebook',   bg: '#1877F2', color: '#fff', icon: FacebookIcon, size: 'half' },
  { id: 'twitter',  label: 'X (Twitter)', bg: '#000',    color: '#fff', border: '1px solid rgba(255,255,255,0.15)', icon: TwitterIcon,  size: 'half' },
  { id: 'discord',  label: 'Discord',    bg: '#5865F2', color: '#fff', icon: DiscordIcon,  size: 'half' },
  { id: 'github',   label: 'GitHub',     bg: '#24292e', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', icon: GitHubIcon,   size: 'half' },
  { id: 'linkedin', label: 'LinkedIn',   bg: '#0A66C2', color: '#fff', icon: LinkedInIcon, size: 'half' },
  { id: 'twitch',   label: 'Twitch',     bg: '#9146FF', color: '#fff', icon: TwitchIcon,   size: 'half' },
];

// ── Component ──────────────────────────────────────────────────────────────────

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

  // Clean origin so Supabase can whitelist it without query-string variance.
  // e.g. https://swrvonthego.pro — add this exact URL to Supabase → Auth → Redirect URLs.
  const redirectTo = window.location.origin;

  const handleSocial = async (provider: SocialProvider) => {
    setError('');
    setSocialLoading(provider);
    // Signal the roadmap should reopen after OAuth round-trip
    try { localStorage.setItem('swrv-post-oauth', 'roadmap'); } catch { /* ignore */ }
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (err) { setError(err.message); setSocialLoading(null); }
  };

  const handleEmail = async () => {
    if (!email || (!password && mode !== 'reset')) return;
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
        redirectTo,
      });
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess('Reset link sent — check your email.');
    }
    setLoading(false);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

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
    padding: '36px 28px 32px',
    maxWidth: '420px', width: '100%',
    maxHeight: '92vh', overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
  };

  const fullBtn = (cfg: ProviderConfig): React.CSSProperties => ({
    width: '100%', padding: '12px 16px',
    background: cfg.bg, color: cfg.color,
    border: cfg.border ?? 'none',
    borderRadius: '10px',
    fontWeight: 600, fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
    marginBottom: '9px',
    transition: 'opacity 0.15s, transform 0.15s',
    letterSpacing: '0.01em',
    opacity: socialLoading && socialLoading !== cfg.id ? 0.55 : 1,
  });

  const halfBtn = (cfg: ProviderConfig): React.CSSProperties => ({
    flex: '1 1 calc(50% - 4px)',
    padding: '11px 8px',
    background: cfg.bg, color: cfg.color,
    border: cfg.border ?? 'none',
    borderRadius: '10px',
    fontWeight: 600, fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    transition: 'opacity 0.15s',
    letterSpacing: '0.01em',
    opacity: socialLoading && socialLoading !== cfg.id ? 0.55 : 1,
    minWidth: 0,
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

  const fullProviders = PROVIDERS.filter(p => p.size === 'full');
  const halfProviders = PROVIDERS.filter(p => p.size === 'half');

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
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '11px',
            background: 'linear-gradient(135deg, #c8a84b, #a07830)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: '1rem', fontWeight: 900,
            color: '#0d0d0d', fontFamily: 'Georgia, serif',
          }}>S</div>
          <h2 style={{ color: 'var(--ink-bright, #f5f2ea)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 5px' }}>
            {showEmail && mode === 'signup' ? 'Create your account' :
             showEmail && mode === 'reset'  ? 'Reset password' :
             showEmail                      ? 'Sign in with email' :
             'Sign in to SWRV'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', margin: 0 }}>
            Your roadmap saves automatically when signed in
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)',
            borderRadius: '8px', padding: '9px 13px',
            color: '#ff7070', fontSize: '0.83rem', marginBottom: '14px',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(80,200,120,0.1)', border: '1px solid rgba(80,200,120,0.25)',
            borderRadius: '8px', padding: '9px 13px',
            color: '#6ee09d', fontSize: '0.83rem', marginBottom: '14px',
          }}>{success}</div>
        )}

        {!showEmail ? (
          <>
            {/* Full-width providers */}
            {fullProviders.map(cfg => (
              <button key={cfg.id} type="button" style={fullBtn(cfg)}
                onClick={() => handleSocial(cfg.id)} disabled={!!socialLoading}>
                {socialLoading === cfg.id ? '...' : <><cfg.icon />{cfg.label}</>}
              </button>
            ))}

            {/* Half-width provider grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '9px' }}>
              {halfProviders.map(cfg => (
                <button key={cfg.id} type="button" style={halfBtn(cfg)}
                  onClick={() => handleSocial(cfg.id)} disabled={!!socialLoading}>
                  {socialLoading === cfg.id ? '...' : <><cfg.icon />{cfg.label}</>}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0 12px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <button type="button" onClick={() => setShowEmail(true)} style={{
              width: '100%', padding: '11px 16px',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer', letterSpacing: '0.01em',
            }}>
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
              width: '100%', padding: '12px',
              background: 'var(--accent-1, #c8a84b)',
              color: '#0d0d0d', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, marginBottom: '12px', letterSpacing: '0.03em',
            }}>
              {loading ? '...' :
               mode === 'signup' ? 'Create Account' :
               mode === 'reset'  ? 'Send Reset Link' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.81rem', color: 'rgba(255,255,255,0.33)', marginBottom: '10px' }}>
              {mode === 'signin' && (
                <>
                  <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-1, #c8a84b)', cursor: 'pointer', fontWeight: 600, fontSize: '0.81rem' }}>
                    Create an account
                  </button>
                  {' · '}
                  <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.33)', cursor: 'pointer', fontSize: '0.81rem' }}>
                    Forgot password?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button type="button" onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-1, #c8a84b)', cursor: 'pointer', fontWeight: 600, fontSize: '0.81rem' }}>
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'reset' && (
                <button type="button" onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.33)', cursor: 'pointer', fontSize: '0.81rem' }}>
                  Back to sign in
                </button>
              )}
            </div>

            <button type="button" onClick={() => { setShowEmail(false); setError(''); setSuccess(''); }}
              style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.22)', cursor: 'pointer', fontSize: '0.78rem', padding: '4px' }}>
              ← All sign-in options
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', marginTop: '18px', marginBottom: 0 }}>
          By signing in you agree to SWRV's terms. Your data stays yours.
        </p>
      </div>
    </div>
  );
};
