import React, { useEffect } from 'react';
import { Wind, Music, Mic, ArrowUpRight, X, Sparkles } from 'lucide-react';
import './birdsong.css';
import { BIRDSONG_CONFIG as B } from './config';

interface BirdsongProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Wind:  <Wind size={32} strokeWidth={1.5} />,
  Music: <Music size={32} strokeWidth={1.5} />,
  Mic:   <Mic size={32} strokeWidth={1.5} />,
};

export function Birdsong({ isOpen, onClose }: BirdsongProps) {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="birdsong-page" role="dialog" aria-modal="true">
      {/* Close X */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close The Birdsong Method"
        className="birdsong-close"
      >
        <X size={20} />
      </button>

      {/* Back to SWRV */}
      <button type="button" onClick={onClose} className="birdsong-back">
        ← SWRV OTG
      </button>

      {/* HERO */}
      <section className="birdsong-hero">
        <div className="birdsong-hero-bg" />
        <div className="birdsong-hero-rings">
          <div className="birdsong-ring" />
          <div className="birdsong-ring" />
          <div className="birdsong-ring" />
        </div>
        <div className="birdsong-hero-content">
          <p className="birdsong-eyebrow">{B.hero.eyebrow}</p>
          <h1 className="birdsong-hero-title">
            {B.hero.title.split('\n').map((line, i) => (
              <span key={i} className="birdsong-hero-line">{line}</span>
            ))}
          </h1>
          <p className="birdsong-hero-subtitle">{B.hero.subtitle}</p>
          <p className="birdsong-hero-body">{B.hero.body}</p>
          <div className="birdsong-cta-row">
            <a href={B.hero.primaryCta.href} target="_blank" rel="noopener noreferrer" className="birdsong-btn birdsong-btn-primary">
              {B.hero.primaryCta.label} <ArrowUpRight size={16} />
            </a>
            <a href={B.hero.secondaryCta.href} target="_blank" rel="noopener noreferrer" className="birdsong-btn birdsong-btn-outline">
              {B.hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="birdsong-marquee">
        <div className="birdsong-marquee-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}>{B.marqueeText}</span>
          ))}
        </div>
      </div>

      {/* ANALYZER FEATURE (the hero feature) */}
      <section className="birdsong-section birdsong-analyzer">
        <div className="birdsong-container">
          <div className="birdsong-analyzer-grid">
            <div className="birdsong-analyzer-text">
              <p className="birdsong-section-eyebrow">
                <Sparkles size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                {B.analyzer.eyebrow}
              </p>
              <h2 className="birdsong-section-title">{B.analyzer.title}</h2>
              <p className="birdsong-analyzer-tagline">{B.analyzer.body}</p>
              <p className="birdsong-section-body">{B.analyzer.description}</p>
              <ul className="birdsong-feature-list">
                {B.analyzer.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <a href={B.analyzer.cta.href} target="_blank" rel="noopener noreferrer" className="birdsong-btn birdsong-btn-primary birdsong-btn-large">
                {B.analyzer.cta.label} <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="birdsong-analyzer-visual">
              <div className="birdsong-radar-demo">
                <svg viewBox="0 0 240 240" width="100%" height="100%">
                  {/* Concentric rings */}
                  {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <polygon
                      key={i}
                      points={Array.from({ length: 5 }, (_, j) => {
                        const a = -Math.PI / 2 + (j * 2 * Math.PI) / 5;
                        const r = 95 * scale;
                        return `${120 + Math.cos(a) * r},${120 + Math.sin(a) * r}`;
                      }).join(' ')}
                      fill="none"
                      stroke="rgba(201,168,76,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Spokes */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                    return (
                      <line
                        key={i}
                        x1="120" y1="120"
                        x2={120 + Math.cos(a) * 95}
                        y2={120 + Math.sin(a) * 95}
                        stroke="rgba(201,168,76,0.12)"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* Data shape */}
                  {(() => {
                    const vals = [0.72, 0.58, 0.65, 0.8, 0.55];
                    const pts = vals.map((v, j) => {
                      const a = -Math.PI / 2 + (j * 2 * Math.PI) / 5;
                      const r = 95 * v;
                      return `${120 + Math.cos(a) * r},${120 + Math.sin(a) * r}`;
                    }).join(' ');
                    return (
                      <>
                        <polygon points={pts} fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.8)" strokeWidth="2" />
                        {vals.map((v, j) => {
                          const a = -Math.PI / 2 + (j * 2 * Math.PI) / 5;
                          const r = 95 * v;
                          return <circle key={j} cx={120 + Math.cos(a) * r} cy={120 + Math.sin(a) * r} r="4" fill="#c9a84c" />;
                        })}
                      </>
                    );
                  })()}
                  {/* Labels */}
                  {['Pitch', 'Breath', 'Range', 'Resonance', 'Dynamics'].map((label, i) => {
                    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                    return (
                      <text
                        key={label}
                        x={120 + Math.cos(a) * 115}
                        y={120 + Math.sin(a) * 115}
                        fill="rgba(245,240,232,0.55)"
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="DM Sans, sans-serif"
                      >
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>
              <p className="birdsong-radar-caption">Your voice. Mapped.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="birdsong-section birdsong-about">
        <div className="birdsong-container">
          <p className="birdsong-section-eyebrow">{B.about.eyebrow}</p>
          <h2 className="birdsong-section-title">{B.about.title}</h2>
          {B.about.paragraphs.map((p, i) => (
            <p key={i} className="birdsong-section-body">{p}</p>
          ))}
          <blockquote className="birdsong-quote">
            <p>"{B.about.quote}"</p>
            <cite>— {B.about.quoteAuthor}</cite>
          </blockquote>
        </div>
      </section>

      {/* PILLARS */}
      <section className="birdsong-section birdsong-pillars">
        <div className="birdsong-container">
          <p className="birdsong-section-eyebrow">THE CURRICULUM</p>
          <h2 className="birdsong-section-title">What you'll master.</h2>
          <div className="birdsong-pillars-grid">
            {B.pillars.map((p) => (
              <div key={p.title} className={`birdsong-pillar-card birdsong-accent-${p.accent}`}>
                <div className="birdsong-pillar-icon">{ICON_MAP[p.icon]}</div>
                <h3 className="birdsong-pillar-title">{p.title}</h3>
                <p className="birdsong-pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="birdsong-section birdsong-programs">
        <div className="birdsong-container">
          <p className="birdsong-section-eyebrow">{B.programs.eyebrow}</p>
          <h2 className="birdsong-section-title">{B.programs.title}</h2>
          <p className="birdsong-section-body">{B.programs.body}</p>
          <div className="birdsong-programs-grid">
            {B.programs.tiers.map((t) => (
              <div key={t.name} className="birdsong-program-card">
                <div className="birdsong-program-bird">{t.bird}</div>
                <h3 className="birdsong-program-name">{t.name}</h3>
                <p className="birdsong-program-tagline">{t.tagline}</p>
                <div className="birdsong-program-price">{t.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAR */}
      <section className="birdsong-cta-bar">
        <div className="birdsong-container">
          <h2 className="birdsong-cta-headline">{B.ctaBar.headline}</h2>
          <p className="birdsong-cta-body">{B.ctaBar.body}</p>
          <div className="birdsong-cta-row">
            <a href={B.ctaBar.primary.href} target="_blank" rel="noopener noreferrer" className="birdsong-btn birdsong-btn-primary">
              {B.ctaBar.primary.label} <ArrowUpRight size={16} />
            </a>
            <a href={B.ctaBar.secondary.href} target="_blank" rel="noopener noreferrer" className="birdsong-btn birdsong-btn-outline-light">
              {B.ctaBar.secondary.label}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="birdsong-footer">
        <button onClick={onClose} className="birdsong-back-link">
          ← Return to SWRV ON THE GO
        </button>
      </div>
    </div>
  );
}
