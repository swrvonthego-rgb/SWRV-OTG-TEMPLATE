import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckoutModal, type CheckoutService } from '../modules/services-menu/CheckoutModal';
import { SERVICES } from '../site.config';
import './scroll-landing.css';

// ════════════════════════════════════════════════════════════
// ScrollLanding — a premium, scroll-driven 3D landing page.
// ────────────────────────────────────────────────────────────
// No WebGL. Real depth comes from CSS 3D: a perspective camera, real
// product screens mounted in solid device frames (each with thickness
// and layered shadows), and a scroll-driven "dolly" that flies the
// camera forward through them. Motion is eased, transform/opacity only.
// Visitors with "reduce motion" get a calm static layout.
// ════════════════════════════════════════════════════════════

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Dev = { id: string; kind: 'desktop' | 'phone'; img: string; alt: string; x: number; y: number; z: number; rx: number; ry: number; rz: number; bob: number };

const WIDE: Dev[] = [
  { id: 'eco',  kind: 'desktop', img: 'web-ecosystem', alt: 'Custom website example', x: -38, y: -29, z: -240, rx: 5,  ry: 24,  rz: -4, bob: 0 },
  { id: 'ph1',  kind: 'phone',   img: 'phone-services', alt: 'SWRV services on a phone', x: 41,  y: -22, z: -100, rx: 4,  ry: -22, rz: 5,  bob: 1.2 },
  { id: 'plat', kind: 'desktop', img: 'web-platform',  alt: 'Booking website example', x: 42,  y: 36,  z: -420, rx: -4, ry: -26, rz: -3, bob: 2.1 },
  { id: 'ph2',  kind: 'phone',   img: 'phone-roadmap', alt: 'The Roadmap on a phone', x: -41, y: 25,  z: -60,  rx: -3, ry: 20,  rz: -6, bob: 3.3 },
];
const NARROW: Dev[] = [
  { id: 'eco',  kind: 'desktop', img: 'web-ecosystem', alt: 'Custom website example', x: -30, y: -39, z: -300, rx: 8,  ry: 28,  rz: -7, bob: 0 },
  { id: 'ph1',  kind: 'phone',   img: 'phone-services', alt: 'SWRV services on a phone', x: 36,  y: -33, z: -150, rx: 5,  ry: -24, rz: 8,  bob: 1.2 },
  { id: 'plat', kind: 'desktop', img: 'web-platform',  alt: 'Booking website example', x: 30,  y: 47,  z: -380, rx: -6, ry: -30, rz: -5, bob: 2.1 },
  { id: 'ph2',  kind: 'phone',   img: 'phone-roadmap', alt: 'The Roadmap on a phone', x: -30, y: 45,  z: -120, rx: -4, ry: 24,  rz: 6,  bob: 3.3 },
];

const FEATURES = [
  { key: 'content', title: 'Content', body: 'Reels, photos and posts that make your brand impossible to scroll past. We show up, capture it, and post it.', to: '/content#sm-cat-social-media', svc: 'social-content-daily' },
  { key: 'web', title: 'Websites', body: 'A site that looks great and goes live fast. Pick a style and we make it yours, with booking and checkout built in.', to: '/content#sm-cat-web-digital', svc: 'website-presence' },
  { key: 'ai', title: 'AI Video', body: 'Short, scroll-stopping videos made fast. 30 seconds, 1 minute or 2 minutes, ready to post.', to: '/content#sm-cat-videography', svc: 'ai-video-short' },
];

const Frame: React.FC<{ kind: 'desktop' | 'phone'; src?: string; alt?: string; children?: React.ReactNode }> = ({ kind, src, alt, children }) => (
  <div className={`sl2-frame sl2-${kind}`}>
    <div className="sl2-slab" aria-hidden="true" />
    <div className="sl2-face">
      {kind === 'desktop' && <div className="sl2-chrome" aria-hidden="true"><i /><i /><i /></div>}
      {kind === 'phone' && <div className="sl2-notch" aria-hidden="true" />}
      <div className="sl2-screen">
        {src ? <img src={`/images/3d/${src}.webp`} alt={alt || ''} loading="lazy" draggable={false} /> : children}
      </div>
      <div className="sl2-gloss" aria-hidden="true" />
    </div>
  </div>
);

