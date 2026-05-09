// ════════════════════════════════════════════════════════════
// site.config.ts — SINGLE SOURCE OF TRUTH
// ════════════════════════════════════════════════════════════
//
// Everything client-customizable lives here. To clone this template
// for a new client, copy the repo and edit ONLY this file (plus
// modules/roadmap/config.ts and modules/zion/config.ts for the
// per-experience modules).
//
// What lives here:
//   • Brand identity (name, tagline, contact email, social links)
//   • Logo + primary brand image URLs
//   • Hero copy
//   • About / story copy
//   • Stats numbers
//   • WebPackages tiers + add-ons
//   • Service catalog (also imported by Roadmap config to keep them in sync)
//   • Footer content
//   • Brand color tokens (also read by tailwind.config.js + CSS modules)
// ════════════════════════════════════════════════════════════

// ── BRAND IDENTITY ─────────────────────────────────────────
export const BRAND = {
  name: 'SWRV On The Go',
  shortName: 'SWRV',
  fullAcronym: 'Serving With Righteous Vision',
  tagline: 'Let Love GPS',
  description:
    'Zion SWRV Birdsong Headquarters. The central hub for artist development, physical training, authorship, and wisdom.',
  url: 'https://swrvonthego.pro',
  founderName: 'Zion SWRV Birdsong',
  contactEmail: 'hello@swrvonthego.pro',
  bookingEmail: 'hello@swrvonthego.pro',
  logoUrl:
    'https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png',
  // Used in the Roadmap experience CTA + email tier-selection link
  ctaUrl: 'https://swrvonthego.pro/services',
} as const;

// ── BRAND COLOR TOKENS ─────────────────────────────────────
// These are the source of truth. Tailwind reads them via tailwind.config.js
// (using the named tokens like `lion-orange`). Modules can also reference
// the hex values directly through this import.
export const BRAND_TOKENS = {
  // ⚠ Tailwind v4 reads its theme from index.css's @theme block — keep
  //    these values in sync with index.css for them to actually render.
  //    To rebrand: change values here AND in index.css @theme block.
  colors: {
    'lion-orange': '#FF4D00',  // primary accent
    'lion-black':  '#000000',
    'lion-dark':   '#121212',
    'lion-gray':   '#333333',
    'lion-light':  '#FFFFFF',
    'lion-subtle': '#999999',
  },
  fonts: {
    sans: '"Inter", "system-ui", "sans-serif"',
  },
} as const;

// ── SOCIAL LINKS ───────────────────────────────────────────
// Only ones with non-empty URLs render in Footer / Zion / Hero.
export const SOCIAL = {
  instagram: 'https://instagram.com/zionswrvbirdsong',
  youtube: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  tiktok: '',
  spotify: '',
  apple: '',
  bandcamp: '',
} as const;

// ── HERO ───────────────────────────────────────────────────
export const HERO = {
  eyebrow: 'YOUR ECOSYSTEM. ON THE GO.',
  headline: 'Built for the artist who is everything at once.',
  subheadline:
    'A modular, scalable creative ecosystem for multi-faceted humans. One vision, every direction.',
  primaryCta: { label: 'Enter the Experience', target: 'roadmap' as const },
  secondaryCta: { label: 'See the work', target: '#about' },
} as const;

// ── ABOUT ──────────────────────────────────────────────────
export const ABOUT = {
  eyebrow: '// ORIGIN STORY',
  title: 'ABOUT',
  titleAccent: 'SWRV ON THE GO',
  intro: "We didn't start as an agency. We started as a calling — a genuine desire to help artists, visionaries, and everyday people show the world who they really are.",
  blocks: [
    {
      heading: 'Where We Come From',
      paragraphs: [
        'Over 20 years ago, Zion "SWRV" Birdsong started doing something most people couldn\'t put a category on — helping people build their brand before branding was cool. Musicians. Coaches. Pastors. Business owners. People with a vision and no roadmap to execute it.',
        "He showed up with a camera, a microphone, a genuine care for people's stories, and a relentless drive to make their vision real. That's not a pitch. That's just what happened — over and over — for two decades.",
      ],
    },
    {
      heading: "What We've Been Doing",
      paragraphs: [
        'Photography. Videography. Original music and jingles. Commercials. Radio shows turned podcasts. Vision and mission statements. Brand strategy. Web presence. Content creation from concept to delivery.',
        'Not as separate vendors charging you three different invoices — but as one integrated team that knows your story, your voice, and your vision. We build with you. Not just for you.',
      ],
    },
  ],
  timeline: [
    { year: '2005', label: 'Where It Started', detail: 'Zion "SWRV" Birdsong began building brands and telling stories before the industry had a name for it.' },
    { year: '2010', label: 'The Movement Grows', detail: 'Clients from music, ministry, athletics, and business. Real people. Real visions. Real results.' },
    { year: '2015', label: 'Full Service Unlocked', detail: 'Expanded into photography, videography, original music, jingles, and brand media production.' },
    { year: '2020', label: 'Built to Evolve', detail: 'When the world shut down, SWRV adapted. New platforms, new tools, same love-driven mission.' },
    { year: 'NOW',  label: 'SWRV On The Go', detail: 'A full-service brand ecosystem that swerves with you — wherever your vision is trying to go.' },
  ],
} as const;

