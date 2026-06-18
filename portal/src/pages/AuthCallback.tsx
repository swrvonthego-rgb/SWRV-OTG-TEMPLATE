import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Handles OAuth callback redirect from Google and password reset links.
// Supabase v2 uses PKCE by default: OAuth redirects include ?code= which must
// be explicitly exchanged via exchangeCodeForSession() before a session exists.
export default function AuthCallback() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    async function handle() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      // PKCE flow: exchange the authorization code for a session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus('Sign-in failed. Redirecting...');
          setTimeout(() => window.location.href = '/portal', 2000);
          return;
        }
        setStatus('Signed in! Redirecting...');
        setTimeout(() => window.location.href = '/portal', 500);
        return;
      }

      // Password reset / email link flow (hash fragment with access_token)
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        const { error } = await supabase.auth.refreshSession();
        if (!error) {
          window.location.href = '/portal';
          return;
        }
      }

      // Fallback: check if session already established (e.g. implicit flow)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus('Signed in! Redirecting...');
        setTimeout(() => window.location.href = '/portal', 500);
      } else {
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => window.location.href = '/portal', 2000);
      }
    }
    handle();
  }, []);

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.1em', color: 'var(--gold)' }}>
        SWRV
      </div>
      <div className="spinner" style={{ margin: '0 auto' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{status}</p>
    </div>
  );
}
