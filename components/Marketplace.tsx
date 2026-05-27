import React, { useState } from 'react';
import { ArrowRight, Check, Cpu, Settings, Shield } from 'lucide-react';
import { SERVICES, WEB_PACKAGE_TIERS, ROADMAP_PRICING, LAUNCH_MODE } from '../site.config';

interface Props {
  onOpenRoadmap?: () => void;
}

export const Marketplace: React.FC<Props> = ({ onOpenRoadmap }) => {
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleAdd = (id: string) => {
    window.dispatchEvent(new CustomEvent('swrv:add-to-cart', { detail: { serviceId: id } }));
    setAdded(prev => new Set(prev).add(id));
    setTimeout(() => setAdded(prev => { const n = new Set(prev); n.delete(id); return n; }), 1800);
  };


  const GOLD = '#c8a84b';
  const GOLD_LIGHT = '#e8c96a';
  const BG = '#0a0804';
  const BG_SOFT = '#13100a';
  const INK = '#ede8dc';
  const INK_MID = 'rgba(237,232,220,0.55)';
  const BORDER = 'rgba(200,168,75,0.12)';

  return (
    <>
    <section id="ecosystem" style={{ background: `linear-gradient(180deg,${BG} 0%,#080604 100%)`, padding: '120px 0', color: INK, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(200,168,75,0.08),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(200,168,75,0.05),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 16, opacity: 0.85 }}>THE SWRV ECOSYSTEM</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 24px', color: '#fff' }}>
            You handle the vision.<br/><span style={{ color: GOLD }}>We handle the operation.</span>
          </h2>
          <p style={{ fontSize: 17, color: INK_MID, lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
            You tell us what you want people to see. We build the operation behind it and keep it running — so you can focus on what matters most: your time.
          </p>
        </div>

        {/* DIFFERENTIATOR — 3 PILLARS */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }} className="mkt-grid">
            {[
              { Icon: Cpu,      title: 'THE ROADMAP', desc: 'We map your gift to a real route. Human direction, real questions, and a roadmap that shows you exactly where your gift is meant to take you.' },
              { Icon: Settings, title: 'THE BACKEND', desc: "Payments, databases, automations, integrations, security. The engine that keeps your business running while you stay focused on driving it forward." },
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
            "Your time is the only thing we can't replace. That's why we handle everything else."
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
                START HERE
              </span>
              <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, margin: '0 0 12px', lineHeight: 1.1, color: '#fff' }}>The Roadmap</h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: '0 0 16px', maxWidth: 580 }}>
                Don't know what you need? Take The Roadmap. A guided vision experience that names your gift, maps your path, and tells you exactly which services build your specific business. Yours forever.
              </p>
              {/* Pricing options — hidden in launch mode */}
              {!LAUNCH_MODE.active && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: `1px solid ${GOLD}`, borderRadius: 999, fontSize: 12, fontWeight: 700, color: GOLD }}>
                    Full Roadmap — {ROADMAP_PRICING.full.price}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                    Quick Vision — {ROADMAP_PRICING.quick.price}
                  </span>
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: BG, fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(200,168,75,0.35)' }}>
                START ROADMAP <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </button>

      </div>

      <style>{`
        @media (max-width: 700px) {
          .mkt-roadmap-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .mkt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>

    {/* ── WHITE SECTION: Pricing + Cart ── */}
    <section
      style={{
        background: '#fafaf7',
        padding: '96px 0',
        color: '#0a0804',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          {LAUNCH_MODE.active ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c8a84b', opacity: 0.8, marginBottom: 14 }}>
                NOW ACCEPTING CLIENTS
              </p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,46px)', fontWeight: 400, margin: '0 0 14px', color: '#0a0804', lineHeight: 1.1 }}>
                We just opened the doors.
              </h3>
              <p style={{ fontSize: 16, color: 'rgba(10,8,4,0.6)', lineHeight: 1.75, maxWidth: 560, margin: '0 0 20px' }}>
                {LAUNCH_MODE.subline}
              </p>
              <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#0a0804', color: '#fff', textDecoration: 'none', borderRadius: 999, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 32 }}>
                Book a Consultation →
              </a>
            </>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c8a84b', opacity: 0.8, marginBottom: 12 }}>
                CHOOSE YOUR TIER
              </p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,42px)', fontWeight: 400, margin: '0 0 10px', color: '#0a0804', lineHeight: 1.15 }}>
                Four tiers. One built right for you.
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(10,8,4,0.55)', lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
                Select what you need, add it to the cart, and check out below. Prices are exact. No surprises.
              </p>
            </>
          )}
        </div>

        {/* Packages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, marginBottom: 40 }}>
          {WEB_PACKAGE_TIERS.map(tier => {
            const matchSvc = SERVICES.find(s => s.id === `website-${tier.id}` || s.id === tier.id);
            const cartId = matchSvc?.id || tier.id;
            const isAdded = added.has(cartId);
            const isFeatured = tier.badge === 'MOST POPULAR';
            return (
              <div key={tier.id} style={{
                background: '#fff',
                border: isFeatured ? '2px solid #c8a84b' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 18,
                padding: 28,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isFeatured ? '0 8px 32px rgba(200,168,75,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                {tier.badge && (
                  <span style={{ position: 'absolute', top: -10, left: 24, padding: '4px 14px', background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', borderRadius: 4 }}>{tier.badge}</span>
                )}
                <h4 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 400, margin: '8px 0 4px', color: '#0a0804' }}>{tier.name}</h4>
                <p style={{ fontSize: 12, color: 'rgba(10,8,4,0.5)', margin: '0 0 18px', lineHeight: 1.6, minHeight: 36 }}>{tier.tagline}</p>
                {LAUNCH_MODE.active ? (
                  <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 20px', color: '#c8a84b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pricing on Request</p>
                ) : (
                  <>
                    <p style={{ fontSize: 38, fontWeight: 800, margin: '0 0 2px', color: '#0a0804', letterSpacing: '-0.02em' }}>
                      ${tier.price.toLocaleString()}
                      {tier.id === 'enterprise' && <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.4, marginLeft: 4 }}>+</span>}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(10,8,4,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 20 }}>{tier.deliveryDays || 'Custom timeline'}</p>
                  </>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {tier.includes.slice(0, 5).map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(10,8,4,0.65)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                      <Check size={14} style={{ color: '#c8a84b', flexShrink: 0, marginTop: 2 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => LAUNCH_MODE.active ? document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}) : (matchSvc && handleAdd(matchSvc.id))}
                  disabled={!matchSvc}
                  style={{
                    width: '100%', padding: '13px',
                    background: isAdded ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : (isFeatured ? '#0a0804' : 'rgba(0,0,0,0.04)'),
                    color: isAdded ? '#0a0804' : (isFeatured ? '#fff' : '#0a0804'),
                    border: isFeatured ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 10, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em',
                    cursor: matchSvc ? 'pointer' : 'not-allowed', transition: 'all 0.2s', textTransform: 'uppercase',
                  }}>
                  {LAUNCH_MODE.active ? 'Get a Quote →' : (isAdded ? '✓ Added to Cart' : 'Add to Cart →')}
                </button>
                {tier.liveExample && (
                  <a href={tier.liveExample.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: 12, fontSize: 11, color: 'rgba(10,8,4,0.35)', textDecoration: 'underline', textAlign: 'center', letterSpacing: '0.04em' }}>
                    See live example →
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Cart note */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(10,8,4,0.4)', marginBottom: 14 }}>Need a different service? You can select any service in the booking step below.</p>
          <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', textDecoration: 'none', borderRadius: 999, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(200,168,75,0.25)' }}>
            View Cart & Book <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
    </>
  );
};
