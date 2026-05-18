import React, { useState } from 'react';
import { ArrowRight, Check, Plus, Sparkles, Globe, Music, Video, Briefcase, Mic, Palette, Cpu, Settings, Shield } from 'lucide-react';
import { SERVICES, WEB_PACKAGE_TIERS, ROADMAP_PRICING } from '../site.config';

interface Props {
  onOpenRoadmap?: () => void;
}

const CATEGORIES = [
  { key: 'all',      label: 'All Services',     Icon: Sparkles,  match: () => true },
  { key: 'web',      label: 'Websites',         Icon: Globe,     match: (s: any) => s.id.includes('website') || s.id.includes('enterprise') || s.id.includes('fundraising') },
  { key: 'brand',    label: 'Brand & Identity', Icon: Palette,   match: (s: any) => ['brand-planning','logo-design','photography','content-system'].includes(s.id) },
  { key: 'music',    label: 'Music & Audio',    Icon: Music,     match: (s: any) => ['music-production','mixing','mastering','jingle','voiceover','audiobook','live-recording','audio-edit-alacarte'].includes(s.id) },
  { key: 'video',    label: 'Video & Motion',   Icon: Video,     match: (s: any) => ['music-video','video-promo','on-site-video','live-streaming','short-form-content','ai-motion-30','ai-motion-60','ai-motion-120','video-edit-alacarte'].includes(s.id) },
  { key: 'business', label: 'Business & Docs',  Icon: Briefcase, match: (s: any) => ['pitch-deck','keynote-slides','book-format','llc-formation'].includes(s.id) },
  { key: 'coaching', label: 'Coaching',         Icon: Mic,       match: (s: any) => ['vocal-training','recording-booth','artist-development','consulting-call','podcast-launch','podcast-editing'].includes(s.id) },
];

