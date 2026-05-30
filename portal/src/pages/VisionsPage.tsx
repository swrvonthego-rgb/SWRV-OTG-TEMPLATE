import { useEffect, useState } from 'react';
import { Map, Plus, ChevronRight, Calendar, Tag } from 'lucide-react';
import { supabase, type Vision } from '../lib/supabase';

export default function VisionsPage() {
  const [visions, setVisions] = useState<Vision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Vision | null>(null);

  useEffect(() => {
    supabase
      .from('visions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVisions((data as Vision[]) || []);
        setLoading(false);
      });
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      complete: 'badge-green', draft: 'badge-gray', archived: 'badge-gray',
    };
    return map[s] || 'badge-gray';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (selected) {
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setSelected(null)}>
            ← Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.06em' }}>
            {selected.title}
          </h1>
          <span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span>
        </div>

        <div className="content-grid content-grid-2" style={{ gap: 20 }}>
          {selected.route && (
            <div className="card card-accent">
              <div className="section-title" style={{ marginBottom: 16 }}><span>The</span> Route</div>
              <pre style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {JSON.stringify(selected.route, null, 2)}
              </pre>
            </div>
          )}
          {selected.coordinates && (
            <div className="card card-accent">
              <div className="section-title" style={{ marginBottom: 16 }}>Your <span>Coordinates</span></div>
              <pre style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {JSON.stringify(selected.coordinates, null, 2)}
              </pre>
            </div>
          )}
          {!selected.route && !selected.coordinates && (
            <div className="card" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state">
                <div className="empty-icon"><Map size={22} /></div>
                <h3>Vision in progress</h3>
                <p>Complete your Roadmap to see your full route and coordinates here.</p>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Version</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>v{selected.version}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Created</div>
              <div style={{ fontSize: '0.9rem' }}>{formatDate(selected.created_at)}</div>
            </div>
            {selected.completed_at && (
              <div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Completed</div>
                <div style={{ fontSize: '0.9rem' }}>{formatDate(selected.completed_at)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header fade-up" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
            My <span className="gold">Visions</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Every Roadmap you've completed lives here — your journey, documented.
          </p>
        </div>
        <a href="https://swrvonthego.pro" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <Plus size={15} /> New Vision
        </a>
      </div>

      {visions.length === 0 ? (
        <div className="card fade-up">
          <div className="empty-state">
            <div className="empty-icon"><Map size={26} /></div>
            <h3>No visions saved yet</h3>
            <p>When you complete a Roadmap on swrvonthego.pro, it'll appear here automatically.</p>
            <a href="https://swrvonthego.pro" target="_blank" rel="noopener noreferrer"
              className="btn btn-primary" style={{ marginTop: 20 }}>
              Start Your Roadmap
            </a>
          </div>
        </div>
      ) : (
        <div className="content-grid" style={{ gap: 12 }}>
          {visions.map((v, i) => (
            <div
              key={v.id}
              className={`card card-sm fade-up delay-${Math.min(i + 1, 4)}`}
              style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => setSelected(v)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="list-icon"><Map size={18} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 4 }}>{v.title}</div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} /> {formatDate(v.created_at)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Tag size={12} /> v{v.version}
                    </span>
                  </div>
                </div>
                <span className={`badge ${statusBadge(v.status)}`}>{v.status}</span>
                <ChevronRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
