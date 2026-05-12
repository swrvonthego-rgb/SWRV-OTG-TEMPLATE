import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SecondaryIntro } from './components/SecondaryIntro';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Stats } from './components/Stats';
import { Shop } from './modules/shop/Shop';
import { Footer } from './components/Footer';
import { Play, X } from 'lucide-react';
import { BrandTransmission } from './components/BrandTransmission';
import { WebPackages } from './components/WebPackages';
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
import { LiveChat } from './components/LiveChat';

const App: React.FC = () => {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isZionOpen, setIsZionOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  // Open services menu if URL is /services (deep linking)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/services') {
      setIsServicesMenuOpen(true);
    }
  }, []);

  const [isByobOpen, setIsByobOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  // LiveChat can request services menu to open
  useEffect(() => {
    const handler = () => setIsServicesMenuOpen(true);
    window.addEventListener('swrv:open-services', handler);
    return () => window.removeEventListener('swrv:open-services', handler);
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
      <Header onOpenByob={() => setIsByobOpen(true)} onOpenZion={() => setIsZionOpen(true)} />

      <main>
        <SecondaryIntro skipIntro={skipIntro} />
        <Hero
          onOpenConsultation={() => setIsRoadmapOpen(true)}
        />
        <BrandTransmission />
        <AboutSWRV />
        <Services onOpenRoadmap={() => setIsRoadmapOpen(true)} onOpenZion={() => setIsZionOpen(true)} onOpenServicesMenu={() => setIsServicesMenuOpen(true)} />
        <WebPackages />
        <Stats />
        <Shop />
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

      {/* Live Chat — floating widget bottom-right */}
      <LiveChat onOpenBooking={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} />
    </div>
  );
};

export default App;
