import { useEffect, useState } from 'react';
import { Map, FolderOpen, CreditCard, Bell, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, type Vision, type Project } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth();
  const [visions, setVisions] = useState<Vision[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: v }, { data: p }] = await Promise.all([
        supabase.from('visions').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('projects').select('*').order('updated_at', { ascending: false }).limit(3),
      ]);
      setVisions((v as Vision[]) || []);
      setProjects((p as Project[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      complete: 'badge-green', in_progress: 'badge-blue',
      inquiry: 'badge-gold', draft: 'badge-gray',
      delivered: 'badge-green', review: 'badge-orange',
    };
    return map[s] || 'badge-gray';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* Welcome */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.06em', marginBottom: 4 }}>
          {greeting()}, <span className="gold">{profile?.full_name?.split(' ')[0] || 'Traveler'}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Here's where your journey stands today.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid fade-up delay-1">
        <div className="stat-card">
          <div className="stat-icon"><Compass size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{visions.length}</div>
            <div className="stat-label">Visions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FolderOpen size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CreditCard size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">$0</div>
            <div className="stat-label">Outstanding</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Bell size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">0</div>
            <div className="stat-label">Notifications</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="content-grid content-grid-2" style={{ gap: 20 }}>
        {/* Recent Visions */}
        <div className="card card-accent fade-up delay-2">
          <div className="section-header">
            <div className="section-title"><span>My</span> Visions</div>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => onNavigate('visions')}>
              View all <ArrowRight size={13} />
            </button>
          </div>

          {visions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Map size={22} /></div>
              <h3>No visions yet</h3>
              <p>Complete your Roadmap to save your first vision.</p>
            </div>
          ) : (
            visions.map(v => (
              <div className="list-item" key={v.id}>
                <div className="list-icon"><Map size={16} /></div>
                <div className="list-body">
                  <div className="list-title">{v.title}</div>
                  <div className="list-sub">{formatDate(v.created_at)}</div>
                </div>
                <span className={`badge ${statusBadge(v.status)}`}>{v.status}</span>
              </div>
            ))
          )}
        </div>

        {/* Recent Projects */}
        <div className="card card-accent fade-up delay-3">
          <div className="section-header">
            <div className="section-title"><span>My</span> Projects</div>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => onNavigate('projects')}>
              View all <ArrowRight size={13} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FolderOpen size={22} /></div>
              <h3>No projects yet</h3>
              <p>Submit an inquiry to start your first project.</p>
            </div>
          ) : (
            projects.map(p => (
              <div className="list-item" key={p.id}>
                <div className="list-icon"><FolderOpen size={16} /></div>
                <div className="list-body">
                  <div className="list-title">{p.title}</div>
                  <div className="list-sub" style={{ textTransform: 'capitalize' }}>{p.service_type}</div>
                </div>
                <span className={`badge ${statusBadge(p.status)}`} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Call to action — start roadmap */}
      <div className="card fade-up delay-4" style={{
        marginTop: 20,
        background: 'linear-gradient(135deg, rgba(200,168,75,0.08) 0%, rgba(10,25,41,0) 60%)',
        border: '1px solid var(--border-hover)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.06em', marginBottom: 4 }}>
            Ready to map your next move?
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Your Roadmap is your GPS. Start a new vision and plot your route.
          </p>
        </div>
        <a
          href="https://swrvonthego.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Start Roadmap <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
}