export const Marketplace: React.FC<Props> = ({ onOpenRoadmap }) => {
  const [category, setCategory] = useState('all');
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleAdd = (id: string) => {
    window.dispatchEvent(new CustomEvent('swrv:add-to-cart', { detail: { serviceId: id } }));
    setAdded(prev => new Set(prev).add(id));
    setTimeout(() => setAdded(prev => { const n = new Set(prev); n.delete(id); return n; }), 1800);
  };

  const activeCat = CATEGORIES.find(c => c.key === category)!;
  const visibleServices = SERVICES.filter(activeCat.match);

  const GOLD = '#c8a84b';
  const GOLD_LIGHT = '#e8c96a';
  const BG = '#0a0804';
  const BG_SOFT = '#13100a';
  const INK = '#ede8dc';
  const INK_MID = 'rgba(237,232,220,0.55)';
  const BORDER = 'rgba(200,168,75,0.12)';

  return (
    <section id="ecosystem" style={{ background: `linear-gradient(180deg,${BG} 0%,#080604 100%)`, padding: '120px 0', color: INK, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(200,168,75,0.08),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(200,168,75,0.05),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 16, opacity: 0.85 }}>THE SWRV ECOSYSTEM</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 24px', color: '#fff' }}>
            AI builds storefronts.<br/><span style={{ color: GOLD }}>We build the business.</span>
          </h2>
          <p style={{ fontSize: 17, color: INK_MID, lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
            Anyone can build a website with AI now. We get that. So we focused on what actually matters — what's running under the hood. Your roadmap, your engine, your payments, your workflow. The system that turns a webpage into a moving business.
          </p>
        </div>

        {/* DIFFERENTIATOR — 3 PILLARS */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }} className="mkt-grid">
            {[
              { Icon: Cpu,      title: 'THE ROADMAP', desc: 'We map your gift to a real route. Human direction, real questions, and a roadmap that shows you exactly where your gift is meant to take you.' },
              { Icon: Settings, title: 'THE BACKEND', desc: "Payments, databases, automations, integrations, security. The engine that keeps your business running while you stay focused on the road. The part AI doesn't handle." },
              { Icon: Shield,   title: 'THE SYSTEM',  desc: 'Workflows, bots, customer journeys, content pipelines. You set the destination — we make sure the ride gets you there clean.' },
            ].map((card, i) => (
              <div key={i} style={{ background: BG_SOFT, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'radial-gradient(circle,rgba(200,168,75,0.12),transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <card.Icon size={20} color={BG} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#fff', letterSpacing: '0.02em' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: INK_MID, lineHeight: 1.7, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'rgba(237,232,220,0.4)', fontStyle: 'italic', maxWidth: 580, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            "AI is the engine. We're the drivers — and we know the road."
          </p>
        </div>

        {/* ROADMAP FEATURED CARD */}
        <button onClick={onOpenRoadmap} style={{
          display: 'block', width: '100%', background: `linear-gradient(135deg,${BG_SOFT} 0%,${BG} 100%)`,
          border: `1.5px solid ${GOLD}`, borderRadius: 24, padding: 'clamp(32px,5vw,56px)', color: '#fff',
          textAlign: 'left', cursor: 'pointer', marginBottom: 56, position: 'relative', overflow: 'hidden',
          transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: '100%', background: 'radial-gradient(circle at top right,rgba(200,168,75,0.2),transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 32, alignItems: 'center' }} className="mkt-roadmap-grid">
            <div>
              <span style={{ display: 'inline-block', padding: '6px 16px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', borderRadius: 999, marginBottom: 20 }}>
                START HERE · {ROADMAP_PRICING.full.price}
              </span>
              <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, margin: '0 0 12px', lineHeight: 1.1, color: '#fff' }}>The Roadmap</h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: 0, maxWidth: 580 }}>
                Don't know what you need? Take The Roadmap. AI-powered vision experience that names your gift, maps your path, and tells you exactly which services build your specific business. Yours forever.
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(200,168,75,0.35)' }}>
                START ROADMAP <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </button>

        {/* PREMIUM WEB PACKAGES */}
        {(category === 'all' || category === 'web') && (
          <div style={{ marginBottom: 64 }}>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, opacity: 0.7, marginBottom: 10 }}>Website Packages</p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 400, margin: 0, color: '#fff', lineHeight: 1.2 }}>Four tiers. One built right for you.</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
              {WEB_PACKAGE_TIERS.map(tier => {
                const matchSvc = SERVICES.find(s => s.id === `website-${tier.id}` || s.id === tier.id);
                const cartId = matchSvc?.id || tier.id;
                const isAdded = added.has(cartId);
                const isFeatured = tier.badge === 'MOST POPULAR';
                return (
                  <div key={tier.id} style={{
                    background: isFeatured ? `linear-gradient(180deg,${BG_SOFT} 0%,${BG} 100%)` : BG_SOFT,
                    border: isFeatured ? `1.5px solid ${GOLD}` : `1px solid ${BORDER}`,
                    borderRadius: 16, padding: 28, position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: isFeatured ? '0 12px 40px rgba(200,168,75,0.12)' : '0 4px 20px rgba(0,0,0,0.3)',
                  }}>
                    {tier.badge && (
                      <span style={{ position: 'absolute', top: -10, left: 24, padding: '4px 14px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', borderRadius: 4, boxShadow: '0 4px 12px rgba(200,168,75,0.3)' }}>{tier.badge}</span>
                    )}
                    <h4 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 400, margin: '8px 0 6px', color: '#fff' }}>{tier.name}</h4>
                    <p style={{ fontSize: 12, color: INK_MID, margin: '0 0 20px', lineHeight: 1.6, minHeight: 38 }}>{tier.tagline}</p>
                    <p style={{ fontSize: 36, fontWeight: 700, margin: '0 0 4px', color: '#fff', letterSpacing: '-0.02em' }}>
                      ${tier.price.toLocaleString()}
                      {tier.id === 'enterprise' && <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.4, marginLeft: 4 }}>+</span>}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(237,232,220,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 20 }}>{tier.deliveryDays || 'Custom timeline'}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      {tier.includes.slice(0, 5).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: INK_MID, alignItems: 'flex-start', lineHeight: 1.5 }}>
                          <Check size={14} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => matchSvc && handleAdd(matchSvc.id)} disabled={!matchSvc} style={{
                      width: '100%', padding: '12px',
                      background: (isAdded || isFeatured) ? `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})` : 'rgba(255,255,255,0.06)',
                      color: (isAdded || isFeatured) ? BG : '#fff',
                      border: `1px solid ${(isAdded || isFeatured) ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 8, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', cursor: matchSvc ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s', textTransform: 'uppercase',
                    }}>
                      {isAdded ? '✓ Added' : 'Add to Cart →'}
                    </button>
                    {tier.liveExample && (
                      <a href={tier.liveExample.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 12, fontSize: 11, color: 'rgba(200,168,75,0.5)', textDecoration: 'underline', textAlign: 'center', letterSpacing: '0.05em' }}>See live example →</a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORY CHIPS */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, opacity: 0.7, marginBottom: 14, textAlign: 'center' }}>BROWSE THE FULL CATALOG</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(c => {
              const isActive = category === c.key;
              const Icon = c.Icon;
              return (
                <button key={c.key} onClick={() => setCategory(c.key)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                  background: isActive ? `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})` : 'rgba(255,255,255,0.04)',
                  color: isActive ? BG : 'rgba(237,232,220,0.7)',
                  border: `1px solid ${isActive ? GOLD : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <Icon size={13} />{c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SERVICE GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {visibleServices.map(svc => {
            const isAdded = added.has(svc.id);
            return (
              <div key={svc.id} style={{ background: BG_SOFT, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#fff', lineHeight: 1.3 }}>{svc.name}</h4>
                  <p style={{ fontSize: 14, fontWeight: 800, margin: 0, color: GOLD, whiteSpace: 'nowrap', flexShrink: 0 }}>{svc.price}</p>
                </div>
                <p style={{ fontSize: 12, color: INK_MID, lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>{svc.blurb}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {(svc as any).deliveryDays && <span style={{ fontSize: 10, padding: '3px 9px', background: 'rgba(255,255,255,0.04)', color: 'rgba(237,232,220,0.5)', borderRadius: 999, fontWeight: 600 }}>⏱ {(svc as any).deliveryDays}d</span>}
                  {(svc as any).revisions > 0 && <span style={{ fontSize: 10, padding: '3px 9px', background: 'rgba(255,255,255,0.04)', color: 'rgba(237,232,220,0.5)', borderRadius: 999, fontWeight: 600 }}>↩ {(svc as any).revisions} rev</span>}
                </div>
                <button onClick={() => handleAdd(svc.id)} style={{
                  width: '100%', padding: '10px',
                  background: isAdded ? `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})` : 'rgba(255,255,255,0.04)',
                  color: isAdded ? BG : '#fff',
                  border: `1px solid ${isAdded ? GOLD : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, letterSpacing: '0.04em',
                }}>
                  {isAdded ? <><Check size={13} /> ADDED</> : <><Plus size={13} /> ADD TO CART</>}
                </button>
              </div>
            );
          })}
        </div>

        {/* CHECKOUT */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ fontSize: 13, color: 'rgba(237,232,220,0.4)', marginBottom: 14 }}>Got what you need?</p>
          <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, textDecoration: 'none', borderRadius: 999, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(200,168,75,0.3)' }}>
            View Cart & Checkout <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .mkt-roadmap-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .mkt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};