// The one button on the page that matters: the $100 consultation. Everything
// else stays quiet so this is the thing the eye goes to.
const Jewel: React.FC<{ onClick: () => void; main?: string; sub?: string; className?: string }> = ({ onClick, main = 'Book live consultation', sub = '$100 · your Roadmap unlocks instantly', className = '' }) => (
  <span className={`sl2-jewel-wrap ${className}`}>
    <i className="sl2-spark s1" aria-hidden="true">✦</i>
    <i className="sl2-spark s2" aria-hidden="true">✦</i>
    <i className="sl2-spark s3" aria-hidden="true">✦</i>
    <button type="button" className="sl2-jewel" onClick={onClick}>
      <span className="sl2-jewel-shine" aria-hidden="true" />
      <span className="sl2-jewel-main">{main} <b>→</b></span>
      <span className="sl2-jewel-sub">{sub}</span>
    </button>
  </span>
);

export const ScrollLanding: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const devRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featRef = useRef<HTMLDivElement>(null);
  const featStageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // The $100 consultation: every "Book" button opens checkout right here.
  const [book, setBook] = useState<CheckoutService | null>(null);
  const openConsult = () => {
    const c = SERVICES.find((x) => x.id === 'brand-consultation');
    if (c) setBook({ id: c.id, name: c.name, priceNumeric: c.priceNumeric, checkoutCategory: c.checkoutCategory });
  };
  // Sticky "Book" bar for phones: shows after the first scroll, hides at the consult panel.
  const panelRef = useRef<HTMLDivElement>(null);
  const [barOn, setBarOn] = useState(false);
  const [panelSeen, setPanelSeen] = useState(false);
  useEffect(() => {
    const onS = () => setBarOn(window.scrollY > 140);
    onS();
    window.addEventListener('scroll', onS, { passive: true });
    const el = panelRef.current;
    const io = el ? new IntersectionObserver(([e]) => setPanelSeen(e.isIntersecting), { threshold: 0.25 }) : null;
    if (el && io) io.observe(el);
    return () => { window.removeEventListener('scroll', onS); io?.disconnect(); };
  }, []);
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 900);
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const devs = narrow ? NARROW : WIDE;

  useEffect(() => {
    const onR = () => setNarrow(window.innerWidth < 900);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  // ── One animation loop drives the hero dolly and the feature scene ──
  useEffect(() => {
    if (reduce) return;
    const hero = heroRef.current, feat = featRef.current;
    if (!hero || !feat) return;
    let pHero = 0, sHero = 0, pFeat = 0, sFeat = 0;
    let tx = 0, ty = 0, gx = 0, gy = 0;
    let raf = 0, vis = true;
    const t0 = performance.now();

    const read = () => {
      const a = hero.getBoundingClientRect();
      pHero = clamp(-a.top / Math.max(1, a.height - window.innerHeight));
      const b = feat.getBoundingClientRect();
      pFeat = clamp(-b.top / Math.max(1, b.height - window.innerHeight));
    };

    const frame = () => {
      sHero += (pHero - sHero) * 0.1;
      sFeat += (pFeat - sFeat) * 0.1;
      tx += (gx - tx) * 0.06; ty += (gy - ty) * 0.06;
      const t = (performance.now() - t0) / 1000;

      // Hero: the camera flies forward through the screens.
      const dolly = ease(seg(sHero, 0.04, 0.96)) * 2300;
      if (worldRef.current) worldRef.current.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`;
      devs.forEach((d, i) => {
        const el = devRefs.current[i];
        if (!el) return;
        const bob = Math.sin(t * 0.9 + d.bob) * 7;
        const z = d.z + dolly;
        el.style.transform = `translate3d(${d.x}vw, calc(${d.y}vh + ${bob}px), ${z}px) rotateX(${d.rx}deg) rotateY(${d.ry + Math.sin(t * 0.5 + d.bob) * 2}deg) rotateZ(${d.rz}deg)`;
        el.style.opacity = String(1 - seg(z, 180, 760));
      });
      if (centerRef.current) {
        const o = 1 - ease(seg(sHero, 0.5, 0.82));
        centerRef.current.style.opacity = String(o);
        centerRef.current.style.transform = `translate3d(0, ${-ease(seg(sHero, 0.35, 0.85)) * 14}vh, ${ease(seg(sHero, 0.35, 0.85)) * 260}px)`;
        centerRef.current.style.pointerEvents = o > 0.4 ? 'auto' : 'none';
      }

      // Features: the big device turns as you move through the three offers.
      const fs = featStageRef.current;
      if (fs) {
        fs.style.transform = `rotateY(${-18 + easeOut(sFeat) * 14}deg) rotateX(${5 - sFeat * 3}deg) translateZ(${Math.sin(sFeat * Math.PI) * (narrow ? 10 : 60)}px)`;
      }
      const idx = Math.min(2, Math.floor(sFeat * 3));
      setActive((a) => (a === idx ? a : idx));

      raf = vis ? requestAnimationFrame(frame) : 0;
    };

    const onScroll = () => { read(); if (!raf && vis) raf = requestAnimationFrame(frame); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      gx = (e.clientX / window.innerWidth - 0.5) * 8;
      gy = -(e.clientY / window.innerHeight - 0.5) * 5;
    };
    // Track each section separately (an entry only reports what changed).
    const seen = new Set<Element>();
    const io = new IntersectionObserver((en) => {
      en.forEach((e) => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      vis = seen.size > 0;
      if (vis && !raf) raf = requestAnimationFrame(frame);
    }, { rootMargin: '300px' });
    io.observe(hero); io.observe(feat);

    read(); sHero = pHero; sFeat = pFeat;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduce, devs]);

  // ── Sections below tilt into place ───────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.sl2-reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('sl2-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('sl2-in'); io.unobserve(en.target); } });
    }, { threshold: 0.2 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [reduce]);

  const go = (to: string) => (e: React.MouseEvent) => { e.preventDefault(); navigate(to); };
  const price = (id: string) => SERVICES.find((s) => s.id === id)?.price || '';

  return (
    <div className={`sl2 ${reduce ? 'sl2-static' : ''}`}>
      <header className="sl2-nav">
        <a href="/" className="sl2-brand" onClick={go('/')}>SWRV <span>on the go</span></a>
        <nav className="sl2-links" aria-label="Main">
          <a href="/content" onClick={go('/content')}>Packages</a>
          <a href="#how">How it works</a>
          <a href="/zionswrvbirdsong" onClick={go('/zionswrvbirdsong')}>Zion SWRV Birdsong</a>
        </nav>
        <button type="button" className="sl2-pill sl2-pill-sm sl2-pill-ghost" onClick={openConsult}>Book $100 <b>→</b></button>
      </header>

      {/* ═══ HERO — fly through the screens ═══ */}
      <div className="sl2-hero" ref={heroRef}>
        <div className="sl2-sticky">
          <div className="sl2-world" ref={worldRef}>
            {devs.map((d, i) => (
              <div key={d.id} className={`sl2-dev sl2-dev-${d.kind}`} ref={(el) => { devRefs.current[i] = el; }}>
                <Frame kind={d.kind} src={d.img} alt={d.alt} />
              </div>
            ))}
          </div>
          <div className="sl2-center" ref={centerRef}>
            <div className="sl2-logo">
              <img src="/images/3d/light-final-cut.webp" alt="SWRV On The Go" width={720} height={667} fetchPriority="high" />
              {!reduce && <video src="/images/3d/light-intro-cut.webm" poster="/images/3d/light-final-cut.webp" autoPlay muted playsInline preload="auto" aria-hidden="true" />}
            </div>
            <h1>Your vision.<br /><span>Our creative engine.</span></h1>
            <p>Content, websites and AI video, booked and paid in minutes. Pick it, book it, and we handle the rest.</p>
            <div className="sl2-actions">
              <Jewel onClick={openConsult} />
              <a href="/content" className="sl2-quiet" onClick={go('/content')}>or browse all packages</a>
            </div>
          </div>
          <div className="sl2-scroll" aria-hidden="true"><span>Scroll</span><i /></div>
        </div>
      </div>

      {/* ═══ WHAT WE DO — a big device that turns with each offer ═══ */}
      <div className="sl2-feat" ref={featRef}>
        <div className="sl2-sticky sl2-feat-sticky">
          <div className="sl2-feat-copy">
            <p className="sl2-mono">WHAT WE DO</p>
            <h2>What can SWRV do for you?</h2>
            <ul>
              {FEATURES.map((f, i) => (
                <li key={f.key} className={i === active ? 'on' : ''}>
                  <a href={f.to} onClick={go(f.to)}>
                    <strong>{f.title} <em>{price(f.svc) ? `from ${price(f.svc).replace(/^From /, '')}` : ''}</em></strong>
                    <span>{f.body}</span>
                    <b>See packages →</b>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="sl2-feat-world">
            <div className="sl2-feat-stage" ref={featStageRef}>
              <div className={`sl2-slide ${active === 0 ? 'on' : ''}`}><Frame kind="phone" src="phone-services" alt="Content packages on a phone" /></div>
              <div className={`sl2-slide ${active === 1 ? 'on' : ''}`}><Frame kind="desktop" src="web-ecosystem" alt="A custom website" /></div>
              <div className={`sl2-slide ${active === 2 ? 'on' : ''}`}>
                <Frame kind="desktop"><div className="sl2-vid"><video src="/images/3d/light-intro.mp4" poster="/images/3d/light-final.webp" autoPlay muted loop playsInline preload="auto" aria-label="SWRV logo animation" /></div></Frame>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="sl2-section">
        <p className="sl2-mono sl2-reveal">HOW IT WORKS</p>
        <h2 className="sl2-h2 sl2-reveal">Easy as 1, 2, 3.</h2>
        <ol className="sl2-steps">
          {[['1', 'Pick it', 'Tap what you need.'], ['2', 'Book it', 'Choose a date. Pay to lock it in.'], ['3', 'We deliver', "You're on the road. We do the rest."]].map(([n, t, d], i) => (
            <li key={n} className="sl2-reveal" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="sl2-num">{n}</span><strong>{t}</strong><span>{d}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══ CONSULTATION ═══ */}
      <section className="sl2-section">
        <div className="sl2-panel sl2-reveal" ref={panelRef}>
          <p className="sl2-mono sl2-mono-light">NOT SURE WHERE TO START?</p>
          <h2>Book a consultation.</h2>
          <p>Step 1: book and pay $100, and pick your date. Step 2: right after you pay, your Roadmap unlocks. It's a short questionnaire so SWRV comes prepared. Step 3: we talk and build your plan. The $100 pays for SWRV's time. Projects are priced and paid for separately.</p>
          <Jewel onClick={openConsult} />
        </div>
      </section>

      <div className={`sl2-bar ${barOn && !panelSeen ? 'on' : ''}`}>
        <Jewel onClick={openConsult} main="Book live consultation" sub="$100 · Roadmap unlocks instantly" className="sl2-jewel-bar" />
      </div>

      {book && createPortal(<CheckoutModal service={book} onClose={() => setBook(null)} />, document.body)}

      <footer className="sl2-footer">
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