// ── STATS ──────────────────────────────────────────────────
export const STATS = [
  { value: '25+', label: 'Years of Guidance' },
  { value: '350+', label: 'Routes Mapped' },
  { value: '1M+', label: 'Lives Impacted' },
  { value: '500', label: 'Partners' },
] as const;

// ── SERVICES (root catalog) ────────────────────────────────
// IMPORTANT: this is the SINGLE SOURCE of services for the entire site.
// Both the main Services component AND the Roadmap config import from here.
// Add/remove/edit services in this one place.
export interface Service {
  id: string;
  name: string;
  category: 'execution' | 'experience' | 'identity';
  price: string; // displayed as-is (e.g. "$500" or "From $250" or "$50/mo")
  priceNumeric: number; // for math / sorting / cart totals
  blurb: string;
  // Optional — featured tile (only one service can be featured at a time)
  featured?: boolean;
}

export const SERVICES: Service[] = [
  // ── BRAND IDENTITY ──────────────────────────────────────
  {
    id: 'brand-planning',
    name: 'Brand Planning',
    category: 'identity',
    price: 'From $250',
    priceNumeric: 250,
    blurb: 'Live, AI-powered Roadmap experience that maps your gift, work, purpose, brand identity, and the path to your happily ever after.',
    featured: true,
  },
  {
    id: 'logo-design',
    name: 'Logo & Brand Identity Design',
    category: 'identity',
    price: '$350',
    priceNumeric: 350,
    blurb: 'Custom logo system with primary, secondary, and submark variations.',
  },
  {
    id: 'vision-statement',
    name: 'Vision + Mission Statement Writing',
    category: 'identity',
    price: '$150',
    priceNumeric: 150,
    blurb: 'Crystallize what you stand for in words that move investors, customers, and audiences.',
  },
  {
    id: 'color-palette',
    name: 'Custom Brand Color Palette & Style Guide',
    category: 'identity',
    price: '$200',
    priceNumeric: 200,
    blurb: 'Color system, typography rules, and a downloadable style guide your team can build from.',
  },
  {
    id: 'brand-system',
    name: 'Full Brand System',
    category: 'identity',
    price: '$1,200',
    priceNumeric: 1200,
    blurb: 'Complete brand identity — logo system, color palette, typography, brand guidelines, and asset library.',
  },

  // ── EXECUTION ───────────────────────────────────────────
  {
    id: 'website-presence',
    name: 'Website — The Presence',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: '3-page essential site. Mobile-friendly. Brand-aligned. Live in 7 days.',
  },
  {
    id: 'website-platform',
    name: 'Website — The Platform',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    blurb: '5-page custom site with booking integration, email capture, and content sections.',
  },
  {
    id: 'website-ecosystem',
    name: 'Website — The Ecosystem',
    category: 'execution',
    price: '$1,000',
    priceNumeric: 1000,
    blurb: 'Modular site with multiple sections, integrated services, e-commerce, AI experiences, and content systems.',
  },
  {
    id: 'jingle',
    name: 'Jingle / Brand Audio Creation',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    blurb: 'Original audio identity — brand jingle, sonic logo, or audio bumper.',
  },
  {
    id: 'photography',
    name: 'Photography Package (Brand/Lifestyle)',
    category: 'execution',
    price: '$600',
    priceNumeric: 600,
    blurb: 'Half-day brand photoshoot with edited deliverables for web, social, and press.',
  },
  {
    id: 'video-promo',
    name: 'Promo Video / Music Video Production',
    category: 'execution',
    price: '$1,200',
    priceNumeric: 1200,
    blurb: 'Concept-to-delivery video production — script, shoot, edit, color.',
  },
  {
    id: 'voiceover',
    name: 'Voiceover Recording & Production',
    category: 'execution',
    price: '$300',
    priceNumeric: 300,
    blurb: 'Professional voiceover for ads, brand intros, audiobooks, or content.',
  },
  {
    id: 'on-site-video',
    name: 'On-Site Filmography & Videography',
    category: 'execution',
    price: '$900',
    priceNumeric: 900,
    blurb: 'Event capture, behind-the-scenes coverage, or on-location brand content.',
  },
  {
    id: 'llc-formation',
    name: 'LLC Formation',
    category: 'execution',
    price: '$300',
    priceNumeric: 300,
    blurb: 'Done-for-you LLC paperwork, EIN, and starter business kit so your brand has legal teeth.',
  },
  {
    id: 'content-system',
    name: 'Content Strategy & Social Media Kit',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Content calendar, brand voice doc, and social templates ready to deploy.',
  },
  {
    id: 'book-format',
    name: 'Book Formatting & Layout',
    category: 'execution',
    price: '$400',
    priceNumeric: 400,
    blurb: 'Manuscript → print-ready interior + cover layout for KDP, IngramSpark, or print.',
  },
  {
    id: 'audiobook',
    name: 'Audiobook Production',
    category: 'execution',
    price: '$650',
    priceNumeric: 650,
    blurb: 'Studio narration, mastering, and ACX/Findaway-ready deliverables.',
  },

  // ── EXPERIENCES (mentorship / coaching) ─────────────────
  {
    id: 'vocal-training',
    name: 'Vocal Training (Birdsong Method)',
    category: 'experience',
    price: '$280',
    priceNumeric: 280,
    blurb: '4-session vocal coaching package — projection, breath control, performance presence.',
  },
  {
    id: 'recording-booth',
    name: 'Recording Booth Training (Artist Package)',
    category: 'experience',
    price: '$350',
    priceNumeric: 350,
    blurb: 'Studio etiquette, mic technique, and the producer-language artists actually need.',
  },
  {
    id: 'artist-development',
    name: 'Artist Development',
    category: 'experience',
    price: 'From $400',
    priceNumeric: 400,
    blurb: 'Multi-week mentorship for artists at the inflection point — cinematic, structured, personal.',
  },
  {
    id: 'consulting-call',
    name: 'Strategy Call',
    category: 'experience',
    price: '$150',
    priceNumeric: 150,
    blurb: '60-minute one-on-one call to map a specific decision or unblock the next move.',
  },
];

