import React from 'react';
import { ShoppingBag, ArrowUpRight, Sparkles } from 'lucide-react';
import { SHOP_CONFIG } from './config';

// ════════════════════════════════════════════════════════════
// Shop Module — generic component, all content driven from config.ts
// ════════════════════════════════════════════════════════════

export const Shop: React.FC = () => {
  const cfg = SHOP_CONFIG;
  return (
    <section
      id="shop"
      className="relative py-24 bg-lion-dark text-white overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-bl from-lion-orange/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-gradient-to-tr from-amber-600/15 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lion-orange/10 border border-lion-orange/30 text-lion-orange text-xs tracking-[0.2em] uppercase font-semibold mb-6">
            <Sparkles size={14} />
            Shop · Live Now
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            {cfg.storeNamePrefix}{' '}
            <span className="text-lion-orange italic">{cfg.storeNameAccent}</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 italic font-light">
            {cfg.tagline}
          </p>
          <p className="text-base text-white/50 mt-4 max-w-xl mx-auto">
            {cfg.description}
          </p>
        </div>

        {/* Featured tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
          {cfg.featured.map((item) => (
            <a
              key={item.label}
              href={cfg.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-lion-orange/50 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative h-full flex flex-col justify-between p-7">
                <div className="flex-1 flex items-center justify-center -mt-2">
                  {item.bgWhite ? (
                    <div className="relative w-full max-w-[200px] aspect-square rounded-2xl bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.label}
                        className="max-h-full w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.label}
                      className="max-h-44 w-auto object-contain drop-shadow-2xl"
                      loading="lazy"
                    />
                  )}
                </div>
                <div>
                  <div className="text-xs tracking-[0.25em] uppercase text-white/50 mb-2">
                    {item.tagline}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-lion-orange transition-colors">
                    {item.label}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-white/60 group-hover:text-lion-orange transition-colors">
                    Shop now
                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <a
            href={cfg.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-lion-orange hover:bg-lion-orange/90 text-lion-dark font-bold text-base tracking-wider uppercase rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,140,40,0.4)] hover:scale-105"
          >
            <ShoppingBag size={20} />
            {cfg.ctaPrimary}
            <ArrowUpRight size={18} />
          </a>
          <p className="text-xs text-white/40 mt-4 tracking-wider">
            {cfg.fulfillmentNote}
          </p>
        </div>
      </div>
    </section>
  );
};
