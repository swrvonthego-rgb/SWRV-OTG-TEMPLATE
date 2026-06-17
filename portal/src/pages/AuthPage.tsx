import { useState, type FC } from 'react';
import { useAuth, type SocialProvider } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'reset';

const AppleSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const GoogleSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SpotifySVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const XSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const socialConfig: { provider: SocialProvider; label: string; bg: string; color: string; border?: string; icon: FC }[] = [
  { provider: 'apple',    label: 'Continue with Apple',    bg: '#fff',          color: '#000',   icon: AppleSVG },
  { provider: 'google',   label: 'Continue with Google',   bg: 'transparent',   color: 'var(--text)', border: '1px solid var(--border)', icon: GoogleSVG },
  { provider: 'facebook', label: 'Continue with Facebook', bg: '#1877F2',       color: '#fff',   icon: FacebookSVG },
  { provider: 'spotify',  label: 'Continue with Spotify',  bg: '#1DB954',       color: '#fff',   icon: SpotifySVG },
  { provider: 'twitter',  label: 'Continue with X (Twitter)', bg: '#000',       color: '#fff', border: '1px solid rgba(255,255,255,0.15)', icon: XSVG },
];

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithSocial } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSocial = async (provider: SocialProvider) => {
    setError('');
    setSocialLoading(provider);
    const { error } = await signInWithSocial(provider);
    if (error) { setError(error); setSocialLoading(null); }
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!email || (!password && mode !== 'reset')) return;
    setLoading(true);

    if (mode === 'signup') {
      if (!fullName.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) setError(error);
      else setSuccess('Check your email to confirm your account.');
    } else if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) setError('Invalid email or password.');
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) setError(error.message);
      else setSuccess('Reset link sent — check your email.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-logo">
          <div className="auth-logo-text">SWRV</div>
          <div className="auth-logo-sub">Client Portal</div>
        </div>

        <div className="auth-title">
          {mode === 'signin' ? 'Sign in to your account' :
           mode === 'signup' ? 'Create your account' :
           'Reset your password'}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

        {/* ── Social buttons (hidden on reset) ── */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 6 }}>
            {socialConfig.map(({ provider, label, bg, color, border, icon: Icon }) => (
              <button
                key={provider}
                type="button"
                disabled={!!socialLoading || loading}
                onClick={() => handleSocial(provider)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 16px',
                  background: bg, color,
                  border: border ?? 'none',
                  borderRadius: 10,
                  fontWeight: 600, fontSize: '0.9rem',
                  cursor: socialLoading || loading ? 'not-allowed' : 'pointer',
                  opacity: socialLoading === provider ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                  letterSpacing: '0.01em',
                  width: '100%',
                }}
              >
                {socialLoading === provider ? '...' : <><Icon />{label}</>}
              </button>
            ))}
          </div>
        )}

        {mode !== 'reset' && <div className="auth-divider" style={{ margin: '14px 0' }}>or</div>}

        {/* ── Email form ── */}
        <div className="auth-form" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} type="text"
                  placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input className="form-input" style={{ paddingLeft: 36 }} type="email"
                placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} type="password"
                  placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={handleSubmit}
            disabled={loading || !!socialLoading} style={{ marginTop: 4 }}>
            {loading ? <span className="spinner" /> : null}
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </div>

        <div className="auth-switch">
          {mode === 'signin' && (
            <>
              Don't have an account?
              <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Sign up</button>
              <br />
              <button style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 6 }}
                onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>Already have an account?<button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>Sign in</button></>
          )}
          {mode === 'reset' && (
            <>Remember it?<button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>Back to sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
