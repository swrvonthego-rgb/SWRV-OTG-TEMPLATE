import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SecondaryIntro } from './components/SecondaryIntro';
import { Hero } from './components/Hero';
// import { Services } from './components/Services'; // replaced by Marketplace
import { Stats } from './components/Stats';
import { Shop } from './modules/shop/Shop';
import { Footer } from './components/Footer';
import { Play, X } from 'lucide-react';
import { BrandTransmission } from './components/BrandTransmission';
// import { WebPackages } from './components/WebPackages'; // replaced by Marketplace
import { AboutSWRV } from './components/AboutSWRV';
import { ContactSchedule } from './components/ContactSchedule';

// ── NEW: Unified Roadmap experience module ──────────────────
// Replaces the old VisionRoadmapBuilder modal. This is the
// merged version of:
//   - The standalone Vercel Roadmap (the visual + UX gold)
//   - VisionRoadmapBuilder.tsx (the integration pattern)
//   - The Workbook content (planned for Layer 2)
//
// Lives in /modules/roadmap/ and is fully config-driven so the
// same module can be dropped into any client ecosystem.
import { Roadmap } from './modules/roadmap/Roadmap';
import { Zion } from './modules/zion/Zion';
import { ServicesMenu } from './modules/services-menu/ServicesMenu';
import { Byob } from './modules/byob/Byob';
import { Birdsong } from './modules/birdsong/Birdsong';
import { LiveChat } from './components/LiveChat';
import { ProjectIntake } from './components/ProjectIntake';
import { Pipeline } from './components/Pipeline';
import { LaunchBanner } from './components/LaunchBanner';
import { Portfolio } from './components/Portfolio';
import { Marketplace } from './components/Marketplace';
import { NeedAWebsite } from './components/NeedAWebsite';
import { AdminPage } from './modules/admin/AdminPage';

// ── CONSOLE FINGERPRINT ─────────────────────────────────────────────
// Fires once on load — brands the devtools, deters casual copying
if (typeof window !== 'undefined') {
  const s1 = 'color:#c8a84b;font-size:18px;font-weight:900;font-family:Georgia,serif';
  const s2 = 'color:#ede8dc;font-size:12px;font-family:monospace';
  const s3 = 'color:#888;font-size:11px';
  console.log('%cSWRV ON THE GO', s1);
  console.log('%c© 2025 Swerve (Robert Birdsong). All rights reserved.', s2);
  console.log('%cThis site is proprietary. Unauthorized copying is prohibited.', s3);
  console.log('%cswrvonthego.pro', s3);
}

// ── CLEAN-PATH DEEP LINKS (SPA fallback safety net) ─────────────────
// Cloudflare's `not_found_handling: single-page-application` serves
// index.html for unknown paths WITHOUT running the Worker, so the
// Worker's SHORTCUTS redirects (e.g. /roadmap → ?roadmap=start) never
// fire for direct navigations. We normalize those clean paths here —
// before React reads window.location — so shared links land correctly.
// Runs once at module load (client only), guarded to a no-op afterward.
if (typeof window !== 'undefined') {
  const p = window.location.pathname.replace(/\/+$/, '') || '/';
  // Paths that should drop the visitor straight into the Roadmap test.
  const ROADMAP_PATHS = ['/roadmap', '/the-roadmap', '/start', '/test', '/roadmap-test'];
  // Clean paths → homepage section anchors.
  const SECTION_HASH: Record<string, string> = {
    '/portfolio': 'portfolio',
    '/about': 'about-swrv',
    '/contact': 'contact',
    '/byob': 'byob',
    '/shop': 'shop',
    '/websites': 'need-a-website',
    '/templates': 'website-templates',
    '/revving-up': 'revving-up',
  };
  // Clean paths → Full Menu catalog tabs.
  const CATALOG_TAB: Record<string, string> = {
    '/menu': 'videography',
    '/videography': 'videography',
    '/video': 'videography',
    '/audio': 'audio-production',
    '/music': 'audio-production',
    '/web': 'web-digital',
    '/brand': 'brand-identity',
    '/coaching': 'coaching',
    '/business': 'content-business',
  };
  if (ROADMAP_PATHS.includes(p) && !window.location.search.includes('roadmap=')) {
    window.history.replaceState({}, '', '/?roadmap=start');
  } else if (SECTION_HASH[p] && !window.location.hash) {
    window.history.replaceState({}, '', '/#' + SECTION_HASH[p]);
  } else if (CATALOG_TAB[p]) {
    window.history.replaceState({}, '', '/?catalog=' + CATALOG_TAB[p] + '#full-menu');
  }
}



