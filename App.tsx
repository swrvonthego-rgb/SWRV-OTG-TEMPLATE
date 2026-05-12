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
import { Byob } from './modules/byob/Byob';

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

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans relative">
        {/* Circle skip button — bottom-right corner, matches SecondaryIntro toggles */}
        <button
          onClick={() => {
            setSkipIntro(true);
            setHasStarted(true);
            setTimeout(() => {
              document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 80);
          }}
          className="fixed bottom-8 right-8 p-3 bg-black/50 hover:bg-lion-orange text-white rounded-full backdrop-blur-sm transition-all z-50"
          title="Skip to SWRV Headquarters"
        >
          <X size={20} />
        </button>

        <button 
          onClick={() => setHasStarted(true)}
          className="group relative bg-lion-orange text-white px-12 py-6 font-bold uppercase tracking-widest text-lg hover:bg-white hover:text-lion-orange transition-all duration-300 rounded-sm shadow-[0_0_40px_rgba(255,77,0,0.6)] hover:shadow-[0_0_60px_rgba(255,77,0,1)] border border-lion-orange overflow-hidden flex items-center gap-4"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Play fill="currentColor" size={24} />
            Enter Experience
          </span>
          <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
        </button>
        <p className="mt-8 text-white/50 text-sm tracking-widest uppercase">Click to enable audio &amp; animations</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-lion-black">
      <Header onOpenByob={() => setIsByobOpen(true)} />

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
    </div>
  );
};

export default App;
