import React from 'react';
import { PORTFOLIO_PROJECTS } from '../site.config';
import { ArrowUpRight } from 'lucide-react';

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  'live':           { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', dot: '#4ade80' },
  'in-development': { bg: 'rgba(200,168,75,0.12)',  color: '#e8c96a', dot: '#e8c96a' },
  'ongoing':        { bg: 'rgba(157,78,221,0.14)',  color: '#c77dff', dot: '#c77dff' },
};

export const Portfolio: React.FC = () => {
  if (!PORTFOLIO_PROJECTS.length) return null;

  return (
    <section
      id="portfolio"
      style={{
        background: 'linear-gradient(180deg,#060608 0%,#0a0a0d 100%)',
        padding: '110px 0',
        color: '#ede8dc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '8%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(200,168,75,0.06),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* Header */}
        <div style={{ marginBottom: 56, maxWidth: 680 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,168,75,0.85)', marginBottom: 16 }}>
            PORTFOLIO
          </p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(32px,5.5vw,52px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 20px', color: '#fff' }}>
            What I've built.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(237,232,220,0.6)', lineHeight: 1.75, margin: 0 }}>
            A working selection of the apps, platforms, and systems I've designed and developed — from full-stack web applications to brand websites and custom tools. Most are live. All are mine, end to end.
          </p>
        </div>

        {/* Project grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 20 }}>
          {PORTFOLIO_PROJECTS.map(project => {
            const st = STATUS_STYLE[project.status] || STATUS_STYLE['live'];
            const clickable = !!project.url;
            const CardTag: any = clickable ? 'a' : 'div';
            const linkProps = clickable ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' } : {};

            return (
              <CardTag
                key={project.id}
                {...linkProps}
                style={{
                  display: 'block',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 18,
                  padding: 28,
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'transform 0.25s, border-color 0.25s',
                }}
                onMouseEnter={(e: any) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = project.accent + '66'; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {/* Accent glow */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle,${project.accent}22,transparent 70%)`, pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                  {/* Status + type row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', background: st.bg, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: st.color }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, animation: project.status === 'live' ? 'portfolio-pulse 2s infinite' : 'none' }} />
                      {project.statusLabel}
                    </span>
                    {clickable && <ArrowUpRight size={18} style={{ color: 'rgba(237,232,220,0.4)' }} />}
                  </div>

                  {/* Name */}
                  <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: '#fff', letterSpacing: '-0.01em' }}>{project.name}</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: project.accent, margin: '0 0 16px' }}>{project.type}</p>

                  {/* Description */}
                  <p style={{ fontSize: 14, color: 'rgba(237,232,220,0.6)', lineHeight: 1.7, margin: '0 0 18px' }}>{project.description}</p>

                  {/* Role */}
                  <p style={{ fontSize: 12, color: 'rgba(237,232,220,0.4)', margin: '0 0 14px' }}>
                    <span style={{ fontWeight: 700, color: 'rgba(237,232,220,0.55)' }}>Role:</span> {project.role}
                  </p>

                  {/* Stack tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {project.stack.map((tech, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, color: 'rgba(237,232,220,0.55)', fontWeight: 500 }}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* CTA row — showcase + live links */}
                  {(project.showcaseUrl || project.url) && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                      {project.showcaseUrl && (
                        <a
                          href={project.showcaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: project.accent + '22', border: `1px solid ${project.accent}55`, borderRadius: 999, fontSize: 12, fontWeight: 700, color: project.accent, textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          See Details →
                        </a>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          Visit Live <ArrowUpRight size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardTag>
            );
          })}
        </div>

        {/* Contact line */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ fontSize: 14, color: 'rgba(237,232,220,0.45)', marginBottom: 14 }}>
            Want to talk about working together or a role?
          </p>
          <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', textDecoration: 'none', borderRadius: 999, fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Get in Touch →
          </a>
        </div>
      </div>

      <style>{`
        @keyframes portfolio-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
};
