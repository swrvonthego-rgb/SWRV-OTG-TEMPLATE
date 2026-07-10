import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND, HEADER } from '../site.config';
import { MEDIA } from '../media.config';

interface HeaderProps { onOpenByob?: () => void; onOpenZion?: () => void; onOpenBirdsong?: () => void; }

const GOLD = '#c8a84b';
const GOLD_LIGHT = '#e8c96a';

// ── Organized menu structure ────────────────────────────────
// Everything that used to be crammed into the horizontal nav bar
// is now grouped into named sections for the hamburger panel.
type MenuAction =
  | { kind: 'scroll'; target: string }
  | { kind: 'roadmap' }
  | { kind: 'overlay'; which: 'byob' | 'zion' | 'birdsong' }
  | { kind: 'zionSection'; section: string }
  | { kind: 'external'; href: string };

interface MenuItem { label: string; sub?: string; action: MenuAction; accent?: boolean; }
interface MenuGroup { heading: string; items: MenuItem[]; }

const MENU_GROUPS: MenuGroup[] = [
  {
    heading: 'The Site',
    items: [
      { label: 'Portfolio',       sub: 'Live client work',        action: { kind: 'scroll', target: 'portfolio' } },
      { label: 'The Ecosystem',   sub: 'Services + pricing',      action: { kind: 'scroll', target: 'ecosystem' } },
      { label: 'Need a Website?', sub: '$300 templates',          action: { kind: 'scroll', target: 'need-a-website' } },
      { label: 'The Full Menu',   sub: 'Browse every service',    action: { kind: 'scroll', target: 'full-menu' } },
      { label: 'About',           sub: 'The story behind SWRV',   action: { kind: 'scroll', target: 'about-swrv' } },
      { label: 'Shop',            sub: 'Products + apparel',      action: { kind: 'scroll', target: 'shop' } },
      { label: 'Contact',         sub: 'Book a session',          action: { kind: 'scroll', target: 'contact' } },
    ],
  },
  {
    heading: 'The Family',
    items: [
      { label: 'Zion Birdsong',       sub: 'Artist & recording',    action: { kind: 'overlay', which: 'zion' } },
      { label: 'The Birdsong Method', sub: 'Vocal training',        action: { kind: 'overlay', which: 'birdsong' } },
      { label: 'Train BYOB',          sub: 'Bilingual coaching',    action: { kind: 'overlay', which: 'byob' } },
      { label: 'Books',               sub: "Zion's published work", action: { kind: 'zionSection', section: 'books' } },
      { label: 'Podcast',             sub: 'Latest episodes',       action: { kind: 'zionSection', section: 'podcast' } },
    ],
  },
];

