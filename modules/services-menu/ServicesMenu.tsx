import React, { useState, useEffect } from 'react';
import './services-menu.css';
import { SERVICES, SERVICE_SUBCATEGORIES as SUB_CATEGORIES } from '../../site.config';
import { CheckoutModal, CheckoutService } from './CheckoutModal';
import { EventCoverage } from './EventCoverage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBookStrategyCall?: () => void;
}

// Build lookup map: serviceId → service
const SERVICE_MAP: Record<string, typeof SERVICES[0]> = {};
SERVICES.forEach((s) => { SERVICE_MAP[s.id] = s; });

export function ServicesMenu({ isOpen, onClose, onBookStrategyCall }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roadmapRecs, setRoadmapRecs] = useState<string[]>([]);
  const [checkoutService, setCheckoutService] = useState<CheckoutService | null>(null);

  // Listen for Roadmap recommendations broadcast
  useEffect(() => {
    const handler = (e: Event) => {
      const names = (e as CustomEvent<string[]>).detail;
      if (Array.isArray(names) && names.length) setRoadmapRecs(names);
    };
    window.addEventListener('swrv:roadmap-recommendations', handler);
    return () => window.removeEventListener('swrv:roadmap-recommendations', handler);
  }, []);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();
  const filterFn = (svc: typeof SERVICES[0]) => {
    if (!q) return true;
    return svc.name.toLowerCase().includes(q) || svc.blurb.toLowerCase().includes(q);
  };

  // Shared CTA block for a service card: a checkout-enabled service leads
  // with "pay 50% now"; everything else (hourly, custom-quoted, monthly)
  // leads with the inquiry form since there's no fixed total to split.
  const renderCardCta = (svc: typeof SERVICES[0]) => {
    const openIntake = () => {
      window.dispatchEvent(new CustomEvent('swrv:open-intake', { detail: { id: svc.id, name: svc.name } }));
      onClose?.();
    };
    if (svc.checkoutEnabled) {
      return (
        <div className="sm-card-cta-row">
          <button type="button" className="sm-book-btn" onClick={() => setCheckoutService({ id: svc.id, name: svc.name, priceNumeric: svc.priceNumeric, checkoutCategory: svc.checkoutCategory })}>
            Book & Pay 50% →
          </button>
          <button type="button" className="sm-quote-link" onClick={openIntake}>
            Questions first? Ask →
          </button>
        </div>
      );
    }
    return (
      <div className="sm-card-cta-row">
        <button type="button" className="sm-intake-btn" onClick={openIntake}>
          Request a Quote →
        </button>
      </div>
    );
  };

  // A sample of real finished work — same shape as WebPackageTier.liveExample.
  const renderLiveExample = (svc: typeof SERVICES[0]) => {
    if (!svc.liveExample) return null;
    return (
      <a href={svc.liveExample.url} target="_blank" rel="noopener noreferrer" className="sm-card-example">
        <span className="sm-card-example-label">{svc.liveExample.label}</span>
        <p className="sm-card-example-desc">{svc.liveExample.description}</p>
      </a>
    );
  };

  const handleStrategyCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBookStrategyCall) {
      onBookStrategyCall();
    }
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
        {/* HERO IMAGE — Leader of the Revolution */}
        <div className="sm-hero-image">
          <img
            src="https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/1752950982581945_2_kk3jt3_ui7upw.png"
            alt="Leader of the Revolution — SWRV On The Go"
            className="sm-hero-img"
          />
          <p className="sm-hero-caption">LEADER OF THE REVOLUTION</p>
        </div>

        {/* SWRV EVENT COVERAGE — category picker + fixed, bookable tiers */}
        <EventCoverage
          onBook={(svc) => setCheckoutService(svc)}
          onIntake={(id, name, path) => {
            window.dispatchEvent(new CustomEvent('swrv:open-intake', { detail: { id, name, path } }));
            onClose?.();
          }}
        />

        {/* ROADMAP RECOMMENDATIONS — shown only when coming from Roadmap CTA */}
        {roadmapRecs.length > 0 && (
          <section className="sm-recs">
            <div className="sm-recs-header">
              <span className="sm-recs-emoji">🗺️</span>
              <div>
                <h2 className="sm-recs-label">YOUR ROADMAP RECOMMENDS</h2>
                <p className="sm-recs-sub">Based on your vision — these services align with where you're going.</p>
              </div>
            </div>
            <div className="sm-grid">
              {roadmapRecs.map((name) => {
                const svc = SERVICES.find(s => s.name === name);
                if (!svc) return null;
                return (
                  <article key={svc.id} className="sm-card sm-card-featured sm-card-rec">
                    <span className="sm-badge">✦ Your Roadmap</span>
                    <h3 className="sm-card-name">{svc.name}</h3>
                    <p className="sm-card-price">{svc.price}</p>
                    <p className="sm-card-blurb">{svc.blurb}</p>
                    {!!svc.includes?.length && (
                      <ul className="sm-card-includes">
                        {svc.includes.slice(0, 3).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                    {renderLiveExample(svc)}
                    {renderCardCta(svc)}
                  </article>
                );
              })}
            </div>
            <button
              type="button"
              className="sm-recs-clear"
              onClick={() => setRoadmapRecs([])}
            >
              See all services ↓
            </button>
          </section>
        )}

        {/* HEADER */}
        <header className="sm-header">
          <p className="sm-eyebrow">FULL SERVICE MENU</p>
          <h1 className="sm-title">SWRV ON THE GO<br/><span className="sm-title-accent">Service</span></h1>
          <p className="sm-intro">
            Event content and websites — pick a package, book it, and pay right here. More packages are on the way.
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

        {/* SUB-CATEGORIES */}
        {SUB_CATEGORIES.map((sub) => {
          const items = sub.serviceIds
            .map((id) => SERVICE_MAP[id])
            .filter(Boolean)
            .filter(filterFn);
          if (items.length === 0) return null;
          return (
            <section key={sub.id} className="sm-category">
              <div className="sm-cat-header">
                <span className="sm-cat-emoji">{sub.emoji}</span>
                <div className="sm-cat-text">
                  <h2 className="sm-cat-label">{sub.label}</h2>
                  <p className="sm-cat-tagline">{sub.tagline}</p>
                </div>
                <span className="sm-cat-count">{items.length}</span>
              </div>
              <div className="sm-grid">
                {items.map((svc) => (
                  <article key={svc.id} className={`sm-card ${svc.featured ? 'sm-card-featured' : ''}`}>
                    {svc.featured && <span className="sm-badge">★ Featured</span>}
                    <h3 className="sm-card-name">{svc.name}</h3>
                    <p className="sm-card-price">{svc.price}</p>
                    <p className="sm-card-blurb">{svc.blurb}</p>
                    {!!svc.includes?.length && (
                      <ul className="sm-card-includes">
                        {svc.includes.slice(0, 3).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                    {renderLiveExample(svc)}
                    {renderCardCta(svc)}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* EMPTY STATE — shown when search returns nothing */}
        {q && !SUB_CATEGORIES.some(sub =>
          sub.serviceIds.map(id => SERVICE_MAP[id]).filter(Boolean).filter(filterFn).length > 0
        ) && (
          <div className="sm-empty-state">
            <p className="sm-empty-icon">🔍</p>
            <p className="sm-empty-title">No services found for "{q}"</p>
            <p className="sm-empty-sub">Try a different keyword, or <button type="button" className="sm-empty-clear" onClick={() => setSearchQuery('')}>clear search</button> to see all services.</p>
          </div>
        )}

        {/* CTA FOOTER */}
        <footer className="sm-footer">
          <p className="sm-footer-eyebrow">DON'T SEE WHAT YOU NEED?</p>
          <h2 className="sm-footer-title">More packages are on the way.</h2>
          <p className="sm-footer-body">
            Music, branding, video and more are being rebuilt into packages. Tell us what you're working on and we'll let you know the moment it's ready.
          </p>
          <a href="#contact" onClick={handleStrategyCallClick} className="sm-cta-btn">
            Get In Touch →
          </a>
          <p className="sm-footer-copy">© {new Date().getFullYear()} SWRV On The Go · swrvonthego.pro</p>
        </footer>
      </div>

      <CheckoutModal service={checkoutService} onClose={() => setCheckoutService(null)} />
    </div>
  );
}

export default ServicesMenu;