const App: React.FC = () => {
  // /admin is a standalone login-gated page — served directly, no splash,
  // no homepage detour. Must come before any hooks (early return).
  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    return <AdminPage />;
  }

  // Initialize roadmap open state from URL. Two entry points:
  //   ?roadmap=1     → opens the overlay on the intro/paywall (homepage CTA)
  //   ?roadmap=start → opens it AND skips straight into the test (the link
  //                    Robert sends clients — Roadmap.tsx reads the same
  //                    param to start on the first question screen).
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const rm = new URLSearchParams(window.location.search).get('roadmap');
    return rm === '1' || rm === 'start';
  });
  const [isZionOpen, setIsZionOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  // Open services menu if URL is /services (deep linking)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/services') {
      setIsServicesMenuOpen(true);
    }
  }, []);

  // Deep-link handler: scroll to hash section OR open roadmap on ?roadmap=1
  useEffect(() => {
    const { hash, search } = window.location;
    const params = new URLSearchParams(search);

    // ?roadmap=1 / ?roadmap=start — already handled by the useState
    // initializer above; nothing else to scroll/open here.
    const rm = params.get('roadmap');
    if (rm === '1' || rm === 'start') return;

    // #byob and #meet-zion open their modals instead of scrolling
    if (hash === '#byob') { setIsByobOpen(true); return; }
    if (hash === '#meet-zion') { setIsZionOpen(true); return; }

    // All other hashes: scroll to the section after render.
    // Slow devices can take several seconds to mount + paint, and images/
    // videos loading above the target keep shifting the layout — so retry
    // for up to ~15s and re-pin the section for ~3s after first landing.
    // The moment the visitor scrolls on their own, stop interfering.
    if (hash) {
      const target = hash.replace('#', '');
      let userTookOver = false;
      const cancel = () => { userTookOver = true; };
      window.addEventListener('wheel', cancel, { once: true, passive: true });
      window.addEventListener('touchstart', cancel, { once: true, passive: true });

      const attempt = (tries = 0, pins = 0) => {
        if (userTookOver) return;
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
          if (pins < 6) setTimeout(() => attempt(tries, pins + 1), 500);
        } else if (tries < 60) {
          setTimeout(() => attempt(tries + 1, pins), 250);
        }
      };
      setTimeout(() => attempt(), 100);
    }
  }, []);

  const [isByobOpen, setIsByobOpen] = useState(false);
  const [isBirdsongOpen, setIsBirdsongOpen] = useState(false);
  const [intakeService, setIntakeService] = useState<{id:string;name:string}|null>(null);
  // Deep-link detection: any URL other than bare swrvonthego.pro/ skips
  // both the splash screen AND the BrandTransmission video. The video
  // only plays for visitors landing at the root with no hash/path/query.
  const isDeepLink = (() => {
    if (typeof window === 'undefined') return false;
    const { hash, search, pathname } = window.location;
    return !!(hash || search || pathname !== '/');
  })();
  const [hasStarted, setHasStarted] = useState(isDeepLink);
  const [skipIntro, setSkipIntro] = useState(isDeepLink);

  // Hero 'Take the Roadmap' button
  // Also sets hasStarted so the main render is mounted before Roadmap opens —
  // prevents the flash-and-disappear caused by unmounting the splash block.
  useEffect(() => {
    const handler = () => {
      setHasStarted(true);
      setSkipIntro(true);
      setTimeout(() => setIsRoadmapOpen(true), 50);
    };
    window.addEventListener('swrv:open-roadmap', handler);
    return () => window.removeEventListener('swrv:open-roadmap', handler);
  }, []);

  // ── REFERRAL TRACKING ─────────────────────────────────────────────
  // Capture ?ref=CODE from URL and store in localStorage for attribution
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('swrv_ref', ref.toUpperCase());
      localStorage.setItem('swrv_ref_ts', Date.now().toString());
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
    // Expire after 30 days
    const ts = localStorage.getItem('swrv_ref_ts');
    if (ts && Date.now() - parseInt(ts) > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('swrv_ref');
      localStorage.removeItem('swrv_ref_ts');
    }
  }, []);

  // LiveChat can request services menu to open
  useEffect(() => {
    const handler = () => setIsServicesMenuOpen(true);
    window.addEventListener('swrv:open-services', handler);
    return () => window.removeEventListener('swrv:open-services', handler);
  }, []);

  // LiveChat "Book SWRV Birdsong" → open Zion page and scroll to the booking section
  useEffect(() => {
    const handler = () => {
      setIsZionOpen(true);
      // Let the overlay mount, then jump to #booking via Zion's section listener
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('swrv:zion-section', { detail: 'booking' }));
      }, 350);
    };
    window.addEventListener('swrv:open-zion-booking', handler);
    return () => window.removeEventListener('swrv:open-zion-booking', handler);
  }, []);

  // Services menu / cards can open intake for a specific service
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, name } = (e as CustomEvent<{id:string;name:string}>).detail;
      setIntakeService({ id, name });
    };
    window.addEventListener('swrv:open-intake', handler);
    return () => window.removeEventListener('swrv:open-intake', handler);
  }, []);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,77,0,0.08) 0%, transparent 70%)'
        }} />

        {/* Skip button */}
        <button
          onClick={() => { setSkipIntro(true); setHasStarted(true); setTimeout(() => { document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' }); }, 80); }}
          className="fixed bottom-8 right-8 p-3 bg-black/50 hover:bg-lion-orange text-white rounded-full backdrop-blur-sm transition-all z-50"
          title="Skip to SWRV Headquarters"
        >
          <X size={20} />
        </button>

        {/* Logo + brand */}
        <img
          src="https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png"
          alt="SWRV On The Go"
          className="w-20 h-20 object-contain mb-6 opacity-90"
        />

        <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/40 mb-2">SWRV ON THE GO</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3 text-center" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>
          LEADER OF THE<br /><span className="text-lion-orange">REVOLUTION</span>
        </h1>
        <p className="text-white/50 text-sm md:text-base max-w-sm text-center leading-relaxed mb-2 px-6">
          Full-service creative agency for artists, solopreneurs, and visionaries.
          Music. Video. Brand. Web. Built for those who refuse to blend in.
        </p>
        <p className="text-white/25 text-xs tracking-widest uppercase mb-10">25 years in the music business</p>

        <button
          onClick={() => setHasStarted(true)}
          className="group relative bg-lion-orange text-white px-12 py-5 font-bold uppercase tracking-widest text-base hover:bg-white hover:text-lion-orange transition-all duration-300 rounded-full shadow-[0_0_40px_rgba(255,77,0,0.5)] hover:shadow-[0_0_60px_rgba(255,77,0,0.9)] border border-lion-orange overflow-hidden flex items-center gap-3"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Play fill="currentColor" size={20} />
            Enter Experience
          </span>
          <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
        </button>
        <p className="mt-5 text-white/30 text-xs tracking-widest uppercase">Enables audio &amp; animations</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-lion-black">
      <Header onOpenByob={() => setIsByobOpen(true)} onOpenZion={() => setIsZionOpen(true)} onOpenBirdsong={() => setIsBirdsongOpen(true)} />

      <main>
        <LaunchBanner />
        <SecondaryIntro skipIntro={skipIntro} />
        <Hero
          onOpenConsultation={() => setIsRoadmapOpen(true)}
        />
        {!skipIntro && <BrandTransmission skipIntro={false} />}
        <Portfolio />
        <NeedAWebsite />
        <Stats />
        <Marketplace onOpenRoadmap={() => setIsRoadmapOpen(true)} />
        <AboutSWRV />
        <Shop />
        <Pipeline />
        <ContactSchedule />
      </main>

      <Footer />

      {/* The Roadmap — full-screen takeover overlay */}
      <Roadmap
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        onOpenServices={() => {
          setIsRoadmapOpen(false);
          setIsServicesMenuOpen(true);
        }}
      />

      {/* Full services menu overlay */}
      <ServicesMenu
        isOpen={isServicesMenuOpen}
        onClose={() => setIsServicesMenuOpen(false)}
        onBookStrategyCall={() => {
          setIsServicesMenuOpen(false);
          // Dispatch event so ContactSchedule pre-selects Strategy Call
          window.dispatchEvent(new CustomEvent('swrv:preset-topic', { detail: 'Strategy Call' }));
          // Smooth scroll to contact section after overlay closes
          setTimeout(() => {
            const el = document.getElementById('contact');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
      />

      {/* Zion SWRV Birdsong — artist page overlay */}
      <Zion
        isOpen={isZionOpen}
        onClose={() => setIsZionOpen(false)}
      />

      {/* BYOB Training — overlay */}
      <Byob
        isOpen={isByobOpen}
        onClose={() => setIsByobOpen(false)}
      />

      {/* The Birdsong Method — vocal training overlay */}
      <Birdsong
        isOpen={isBirdsongOpen}
        onClose={() => setIsBirdsongOpen(false)}
      />

      {/* Project Intake — full intake form overlay */}
      <ProjectIntake
        isOpen={!!intakeService}
        onClose={() => setIntakeService(null)}
        serviceId={intakeService?.id}
        serviceName={intakeService?.name}
      />

      {/* Live Chat — floating widget bottom-right */}
      <LiveChat onOpenBooking={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
    </div>
  );
};

export default App;

