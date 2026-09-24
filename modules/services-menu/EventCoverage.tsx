import React from 'react';
import './event-coverage.css';
import { SERVICES } from '../../site.config';
import type { CheckoutService } from './CheckoutModal';

interface Props {
  onBook: (svc: CheckoutService) => void;
  onIntake: (id: string, name: string) => void;
}

// A picker for what an event needs, plus the three fixed SWRV Coverage
// tiers themselves (site.config.ts: coverage-quick-stop / -on-the-go-day
// / -full-convoy). Structured after a reference brand's "pick a category,
// then see tiered packages" content-coverage page — but named and priced
// for SWRV: the tiers are just the existing $1,000/hr on-site rate packaged
// into fixed, bookable blocks instead of an open-ended hourly quote.
const COVERAGE_TIER_IDS = ['coverage-quick-stop', 'coverage-on-the-go-day', 'coverage-full-convoy'];

const CATEGORIES = [
  {
    id: 'on-the-go-content',
    label: 'On The Go Content',
    desc: 'Real-time reels, TikToks, and behind-the-scenes — captured and posted while your event is still happening.',
    action: 'tiers' as const,
  },
  {
    id: 'photography',
    label: 'Photography',
    desc: 'Event imagery, guest moments, and branded shots — professionally shot and edited.',
    action: 'checkout' as const,
    serviceId: 'photography',
  },
  {
    id: 'videography',
    label: 'Videography',
    desc: 'Recap videos, testimonials, and promo-ready footage cut from your event.',
    action: 'intake' as const,
    intakeName: 'Event Videography Coverage',
  },
  {
    id: 'full-ride',
    label: 'The Full Ride',
    badge: 'RECOMMENDED',
    desc: 'Every lane covered — content, photography, and videography, one crew, one price.',
    action: 'intake' as const,
    intakeName: 'The Full Ride — Full Creative Team',
  },
];

export function EventCoverage({ onBook, onIntake }: Props) {
  const tiers = COVERAGE_TIER_IDS.map((id) => SERVICES.find((s) => s.id === id)).filter(Boolean) as typeof SERVICES;

  const scrollToTiers = () => {
    document.getElementById('swrv-coverage-tiers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    if (cat.action === 'tiers') scrollToTiers();
    else if (cat.action === 'checkout') {
      const svc = SERVICES.find((s) => s.id === cat.serviceId);
      if (svc) onBook({ id: svc.id, name: svc.name, priceNumeric: svc.priceNumeric, checkoutCategory: svc.checkoutCategory });
    } else {
      onIntake(cat.id, cat.intakeName || cat.label);
    }
  };

  return (
    <section className="ec-section">
      <div className="ec-header">
        <p className="ec-eyebrow">SWRV EVENT COVERAGE</p>
        <h2 className="ec-title">We Show Up.<br />You Stay In The Moment.</h2>
        <p className="ec-intro">Select what your event needs.</p>
      </div>

      {/* CATEGORY PICKER */}
      <div className="ec-cat-grid">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} type="button" className="ec-cat-card" onClick={() => handleCategoryClick(cat)}>
            <div className="ec-cat-top">
              <span className="ec-cat-label">{cat.label}</span>
              {cat.badge && <span className="ec-cat-badge">{cat.badge}</span>}
            </div>
            <p className="ec-cat-desc">{cat.desc}</p>
          </button>
        ))}
      </div>

      {/* TIERED PACKAGES */}
      <div id="swrv-coverage-tiers" className="ec-tiers-header">
        <p className="ec-tiers-eyebrow">ON THE GO CONTENT — PICK YOUR BLOCK</p>
      </div>
      <div className="ec-tier-grid">
        {tiers.map((svc) => (
          <article key={svc.id} className={`ec-tier-card ${svc.featured ? 'ec-tier-featured' : ''}`}>
            {svc.featured && <span className="ec-tier-badge">MOST POPULAR</span>}
            <div className="ec-tier-top">
              <h3 className="ec-tier-name">{svc.name}</h3>
              <span className="ec-tier-duration">{svc.deliveryDays === 1 ? 'Same day' : `${svc.deliveryDays} days`}</span>
            </div>
            <p className="ec-tier-price">{svc.price}</p>
            <p className="ec-tier-blurb">{svc.blurb}</p>
            {!!svc.includes?.length && (
              <ul className="ec-tier-includes">
                {svc.includes.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
            <button
              type="button"
              className="ec-tier-cta"
              onClick={() => onBook({ id: svc.id, name: svc.name, priceNumeric: svc.priceNumeric, checkoutCategory: svc.checkoutCategory })}
            >
              Book & Pay 50% →
            </button>
          </article>
        ))}
      </div>
      <p className="ec-tier-note">Half down to lock your date, half auto-invoiced a few days before your event. Need something bigger or more custom? <button type="button" className="ec-tier-note-link" onClick={() => onIntake('full-ride', 'The Full Ride — Full Creative Team')}>Talk to us →</button></p>
    </section>
  );
}
