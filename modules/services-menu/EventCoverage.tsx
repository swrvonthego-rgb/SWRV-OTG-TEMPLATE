import React, { useState } from 'react';
import './event-coverage.css';
import { SERVICES } from '../../site.config';
import type { CheckoutService } from './CheckoutModal';
import type { IntakePath } from '../../site.config';

interface Props {
  onBook: (svc: CheckoutService) => void;
  onIntake: (id: string, name: string, path?: IntakePath) => void;
}

// The on-location content packages, in price order. These come first on
// /content: they are the thing people book most, and the one that needs
// explaining — SWRV comes to the event, shoots it, edits it and hands it
// back the same day. Half is paid today, half when the content is delivered.
// Internal ids keep their original names so existing orders still match;
// the display names live in site.config.ts.
const COVERAGE_TIER_IDS = [
  'coverage-quick-stop',
  'coverage-on-the-go-day',
  'coverage-full-convoy',
  'coverage-air-support',
];

// What the client is actually buying on the day — printed under the name so
// "we show up and shoot" is never something they have to infer from a list.
const ON_SITE: Record<string, string> = {
  'coverage-quick-stop': '1 hour on location',
  'coverage-on-the-go-day': '2 hours on location',
  'coverage-full-convoy': '3 hours on location',
  'coverage-air-support': '3 hours on location + drone',
};

// Everything else an event can add, once the content packages are picked
// over. Same actions the old category picker had.
type Extra = {
  id: string;
  label: string;
  badge: string;
  desc: string;
  action: 'checkout' | 'intake';
  serviceId?: string;
  intakeName?: string;
  intakePath?: IntakePath;
};

