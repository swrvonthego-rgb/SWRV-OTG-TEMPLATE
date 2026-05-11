import { useState } from 'react';
import './services-menu.css';
import { SERVICES, BRAND } from '../../site.config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_META: Record<string, { label: string; tagline: string; emoji: string }> = {
  identity: {
    label: 'BRAND IDENTITY',
    tagline: 'Define who you are before you put it anywhere.',
    emoji: '✨',
  },
  execution: {
    label: 'EXECUTION & PRODUCTION',
    tagline: 'Bring it to life — websites, audio, video, business setup.',
    emoji: '🛠',
  },
  experience: {
    label: 'COACHING & MENTORSHIP',
    tagline: 'One-on-one training and development.',
    emoji: '🎯',
  },
};

export function ServicesMenu({ isOpen, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  if (!isOpen) return null;

  // Group services by category
  const grouped: Record<string, typeof SERVICES> = { identity: [], execution: [], experience: [] };
  SERVICES.forEach((svc) => {
    if (grouped[svc.category]) grouped[svc.category].push(svc);
  });

  const filterFn = (svc: typeof SERVICES[0]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return svc.name.toLowerCase().includes(q) || svc.blurb.toLowerCase().includes(q);
  };

  return (
    <div className="services-menu" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close services menu"
        className="sm-close"
      >×</button>

      <div className="sm-inner">
        {/* HEADER */}
        <header className="sm-header">
          <p className="sm-eyebrow">FULL SERVICE MENU</p>
          <h1 className="sm-title">SWRV ON THE GO<br/><span className="sm-title-accent">Services</span></h1>
          <p className="sm-intro">
            Everything you need to launch, brand, or scale — from your first logo to your funded launch site. À la carte or bundled.
          </p>
          <input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm-search"
            aria-label="Search services"
          />
        </header>

        {/* CATEGORIES */}
        {(['identity', 'execution', 'experience'] as const).map((cat) => {
          const items = grouped[cat].filter(filterFn);
          if (items.length === 0) return null;
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat} className="sm-category">
              <div className="sm-cat-header">
                <span className="sm-cat-emoji">{meta.emoji}</span>
                <div>
                  <h2 className="sm-cat-label">{meta.label}</h2>
                  <p className="sm-cat-tagline">{meta.tagline}</p>
                </div>
              </div>
              <div className="sm-grid">
                {items.map((svc) => (
                  <article key={svc.id} className={`sm-card ${svc.featured ? 'sm-card-featured' : ''}`}>
                    {svc.featured && <span className="sm-badge">★ Featured</span>}
                    <h3 className="sm-card-name">{svc.name}</h3>
                    <p className="sm-card-price">{svc.price}</p>
                    <p className="sm-card-blurb">{svc.blurb}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA FOOTER */}
        <footer className="sm-footer">
          <p className="sm-footer-eyebrow">DON'T SEE WHAT YOU NEED?</p>
          <h2 className="sm-footer-title">Custom packages available.</h2>
          <p className="sm-footer-body">
            If you're building something we haven't named yet — a course, a community, a campaign, a creative business with moving parts — let's talk. Most things can be bundled or made à la carte.
          </p>
          <a href={BRAND.ctaUrl} className="sm-cta-btn">Book a Strategy Call →</a>
          <p className="sm-footer-copy">© {new Date().getFullYear()} SWRV On The Go · swrvonthego.pro</p>
        </footer>
      </div>
    </div>
  );
}

export default ServicesMenu;
