import { useEffect, useState } from 'react';
import {
  Map, Plus, ChevronRight, Calendar, Tag, ArrowLeft,
  Star, Target, Compass, MessageSquare, Flag, AlertTriangle, User,
  Zap, Layers, TrendingUp, Award,
} from 'lucide-react';
import { supabase, type Vision } from '../lib/supabase';

// ── Types matching what Roadmap saves ─────────────────────────────────

interface RoadmapPhase {
  phase: string;
  timeframe: string;
  title: string;
  description: string;
  milestones: string[];
  challenges: string[];
  character_needed: string;
}

interface QAReflection {
  question: string;
  answer: string;
}

// ── Phase metadata ────────────────────────────────────────────────────

const PHASE_META: Record<string, { color: string; bg: string; Icon: React.ElementType }> = {
  Foundation: { color: '#f8c471', bg: 'rgba(243,156,18,0.1)',  Icon: Layers     },
  Building:   { color: '#5dade2', bg: 'rgba(52,152,219,0.1)',  Icon: TrendingUp },
  Momentum:   { color: '#58d68d', bg: 'rgba(46,204,113,0.1)',  Icon: Zap        },
  Arrival:    { color: '#c8a84b', bg: 'rgba(200,168,75,0.12)', Icon: Award      },
};

function getPhaseStyle(phase: string) {
  const key = Object.keys(PHASE_META).find(k => phase.toLowerCase().includes(k.toLowerCase()));
  return key ? PHASE_META[key] : PHASE_META.Foundation;
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadgeClass(s: string) {
  const map: Record<string, string> = {
    complete: 'badge-green', draft: 'badge-gray', archived: 'badge-gray',
  };
  return map[s] || 'badge-gray';
}

function getVisionStatement(v: Vision): string | null {
  if (!v.quick_answers) return null;
  const qa = v.quick_answers as Record<string, unknown>;
  return typeof qa.vision === 'string' ? qa.vision : null;
}

function getRoute(v: Vision): RoadmapPhase[] | null {
  if (!v.route) return null;
  if (Array.isArray(v.route)) return v.route as RoadmapPhase[];
  return null;
}

function getCoordinates(v: Vision): QAReflection[] | null {
  if (!v.coordinates) return null;
  if (Array.isArray(v.coordinates)) return v.coordinates as QAReflection[];
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────

function VisionStatement({ text }: { text: string }) {
  return (
    <div className="card card-accent" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'rgba(200,168,75,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--gold)', flexShrink: 0,
        }}>
          <Star size={16} />
        </div>
        <div className="section-title" style={{ margin: 0 }}>Your <span>Vision</span></div>
      </div>
      <p style={{
        fontSize: '1rem', lineHeight: 1.75, color: 'var(--text)',
        fontStyle: 'italic',
        borderLeft: '2px solid var(--gold)',
        paddingLeft: 16,
        margin: 0,
      }}>
        "{text}"
      </p>
    </div>
  );
}

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const { color, bg, Icon } = getPhaseStyle(phase.phase);
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className="card"
      style={{
        border: `1px solid ${open ? color + '40' : 'var(--border)'}`,
        transition: 'border-color 0.25s',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, padding: 0,
          color: 'inherit', font: 'inherit', textAlign: 'left',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0,
        }}>
          <Icon size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '1.05rem',
              letterSpacing: '0.06em', color: 'var(--text)',
            }}>
              {phase.title || phase.phase}
            </span>
            <span style={{
              fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20,
              background: bg, color, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {phase.phase}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {phase.timeframe}
          </div>
        </div>

        <ChevronRight
          size={16}
          style={{
            color: 'var(--text-dim)', flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Body */}
      {open && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Description */}
          {phase.description && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
              {phase.description}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Milestones */}
            {phase.milestones?.length > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', marginBottom: 10, fontWeight: 600,
                }}>
                  <Target size={12} /> Milestones
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {phase.milestones.map((m, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color, marginTop: 2, flexShrink: 0 }}>
                        <Flag size={12} />
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.55 }}>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {phase.challenges?.length > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', marginBottom: 10, fontWeight: 600,
                }}>
                  <AlertTriangle size={12} /> Challenges
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {phase.challenges.map((c, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#f1948a', marginTop: 2, flexShrink: 0 }}>
                        <AlertTriangle size={12} />
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Character needed */}
          {phase.character_needed && (
            <div style={{
              background: 'var(--navy-light)',
              border: `1px solid ${color}30`,
              borderRadius: 8, padding: '12px 16px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <User size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{
                  fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600,
                }}>Who you need to become</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  {phase.character_needed}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CoordinatesCard({ reflection, index }: { reflection: QAReflection; index: number }) {
  return (
    <div
      className={`card fade-up delay-${Math.min(index + 1, 4)}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'rgba(200,168,75,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--gold)',
        }}>
          <MessageSquare size={14} />
        </div>
        <p style={{
          fontSize: '0.82rem', letterSpacing: '0.02em',
          color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, flex: 1,
        }}>
          {reflection.question}
        </p>
      </div>
      <p style={{
        fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.72,
        margin: '0 0 0 38px',
        paddingLeft: 12,
        borderLeft: '2px solid rgba(200,168,75,0.3)',
      }}>
        {reflection.answer}
      </p>
    </div>
  );
}

// ── Detail view ───────────────────────────────────────────────────────

function VisionDetail({ vision, onBack }: { vision: Vision; onBack: () => void }) {
  const statement = getVisionStatement(vision);
  const route = getRoute(vision);
  const coordinates = getCoordinates(vision);
  const hasContent = statement || route || coordinates;

  return (
    <div className="fade-up">
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '6px 12px', gap: 6 }}
          onClick={onBack}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem',
            letterSpacing: '0.06em', margin: 0,
          }}>
            {vision.title}
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
            <span className={`badge ${statusBadgeClass(vision.status)}`}>{vision.status}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              v{vision.version} · {formatDate(vision.created_at)}
            </span>
            {vision.completed_at && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Completed {formatDate(vision.completed_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!hasContent ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Compass size={22} /></div>
            <h3>Vision in progress</h3>
            <p>Complete your Roadmap on swrvonthego.pro to see your full route and coordinates.</p>
            <a href="https://swrvonthego.pro/?roadmap=1" target="_blank" rel="noopener noreferrer"
              className="btn btn-primary" style={{ marginTop: 20 }}>
              Continue Roadmap
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Vision statement */}
          {statement && <VisionStatement text={statement} />}

          {/* Route — roadmap timeline */}
          {route && route.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(200,168,75,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gold)',
                }}>
                  <Map size={16} />
                </div>
                <div className="section-title" style={{ margin: 0 }}>The <span>Route</span></div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {route.length} phase{route.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {route.map((phase, i) => (
                  <PhaseCard key={i} phase={phase} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Coordinates — Q&A reflections */}
          {coordinates && coordinates.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(200,168,75,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gold)',
                }}>
                  <Compass size={16} />
                </div>
                <div className="section-title" style={{ margin: 0 }}>Your <span>Coordinates</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {coordinates.map((r, i) => (
                  <CoordinatesCard key={i} reflection={r} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

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

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (selected) {
    return <VisionDetail vision={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <div className="section-header fade-up" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em',
          }}>
            My <span className="gold">Visions</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Every Roadmap you've completed lives here — your journey, documented.
          </p>
        </div>
        <a href="https://swrvonthego.pro/?roadmap=1" target="_blank" rel="noopener noreferrer"
          className="btn btn-primary">
          <Plus size={15} /> New Vision
        </a>
      </div>

      {visions.length === 0 ? (
        <div className="card fade-up">
          <div className="empty-state">
            <div className="empty-icon"><Map size={26} /></div>
            <h3>No visions saved yet</h3>
            <p>When you complete a Roadmap on swrvonthego.pro, it'll appear here automatically.</p>
            <a href="https://swrvonthego.pro/?roadmap=1" target="_blank" rel="noopener noreferrer"
              className="btn btn-primary" style={{ marginTop: 20 }}>
              Start Your Roadmap
            </a>
          </div>
        </div>
      ) : (
        <div className="content-grid" style={{ gap: 12 }}>
          {visions.map((v, i) => {
            const route = getRoute(v);
            const coordinates = getCoordinates(v);
            const phaseCount = route?.length ?? 0;
            const qaCount = coordinates?.length ?? 0;

            return (
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
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 6 }}>{v.title}</div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: '0.78rem', color: 'var(--text-muted)',
                      }}>
                        <Calendar size={12} /> {formatDate(v.created_at)}
                      </span>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: '0.78rem', color: 'var(--text-muted)',
                      }}>
                        <Tag size={12} /> v{v.version}
                      </span>
                      {phaseCount > 0 && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: '0.78rem', color: 'var(--text-muted)',
                        }}>
                          <Map size={12} /> {phaseCount} phases
                        </span>
                      )}
                      {qaCount > 0 && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: '0.78rem', color: 'var(--text-muted)',
                        }}>
                          <MessageSquare size={12} /> {qaCount} reflections
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`badge ${statusBadgeClass(v.status)}`}>{v.status}</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
