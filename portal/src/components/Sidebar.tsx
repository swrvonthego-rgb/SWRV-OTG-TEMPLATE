import { Map, FolderOpen, CreditCard, Settings, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  open?: boolean;
  onClose?: () => void;
}

const clientNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'visions',   label: 'My Visions',  icon: Map },
  { id: 'projects',  label: 'My Projects', icon: FolderOpen },
  { id: 'billing',   label: 'Billing',     icon: CreditCard },
  { id: 'account',   label: 'Account',     icon: Settings },
];

const adminNav = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'admin',     label: 'Admin',       icon: Users },
  { id: 'projects',  label: 'Projects',    icon: FolderOpen },
  { id: 'billing',   label: 'Billing',     icon: CreditCard },
  { id: 'account',   label: 'Account',     icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, open, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const navItems = isAdmin ? adminNav : clientNav;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? 'U';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">SWRV</div>
        <div className="sidebar-logo-sub">On The Go</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${activePage === id ? ' active' : ''}`}
            onClick={() => { onNavigate(id); onClose?.(); }}
          >
            <Icon size={16} className="nav-icon" />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip" onClick={handleSignOut} title="Sign out">
          <div className="user-avatar">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" />
              : initials
            }
          </div>
          <div className="user-info">
            <div className="user-name">{profile?.full_name || profile?.email}</div>
            <div className="user-role-badge">{profile?.role}</div>
          </div>
          <LogOut size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
