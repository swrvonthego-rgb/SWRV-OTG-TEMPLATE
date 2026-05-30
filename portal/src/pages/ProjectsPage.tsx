import { useEffect, useState } from 'react';
import { FolderOpen, ChevronRight, Calendar, Layers, Download } from 'lucide-react';
import { supabase, type Project } from '../lib/supabase';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setProjects((data as Project[]) || []);
        setLoading(false);
      });
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      inquiry: 'badge-gold', proposal_sent: 'badge-blue', in_progress: 'badge-blue',
      review: 'badge-orange', delivered: 'badge-green', archived: 'badge-gray',
    };
    return map[s] || 'badge-gray';
  };

  const statusLabel = (s: string) => s.replace(/_/g, ' ');

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const serviceIcon = (type: string) => {
    const colors: Record<string, string> = {
      website: '#3498db', video: '#e74c3c', music: '#9b59b6',
      brand: '#e67e22', business: '#27ae60', podcast: '#f39c12',
      coaching: '#1abc9c', other: '#7f8c8d',
    };
    return colors[type] || '#7f8c8d';
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (selected) {
    const deliverables = selected.deliverables || [];
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setSelected(null)}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.06em' }}>{selected.title}</h1>
          <span className={`badge ${statusBadge(selected.status)}`} style={{ textTransform: 'capitalize' }}>{statusLabel(selected.status)}</span>
        </div>

        <div className="content-grid content-grid-2" style={{ gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Project <span>Details</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Service', selected.service_type],
                ['Tier', selected.tier || '—'],
                ['Price', selected.price ? `$${selected.price.toLocaleString()}` : '—'],
                ['Due Date', selected.due_date ? formatDate(selected.due_date) : '—'],
                ['Started', formatDate(selected.created_at)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{label}</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Project <span>Brief</span></div>
            {selected.brief ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{selected.brief}</p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Brief will appear once your project is confirmed.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}><span>Deliverables</span></div>
          {deliverables.length === 0 ? (
            <div className="empty-state" style={{ padding: '28px 16px' }}>
              <div className="empty-icon"><Download size={18} /></div>
              <h3>No deliverables yet</h3>
              <p>Files will appear here as your project progresses.</p>
            </div>
          ) : (
            deliverables.map((d, i) => (
              <div className="list-item" key={i}>
                <div className="list-icon"><Download size={15} /></div>
                <div className="list-body">
                  <div className="list-title">{d.name}</div>
                  <div className="list-sub">{formatDate(d.uploaded_at)}</div>
                </div>
                <a href={d.url} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.8rem' }} download>
                  Download
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header fade-up" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
            My <span className="gold">Projects</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Track every build, delivery, and milestone in one place.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card fade-up">
          <div className="empty-state">
            <div className="empty-icon"><FolderOpen size={26} /></div>
            <h3>No projects yet</h3>
            <p>Submit a project inquiry on the main site and it'll show up here.</p>
            <a href="https://swrvonthego.pro/#intake" target="_blank" rel="noopener noreferrer"
              className="btn btn-primary" style={{ marginTop: 20 }}>
              Start a Project
            </a>
          </div>
        </div>
      ) : (
        <div className="content-grid" style={{ gap: 12 }}>
          {projects.map((p, i) => (
            <div
              key={p.id}
              className={`card card-sm fade-up delay-${Math.min(i + 1, 4)}`}
              style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => setSelected(p)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="list-icon" style={{ background: `${serviceIcon(p.service_type)}22`, color: serviceIcon(p.service_type) }}>
                  <Layers size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.service_type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} /> Updated {formatDate(p.updated_at)}
                    </span>
                    {p.tier && <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>{p.tier}</span>}
                  </div>
                </div>
                <span className={`badge ${statusBadge(p.status)}`} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {statusLabel(p.status)}
                </span>
                <ChevronRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
