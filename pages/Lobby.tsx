import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LaunchBanner } from '../components/LaunchBanner';
import { SecondaryIntro } from '../components/SecondaryIntro';
import { Hero } from '../components/Hero';
import { BrandTransmission } from '../components/BrandTransmission';
import { Stats } from '../components/Stats';
import { Portfolio } from '../components/Portfolio';
import { SuiteDirectory } from '../components/SuiteDirectory';
import { useNavigate } from 'react-router-dom';

// ════════════════════════════════════════════════════════════
// LOBBY — the site's front door.
// ────────────────────────────────────────────────────────────
// This used to be the entire homepage (every section, every offering,
// one long scroll). Now it's just: a first-visit intro ceremony, a
// short trust-building intro (hero + stats + a taste of the work),
// then a clear directory pointing to each of the 6 real suites —
// like a building lobby with a directory board, not the whole building
// crammed into the entryway.
// ════════════════════════════════════════════════════════════

export const Lobby: React.FC = () => {
  const navigate = useNavigate();

  // First-visit splash ceremony. Any query string or hash on `/` (e.g. a
  // Stripe/PayPal return redirect) skips straight past it — this mirrors
  // the site's old isDeepLinkEntry() behavior, just scoped to this page
  // now that every other suite is its own route (and never shows the splash).
  const [hasStarted, setHasStarted] = useState(
    () => typeof window !== 'undefined' && !!(window.location.hash || window.location.search),
  );
  const [skipIntro, setSkipIntro] = useState(hasStarted);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,77,0,0.08) 0%, transparent 70%)'
        }} />

        <button
          onClick={() => { setSkipIntro(true); setHasStarted(true); setTimeout(() => { document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' }); }, 80); }}
          className="fixed bottom-8 right-8 p-3 bg-black/50 hover:bg-lion-orange text-white rounded-full backdrop-blur-sm transition-all z-50"
          title="Skip to SWRV Headquarters"
        >
          <X size={20} />
        </button>

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
      <Header />

      <main>
        <LaunchBanner />
        <SecondaryIntro skipIntro={skipIntro} />
        <Hero onOpenConsultation={() => navigate('/roadmap')} />
        {!skipIntro && <BrandTransmission skipIntro={false} />}
        <Stats />
        <Portfolio />
        <SuiteDirectory />
      </main>

      <Footer />
    </div>
  );
};