export const Header: React.FC<HeaderProps> = ({ onOpenByob, onOpenZion, onOpenBirdsong }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll while menu open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleAction = (action: MenuAction) => {
    setMenuOpen(false);
    setTimeout(() => {
      switch (action.kind) {
        case 'scroll': {
          const el = document.getElementById(action.target);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
        case 'roadmap':
          window.dispatchEvent(new CustomEvent('swrv:open-roadmap'));
          break;
        case 'overlay':
          if (action.which === 'byob') onOpenByob?.();
          if (action.which === 'zion') onOpenZion?.();
          if (action.which === 'birdsong') onOpenBirdsong?.();
          break;
        case 'zionSection':
          window.dispatchEvent(new CustomEvent('swrv:zion-section', { detail: action.section }));
          onOpenZion?.();
          break;
        case 'external':
          window.open(action.href, '_blank', 'noopener,noreferrer');
          break;
      }
    }, 120);
  };

  return (
    <header className="fixed w-full z-50 font-sans">
      {/* Main bar — Logo | (grows) | Roadmap CTA | Get In Touch | Hamburger */}
      <div className={`bg-black transition-all duration-300 border-b border-gray-800 ${scrolled ? 'py-2 shadow-lg' : 'py-3'}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-full gap-4">

          {/* Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
            aria-label={`${BRAND.name} — home`}
          >
            <img
              src={MEDIA.brand.logo}
              alt={`${BRAND.name} Logo`}
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Right side — always compact: Roadmap + Get In Touch + Hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('swrv:open-roadmap'))}
              className="hidden sm:inline-block text-[12px] font-bold tracking-[0.2em] uppercase text-lion-orange hover:text-white transition-colors bg-transparent border-0 cursor-pointer px-2 md:px-3"
            >
              Take the Roadmap
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:inline-block px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_LIGHT})`, color: '#0a0804' }}
            >
              Get In Touch
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 text-white bg-transparent border border-gray-700 hover:border-lion-orange rounded-full pl-4 pr-3 py-2 transition-colors"
            >
              <span className="hidden md:inline text-[11px] font-bold tracking-[0.2em] uppercase">Menu</span>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Slide-down mega menu ────────────────────────────── */}
      {menuOpen && (
        <>
          {/* backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ animation: 'swrvHeaderFade 0.2s ease-out' }}
          />
          {/* panel */}
          <div
            className="fixed inset-x-0 top-0 bg-black text-white shadow-2xl overflow-y-auto"
            style={{
              maxHeight: '100vh',
              borderBottom: `1.5px solid ${GOLD}`,
              animation: 'swrvHeaderDrop 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* top bar inside panel — logo + close */}
            <div className="container mx-auto px-4 md:px-8 flex justify-between items-center py-3 border-b border-gray-800">
              <img src={MEDIA.brand.logo} alt="" className="h-10 md:h-12 w-auto object-contain" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex items-center gap-2 text-white bg-transparent border border-gray-700 hover:border-white rounded-full pl-4 pr-3 py-2 transition-colors"
              >
                <span className="hidden md:inline text-[11px] font-bold tracking-[0.2em] uppercase">Close</span>
                <X size={22} />
              </button>
            </div>

            {/* content */}
            <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
              {/* Primary CTAs across the top */}
              <div className="grid gap-3 md:grid-cols-2 mb-10 md:mb-14">
                <button
                  type="button"
                  onClick={() => handleAction({ kind: 'roadmap' })}
                  className="text-left rounded-2xl p-6 md:p-7 transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg,#ff4d00 0%,#ff6a2a 100%)', boxShadow: '0 8px 24px rgba(255,77,0,0.25)' }}
                >
                  <div className="text-[11px] font-bold tracking-[0.4em] uppercase mb-3 text-white/85">Start here</div>
                  <div className="text-2xl md:text-3xl text-white leading-[1.05]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
                    Take the Roadmap
                  </div>
                  <div className="text-sm text-white/85 mt-2">Map your gift to a real route.</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction({ kind: 'scroll', target: 'contact' })}
                  className="text-left rounded-2xl p-6 md:p-7 transition-all hover:scale-[1.01]"
                  style={{ background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_LIGHT} 100%)`, color: '#0a0804', boxShadow: '0 8px 24px rgba(200,168,75,0.25)' }}
                >
                  <div className="text-[11px] font-bold tracking-[0.4em] uppercase mb-3 opacity-75">Ready?</div>
                  <div className="text-2xl md:text-3xl leading-[1.05]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>
                    Get In Touch
                  </div>
                  <div className="text-sm opacity-80 mt-2">Book a session or a strategy call.</div>
                </button>
              </div>

              {/* Grouped links */}
              <div className="grid gap-10 md:gap-16 md:grid-cols-2">
                {MENU_GROUPS.map(group => (
                  <div key={group.heading}>
                    <div className="text-[11px] font-bold tracking-[0.4em] uppercase mb-5" style={{ color: GOLD }}>
                      {group.heading}
                    </div>
                    <ul className="space-y-3">
                      {group.items.map(item => (
                        <li key={item.label}>
                          <button
                            type="button"
                            onClick={() => handleAction(item.action)}
                            className="w-full text-left group flex items-baseline justify-between gap-3 py-2 border-b border-gray-800 hover:border-gray-600 transition-colors"
                          >
                            <span>
                              <span className="text-base md:text-lg font-bold text-white group-hover:text-lion-orange transition-colors block leading-tight">
                                {item.label}
                              </span>
                              {item.sub && (
                                <span className="text-xs text-gray-500 block mt-0.5">{item.sub}</span>
                              )}
                            </span>
                            <span className="text-gray-600 group-hover:text-white text-lg transition-colors" aria-hidden="true">→</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Utility footer */}
              <div className="mt-12 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                <div className="tracking-wider">© {new Date().getFullYear()} Swerve · SWRV On The Go</div>
                <div className="flex flex-wrap gap-4">
                  {HEADER.utilityLinks.map(link => (
                    link.external ? (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="uppercase tracking-widest hover:text-white transition-colors">
                        {link.label}
                      </a>
                    ) : null
                  ))}
                  <a href="https://trainbyob.me" target="_blank" rel="noopener noreferrer" className="uppercase tracking-widest hover:text-white transition-colors">
                    TrainBYOB.me
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes swrvHeaderFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes swrvHeaderDrop {
          from { transform: translateY(-16px); opacity: 0 }
          to   { transform: translateY(0);     opacity: 1 }
        }
      `}</style>
    </header>
  );
};