// ── WEB PACKAGES (subset of services, displayed as comparison tiers) ──
export const WEB_PACKAGES = {
  tiers: [
    {
      id: 'presence',
      name: 'THE PRESENCE',
      price: 250,
      tagline: 'Get found. Look right.',
      features: [
        '3-page essential site',
        'Mobile-optimized',
        'Brand-aligned design',
        '7-day delivery',
        'Domain & hosting setup help',
      ],
    },
    {
      id: 'platform',
      name: 'THE PLATFORM',
      price: 500,
      tagline: 'Convert. Capture. Connect.',
      features: [
        '5-page custom site',
        'Booking integration',
        'Email capture + automation',
        'Content sections (blog/portfolio)',
        'SEO foundation',
        '14-day delivery',
      ],
      featured: true,
    },
    {
      id: 'ecosystem',
      name: 'THE ECOSYSTEM',
      price: 1000,
      tagline: 'The full SWRV treatment.',
      features: [
        'Modular site (unlimited sections)',
        'Integrated services menu',
        'AI experience integration',
        'E-commerce + payments',
        'Content engine',
        '21-day delivery',
      ],
    },
  ],
  addons: [
    { label: 'Extra pages (beyond 5)', price: '+$75 each' },
    { label: 'Monthly maintenance & updates', price: '$75/mo' },
    { label: 'Additional brand video', price: '$150–$300' },
    { label: 'Done-for-you domain & hosting setup', price: '$50 one-time' },
  ],
} as const;

// ── FOOTER ─────────────────────────────────────────────────
export const FOOTER = {
  ecosystemLinks: [
    'Artist Development',
    'Brand Planning & LLCs',
    'Web Design & Strategy',
    'Books & Wisdom',
    'Music & Podcast',
  ],
  resourceLinks: [
    'About',
    'Services',
    'Contact',
    'Privacy Policy',
    'Terms of Service',
  ],
  legalLinks: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms', href: '#' }],
  copyright: `© ${new Date().getFullYear()} SWRV On The Go. All rights reserved.`,
} as const;

// ── CONTACT / SCHEDULING ───────────────────────────────────
export const CONTACT = {
  // Generic topics for the "let's talk" calendar — Roadmap and BYOB scheduling
  // can override with their own topic lists.
  topics: [
    { id: 'roadmap', label: 'Roadmap / Brand Planning' },
    { id: 'website', label: 'Website Project' },
    { id: 'consult', label: 'Strategy Call' },
    { id: 'artist-dev', label: 'Artist Development' },
    { id: 'other', label: 'Something Else' },
  ],
} as const;
