import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICES } from '../site.config';
import './scroll-landing.css';

// ════════════════════════════════════════════════════════════
// ScrollLanding — a scroll-driven 3D landing page, no WebGL needed.
// ────────────────────────────────────────────────────────────
// Real depth comes from CSS 3D transforms (perspective + translateZ +
// rotate) driven by scroll position: one tall "stage" with a sticky
// viewport inside it, and each layer (logo, headline, cards, speed
// streaks) moves through a different range of the scroll. Everything is
// transform/opacity only, so it stays smooth on phones. Visitors with
// "reduce motion" get the finished layout with no animation.
// ════════════════════════════════════════════════════════════

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);

const price = (id: string) => SERVICES.find((s) => s.id === id)?.price || '';

const LANES = [
  { icon: '📱', title: 'Content', blurb: 'Reels, photos and posts.', price: `From ${price('social-content-daily') || '$200/mo'}`, to: '/content#sm-cat-social-media' },
  { icon: '🌐', title: 'Websites', blurb: 'Look great. Go live fast.', price: `From ${price('website-presence') || '$300'}`, to: '/content#sm-cat-web-digital' },
  { icon: '🎬', title: 'AI Video', blurb: 'Short videos, made fast.', price: price('ai-video-short') || 'From $200', to: '/content#sm-cat-videography' },
];

