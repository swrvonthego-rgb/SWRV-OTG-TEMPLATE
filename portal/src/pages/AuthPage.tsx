import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Chrome } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'reset';

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        redirectTo: 'https://app.swrvonthego.pro/auth/update-password',
      });
      if (error) setError(error.message);
      else setSuccess('Reset link sent — check your email.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-logo">
          <div className="auth-logo-text">SWRV</div>
          <div className="auth-logo-sub">Client Portal</div>
        </div>

        <div className="auth-title">
          {mode === 'signin' && 'Sign in to your account'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'reset' && 'Reset your password'}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

        <div className="auth-form" onKeyDown={handleKey}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  type="password"
                  placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : null}
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Send Reset Link'}
          </button>

          {mode !== 'reset' && (
            <>
              <div className="auth-divider">or</div>
              <button className="btn btn-outline btn-full" onClick={handleGoogle} disabled={loading}>
                <Chrome size={16} />
                Continue with Google
              </button>
            </>
          )}
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