const EXTRAS: Extra[] = [
  {
    id: 'photography',
    label: 'Photography',
    badge: '',
    desc: 'Still photos of the day — guest moments, branded shots, professionally edited.',
    action: 'checkout' as const,
    serviceId: 'photography',
  },
  {
    id: 'videography',
    label: 'Videography',
    badge: '',
    desc: 'A recap video, testimonials, or promo footage cut from your event.',
    action: 'intake' as const,
    intakeName: 'Event Videography Content',
    intakePath: 'video' as IntakePath,
  },
  {
    id: 'full-ride',
    label: 'The Full Ride',
    badge: 'RECOMMENDED',
    desc: 'Content, photography and videography — one crew, one price, every lane covered.',
    action: 'intake' as const,
    intakeName: 'The Full Ride — Full Creative Team',
    intakePath: 'event' as IntakePath,
  },
];

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function EventCoverage({ onBook, onIntake }: Props) {
  const tiers = COVERAGE_TIER_IDS.map((id) => SERVICES.find((s) => s.id === id)).filter(Boolean) as typeof SERVICES;
  const [selectedId, setSelectedId] = useState('');
  const selected = tiers.find((svc) => svc.id === selectedId) || null;
  const half = selected ? selected.priceNumeric / 2 : 0;

  const book = (svc: typeof SERVICES[number]) =>
    onBook({ id: svc.id, name: svc.name, priceNumeric: svc.priceNumeric, checkoutCategory: svc.checkoutCategory });

  return (
    <section className="ec-section" id="content-packages">
      <header className="ec-header">
        <p className="ec-eyebrow">SWRV CONTENT — WE COME TO YOU</p>
        <h2 className="ec-title">We Show Up.<br />We Shoot.<br />You Get The Content.</h2>
        <p className="ec-lede">
          This is on-location content. We bring the cameras to your event, your shoot, your storefront —
          capture it while it&apos;s happening, edit it on the spot, and post it to your accounts before the
          night is over. Pick a package below: half today locks your date, and the other half is due when we deliver.
          Shoots book at least 48 hours ahead, so the calendar won&apos;t offer anything sooner.
        </p>
      </header>

      {/* HOW IT WORKS — what "we show up and shoot" actually means, in order */}
      <ol className="ec-steps">
        <li>
          <span className="ec-step-num">1</span>
          <div>
            <p className="ec-step-title">Pick your package</p>
            <p className="ec-step-body">Choose the hours that fit what you have planned — at least 48 hours out.</p>
          </div>
        </li>
        <li>
          <span className="ec-step-num">2</span>
          <div>
            <p className="ec-step-title">We show up and shoot</p>
            <p className="ec-step-body">You pick the date and tell us where. We arrive early and shoot the whole thing.</p>
          </div>
        </li>
        <li>
          <span className="ec-step-num">3</span>
          <div>
            <p className="ec-step-title">Edited content, same day</p>
            <p className="ec-step-body">Reels live on your accounts, raw footage sent to you. Second half paid on delivery.</p>
          </div>
        </li>
      </ol>

      <p className="ec-pick-label">Pick your package</p>
      <div className="ec-tier-grid" role="group" aria-label="Content packages">
        {tiers.map((svc) => {
          const on = selectedId === svc.id;
          return (
            <article key={svc.id} className={`ec-tier-card ${svc.featured ? 'ec-tier-featured' : ''} ${on ? 'ec-tier-on' : ''}`}>
              {svc.featured && <span className="ec-tier-badge">MOST POPULAR</span>}
              <div className="ec-tier-top">
                <h3 className="ec-tier-name">{svc.name}</h3>
                <span className="ec-tier-duration">{ON_SITE[svc.id] || 'On location'}</span>
              </div>
              <p className="ec-tier-price">{svc.price}</p>
              <p className="ec-tier-split">{money(svc.priceNumeric / 2)} today · {money(svc.priceNumeric / 2)} on delivery</p>
              <p className="ec-tier-blurb">{svc.blurb}</p>
              {!!svc.includes?.length && (
                <ul className="ec-tier-includes">
                  {svc.includes.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
              <button
                type="button"
                className="ec-tier-cta"
                aria-pressed={on}
                onClick={() => setSelectedId(svc.id)}
              >
                {on ? '✓ Selected' : 'Select this package'}
              </button>
            </article>
          );
        })}
      </div>

      {/* THE PICK — one place to confirm, then Book & Pay takes over:
          date, where we're shooting, what's happening, sign, pay half. */}
      <div className={`ec-confirm ${selected ? 'ec-confirm-live' : ''}`}>
        {selected ? (
          <>
            <div className="ec-confirm-text">
              <p className="ec-confirm-label">Your package</p>
              <p className="ec-confirm-name">{selected.name} · {ON_SITE[selected.id] || 'On location'}</p>
              <p className="ec-confirm-split">{money(half)} today · {money(half)} on delivery</p>
            </div>
            <button type="button" className="ec-confirm-cta" onClick={() => book(selected)}>
              Book &amp; pay {money(half)} now →
            </button>
          </>
        ) : (
          <p className="ec-confirm-hint">
            Select a package above. Half today locks your date, half when we deliver — then you pick the
            date and tell us where we&apos;re shooting.
          </p>
        )}
      </div>

      <p className="ec-tier-note">
        Need more hours, a multi-day shoot or a whole campaign?{' '}
        <button type="button" className="ec-tier-note-link" onClick={() => onIntake('full-ride', 'The Full Ride — Full Creative Team', 'event')}>Talk to us →</button>
      </p>

      <div className="ec-extras">
        <p className="ec-extras-label">Add more to the shoot</p>
        <div className="ec-extras-grid">
          {EXTRAS.map((extra) => (
            <button
              key={extra.id}
              type="button"
              className="ec-extra-card"
              onClick={() => {
                if (extra.action === 'checkout') {
                  const svc = SERVICES.find((s) => s.id === extra.serviceId);
                  if (svc) book(svc);
                } else {
                  onIntake(extra.id, extra.intakeName || extra.label, extra.intakePath);
                }
              }}
            >
              <span className="ec-extra-top">
                <span className="ec-extra-name">{extra.label}</span>
                {extra.badge && <span className="ec-extra-badge">{extra.badge}</span>}
              </span>
              <span className="ec-extra-desc">{extra.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
