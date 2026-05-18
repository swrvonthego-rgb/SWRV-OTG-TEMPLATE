import React, { useState } from 'react';
import { ArrowRight, Check, Plus, Sparkles, Globe, Music, Video, Briefcase, Mic, Palette } from 'lucide-react';
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

  return (
    <section
      id="ecosystem"
      style={{
        background: 'linear-gradient(180deg,#fafaf7 0%,#f3f1ec 100%)',
        padding: '96px 0',
        color: '#0a0804',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,168,75,0.9)', marginBottom: 12 }}>
            THE SWRV ECOSYSTEM
          </p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(32px,5.5vw,52px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 16px', color: '#0a0804' }}>
            One marketplace.<br/>Every service you need.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(10,8,4,0.6)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
            Browse by category, add what you need to the cart, then check out below. Pricing is exact and consistent. No surprises.
          </p>
        </div>

        {/* Roadmap featured card */}
        <button
          onClick={onOpenRoadmap}
          style={{
            display: 'block',
            width: '100%',
            background: 'linear-gradient(135deg,#1a1408 0%,#0a0804 100%)',
            border: '1px solid rgba(200,168,75,0.4)',
            borderRadius: 20,
            padding: 'clamp(28px,4vw,40px)',
            color: '#fff',
            textAlign: 'left',
            cursor: 'pointer',
            marginBottom: 40,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle at top right,rgba(200,168,75,0.15),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) auto', gap: 24, alignItems: 'center' }} className="roadmap-card-grid">
            <div>
              <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(200,168,75,0.2)', color: '#c8a84b', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', borderRadius: 999, marginBottom: 16 }}>
                Start Here · {ROADMAP_PRICING.full.price}
              </span>
              <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 400, margin: '0 0 10px', lineHeight: 1.2 }}>
                The Roadmap
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, maxWidth: 540 }}>
                Don't know what you need? Take the Roadmap. AI-powered vision experience that names your gift and maps it to the exact services that will build it. Yours forever.
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', borderRadius: 999, whiteSpace: 'nowrap' }}>
                Start Roadmap <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </button>

        {/* Web packages — featured tier cards */}
        {(category === 'all' || category === 'web') && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(10,8,4,0.5)', marginBottom: 16 }}>
              Website Packages
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
              {WEB_PACKAGE_TIERS.map(tier => {
                const matchSvc = SERVICES.find(s => s.id === `website-${tier.id}` || s.id === tier.id);
                const cartId = matchSvc?.id || tier.id;
                const isAdded = added.has(cartId);
                return (
                  <div key={tier.id} style={{ background: '#fff', border: tier.badge === 'MOST POPULAR' ? '2px solid #c8a84b' : '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {tier.badge && (
                      <span style={{ position: 'absolute', top: -10, left: 24, padding: '4px 12px', background: '#c8a84b', color: '#0a0804', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', borderRadius: 4 }}>
                        {tier.badge}
                      </span>
                    )}
                    <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0a0804' }}>{tier.name}</h4>
                    <p style={{ fontSize: 13, color: 'rgba(10,8,4,0.55)', margin: '0 0 16px', lineHeight: 1.6 }}>{tier.tagline}</p>
                    <p style={{ fontSize: 28, fontWeight: 800, margin: '0 0 16px', color: '#0a0804' }}>
                      ${tier.price.toLocaleString()}
                      {tier.id === 'enterprise' && <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.5 }}>+</span>}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      {tier.includes.slice(0, 4).map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'rgba(10,8,4,0.65)', alignItems: 'flex-start' }}>
                          <Check size={13} style={{ color: '#c8a84b', flexShrink: 0, marginTop: 2 }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => matchSvc && handleAdd(matchSvc.id)}
                      disabled={!matchSvc}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: isAdded ? '#c8a84b' : '#0a0804',
                        color: isAdded ? '#0a0804' : '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        cursor: matchSvc ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isAdded ? '✓ Added to Cart' : 'Add to Cart →'}
                    </button>
                    {tier.liveExample && (
                      <a href={tier.liveExample.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 10, fontSize: 11, color: 'rgba(10,8,4,0.4)', textDecoration: 'underline', textAlign: 'center' }}>
                        See live example →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, justifyContent: 'center' }}>
          {CATEGORIES.map(c => {
            const isActive = category === c.key;
            const Icon = c.Icon;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: isActive ? '#0a0804' : 'rgba(0,0,0,0.04)',
                  color: isActive ? '#fff' : 'rgba(10,8,4,0.6)',
                  border: '1px solid ' + (isActive ? '#0a0804' : 'rgba(0,0,0,0.08)'),
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={13} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Service grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {visibleServices.map(svc => {
            const isAdded = added.has(svc.id);
            return (
              <div key={svc.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0a0804', lineHeight: 1.3 }}>{svc.name}</h4>
                  <p style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#c8a84b', whiteSpace: 'nowrap', flexShrink: 0 }}>{svc.price}</p>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(10,8,4,0.55)', lineHeight: 1.6, margin: '0 0 12px', flex: 1 }}>{svc.blurb}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {(svc as any).deliveryDays && (
                    <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(0,0,0,0.05)', color: 'rgba(10,8,4,0.55)', borderRadius: 999, fontWeight: 600 }}>
                      ⏱ {(svc as any).deliveryDays}d
                    </span>
                  )}
                  {(svc as any).revisions > 0 && (
                    <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(0,0,0,0.05)', color: 'rgba(10,8,4,0.55)', borderRadius: 999, fontWeight: 600 }}>
                      ↩ {(svc as any).revisions} rev
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAdd(svc.id)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: isAdded ? '#c8a84b' : 'rgba(0,0,0,0.04)',
                    color: isAdded ? '#0a0804' : '#0a0804',
                    border: '1px solid ' + (isAdded ? '#c8a84b' : 'rgba(0,0,0,0.1)'),
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add to Cart</>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout link at bottom */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'rgba(10,8,4,0.4)', marginBottom: 10 }}>Ready to check out?</p>
          <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#0a0804', color: '#fff', textDecoration: 'none', borderRadius: 999, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
            View Cart & Checkout <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .roadmap-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
