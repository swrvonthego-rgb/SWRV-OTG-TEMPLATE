import React, { useState } from 'react';
import { ArrowRight, Globe, ExternalLink } from 'lucide-react';
import { NEED_A_WEBSITE, WEBSITE_TEMPLATES, PORTFOLIO_PROJECTS, WebsiteTemplate } from '../site.config';

const GOLD = '#c8a84b';
const GOLD_LIGHT = '#e8c96a';
const BG = '#0a0804';

// ── CSS mini-mockup preview — a stylized "browser window" per template ──
const TemplatePreview: React.FC<{ tpl: WebsiteTemplate }> = ({ tpl }) => {
  const fontFamily =
    tpl.font === 'serif' ? 'Georgia, serif' :
    tpl.font === 'mono' ? '"Share Tech Mono", monospace' :
    '"Inter", sans-serif';

  const block = (w: string, h: number, color: string, radius = 3): React.CSSProperties => ({
    width: w, height: h, background: color, borderRadius: radius,
  });

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      {/* Browser chrome */}
      <div style={{ background: '#e8e6e1', padding: '6px 10px', display: 'flex', gap: 5, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0655a' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0b25a' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6fbf73' }} />
      </div>
      {/* Page body */}
      <div style={{ background: tpl.bg, padding: 14, height: 150, fontFamily, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {/* Nav bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={block('26%', 7, tpl.accent, 2)} />
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={block('18px', 5, `${tpl.ink}44`)} />
            <div style={block('18px', 5, `${tpl.ink}44`)} />
            <div style={block('18px', 5, `${tpl.ink}44`)} />
          </div>
        </div>

        {tpl.layout === 'hero' && (
          <>
            <div style={{ ...block('100%', 54, `${tpl.accent}33`, 6), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: tpl.ink, letterSpacing: '0.06em' }}>YOUR NAME HERE</div>
            </div>
            <div style={block('70%', 6, `${tpl.ink}55`)} />
            <div style={block('50%', 6, `${tpl.ink}33`)} />
            <div style={{ ...block('34%', 16, tpl.accent, 999), marginTop: 2 }} />
          </>
        )}

        {tpl.layout === 'grid' && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: tpl.ink }}>Your Work</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, flex: 1 }}>
              {[0.5, 0.3, 0.4, 0.35, 0.55, 0.3].map((op, i) => (
                <div key={i} style={{ background: i === 0 ? tpl.accent : `${tpl.ink}${Math.round(op * 100).toString(16).padStart(2, '0')}`, borderRadius: 4, opacity: i === 0 ? 0.85 : 1 }} />
              ))}
            </div>
          </>
        )}

        {tpl.layout === 'split' && (
          <div style={{ display: 'flex', gap: 10, flex: 1 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: tpl.ink }}>Book a Session</div>
              <div style={block('90%', 5, `${tpl.ink}55`)} />
              <div style={block('75%', 5, `${tpl.ink}33`)} />
              <div style={{ ...block('60%', 15, tpl.accent, 999), marginTop: 3 }} />
            </div>
            <div style={{ flex: 1, background: `${tpl.accent}26`, borderRadius: 6, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3, padding: 6 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ background: i === 5 ? tpl.accent : `${tpl.ink}22`, borderRadius: 2 }} />
              ))}
            </div>
          </div>
        )}

        {tpl.layout === 'centered' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: tpl.accent }} />
            <div style={{ fontSize: 13, fontWeight: tpl.font === 'serif' ? 500 : 800, color: tpl.ink, fontStyle: tpl.font === 'serif' ? 'italic' : 'normal' }}>
              Your Vision Here
            </div>
            <div style={block('55%', 5, `${tpl.ink}44`)} />
            <div style={block('40%', 5, `${tpl.ink}2b`)} />
            <div style={{ ...block('32%', 15, tpl.accent, 999), marginTop: 2 }} />
          </div>
        )}

        {tpl.layout === 'list' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${tpl.ink}11`, borderRadius: 6, padding: '7px 10px' }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: i === 0 ? tpl.accent : `${tpl.ink}44`, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={block(`${70 - i * 12}%`, 5, `${tpl.ink}66`)} />
                </div>
                <div style={block('22px', 5, tpl.accent)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const NeedAWebsite: React.FC = () => {
  const [picked, setPicked] = useState<string | null>(null);

  const startTemplate = (tpl: WebsiteTemplate) => {
    setPicked(tpl.id);
    window.dispatchEvent(new CustomEvent('swrv:open-intake', {
      detail: { id: 'template-site', name: `Template Website — ${tpl.name} ($300)` },
    }));
  };

  const livePortfolio = PORTFOLIO_PROJECTS.filter(p => p.url || p.showcaseUrl);

  return (
    <section id="need-a-website" style={{ background: '#fafaf7', padding: '96px 0', color: '#0a0804' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ── VIDEO / CTA BANNER ── */}
        <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 56, position: 'relative', border: `1.5px solid ${GOLD}`, boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
          {NEED_A_WEBSITE.videoUrl ? (
            <div style={{ position: 'relative' }}>
              <video
                src={NEED_A_WEBSITE.videoUrl}
                autoPlay muted loop playsInline
                style={{ width: '100%', display: 'block', maxHeight: 560, objectFit: 'cover' }}
              />
              {/* Scrim + overlaid CTA */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,4,0.15) 0%, rgba(10,8,4,0.05) 40%, rgba(10,8,4,0.82) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(20px,4vw,44px)' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4.5vw,46px)', fontWeight: 400, color: '#fff', margin: '0 0 8px', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                  Need a website? <span style={{ color: GOLD_LIGHT }}>{NEED_A_WEBSITE.price} flat.</span>
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '0 0 18px', maxWidth: 520, lineHeight: 1.6, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                  Ten styles. Your brand. Live in days.
                </p>
                <div>
                  <a href="#website-templates" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', borderRadius: 999, textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
                    Browse the 10 Styles <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: `linear-gradient(135deg, ${BG} 0%, #1a1005 60%, #241503 100%)`, padding: 'clamp(40px,7vw,80px) clamp(24px,5vw,64px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(200,168,75,0.18), transparent 70%)', pointerEvents: 'none' }} />
              <Globe size={28} color={GOLD} style={{ marginBottom: 18 }} />
              <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(32px,5vw,54px)', fontWeight: 400, color: '#fff', margin: '0 0 14px', lineHeight: 1.1, maxWidth: 640 }}>
                Need a website?<br /><span style={{ color: GOLD }}>{NEED_A_WEBSITE.price} flat. Live in days.</span>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 560, margin: '0 0 24px' }}>
                {NEED_A_WEBSITE.subline}
              </p>
              <a href="#website-templates" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 30px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', borderRadius: 999, textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(200,168,75,0.35)' }}>
                Browse the 10 Styles <ArrowRight size={15} />
              </a>
            </div>
          )}
        </div>

        {/* ── PROOF — sites we've built ── */}
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, opacity: 0.8, marginBottom: 10, textAlign: 'center' }}>
            REAL SITES. REAL CLIENTS. BUILT BY SWRV.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {livePortfolio.map(p => (
              <a
                key={p.id}
                href={p.url || p.showcaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', background: '#fff',
                  border: '1px solid rgba(0,0,0,0.1)', borderRadius: 999,
                  fontSize: 13, fontWeight: 600, color: '#0a0804', textDecoration: 'none',
                  transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.accent, flexShrink: 0 }} />
                {p.name}
                <ExternalLink size={12} style={{ opacity: 0.4 }} />
              </a>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(10,8,4,0.45)', marginTop: 16 }}>
            Tap any of them — they're all live right now. Your site joins this list next.
          </p>
        </div>

        {/* ── TEMPLATE GRID ── */}
        <div id="website-templates">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, margin: '0 0 10px', color: '#0a0804' }}>
              {NEED_A_WEBSITE.headline}
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(10,8,4,0.55)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
              Every template is {NEED_A_WEBSITE.price} — customized with your brand, your content, your colors. Pick the one that feels like you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {WEBSITE_TEMPLATES.map(tpl => (
              <div key={tpl.id} style={{
                background: '#fff',
                border: picked === tpl.id ? `2px solid ${GOLD}` : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 18, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 12,
                boxShadow: picked === tpl.id ? '0 8px 32px rgba(200,168,75,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}>
                <TemplatePreview tpl={tpl} />
                <div style={{ padding: '0 4px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0a0804' }}>{tpl.name}</h4>
                    <span style={{ fontSize: 17, fontWeight: 800, color: GOLD }}>{NEED_A_WEBSITE.price}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'rgba(10,8,4,0.6)', margin: '0 0 4px', lineHeight: 1.5 }}>{tpl.style}</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(10,8,4,0.4)', margin: 0, lineHeight: 1.5 }}>Best for: {tpl.bestFor}</p>
                </div>
                <button
                  type="button"
                  onClick={() => startTemplate(tpl)}
                  style={{
                    width: '100%', padding: '12px',
                    background: picked === tpl.id ? `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})` : '#0a0804',
                    color: picked === tpl.id ? BG : '#fff',
                    border: 'none', borderRadius: 10,
                    fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
                    cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase',
                  }}
                >
                  {picked === tpl.id ? '✓ Let’s Build It' : 'Start With This One →'}
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(10,8,4,0.45)', marginTop: 32, lineHeight: 1.7, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Want something fully custom instead? Check out <a href="#ecosystem" style={{ color: GOLD, fontWeight: 700, textDecoration: 'none' }}>The Presence, The Platform &amp; The Ecosystem</a> — our ground-up builds.
          </p>
        </div>
      </div>
    </section>
  );
};
