import React, { useState, useEffect } from 'react';
import './services-menu.css';
import { SERVICES, SERVICE_SUBCATEGORIES as SUB_CATEGORIES } from '../../site.config';
import { ClientReviews } from '../../components/ClientReviews';
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

// The poster's pixel size and the four tappable cards on it (source pixels).
const POSTER = { w: 941, h: 1135 };
const POSTER_HOTSPOTS = [
  { x: 28,  y: 843, w: 444, hh: 124, target: 'sm-coverage',          label: 'Professional content filming — see event coverage' },
  { x: 478, y: 843, w: 438, hh: 124, target: 'sm-cat-web-digital',   label: 'Websites and digital presence' },
  { x: 28,  y: 988, w: 444, hh: 125, target: 'sm-cat-videography',   label: 'AI-powered content creation' },
  { x: 478, y: 988, w: 438, hh: 125, target: 'sm-cat-social-media',  label: 'Brand and social media support' },
];
const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
            {svc.checkoutCategory === 'monthly' ? 'Start Monthly Plan →' : svc.payInFull ? `Book & Pay ${svc.price} →` : 'Book & Pay 50% →'}
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
        {/* HERO POSTER — each card on the poster jumps to its section below */}
        <div className="sm-poster">
          <div className="sm-poster-frame" style={{ aspectRatio: `${POSTER.w} / ${POSTER.h}` }}>
            <img
              src="/images/content-hero.webp"
              alt="SWRV On-The-Go. Your vision, our creative engine: professional content filming, websites and digital presence, AI-powered content creation, brand and social media support."
              className="sm-poster-img"
              width={POSTER.w}
              height={POSTER.h}
              fetchPriority="high"
            />
            {POSTER_HOTSPOTS.map((h) => (
              <a
                key={h.target}
                href={`#${h.target}`}
                aria-label={h.label}
                className="sm-poster-hit"
                style={{
                  left: `${(h.x / POSTER.w) * 100}%`,
                  top: `${(h.y / POSTER.h) * 100}%`,
                  width: `${(h.w / POSTER.w) * 100}%`,
                  height: `${(h.hh / POSTER.h) * 100}%`,
                }}
                onClick={(e) => { e.preventDefault(); scrollToId(h.target); }}
              />
            ))}
          </div>
          <p className="sm-poster-hint">Tap a card to jump straight to it</p>
          <button type="button" className="sm-poster-cta" onClick={() => scrollToId('sm-jump')}>
            See every service ↓
          </button>
        </div>

        {/* SWRV EVENT COVERAGE — category picker + fixed, bookable tiers */}
        <div id="sm-coverage">
        <EventCoverage
          onBook={(svc) => setCheckoutService(svc)}
          onIntake={(id, name, path) => {
            window.dispatchEvent(new CustomEvent('swrv:open-intake', { detail: { id, name, path } }));
            onClose?.();
          }}
        />
        </div>

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
            Event coverage, music production, music videos, websites, social media and more — pick a package, book it, and pay right here. Affirm, Klarna, and Afterpay accepted.
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

        {/* QUICK JUMP — one tap to any category, so phone visitors don't scroll blind */}
        {!q && (
          <nav id="sm-jump" className="sm-jump" aria-label="Jump to a service category">
            {SUB_CATEGORIES.filter((sub) => sub.serviceIds.some((id) => SERVICE_MAP[id])).map((sub) => (
              <a key={sub.id} href={`#sm-cat-${sub.id}`} className="sm-jump-chip"
                onClick={(e) => { e.preventDefault(); document.getElementById(`sm-cat-${sub.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span aria-hidden="true">{sub.emoji}</span> {sub.label}
              </a>
            ))}
          </nav>
        )}

        {/* SUB-CATEGORIES */}
        {SUB_CATEGORIES.map((sub) => {
          const items = sub.serviceIds
            .map((id) => SERVICE_MAP[id])
            .filter(Boolean)
            .filter(filterFn);
          if (items.length === 0) return null;
          return (
            <section key={sub.id} id={`sm-cat-${sub.id}`} className="sm-category">
              <div className="sm-cat-header">
                <span className="sm-cat-emoji">{sub.emoji}</span>
                <div className="sm-cat-text">
                  <h2 className="sm-cat-label">{sub.label}</h2>
                  <p className="sm-cat-tagline">{sub.tagline}</p>
                </div>
                <span className="sm-cat-count">{items.length}</span>
              </div>
              {sub.note && (
                <p className="sm-cat-note">
                  {sub.note.text}{' '}
                  <a href={sub.note.to} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('swrv:open-roadmap')); }}>{sub.note.linkLabel}</a>
                </p>
              )}
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

        {/* CLIENT REVIEWS — published reviews from verified paying clients */}
        {!q && <ClientReviews />}

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

        {/* CUSTOM BOOKING CTA */}
        {!q && (
          <section className="sm-custom-booking">
            <p className="sm-footer-eyebrow">NEED SOMETHING CUSTOM?</p>
            <h2 className="sm-footer-title">Don't see your exact package?</h2>
            <p className="sm-footer-body">
              Working on something that doesn't fit a price sheet? Build a bundle, get a custom quote, or just tell us what you're working on. No back-and-forth — we'll put it together.
            </p>
            <button
              type="button"
              className="sm-cta-btn"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('swrv:open-intake', { detail: { id: 'custom', name: 'Custom Service Request' } }));
                onClose?.();
              }}
            >
              Build a Custom Package →
            </button>
          </section>
        )}

        {/* CTA FOOTER */}
        <footer className="sm-footer">
          <p className="sm-footer-copy">© {new Date().getFullYear()} SWRV On The Go · swrvonthego.pro</p>
        </footer>
      </div>

      <CheckoutModal service={checkoutService} onClose={() => setCheckoutService(null)} />
    </div>
  );
}

export default ServicesMenu;
