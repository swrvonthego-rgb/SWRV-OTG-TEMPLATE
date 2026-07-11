import React, { useState } from 'react';
import { ArrowRight, ExternalLink, Check, Clock, Smartphone, Palette, Mail, Zap } from 'lucide-react';
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
      detail: { id: 'website-presence', name: `The Presence — ${tpl.name} ($300 special)` },
    }));
  };

  const livePortfolio = PORTFOLIO_PROJECTS.filter(p => p.url || p.showcaseUrl);

  return (
    <section id="need-a-website" style={{ background: '#fafaf7', padding: '96px 0', color: '#0a0804' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ── LANDING HERO — portrait video + pitch side-by-side ── */}
        <div style={{
          background: `linear-gradient(135deg, ${BG} 0%, #14100a 55%, #241503 100%)`,
          borderRadius: 28, marginBottom: 48, padding: 'clamp(28px,4vw,56px)',
          border: `1.5px solid ${GOLD}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* soft glow */}
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(200,168,75,0.16), transparent 70%)', pointerEvents: 'none' }} />

          <style>{`
            .naw-hero-grid { display: grid; gap: clamp(24px,4vw,48px); align-items: center;
              grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
              position: relative; }
            @media (max-width: 768px) {
              .naw-hero-grid { grid-template-columns: 1fr; }
              .naw-hero-video { max-width: 260px !important; margin: 0 auto; }
            }
          `}</style>
          <div className="naw-hero-grid">
            {/* Left — pitch + CTA */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
                NEED A WEBSITE?
              </p>
              <h2 style={{
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                fontSize: 'clamp(30px,5vw,54px)', fontWeight: 400,
                color: '#fff', margin: '0 0 18px', lineHeight: 1.05,
              }}>
                <span style={{ color: GOLD_LIGHT }}>$300 flat.</span><br />
                Live in 5 days.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', margin: '0 0 24px', maxWidth: 520 }}>
                Pick from ten professionally designed templates. We swap in your brand,
                your words, your photos, and hand you a working website — no monthly
                fees, no surprises.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                <a href="#whats-included" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '15px 28px',
                  background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`,
                  color: BG, fontWeight: 800, fontSize: 13, letterSpacing: '0.1em',
                  borderRadius: 999, textDecoration: 'none', textTransform: 'uppercase',
                  boxShadow: '0 10px 28px rgba(200,168,75,0.35)',
                }}>
                  See What's Included <ArrowRight size={15} />
                </a>
                <a href="#website-templates" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '15px 28px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em',
                  borderRadius: 999, textDecoration: 'none', textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  Browse the 10 Styles
                </a>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
                No monthly fees · You own everything · Revisions included
              </p>
            </div>

            {/* Right — portrait video */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {NEED_A_WEBSITE.videoUrl ? (
                <div className="naw-hero-video" style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 320,
                  aspectRatio: '9 / 16',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `1px solid rgba(200,168,75,0.4)`,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
                  background: '#000',
                }}>
                  <video
                    src={NEED_A_WEBSITE.videoUrl}
                    autoPlay muted loop playsInline
                    style={{
                      width: '100%', height: '100%', display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                  {/* subtle bottom fade so a caption could sit here */}
                  <div style={{
                    position: 'absolute', inset: 'auto 0 0 0', height: '30%',
                    background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.6))',
                    pointerEvents: 'none',
                  }} />
                </div>
              ) : (
                <div style={{
                  width: '100%', maxWidth: 320, aspectRatio: '9 / 16',
                  borderRadius: 20,
                  background: 'linear-gradient(180deg, rgba(200,168,75,0.15), rgba(200,168,75,0.03))',
                  border: '1px dashed rgba(200,168,75,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', padding: 20,
                }}>
                  Promo video slot
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── WHAT'S INCLUDED — clarity panel ── */}
        <div id="whats-included" style={{ scrollMarginTop: 100, marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 10 }}>
              WHAT YOU GET FOR $300
            </p>
            <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, margin: '0 0 12px', color: BG }}>
              Everything you need to be online — done right.
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(10,8,4,0.6)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              One flat price. No monthly fees, no surprises. Here's exactly what's included.
            </p>
          </div>

          {/* Value props strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 32,
          }}>
            {[
              { Icon: Clock,      title: 'Live in 5 Days',  sub: 'Not weeks. Days.' },
              { Icon: Smartphone, title: 'Mobile Ready',    sub: 'Perfect on every phone' },
              { Icon: Palette,    title: 'Your Brand',      sub: 'Your colors, logo, words' },
              { Icon: Mail,       title: 'Contact Form',    sub: 'Wired to your email' },
              { Icon: Zap,        title: 'Fast Loading',    sub: 'Under 2 seconds' },
            ].map((v, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 14, padding: '18px 16px', textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: 10,
                  background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`,
                  marginBottom: 10,
                }}>
                  <v.Icon size={18} color={BG} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: BG, marginBottom: 2 }}>{v.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(10,8,4,0.55)' }}>{v.sub}</div>
              </div>
            ))}
          </div>

          {/* Detailed breakdown — 2 columns: included / not included */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}>
            {/* Included */}
            <div style={{ background: '#fff', border: `1.5px solid ${GOLD}`, borderRadius: 18, padding: 28, position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -12, left: 24,
                background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`,
                color: BG, fontSize: 10, fontWeight: 700, letterSpacing: '0.25em',
                textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999,
              }}>Included</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Your choice of 10 template styles',
                  'Full customization — your brand colors, logo, fonts',
                  'Your written content dropped in',
                  'Up to 5 pages (home, about, services, contact, etc.)',
                  'Mobile responsive — looks great on every device',
                  'Contact form wired to your email',
                  'Basic SEO setup (title, description, sitemap)',
                  '1 round of revisions after launch',
                  'Launched in 5 business days',
                ].map((it, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'rgba(10,8,4,0.85)', lineHeight: 1.5 }}>
                    <Check size={18} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not included / add-on */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 18, padding: 28, position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -12, left: 24,
                background: 'rgba(10,8,4,0.7)',
                color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em',
                textTransform: 'uppercase', padding: '5px 12px', borderRadius: 999,
              }}>Optional Add-Ons</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { it: 'More pages — upgrade to The Platform', note: '$500' },
                  { it: 'Full site — upgrade to The Ecosystem', note: '$1,000' },
                  { it: 'E-commerce / online store',            note: '+$200' },
                  { it: 'Copywriting (we write for you)',       note: '+$100' },
                  { it: 'Custom domain purchase & setup',       note: '+$30' },
                  { it: 'Monthly management (full service)',    note: '$125/mo' },
                ].map((row, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, color: 'rgba(10,8,4,0.7)', lineHeight: 1.5 }}>
                    <span>{row.it}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, whiteSpace: 'nowrap' }}>{row.note}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 12, color: 'rgba(10,8,4,0.4)', fontStyle: 'italic', margin: 0 }}>
                Add on when you book — we'll quote it before starting.
              </p>
            </div>
          </div>

          {/* HOW IT WORKS — 3 steps */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(200,168,75,0.06), rgba(200,168,75,0.02))',
            border: '1px solid rgba(200,168,75,0.2)',
            borderRadius: 18, padding: 'clamp(24px,3vw,36px)',
            marginBottom: 28,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 6, textAlign: 'center' }}>
              HOW IT WORKS
            </p>
            <h4 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, margin: '0 0 28px', color: BG }}>
              Three steps from picked to live.
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
              {[
                { n: '1', t: 'Pick your style',   d: 'Browse the 10 templates below. Tap the one that feels like you — you\'ll open a short brief so we know what you need.' },
                { n: '2', t: 'Send us your stuff', d: 'Your logo, your words, a few photos. We handle the rest — the design, the code, the setup.' },
                { n: '3', t: 'Go live in 5 days', d: 'You get a link to review, we swap in your feedback (1 round), and your site is live on your domain.' },
              ].map(s => (
                <div key={s.n} style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: BG, color: GOLD,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700,
                    marginBottom: 14,
                  }}>{s.n}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: BG, marginBottom: 6 }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: 'rgba(10,8,4,0.6)', lineHeight: 1.6 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Big CTA */}
          <div style={{ textAlign: 'center' }}>
            <a href="#website-templates" style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '18px 40px',
              background: `linear-gradient(135deg,${BG},#1a1005)`,
              color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.12em',
              borderRadius: 999, textDecoration: 'none', textTransform: 'uppercase',
              border: `1.5px solid ${GOLD}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            }}>
              Pick Your Template — <span style={{ color: GOLD_LIGHT }}>$300 Flat</span>
              <ArrowRight size={18} />
            </a>
            <p style={{ fontSize: 12, color: 'rgba(10,8,4,0.45)', marginTop: 14 }}>
              10 styles below · No commitment to browse
            </p>
          </div>
        </div>


        {/* ── PROOF — sites we've built ── */}
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 10, textAlign: 'center' }}>
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
