import React, { useState } from 'react';
import { Check, Plus, ArrowRight, Star, Zap, Globe, Rocket } from 'lucide-react';

const tiers = [
  {
    id: 'presence',
    name: 'THE PRESENCE',
    price: 250,
    icon: <Globe size={28} strokeWidth={1.5} />,
    tagline: 'Show up. Stand out. Get seen.',
    badge: null,
    bestFor: 'Artists, LLC holders, coaches, and creatives who need a clean, professional page for funding apps, investor decks, portfolio showcases, or proving you exist online.',
    deliveryDays: '48-hour turnaround',
    revisions: '1 round',
    includes: [
      'Custom single-page responsive website (desktop + mobile)',
      'Bio / About section',
      'Photo gallery — up to 8 images (you provide)',
      'All social media profile links',
      'Contact form (email-linked, no spam)',
      'SEO setup: page title, meta description, Open Graph tags',
      'Google Analytics installation',
      'Your logo & brand colors applied',
    ],
    addOns: null,
    note: 'You provide: photos, logo, and a short bio. We handle the rest.',
    color: 'border-white/10',
    accentColor: 'text-white',
    badgeBg: '',
    cta: 'Get The Presence',
  },
  {
    id: 'platform',
    name: 'THE PLATFORM',
    price: 500,
    icon: <Zap size={28} strokeWidth={1.5} />,
    tagline: 'Sell. Book. Tell your story.',
    badge: 'MOST POPULAR',
    bestFor: 'Creators, coaches, service providers, and small businesses ready to take payments, book clients, and make a cinematic first impression.',
    deliveryDays: '1-week turnaround',
    revisions: '2 rounds',
    includes: [
      'Everything in The Presence',
      'Payment integration (Stripe, PayPal, or Square — up to 3 products/services)',
      'Booking / inquiry form with service category selection',
      'Email list capture (newsletter sign-up integration)',
      'Testimonials & social proof section',
      '60–90 second custom brand intro video — includes:',
      '   · Script writing (your story + what you stand for)',
      '   · Cinematic voiceover (professional, produced by SWRV)',
      '   · Original background music',
      '   · Motion graphics + text animations',
      'Video embedded and optimized on your page',
    ],
    addOns: null,
    note: 'The brand video alone runs $500–$1,500 on the open market. You get it bundled here.',
    color: 'border-lion-orange',
    accentColor: 'text-lion-orange',
    badgeBg: 'bg-lion-orange',
    cta: 'Get The Platform',
  },
  {
    id: 'ecosystem',
    name: 'THE ECOSYSTEM',
    price: 1000,
    icon: <Rocket size={28} strokeWidth={1.5} />,
    tagline: 'Your full world. One destination.',
    badge: null,
    bestFor: 'Established brands, movements, ministries, and businesses ready for a complete full-scale web presence built entirely around their vision.',
    deliveryDays: '2-week turnaround',
    revisions: '3 rounds',
    includes: [
      'Everything in The Platform',
      '1 main page + up to 5 additional pages',
      '   (Choose from: About, Services, Shop, Portfolio, Events, Blog, Press Kit, Contact)',
      'Full site navigation — desktop menu + mobile hamburger',
      'Full SEO optimization across all pages',
      'Up to 10 products or services in your shop',
      'Blog / news page (if selected as one of your 5 pages)',
      'Social media feed integration',
      'Brand style guide document (colors, fonts, logo usage rules)',
      '30 days of post-launch support & minor updates',
      'Priority response time',
    ],
    addOns: [
      { label: 'Extra pages (beyond 5)', price: '+$75 each' },
      { label: 'Monthly maintenance & updates', price: '$75/mo' },
      { label: 'Additional brand video', price: '$150–$300' },
      { label: 'Done-for-you domain & hosting setup', price: '$50 one-time' },
    ],
    note: 'Multi-page sites run $3,000–$15,000+ in the open market. This is intentional.',
    color: 'border-white/20',
    accentColor: 'text-white',
    badgeBg: '',
    cta: 'Get The Ecosystem',
  },
];

const universalNotes = [
  'Domain & hosting not included — we walk you through setup (~$15/yr domain, ~$10–20/mo hosting)',
  'You own your site 100% after delivery — no lock-in, no hidden fees',
  '50% deposit required to begin · 50% due on final delivery',
  'You provide: photos, logo, and key copy (we can help shape it) — or ask about copy writing as an add-on',
];

