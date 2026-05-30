import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import VisionsPage from './VisionsPage';
import ProjectsPage from './ProjectsPage';
import BillingPage from './BillingPage';
import AccountPage from './AccountPage';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  visions:   'My Visions',
  projects:  'My Projects',
  billing:   'Billing',
  account:   'Account',
  clients:   'All Clients',
};

export default function PortalApp() {
  const { profile } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'visions':   return <VisionsPage />;
      case 'projects':  return <ProjectsPage />;
      case 'billing':   return <BillingPage />;
      case 'account':   return <AccountPage />;
      default:          return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="portal-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        activePage={page}
        onNavigate={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="portal-main">
        <header className="portal-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">{PAGE_TITLES[page] || 'Portal'}</span>
          </div>

          <div className="topbar-actions">
            {profile?.role === 'admin' && (
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Admin</span>
            )}
            <button className="notif-btn" aria-label="Notifications">
              <Bell size={18} />
              {/* <span className="notif-dot" /> */}
            </button>
          </div>
        </header>

        <main className="portal-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
