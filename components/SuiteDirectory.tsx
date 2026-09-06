import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Globe, Mic2, Users, Info } from 'lucide-react';

// ════════════════════════════════════════════════════════════
// SUITE DIRECTORY — the "building directory board."
// ────────────────────────────────────────────────────────────
// A visitor lands in the Lobby, sees exactly 6 doors, and picks the one
// they need. This replaces "everything on one page" with "one clear
// choice per thing SWRV does."
// ════════════════════════════════════════════════════════════

interface Suite {
  id: string;
  suiteNumber: string;
  name: string;
  blurb: string;
  path: string;
  icon: React.ReactNode;
}

const SUITES: Suite[] = [
  {
    id: 'roadmap',
    suiteNumber: 'Suite 1',
    name: 'The Roadmap',
    blurb: 'Free AI-guided quiz — map your gift to a real, priced plan in minutes.',
    path: '/roadmap',
    icon: <Compass size={28} strokeWidth={1.5} />,
  },
  {
    id: 'creative-services',
    suiteNumber: 'Suite 2',
    name: 'Creative Services',
    blurb: 'Video, audio, podcasts, content — the full à la carte catalog.',
    path: '/creative-services',
    icon: <Sparkles size={28} strokeWidth={1.5} />,
  },
  {
    id: 'website-design',
    suiteNumber: 'Suite 3',
    name: 'Website Design',
    blurb: '$300 templates or a full custom build — pick a style, we make it yours.',
    path: '/website-design',
    icon: <Globe size={28} strokeWidth={1.5} />,
  },
  {
    id: 'zion',
    suiteNumber: 'Suite 4',
    name: 'Zion & Artist Development',
    blurb: "Book Zion SWRV Birdsong, or dig into the artist development curriculum.",
    path: '/zion',
    icon: <Mic2 size={28} strokeWidth={1.5} />,
  },
  {
    id: 'family',
    suiteNumber: 'Suite 5',
    name: 'The SWRV Family',
    blurb: 'Sibling products: the No BS Bible, Train BYOB self-defense, The Birdsong Method.',
    path: '/family',
    icon: <Users size={28} strokeWidth={1.5} />,
  },
  {
    id: 'about',
    suiteNumber: 'Suite 6',
    name: 'About, Shop & Contact',
    blurb: "The story behind SWRV, merch, and how to book a session.",
    path: '/about',
    icon: <Info size={28} strokeWidth={1.5} />,
  },
];

export const SuiteDirectory: React.FC = () => {
  return (
    <section id="suite-directory" className="py-20 md:py-28 bg-[#0a0804] text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-lion-orange mb-3">Directory</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Pick Your Suite
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto mt-4">
            SWRV On The Go is one building, six doors. Choose what you're here for.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SUITES.map((suite) => (
            <Link
              key={suite.id}
              to={suite.path}
              className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-lion-orange/60 transition-all p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-lion-orange">{suite.icon}</span>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">{suite.suiteNumber}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-lion-orange transition-colors">{suite.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{suite.blurb}</p>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-colors inline-flex items-center gap-2">
                Enter →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
