import React, { useState, useEffect } from 'react';
import './services-menu.css';
import { SERVICES } from '../../site.config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBookStrategyCall?: () => void;
}

// ────────────────────────────────────────────────────────────
// SUB-CATEGORY DEFINITIONS — premium organized taxonomy
// ────────────────────────────────────────────────────────────
interface SubCategory {
  id: string;
  label: string;
  tagline: string;
  emoji: string;
  serviceIds: string[];
}

const SUB_CATEGORIES: SubCategory[] = [
  {
    id: 'videography',
    label: 'Videography',
    tagline: 'Moving picture, fully produced.',
    emoji: '🎬',
    serviceIds: [
      'music-video',
      'video-promo',
      'on-site-video',
      'live-streaming',
      'short-form-content',
      'ai-motion-30',
      'ai-motion-60',
      'ai-motion-120',
      'video-edit-alacarte',
    ],
  },
  {
    id: 'audio-production',
    label: 'Audio Production',
    tagline: 'Music, voice, and everything between.',
    emoji: '🎵',
    serviceIds: [
      'music-production',
      'mixing',
      'mastering',
      'live-recording',
      'jingle',
      'voiceover',
      'audiobook',
      'podcast-launch',
      'podcast-editing',
      'audio-edit-alacarte',
    ],
  },
  {
    id: 'web-digital',
    label: 'Web & Digital',
    tagline: 'Vision-first. Custom-built. Yours alone.',
    emoji: '🌐',
    serviceIds: [
      'website-presence',
      'website-platform',
      'website-ecosystem',
      'enterprise-ecosystem',
      'website-management',
      'website-maintenance',
      'fundraising-site',
    ],
  },
  {
    id: 'brand-identity',
    label: 'Brand Identity',
    tagline: 'Define who you are before you put it anywhere.',
    emoji: '✨',
    serviceIds: [
      'brand-planning',
      'logo-design',
      'photography',
      'content-system',
    ],
  },
  {
    id: 'coaching',
    label: 'Coaching & Mentorship',
    tagline: 'One-on-one development to level up.',
    emoji: '🎯',
    serviceIds: [
      'vocal-training',
      'recording-booth',
      'artist-development',
      'consulting-call',
    ],
  },
  {
    id: 'content-business',
    label: 'Content & Business',
    tagline: 'Books, decks, LLCs — everything to operate.',
    emoji: '📚',
    serviceIds: [
      'book-format',
      'pitch-deck',
      'keynote-slides',
      'llc-formation',
    ],
  },
];

// Build lookup map: serviceId → service
const SERVICE_MAP: Record<string, typeof SERVICES[0]> = {};
SERVICES.forEach((s) => { SERVICE_MAP[s.id] = s; });

export function ServicesMenu({ isOpen, onClose, onBookStrategyCall }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roadmapRecs, setRoadmapRecs] = useState<string[]>([]);

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
            src="https://res.cloudinary.com/dastq6bk5/image/upload/v1775906943/1752950982581945_2_kk3jt3_ui7upw.png"
            alt="Leader of the Revolution — SWRV On The Go"
            className="sm-hero-img"
          />
          <p className="sm-hero-caption">LEADER OF THE REVOLUTION</p>
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

        {/* FEATURED BUNDLES & POPULAR COMBOS */}
        <section className="sm-featured">
          <div className="sm-featured-header">
            <span className="sm-featured-emoji">⭐</span>
            <div>
              <h2 className="sm-featured-label">POPULAR STARTING POINTS</h2>
              <p className="sm-featured-tagline">Most clients start with one of these combos.</p>
            </div>
          </div>
          <div className="sm-featured-grid">
            <article className="sm-featured-card">
              <h3>Brand Launch</h3>
              <p className="sm-featured-items">Brand Planning + Logo + Website + Strategy Call</p>
              <p className="sm-featured-savings">Usually $1,150 → <strong>Bundle Save</strong></p>
            </article>
            <article className="sm-featured-card">
              <h3>Artist Production</h3>
              <p className="sm-featured-items">Vocal Training + Recording Booth + Music Production</p>
              <p className="sm-featured-savings">Usually $2,630 → <strong>Bundle Save</strong></p>
            </article>
            <article className="sm-featured-card">
              <h3>Video Creator</h3>
              <p className="sm-featured-items">Promo Video + Color Grading + Video Editing</p>
              <p className="sm-featured-savings">Usually $1,550 → <strong>Bundle Save</strong></p>
            </article>
            <article className="sm-featured-card">
              <h3>Content Creator</h3>
              <p className="sm-featured-items">Podcast Launch + Reels + Social Media Strategy</p>
              <p className="sm-featured-savings">Usually $1,295 → <strong>Bundle Save</strong></p>
            </article>
          </div>
          <p className="sm-featured-note">💡 All services are fully customizable. Payment plans available via Klarna — pay as little as 25% upfront. Book a Strategy Call to build your combo.</p>
        </section>

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
          <h2 className="sm-footer-title">Custom packages available.</h2>
          <p className="sm-footer-body">
            If you're building something we haven't named yet — a course, a community, a campaign, a creative business with moving parts — let's talk. Most things can be bundled or made à la carte.
          </p>
          <a href="#contact" onClick={handleStrategyCallClick} className="sm-cta-btn">
            Book a Strategy Call →
          </a>
          <p className="sm-footer-copy">© {new Date().getFullYear()} SWRV On The Go · swrvonthego.pro</p>
        </footer>
      </div>
    </div>
  );
}

export default ServicesMenu;