export const ScrollLanding: React.FC = () => {
  const navigate = useNavigate();
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const streaksRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // ── Scroll-driven scene ──────────────────────────────────
  useEffect(() => {
    if (reduce) return;
    const stage = stageRef.current;
    if (!stage) return;
    let target = 0;
    let shown = 0;
    let tiltX = 0, tiltY = 0, goalX = 0, goalY = 0;
    let raf = 0;
    let visible = true;

    const readTarget = () => {
      const r = stage.getBoundingClientRect();
      target = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };

    const paint = () => {
      const p = shown;
      const scene = sceneRef.current;
      if (scene) scene.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      if (streaksRef.current) {
        streaksRef.current.style.transform = `translateZ(${-200 + p * 900}px) scale(${1 + p * 1.4})`;
        streaksRef.current.style.opacity = String(0.95 - 0.55 * seg(p, 0.55, 1));
      }
      if (logoRef.current) {
        const s1 = ease(seg(p, 0, 0.3));
        const back = ease(seg(p, 0.42, 0.9));
        logoRef.current.style.transform = `translate3d(0, ${-back * 24}vh, ${-1000 * (1 - s1) - 320 * back}px) scale(${0.8 + 0.2 * s1})`;
        logoRef.current.style.opacity = String((0.15 + 0.85 * s1) * (1 - 0.55 * back));
      }
      if (headRef.current) {
        const s = ease(seg(p, 0.3, 0.5));
        headRef.current.style.transform = `translate3d(0, ${(1 - s) * 6}vh, ${-600 * (1 - s)}px)`;
        headRef.current.style.opacity = String(s);
      }
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.46 + 0.07 * i;
        const s = ease(seg(p, start, start + 0.24));
        const float = Math.sin(p * 6 + i) * 4 * s;
        el.style.transform = `translate3d(0, ${float}px, ${-1300 * (1 - s)}px) rotateX(${42 * (1 - s)}deg) rotateY(${(i - 1) * 34 * (1 - s)}deg)`;
        el.style.opacity = String(s);
        el.style.pointerEvents = s > 0.85 ? 'auto' : 'none';
      });
      if (ctaRef.current) {
        const s = ease(seg(p, 0.86, 0.99));
        ctaRef.current.style.opacity = String(s);
        ctaRef.current.style.transform = `translate3d(0, ${(1 - s) * 30}px, 0)`;
        ctaRef.current.style.pointerEvents = s > 0.6 ? 'auto' : 'none';
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - seg(p, 0, 0.07));
    };

    const loop = () => {
      shown += (target - shown) * 0.12;
      tiltX += (goalX - tiltX) * 0.08;
      tiltY += (goalY - tiltY) * 0.08;
      paint();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onScroll = () => { readTarget(); if (!raf && visible) raf = requestAnimationFrame(loop); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      goalY = (e.clientX / window.innerWidth - 0.5) * 7;
      goalX = -(e.clientY / window.innerHeight - 0.5) * 5;
    };
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { rootMargin: '200px' });
    io.observe(stage);

    readTarget();
    shown = target;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduce]);

  // ── 3D reveal for sections below the stage ───────────────
  useEffect(() => {
    const els = document.querySelectorAll('.sl-reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('sl-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('sl-in'); io.unobserve(en.target); } });
    }, { threshold: 0.18 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [reduce]);

  const go = (to: string) => (e: React.MouseEvent) => { e.preventDefault(); navigate(to); };

  const featured = ['brand-consultation', 'website-presence', 'coverage-quick-stop', 'ai-video-short']
    .map((id) => SERVICES.find((s) => s.id === id)).filter(Boolean) as typeof SERVICES;

  return (
    <div className={`sl-page ${reduce ? 'sl-static' : ''}`}>
      {/* ═══ 3D STAGE ═══ */}
      <div className="sl-stage" ref={stageRef}>
        <div className="sl-sticky">
          <div className="sl-scene" ref={sceneRef}>
            <div className="sl-streaks" ref={streaksRef} aria-hidden="true" />
            <div className="sl-logo" ref={logoRef}>
              <img src="/images/logo-intro-final.webp" alt="SWRV On The Go" className="sl-logo-media" width={900} height={834} fetchPriority="high" />
              {!reduce && <video className="sl-logo-media sl-logo-video" src="/images/logo-intro.mp4" autoPlay muted playsInline preload="auto" aria-hidden="true" />}
            </div>
            <div className="sl-head" ref={headRef}>
              <h1>Your vision.<br /><span>Our creative engine.</span></h1>
            </div>
            <div className="sl-cards">
              {LANES.map((l, i) => (
                <a key={l.title} href={l.to} ref={(el) => { cardRefs.current[i] = el; }} className="sl-card" onClick={go(l.to)}>
                  <span className="sl-card-icon" aria-hidden="true">{l.icon}</span>
                  <strong>{l.title}</strong>
                  <span className="sl-card-blurb">{l.blurb}</span>
                  <span className="sl-card-price">{l.price}</span>
                </a>
              ))}
            </div>
            <div className="sl-cta" ref={ctaRef}>
              <a href="/content" className="sl-btn" onClick={go('/content')}>See all packages →</a>
            </div>
            <div className="sl-hint" ref={hintRef} aria-hidden="true">Scroll<span>↓</span></div>
          </div>
        </div>
      </div>

      {/* ═══ BELOW THE STAGE ═══ */}
      <section className="sl-section">
        <p className="sl-eyebrow sl-reveal">EASY AS 1-2-3</p>
        <ol className="sl-steps">
          {[['1', 'Pick it', 'Tap what you need.'], ['2', 'Book it', 'Choose a date. Pay to lock it in.'], ['3', 'We deliver', "You're on the road. We do the rest."]].map(([n, t, d], i) => (
            <li key={n} className="sl-reveal" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="sl-num">{n}</span><strong>{t}</strong><span>{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sl-section">
        <p className="sl-eyebrow sl-reveal">POPULAR PICKS</p>
        <div className="sl-grid">
          {featured.map((s, i) => (
            <a key={s.id} href="/content" onClick={go('/content')} className="sl-pick sl-reveal" style={{ transitionDelay: `${i * 110}ms` }}>
              <strong>{s.name}</strong>
              <span className="sl-pick-price">{s.price}</span>
              <span className="sl-pick-go">Book now →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="sl-section">
        <div className="sl-panel sl-reveal">
          <p className="sl-eyebrow sl-eyebrow-light">NOT SURE? START HERE</p>
          <h2>Book a consultation</h2>
          <p>Step 1: book and pay $100. Pick your date. Step 2: right after you pay, answer a short questionnaire so SWRV comes prepared. Step 3: we talk and make your plan.</p>
          <a href="/content#sm-cat-social-media" onClick={go('/content#sm-cat-social-media')} className="sl-btn">Book consultation · $100 →</a>
        </div>
      </section>

      <footer className="sl-footer">
        <nav aria-label="More from SWRV On The Go">
          <a href="/zionswrvbirdsong" onClick={go('/zionswrvbirdsong')}>Zion SWRV Birdsong</a>
          <a href="/about" onClick={go('/about')}>About, Shop &amp; Contact</a>
          <a href="/family" onClick={go('/family')}>The SWRV Family</a>
          <a href="https://instagram.com/swrvonthego" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
        </nav>
        <p>© {new Date().getFullYear()} SWRV On The Go · swrvonthego.pro</p>
      </footer>
    </div>
  );
};

export default ScrollLanding;
