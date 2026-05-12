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

  // ── BRAND IDENTITY ──────────────────────────────────────────────────────
  {
    id: 'brand-planning',
    name: 'Brand Planning',
    category: 'identity',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Live, AI-powered Roadmap experience that maps your gift, purpose, and brand identity. Includes vision + mission writing, color palette, and full brand direction — custom-built for you, not recycled.',
    featured: true,
  },
  {
    id: 'logo-design',
    name: 'Logo & Brand Identity Design',
    category: 'identity',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Custom logo system with primary, secondary, and submark variations. 2 rounds of revisions. Proprietary — not templated.',
  },
  {
    id: 'photography',
    name: 'Photography Package',
    category: 'identity',
    price: '$800',
    priceNumeric: 800,
    blurb: 'Half-day brand + lifestyle photoshoot. Full day of shooting, 3-5 hours of professional editing. Color grading included. Deliverables ready for web, press, and social.',
  },
  {
    id: 'content-system',
    name: 'Content Strategy & Social Media Kit',
    category: 'identity',
    price: '$500',
    priceNumeric: 500,
    blurb: 'Custom content calendar, brand voice guide, social media templates, hashtag strategy, engagement framework, and post scheduling system. Bespoke — built around your audience.',
  },

  // ── WEB & DIGITAL ────────────────────────────────────────────────────────
  {
    id: 'website-presence',
    name: 'Website — The Presence',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: '3-page essential site. Mobile-friendly. Brand-aligned. Domain + email setup included. Live in 7 days. SEO audit at 3-6 months included.',
  },
  {
    id: 'website-platform',
    name: 'Website — The Platform',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    blurb: '5-page custom site with booking integration, email capture, and content sections. Domain + email included. SEO audit at 3-6 months included. Live in 14 days.',
  },
  {
    id: 'website-ecosystem',
    name: 'Website — The Ecosystem',
    category: 'execution',
    price: '$1,000',
    priceNumeric: 1000,
    blurb: 'Full modular site — multiple sections, integrated services, AI experiences, e-commerce, and content systems. Domain + email included. SEO audit at 3-6 months included. Live in 21 days.',
  },
  {
    id: 'website-maintenance',
    name: 'Website Maintenance — Self-Service',
    category: 'execution',
    price: '$30/month',
    priceNumeric: 30,
    blurb: 'Security updates, broken link fixes, and content updates monthly. You run the site — we keep it clean and current.',
  },
  {
    id: 'website-management',
    name: 'Website Management — Full Service',
    category: 'execution',
    price: '$125/month',
    priceNumeric: 125,
    blurb: 'We manage everything — security, updates, content, SEO monitoring, and performance optimization. No separate audit needed. Proactive, not reactive.',
  },
  {
    id: 'fundraising-site',
    name: 'Crowdfunding / Fundraising Site',
    category: 'execution',
    price: '$1,000',
    priceNumeric: 1000,
    blurb: 'Campaign page, donation/payment flow, progress tracker, and supporter recognition — built to raise money. A GoFundMe alternative you actually own.',
  },

  // ── MUSIC & AUDIO ────────────────────────────────────────────────────────
  {
    id: 'music-production',
    name: 'Full Song Production',
    category: 'execution',
    price: '$3,000',
    priceNumeric: 3000,
    blurb: 'Complete song from concept to master — beat/instrumental creation, vocal recording, arranging, vocal production, vocal coaching, mixing, mastering, and final delivery. 5-day turnaround. Industry standard: $4,000-$8,000.',
    featured: true,
  },
  {
    id: 'mixing',
    name: 'Mixing',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    blurb: 'Professional mixing for your finished recordings. Balances every element — levels, panning, EQ, compression, effects. Broadcast-ready output.',
  },
  {
    id: 'mastering',
    name: 'Mastering',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    blurb: 'Final mastering to streaming and broadcast standards. Loudness normalization, stereo enhancement, and platform-optimized delivery.',
  },
  {
    id: 'jingle',
    name: 'Jingle / Brand Audio',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Original brand jingle, sonic logo, or audio bumper. Custom-written and produced to live in your audience\'s head.',
  },
  {
    id: 'voiceover',
    name: 'Voiceover Recording & Production',
    category: 'execution',
    price: '$125/hr',
    priceNumeric: 125,
    blurb: 'Professional voiceover for ads, brand intros, audiobooks, or content. Over 25 years in the music business — you\'re paying for the mic, the ear, and the experience.',
  },
  {
    id: 'audiobook',
    name: 'Audiobook Production',
    category: 'execution',
    price: '$125/hr',
    priceNumeric: 125,
    blurb: 'Studio narration, noise cleanup, mastering, and ACX/Findaway-ready deliverables. Broadcast-ready. Every session managed with 25 years of production experience.',
  },
  {
    id: 'live-recording',
    name: 'Live Recording Session',
    category: 'execution',
    price: '$125/hr',
    priceNumeric: 125,
    blurb: 'Capture a live performance, rehearsal, or jam session in broadcast-ready quality. Setup in 20 minutes. Includes recording and basic editing.',
  },
  {
    id: 'audio-edit-alacarte',
    name: 'Audio Editing',
    category: 'execution',
    price: '$125/hr',
    priceNumeric: 125,
    blurb: 'Scrubbing, noise cancellation, reverb, compression, effects, and mastering. You\'re not just paying for editing — you\'re paying for someone who\'s been in the music business for over 25 years, delivering broadcast-ready quality with meticulous attention to detail.',
  },
  {
    id: 'podcast-launch',
    name: 'Podcast Launch Kit',
    category: 'execution',
    price: '$250 + $125/hr',
    priceNumeric: 250,
    blurb: '$250 covers full strategy, branding, and tech setup — hosting, RSS, distribution on Spotify + Apple Podcasts. Recording sessions at $125/hr. Everything built around your voice and audience.',
  },
  {
    id: 'podcast-editing',
    name: 'Podcast Episode Production',
    category: 'execution',
    price: '$125/hr',
    priceNumeric: 125,
    blurb: 'Per-hour recording + editing, leveling, intro/outro integration, and delivery. Broadcast-ready every episode. Bulk sessions available.',
  },

  // ── VIDEOGRAPHY ──────────────────────────────────────────────────────────
  {
    id: 'music-video',
    name: 'Music Video (2:30–4 min)',
    category: 'execution',
    price: '$5,000',
    priceNumeric: 5000,
    blurb: 'Full music video production — concept, 1-day shoot, 5-day post-production, unlimited premium effects and transitions, color grading, and 2 rounds of revisions. Industry standard: $7,000-$15,000.',
    featured: true,
  },
  {
    id: 'video-promo',
    name: 'Promo Video (under 1 min)',
    category: 'execution',
    price: '$1,250',
    priceNumeric: 1250,
    blurb: 'Complete 1-minute promo — concept to delivery in 1 day. Includes shoot, edit, color grading, and 2 revision rounds. Everything included, nothing recycled.',
  },
  {
    id: 'on-site-video',
    name: 'On-Site Filmography & Event Coverage',
    category: 'execution',
    price: '$500/hr',
    priceNumeric: 500,
    blurb: 'On-location brand content, event coverage, behind-the-scenes, or multi-cam event capture. 20-minute setup. Equipment travels with us. Includes footage delivery and basic edit.',
  },
  {
    id: 'live-streaming',
    name: 'Live Streaming Setup & Production',
    category: 'execution',
    price: '$312/hr',
    priceNumeric: 312,
    blurb: 'Real-time multi-platform streaming to YouTube, Instagram, Facebook, or Twitch. Includes setup, camera switching, audio management, live chat monitoring, and audience engagement throughout the broadcast.',
  },
  {
    id: 'short-form-content',
    name: 'Reels / Short-Form Content',
    category: 'execution',
    price: '$300/batch',
    priceNumeric: 300,
    blurb: 'Batch of 5-10 short-form videos (TikTok, Instagram Reels, YouTube Shorts). Edited, captioned, and optimized for each platform.',
  },
  {
    id: 'ai-motion-30',
    name: 'AI Motion Graphics — 30 Seconds',
    category: 'execution',
    price: '$600',
    priceNumeric: 600,
    blurb: '30-second AI-generated video — intro, animated collage, or branded content. 5 premium effects, 5 premium transitions, 2 revision rounds. 3-hour production time at $200/hr.',
  },
  {
    id: 'ai-motion-60',
    name: 'AI Motion Graphics — 60 Seconds',
    category: 'execution',
    price: '$800',
    priceNumeric: 800,
    blurb: '60-second AI-generated video with 8-10 premium effects and transitions. 2 revision rounds. Built with cutting-edge AI tools and edited to broadcast standards.',
  },
  {
    id: 'ai-motion-120',
    name: 'AI Motion Graphics — Up to 2 Minutes',
    category: 'execution',
    price: '$1,200',
    priceNumeric: 1200,
    blurb: 'Up to 2-minute AI-generated video with 8-10 premium effects and transitions. 2 revision rounds. Cinematic quality at a fraction of traditional animation costs.',
  },
  {
    id: 'video-edit-alacarte',
    name: 'Video Editing',
    category: 'execution',
    price: '$250/hr',
    priceNumeric: 250,
    blurb: 'Professional video editing for existing footage — cuts, transitions, graphics, color, and delivery. Bring the footage, leave with finished cuts.',
  },

  // ── BUSINESS & CONTENT ───────────────────────────────────────────────────
  {
    id: 'pitch-deck',
    name: 'Pitch Deck + Business Plan',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Investor-ready pitch deck (up to 12 slides) plus a full business plan document. Narrative arc, design, financial overview, and ask slide — everything you need to walk into the room ready.',
  },
  {
    id: 'keynote-slides',
    name: 'Keynote / Speaking Slides',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Custom slide deck for talks, workshops, or presentations. Visual storytelling that amplifies your message — not generic templates.',
  },
  {
    id: 'book-format',
    name: 'Book Formatting + Marketing Launch',
    category: 'execution',
    price: '$750',
    priceNumeric: 750,
    blurb: 'Professional interior formatting + cover layout for KDP, IngramSpark, or print — plus a full marketing launch strategy and social media rollout plan. Built for artists who need their book to sell, not just exist.',
  },
  {
    id: 'llc-formation',
    name: 'LLC Formation + Business Banking',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Done-for-you LLC paperwork, EIN setup, business banking connection, and account guidance — everything to make your brand legally operational. All-inclusive.',
  },

  // ── COACHING & MENTORSHIP ────────────────────────────────────────────────
  {
    id: 'vocal-training',
    name: 'Vocal Training (Birdsong Method)',
    category: 'experience',
    price: '$700',
    priceNumeric: 700,
    blurb: '4-session vocal coaching — projection, breath control, performance presence, and voice preservation. The Birdsong Method: developed from 25+ years in the music business.',
  },
  {
    id: 'recording-booth',
    name: 'Recording Booth Training',
    category: 'experience',
    price: '$875',
    priceNumeric: 875,
    blurb: 'Studio etiquette, mic technique, producer language, and how to get the best out of every session. For artists who want to walk into any studio ready.',
  },
  {
    id: 'artist-development',
    name: 'Artist Development',
    category: 'experience',
    price: 'From $1,000',
    priceNumeric: 1000,
    blurb: 'Multi-week mentorship for artists at the inflection point. Sound, image, business, stage presence — built around your vision, not a formula. Proprietary. Personal. Results-driven.',
  },
  {
    id: 'consulting-call',
    name: 'Strategy Call',
    category: 'experience',
    price: '$375',
    priceNumeric: 375,
    blurb: '60-minute one-on-one call to map a specific decision, price a project, unblock the next move, or build a roadmap. 25 years of music business insight in one hour.',
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
