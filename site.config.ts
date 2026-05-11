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

  // ── À LA CARTE (audio + video editing without full production overhead) ──
  {
    id: 'audio-edit-alacarte',
    name: 'Audio Editing — À La Carte',
    category: 'execution',
    price: 'From $75/hr',
    priceNumeric: 75,
    blurb: 'You bring the raw audio, I clean it up — denoise, mix, master, level. Per-track or hourly.',
  },
  {
    id: 'video-edit-alacarte',
    name: 'Video Editing — À La Carte',
    category: 'execution',
    price: 'From $100/hr',
    priceNumeric: 100,
    blurb: 'Reels, shorts, promos, sermon clips — bring the footage, leave with finished cuts. Hourly or per-deliverable.',
  },

  // ── PODCASTING ──
  {
    id: 'podcast-launch',
    name: 'Podcast Launch Kit',
    category: 'execution',
    price: '$650',
    priceNumeric: 650,
    blurb: 'Cover art, intro/outro music, hosting setup, RSS distribution, and a 5-episode editing block to get you live on Spotify + Apple Podcasts.',
  },
  {
    id: 'podcast-editing',
    name: 'Podcast Episode Production',
    category: 'execution',
    price: '$95/episode',
    priceNumeric: 95,
    blurb: 'Per-episode editing, leveling, intro/outro, show notes, and chapter markers. Bulk discounts available.',
  },

  // ── PRESENTATIONS ──
  {
    id: 'pitch-deck',
    name: 'Pitch Deck / Investor Slides',
    category: 'execution',
    price: '$450',
    priceNumeric: 450,
    blurb: 'Brand-aligned investor or grant pitch deck — narrative arc, design, charts, ask slide. Up to 12 slides.',
  },
  {
    id: 'keynote-slides',
    name: 'Keynote / Speaking Slides',
    category: 'execution',
    price: '$300',
    priceNumeric: 300,
    blurb: 'Custom slide deck for talks, workshops, or sermons. Visual storytelling that doesn\'t fight your message.',
  },

  // ── BUSINESS FOUNDATION ──
  {
    id: 'bank-setup',
    name: 'Business Banking Setup',
    category: 'execution',
    price: '$150',
    priceNumeric: 150,
    blurb: 'After your LLC + EIN are live, I help you open a business bank account, set up payment processing, and connect Stripe/Square so money can move.',
  },
  {
    id: 'llc-bank-bundle',
    name: 'LLC + Banking + Site Bundle',
    category: 'execution',
    price: '$650',
    priceNumeric: 650,
    blurb: 'LLC paperwork + EIN + business banking + 3-page launch site. Done in 2 weeks. From idea to legal-and-online.',
    featured: true,
  },
  {
    id: 'fundraising-site',
    name: 'Crowdfunding / Fundraising Site',
    category: 'execution',
    price: '$400',
    priceNumeric: 400,
    blurb: 'Built specifically to raise money — campaign page, donation/payment flow, progress meter, supporter shoutouts. GoFundMe alternative you actually own.',
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


// ── HERO CAROUSEL ──────────────────────────────────────────
// The two scrolling columns of cards in the Hero. Each card has an
// image OR video, a title, and an optional subtitle (small label).
// Add/remove cards freely — the component scales.
export interface HeroCard {
  image?: string;
  video?: string;
  title: string;
  subtitle?: string;
}
export const HERO_CAROUSEL: {
  backgroundVideo: string;
  title: { line1: string; line2: string };
  taglineHeading: string;
  taglineAccent: string;
  taglineBody: string;
  column1: HeroCard[];
  column2: HeroCard[];
} = {
  backgroundVideo:
    'https://videos.pexels.com/video-files/3121459/3121459-hd_1920_1080_24fps.mp4',
  title: { line1: 'SWRV', line2: 'HEADQUARTERS.' },
  taglineHeading: 'Swrv On Roadblocks.',
  taglineAccent: 'Let Love GPS.',
  taglineBody:
    'The central hub for artist development, physical training, authorship, and wisdom. Welcome to the ecosystem.',
  column1: [
    { image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop', title: 'FIGHTING ARTS', subtitle: 'MARTIAL ARTS' },
    { image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop', title: 'CULINARY ARTS', subtitle: '' },
    { image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop', title: 'REALTORS', subtitle: 'INTERIOR DESIGN' },
    { image: 'https://res.cloudinary.com/dastq6bk5/image/upload/v1776950508/cld-sample_p72mk2.jpg', title: 'PET LOVERS', subtitle: 'COMMUNITY' },
    { image: 'https://res.cloudinary.com/dastq6bk5/image/upload/v1776950507/shoe_e9qvna.jpg', title: 'TRAVELERS', subtitle: 'EXPLORATION' },
    { image: 'https://res.cloudinary.com/dastq6bk5/image/upload/v1776950507/man-portrait_xykmg4.jpg', title: 'FASHION DESIGNERS', subtitle: 'STYLE' },
  ],
  column2: [
    { image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop', title: 'MUSICAL ARTISTS', subtitle: 'PRODUCTION' },
    { image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop', title: 'FAN ENGAGEMENT', subtitle: 'COMMUNITY' },
    { image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop', title: 'GRAPHIC DESIGNERS', subtitle: 'CREATIVE' },
    { image: 'https://res.cloudinary.com/dastq6bk5/image/upload/w_800,h_800,c_fill,q_auto/1752950982581945_2_kk3jt3_ui7upw.png', title: 'CONTENT CREATORS', subtitle: 'DIGITAL MEDIA' },
    { image: 'https://res.cloudinary.com/dastq6bk5/image/upload/v1776950507/woman-on-a-football-field_agfcng.jpg', title: 'SUPER-DOPE PEOPLE', subtitle: 'LIFESTYLE' },
  ],
};

// ── INTRO VIDEOS ───────────────────────────────────────────
export const INTRO_VIDEOS = {
  // Full-screen takeover that plays before the page is interactive
  primary:
    'https://res.cloudinary.com/dastq6bk5/video/upload/v1775906948/SWRV_WEB_4k_gifq4n_u5zwta.mp4',
  // Secondary intro that plays after the primary shrinks
  secondary:
    'https://res.cloudinary.com/dastq6bk5/video/upload/v1775906956/copy_506106AC-E7D2-4CDF-A553-6E2DC5A6894F_ckn5nm_cynppw.mov',
} as const;

// ── SCHEDULING (Calendar / Contact form) ───────────────────
export const SCHEDULING: {
  contactEmail: string;
  availableDays: number[];
  timeSlots: string[];
  topics: string[];
} = {
  contactEmail: 'swrvonthego@gmail.com',
  // Days you're available (0=Sun, 1=Mon, ... 6=Sat). Default Mon–Sat.
  availableDays: [1, 2, 3, 4, 5, 6],
  timeSlots: [
    '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  ],
  topics: [
    'Website Package Inquiry',
    'Monthly Care Plan',
    'Brand Video / Commercial',
    'Photography / Videography',
    'Music / Jingle Production',
    'Full Brand Strategy',
    'Something Else',
  ],
};

// ── WEB PACKAGE NOTES (universal disclaimers shown under tiers) ──
export const WEB_PACKAGE_NOTES = [
  'Domain & hosting not included — we walk you through setup (~$15/yr domain, ~$10–20/mo hosting)',
  'You own your site 100% after delivery — no lock-in, no hidden fees',
  '50% deposit required to begin · 50% due on final delivery',
  'You provide: photos, logo, and key copy (we can help shape it) — or ask about copy writing as an add-on',
] as const;


// ── WEB PACKAGE TIERS (rich tier data) ──────────────────────
// The 3-tier comparison shown on the Web Packages section.
// Icons are referenced by name (component maps name → lucide icon).
// Available icon names: 'Globe', 'Zap', 'Rocket', 'Star', 'Compass', 'Sparkles'
export interface WebPackageTier {
  id: string;
  name: string;
  price: number;
  iconName: 'Globe' | 'Zap' | 'Rocket' | 'Star' | 'Compass' | 'Sparkles';
  tagline: string;
  badge: string | null;
  bestFor: string;
  deliveryDays: string;
  revisions: string;
  includes: string[];
  addOns: { label: string; price: string }[] | null;
  note: string;
  color: string;          // tailwind border class
  accentColor: string;    // tailwind text class
  badgeBg: string;        // tailwind bg class
  cta: string;
}

export const WEB_PACKAGE_TIERS: WebPackageTier[] = [
  {
    id: 'presence',
    name: 'THE PRESENCE',
    price: 250,
    iconName: 'Globe',
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
    iconName: 'Zap',
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
    iconName: 'Rocket',
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


// ── HEADER (top utility bar + main navigation) ──────────────
// The top utility bar (small links above main nav) and the main
// nav. Train BYOB stays inlined in the component since it's a
// permanent fixture pointing to the founder's other site.
export const HEADER = {
  // Small links shown in the utility bar (right side, hides on scroll)
  utilityLinks: [
    { label: 'Books', href: '#books', external: false },
    { label: 'Podcast', href: '#podcast', external: false },
  ],
  // Main navigation items
  navItems: [
    { label: 'THE ECOSYSTEM', href: '#ecosystem', external: false },
    { label: 'BYOB TRAINING', href: '#byob', external: false },  // opens in-site BYOB overlay
    { label: 'ABOUT SWRV', href: '#about-swrv', external: false },
    { label: 'ZION SWRV BIRDSONG', href: '#meet-zion', external: false },
  ],
  // Inline "Connect" button copy
  connectLabel: 'Connect',
  // Right-side primary CTAs
  bookNowLabel: 'BOOK NOW',
  getInTouchLabel: 'GET IN TOUCH',
} as const;

// ── SERVICE CATEGORIES (top-level Services tiles) ───────────
// These are the BIG category tiles shown in the main Services component.
// They differ from the priced SERVICES catalog (à la carte items used by
// the Roadmap recommendations) — these are the high-level "what we do".
// Icons reference lucide-react component names; the Services component maps
// the name to the actual icon.
export interface ServiceCategory {
  title: string;
  description: string;
  icon: 'Compass' | 'Globe' | 'CheckCircle' | 'FileText' | 'Database' | 'Briefcase' | 'Music';
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: 'Brand Planning',
    description: 'Blueprint Your Vision — an interactive 5-minute experience to map your gift, your work, your purpose, and your brand identity. AI guides you through your Day in the Happily Ever After and reveals your Roadmap.',
    icon: 'Compass',
  },
  {
    title: 'Artist Development',
    description: 'The one-stop shop for your bigger vision. We handle the logistics so you can create the art.',
    icon: 'Globe',
  },
  {
    title: 'BYOB Training',
    description: 'Fitness & Self-Defense Coaching. Train your body, protect your peace. Visit trainbyob.me.',
    icon: 'CheckCircle',
  },
  {
    title: 'Authorship',
    description: "Books to guide your journey: 'SWRV In Your Gift' and 'The RoadMap (Blueprint Your Vision)'.",
    icon: 'FileText',
  },
  {
    title: 'SWRV Talk Podcast',
    description: 'Wisdom, motivation, and behind-the-scenes stories from the journey. Tune in to the conversation.',
    icon: 'Database',
  },
];