export const WebPackages: React.FC = () => {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const handleCTA = (tierId: string) => {
    const subject = encodeURIComponent(`Web Package Inquiry — ${tiers.find(t => t.id === tierId)?.name}`);
    const body = encodeURIComponent(`Hi Zion,\n\nI'm interested in the ${tiers.find(t => t.id === tierId)?.name} web package ($${tiers.find(t => t.id === tierId)?.price}).\n\nAbout my project:\n\n`);
    window.location.href = `mailto:swrvonthego@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="web-packages" className="py-24 bg-[#080808] text-white">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.45em] uppercase text-lion-orange mb-5">
            // WEB PRESENCE PACKAGES
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-none tracking-tight mb-6">
            YOUR BRAND.<br />
            <span className="text-lion-orange">BUILT RIGHT.</span>
          </h2>
          <div className="w-16 h-0.5 bg-lion-orange mx-auto mb-8" />
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Content creation is how the world speaks now. Every artist, entrepreneur, pastor, coach, and movement needs a home online that works as hard as they do. Pick your tier — we handle the build.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col border-2 ${tier.color} rounded-sm transition-all duration-300 ${
                hoveredTier === tier.id ? 'border-lion-orange shadow-[0_0_40px_rgba(255,77,0,0.15)]' : ''
              }`}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {/* Popular Badge */}
              {tier.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${tier.badgeBg} text-black text-xs font-black tracking-[0.25em] uppercase px-4 py-1.5 flex items-center gap-1.5`}>
                  <Star size={10} fill="currentColor" />
                  {tier.badge}
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                {/* Icon + Name */}
                <div className={`${tier.accentColor} mb-4`}>{tier.icon}</div>
                <h3 className={`text-2xl font-black tracking-wider uppercase mb-1 ${tier.accentColor}`}>
                  {tier.name}
                </h3>
                <p className="text-gray-500 text-xs tracking-widest uppercase mb-6">{tier.tagline}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white leading-none">${tier.price}</span>
                    <span className="text-gray-500 text-sm mb-1">one-time</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>⏱ {tier.deliveryDays}</span>
                    <span>✏️ {tier.revisions}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/8 mb-6" />

                {/* Best For */}
                <div className="mb-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Best For</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{tier.bestFor}</p>
                </div>

                {/* Includes */}
                <div className="mb-6 flex-1">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">What's Included</p>
                  <ul className="space-y-2">
                    {tier.includes.map((item, i) => {
                      const isIndented = item.startsWith('   ·') || item.startsWith('   (');
                      return (
                        <li key={i} className={`flex gap-2 text-sm ${isIndented ? 'ml-5 text-gray-500' : 'text-gray-300'}`}>
                          {!isIndented && (
                            <Check
                              size={14}
                              className={`flex-shrink-0 mt-0.5 ${tier.id === 'platform' ? 'text-lion-orange' : 'text-green-500'}`}
                            />
                          )}
                          <span>{isIndented ? item.replace('   ', '') : item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Add-ons for Tier 3 */}
                {tier.addOns && (
                  <div className="mb-6">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Available Add-Ons</p>
                    <ul className="space-y-1.5">
                      {tier.addOns.map((addon, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-1.5">
                          <span className="flex items-center gap-1.5"><Plus size={10} className="text-lion-orange" />{addon.label}</span>
                          <span className="text-lion-orange font-bold">{addon.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Note */}
                <p className="text-xs text-gray-600 italic mb-6 leading-relaxed">{tier.note}</p>

                {/* CTA */}
                <button
                  onClick={() => handleCTA(tier.id)}
                  className={`group w-full py-4 font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                    tier.id === 'platform'
                      ? 'bg-lion-orange text-black hover:bg-white'
                      : 'bg-transparent border border-white/20 text-white hover:border-lion-orange hover:text-lion-orange'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Universal Notes */}
        <div className="border border-white/8 rounded-sm p-8 max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-gray-500 mb-5 text-center">
            // GOOD TO KNOW — BEFORE WE START
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {universalNotes.map((note, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                <span className="text-lion-orange mt-0.5 flex-shrink-0">·</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/8 text-center">
            <p className="text-gray-400 text-sm mb-4">Not sure which tier is right for you?</p>
            <a
              href="#ecosystem"
              className="inline-flex items-center gap-2 text-lion-orange font-bold text-sm tracking-widest uppercase hover:underline"
            >
              Start with the free Brand Vision consultation <ArrowRight size={14} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
