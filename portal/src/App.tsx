import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import PortalApp from './pages/PortalApp';

function AppInner() {
  const { user, loading } = useAuth();

  // Handle OAuth and password reset callbacks
  const path = window.location.pathname;
  if (path === '/portal/auth/callback' || path === '/portal/auth/update-password') {
    return <AuthCallback />;
  }

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--navy)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: 16 }}>
            SWRV
          </div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return user ? <PortalApp /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
