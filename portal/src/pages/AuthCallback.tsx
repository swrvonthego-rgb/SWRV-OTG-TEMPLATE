import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Handles OAuth callback redirect from Google and password reset links.
// Supabase automatically exchanges the token — we just wait then redirect.
export default function AuthCallback() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    async function handle() {
      // Give Supabase a moment to exchange the code in the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      if (data.session) {
        setStatus('Signed in! Redirecting...');
        setTimeout(() => window.location.href = '/', 500);
      } else {
        // Try exchanging hash fragment (for password reset flow)
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          const { error: hashError } = await supabase.auth.refreshSession();
          if (!hashError) {
            window.location.href = '/';
            return;
          }
        }
        setStatus('Redirecting...');
        setTimeout(() => window.location.href = '/', 1000);
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
