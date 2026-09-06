import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Mic } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Suite 5 — The SWRV Family. These are sibling products SWRV built and
// owns separately, not bookable SWRV services — this page's job is
// presenting them and sending visitors onward (external sites, or the
// existing full-page BYOB/Birdsong experiences at /family/byob and
// /family/birdsong).
const FAMILY_PRODUCTS = [
  {
    id: 'bible',
    name: 'The SWRV No BS Bible',
    tagline: 'The Word — without the whitewash.',
    description: 'A free, historically accurate Bible web app with original canon translations, the Book of Enoch, and Dead Sea Scrolls documentation.',
    icon: <BookOpen size={28} strokeWidth={1.5} />,
    href: 'https://swrv-on-bs-bible.swrvonthego.workers.dev/',
    external: true,
  },
  {
    id: 'byob',
    name: 'Train BYOB',
    tagline: 'Build Your Own Bodyguard.',
    description: 'Self-defense coaching drawing from Jeet Kune Do, Muay Thai, boxing, and Kali — for adults and youth.',
    icon: <Shield size={28} strokeWidth={1.5} />,
    href: '/family/byob',
    external: false,
  },
  {
    id: 'birdsong',
    name: 'The Birdsong Method',
    tagline: 'Vocal training, built different.',
    description: "Zion SWRV Birdsong's vocal coaching system — breath, pitch, and a paid AI vocal analyzer.",
    icon: <Mic size={28} strokeWidth={1.5} />,
    href: '/family/birdsong',
    external: false,
  },
];

export const FamilyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0804] font-sans text-white">
      <Header />
      <main className="pt-28 md:pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-lion-orange mb-3">Suite 5</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              The SWRV Family
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto mt-4">
              Sibling products SWRV built and owns — each its own thing, each worth a visit.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FAMILY_PRODUCTS.map((p) =>
              p.external ? (
                <a
                  key={p.id}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-lion-orange/60 transition-all p-7"
                >
                  <span className="text-lion-orange mb-5 block">{p.icon}</span>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-lion-orange transition-colors">{p.name}</h3>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{p.tagline}</p>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{p.description}</p>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-colors">Visit ↗</span>
                </a>
              ) : (
                <Link
                  key={p.id}
                  to={p.href}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-lion-orange/60 transition-all p-7"
                >
                  <span className="text-lion-orange mb-5 block">{p.icon}</span>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-lion-orange transition-colors">{p.name}</h3>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{p.tagline}</p>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{p.description}</p>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-colors">Explore →</span>
                </Link>
              )
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
