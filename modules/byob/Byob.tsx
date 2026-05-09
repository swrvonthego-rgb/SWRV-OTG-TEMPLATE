import React, { useEffect } from 'react';
import { Brain, Zap, Shield, ArrowUpRight, X } from 'lucide-react';
import './byob.css';
import { BYOB_CONFIG as B } from './config';

interface ByobProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain size={36} strokeWidth={1.5} />,
  Zap: <Zap size={36} strokeWidth={1.5} />,
  Shield: <Shield size={36} strokeWidth={1.5} />,
};

export function Byob({ isOpen, onClose }: ByobProps) {
  // Lock body scroll when overlay open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="byob-page" role="dialog" aria-modal="true">
      {/* Fixed close X */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close BYOB Training"
        className="byob-close"
      >
        <X size={20} />
      </button>

      {/* Back-to-SWRV nav button (top-left) */}
      <button
        type="button"
        onClick={onClose}
        className="byob-back"
      >
        ← SWRV OTG
      </button>

      {/* BYOB Golden Logo — top-right corner */}
      <img
        src={B.goldenLogoUrl}
        alt="BYOB"
        className="byob-logo-corner"
      />

      {/* HERO */}
      <section className="byob-hero">
        <video
          src={B.hero.backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          className="byob-hero-video"
        />
        <div className="byob-hero-overlay" />

        <div className="byob-hero-content">
          <p className="byob-eyebrow">{B.hero.eyebrow}</p>
          <h1 className="byob-hero-title">{B.hero.title}</h1>
          <p className="byob-hero-subtitle">{B.hero.subtitle}</p>
          <p className="byob-hero-body">{B.hero.body}</p>
          <div className="byob-cta-row">
            <a href={B.hero.primaryCta.href} target="_blank" rel="noopener noreferrer" className="byob-btn byob-btn-primary">
              {B.hero.primaryCta.label}
            </a>
            <a href={B.hero.secondaryCta.href} target="_blank" rel="noopener noreferrer" className="byob-btn byob-btn-outline">
              {B.hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="byob-marquee">
        <div className="byob-marquee-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}>{B.marqueeText}</span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section className="byob-section byob-about">
        <div className="byob-container">
          <p className="byob-section-eyebrow">{B.about.eyebrow}</p>
          <h2 className="byob-section-title">{B.about.title}</h2>
          {B.about.paragraphs.map((p, i) => (
            <p key={i} className="byob-section-body">{p}</p>
          ))}
        </div>
      </section>

      {/* DISCIPLINES */}
      <section className="byob-section byob-disciplines">
        <div className="byob-container">
          <p className="byob-section-eyebrow">THE MENTALITY</p>
          <h2 className="byob-section-title">Three pillars. One discipline.</h2>
          <div className="byob-disciplines-grid">
            {B.disciplines.map((d) => (
              <div key={d.title} className={`byob-discipline-card byob-accent-${d.accent}`}>
                <div className="byob-discipline-icon">{ICON_MAP[d.icon]}</div>
                <h3 className="byob-discipline-title">{d.title}</h3>
                <p className="byob-discipline-desc">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YOUTH */}
      <section className="byob-section byob-youth">
        <div className="byob-container">
          <p className="byob-section-eyebrow">{B.youth.eyebrow}</p>
          <h2 className="byob-section-title">{B.youth.title}</h2>
          <p className="byob-section-body">{B.youth.body}</p>
          <a href={B.youth.cta.href} target="_blank" rel="noopener noreferrer" className="byob-btn byob-btn-outline">
            {B.youth.cta.label}
          </a>
        </div>
      </section>

      {/* VIRTUAL */}
      <section className="byob-section byob-virtual">
        <div className="byob-container">
          <p className="byob-section-eyebrow">{B.virtual.eyebrow}</p>
          <h2 className="byob-section-title">{B.virtual.title}</h2>
          <p className="byob-section-body">{B.virtual.body}</p>
          <a href={B.virtual.cta.href} target="_blank" rel="noopener noreferrer" className="byob-btn byob-btn-primary">
            {B.virtual.cta.label} <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {/* CTA BAR */}
      <section className="byob-cta-bar">
        <div className="byob-container">
          <h2 className="byob-cta-headline">{B.ctaBar.headline}</h2>
          <p className="byob-cta-body">{B.ctaBar.body}</p>
          <div className="byob-cta-row">
            <a href={B.ctaBar.primary.href} target="_blank" rel="noopener noreferrer" className="byob-btn byob-btn-primary">
              {B.ctaBar.primary.label} <ArrowUpRight size={16} />
            </a>
            <a href={B.ctaBar.secondary.href} target="_blank" rel="noopener noreferrer" className="byob-btn byob-btn-outline">
              {B.ctaBar.secondary.label}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="byob-footer">
        <button onClick={onClose} className="byob-back-link">
          ← Return to SWRV ON THE GO
        </button>
      </div>
    </div>
  );
}
