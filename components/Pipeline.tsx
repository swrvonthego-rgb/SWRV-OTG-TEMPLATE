import React from 'react';
import { PIPELINE_PROJECTS } from '../site.config';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'live-preview':   { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80', dot: '#4ade80' },
  'in-development': { bg: 'rgba(200,168,75,0.12)',  text: '#c8a84b', dot: '#c8a84b' },
  'coming-soon':    { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', dot: 'rgba(255,255,255,0.3)' },
};

export const Pipeline: React.FC = () => {
  if (!PIPELINE_PROJECTS.length) return null;

  return (
    <section
      id="pipeline"
      style={{
        background: 'linear-gradient(180deg, #080806 0%, #0a0804 100%)',
        padding: '96px 0',
        borderTop: '1px solid rgba(200,168,75,0.08)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.35em',
            textTransform: 'uppercase', color: 'rgba(200,168,75,0.6)',
            marginBottom: 12,
          }}>
            REVVING UP
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 5vw, 46px)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
            margin: '0 0 16px',
          }}>
            Revving Up
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7, maxWidth: 560, margin: 0,
          }}>
            SWRV isn't just a service agency. There are tools, resources, and experiences being built for people in their gift and on the go. This is what's coming.
          </p>
        </div>

        {/* Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {PIPELINE_PROJECTS.map((project) => {
            const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES['coming-soon'];
            const paragraphs = project.description.split('\n\n');

            return (
              <div
                key={project.id}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(200,168,75,0.15)',
                  borderRadius: 20,
                  padding: 'clamp(24px, 4vw, 48px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle gold glow top-left */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: 300, height: 300,
                  background: 'radial-gradient(circle at 0% 0%, rgba(200,168,75,0.06), transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative' }}>
                  {/* Status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', borderRadius: 999,
                      background: statusStyle.bg,
                      fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: statusStyle.text,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: statusStyle.dot,
                        animation: project.status === 'live-preview' ? 'pipeline-pulse 2s infinite' : 'none',
                        flexShrink: 0,
                      }} />
                      {project.statusLabel}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                      Free Access · SWRV Project
                    </span>
                  </div>

                  {/* Two-column layout on desktop */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.8fr)',
                    gap: 'clamp(24px, 4vw, 56px)',
                    alignItems: 'start',
                  }}
                  className="pipeline-grid"
                  >
                    {/* Left: Title + CTA */}
                    <div>
                      <h3 style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontSize: 'clamp(22px, 3vw, 32px)',
                        fontWeight: 400,
                        color: '#fff',
                        lineHeight: 1.2,
                        margin: '0 0 10px',
                      }}>
                        {project.name}
                      </h3>
                      <p style={{
                        fontSize: 14, fontWeight: 600,
                        color: project.accentColor,
                        margin: '0 0 28px',
                        letterSpacing: '0.02em',
                      }}>
                        {project.tagline}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '13px 24px',
                              background: 'linear-gradient(135deg,#c8a84b,#e8c96a)',
                              color: '#0a0804',
                              fontWeight: 800,
                              fontSize: 13,
                              letterSpacing: '0.05em',
                              borderRadius: 999,
                              textDecoration: 'none',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              boxShadow: '0 6px 20px rgba(200,168,75,0.3)',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 28px rgba(200,168,75,0.5)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(200,168,75,0.3)';
                            }}
                          >
                            {project.ctaLabel}
                          </a>
                        )}
                        {project.supportCta && project.supportUrl && (
                          <a
                            href={project.supportUrl}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '12px 24px',
                              border: '1px solid rgba(200,168,75,0.3)',
                              color: 'rgba(200,168,75,0.8)',
                              fontWeight: 600,
                              fontSize: 13,
                              letterSpacing: '0.04em',
                              borderRadius: 999,
                              textDecoration: 'none',
                              transition: 'border-color 0.2s, color 0.2s',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,168,75,0.7)';
                              (e.currentTarget as HTMLAnchorElement).style.color = '#c8a84b';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,168,75,0.3)';
                              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(200,168,75,0.8)';
                            }}
                          >
                            {project.supportCta}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Description */}
                    <div>
                      {paragraphs.map((para, i) => (
                        <p key={i} style={{
                          fontSize: 15,
                          color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
                          lineHeight: 1.85,
                          margin: i === 0 ? '0 0 18px' : '0 0 14px',
                          fontWeight: i === 0 ? 500 : 400,
                        }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* More coming note */}
        <p style={{
          textAlign: 'center',
          marginTop: 48,
          fontSize: 13,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.05em',
        }}>
          More projects in development — stay connected.
        </p>
      </div>

      <style>{`
        @keyframes pipeline-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 680px) {
          .pipeline-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
