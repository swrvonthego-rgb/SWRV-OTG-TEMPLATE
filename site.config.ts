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
// ── PAYMENT CONFIG ─────────────────────────────────────────────────────
// Direct payment links — update handles before going live.
// BNPL merchant portals are for Swerve to apply; API keys go in Cloudflare.
export const PAYMENT_CONFIG = {
  // ── DIRECT PAYMENT (live now once handles are set) ──────────────────
  paypal:  'https://paypal.me/swrvonthego',   // swrvonthego@gmail.com
  cashapp: 'https://cash.app/$SwrvOnTheGo',
  venmo:   'https://venmo.com/u/swrvonthego',

  // ── BNPL MERCHANT SIGNUP PORTALS (for Swerve to apply) ─────────────
  // Once approved + API keys added to Cloudflare → remove 'pending: true'
  bnpl: [
    { id: 'klarna',   name: 'Klarna',   tagline: 'Pay in 4 — no interest',      color: '#FFB800', pending: true, applyUrl: 'https://www.klarna.com/us/business/merchant-sign-up/' },
    { id: 'afterpay', name: 'Afterpay', tagline: '4 payments — no interest',     color: '#B2FCE4', pending: true, applyUrl: 'https://www.afterpay.com/en-US/business' },
    { id: 'affirm',   name: 'Affirm',   tagline: '3–36 months — low rates',      color: '#4B22F4', pending: true, applyUrl: 'https://www.affirm.com/business' },
    { id: 'zip',      name: 'Zip',      tagline: '4 payments — instant approval',color: '#AA8EFF', pending: true, applyUrl: 'https://zip.co/us/merchant-solutions' },
    { id: 'sezzle',   name: 'Sezzle',   tagline: '4 payments — 0% interest',     color: '#CE3665', pending: true, applyUrl: 'https://sezzle.com/merchant-solutions' },
    { id: 'paidy',    name: 'PayPal Pay Later', tagline: 'Pay in 4 via PayPal',  color: '#003087', pending: true, applyUrl: 'https://www.paypal.com/us/business/accept-payments/checkout/pay-later' },
  ],
} as const;


// ── ROADMAP ────────────────────────────────────────────────────────────
// The Roadmap is FREE — it's the top of the funnel, not a product.
// There is one experience (no tiers) and nothing is charged for it.
export const ROADMAP_PRICING = {
  full: {
    price: 'Free',
    priceNumeric: 0,
    label: 'The Roadmap',
    tagline: 'Your complete blueprint — vision mapped to services.',
    bulletPoints: [
      'Deep evidence-based analysis of your vision',
      '7-part life blueprint (mindset, diet, fitness, community)',
      'Every service you need, mapped to what you said',
      'Yours to download, email, and bring to the booking',
    ],
  },
} as const;


// ── SERVICE ASSET REQUIREMENTS ──────────────────────────────────────────
// What each service needs from the client before work begins.
// Drives the file upload guidance in the booking flow.
export const SERVICE_ASSETS: Record<string, {
  title: string;
  required: string[];
  optional: string[];
  formats: string;
  note?: string;
}> = {
  'music-video': {
    title: "What we need for your Music Video",
    required: ['Mastered song file (WAV, MP3, or FLAC)', 'Artist reference photos'],
    optional: ['Written concept or treatment doc', 'Reference video links', 'Location ideas or mood board'],
    formats: '.wav,.mp3,.flac,.pdf,.doc,.docx,.jpg,.jpeg,.png',
    note: 'Song must be final mix and mastered before shoot day.',
  },
  'video-promo': {
    title: "What we need for your Promo Video",
    required: ['Brand guide or logo files (if applicable)', 'Key message or script (even rough)'],
    optional: ['Reference promo videos (links)', 'Brand colors / fonts', 'Existing footage to incorporate'],
    formats: '.pdf,.ai,.eps,.svg,.jpg,.png,.mp4,.mov,.doc,.docx',
  },
  'full-song': {
    title: "What we need for Full Song Production",
    required: ['Voice memo of your melody or hook', 'Lyrics doc or at minimum the concept'],
    optional: ['Reference tracks (Spotify/YouTube links)', 'Detailed notes on vibe/direction', 'Any demo recordings'],
    formats: '.mp3,.wav,.m4a,.pdf,.doc,.docx,.txt',
  },
  'mixing': {
    title: "What we need for Mixing",
    required: ['All individual stems/tracks (WAV, 24-bit if possible)', 'Reference mix if you have one'],
    optional: ['Mixing notes or direction', 'Lyrics sheet for balance reference'],
    formats: '.wav,.aif,.mp3',
    note: 'Stems must be exported from session start (bar 1). Label tracks clearly.',
  },
  'mastering': {
    title: "What we need for Mastering",
    required: ['Final mixed file (WAV or AIFF, -3dBFS headroom minimum)'],
    optional: ['Reference track for target loudness', 'ISRC codes if you have them', 'Release platform (Spotify, Apple, etc.)'],
    formats: '.wav,.aif',
    note: 'Do not submit a compressed MP3 for mastering. WAV only.',
  },
  'brand-planning': {
    title: "What we need for Brand Planning",
    required: ['Business name and any taglines you are considering', 'Brief description of your business and target audience'],
    optional: ['Existing logo or brand elements', 'Competitor examples', 'Visual inspiration (Pinterest board, screenshots, links)'],
    formats: '.pdf,.doc,.docx,.jpg,.png,.ai,.eps',
  },
  'logo-design': {
    title: "What we need for Logo Design",
    required: ['Brand planning brief or answers to our intake form', 'Color preferences or mood reference'],
    optional: ['Existing brand assets to work with or replace', 'Font preferences', 'Examples of logos you like or dislike and why'],
    formats: '.pdf,.jpg,.png,.ai,.eps,.doc,.docx',
  },
  'photography': {
    title: "What we need for your Photo Shoot",
    required: ['Shot list or usage goal (album cover, social, press, brand)'],
    optional: ['Mood board or visual reference images', 'Wardrobe plan / outfit ideas', 'Location preferences or restrictions'],
    formats: '.pdf,.jpg,.png,.doc,.docx',
  },
  'website-presence': {
    title: "What we need for your Website",
    required: ['Brand guide or logo file (PNG, SVG, or AI format)', 'Written content for each page (copy, bio, services)'],
    optional: ['Professional photography', 'Color palette / brand colors', 'Reference websites you like'],
    formats: '.pdf,.ai,.eps,.svg,.png,.jpg,.doc,.docx,.txt',
    note: 'The more content you provide, the faster and better the result.',
  },
  'website-platform': {
    title: "What we need for your Website",
    required: ['Brand guide (logo, colors, fonts)', 'Written copy for all pages', 'Professional photography or image direction'],
    optional: ['Competitor / reference sites', 'Sitemap or page structure preference', 'Existing domain/hosting credentials'],
    formats: '.pdf,.ai,.eps,.svg,.png,.jpg,.doc,.docx',
  },
  'website-ecosystem': {
    title: "What we need for your Website Ecosystem",
    required: ['Full brand guide', 'All written copy (or approve SWRV to write it)', 'Photography / visual assets', 'Domain and hosting access'],
    optional: ['CRM / booking system preferences', 'E-commerce product list if applicable', 'Any API keys (Stripe, etc.)'],
    formats: '.pdf,.ai,.eps,.svg,.png,.jpg,.doc,.docx,.zip',
    note: 'For Ecosystem builds, a kickoff call is included. Come prepared.',
  },
  'enterprise-ecosystem': {
    title: "Enterprise Intake — Custom Scope",
    required: ['Executive brief or project overview', 'Brand guide and all existing assets', 'Technical requirements doc if applicable'],
    optional: ['Existing codebase or documentation', 'Team access credentials', 'Budget and timeline constraints'],
    formats: '.pdf,.zip,.docx,.pptx',
    note: 'Enterprise scopes start with a paid discovery session.',
  },
  'podcast-launch': {
    title: "What we need for your Podcast Launch",
    required: ['Show concept doc (name, premise, target audience, format)', 'Host bio and headshot'],
    optional: ['Episode outline for pilot episode', 'Intro/outro music direction', 'Brand guide or logo for cover art'],
    formats: '.pdf,.doc,.docx,.jpg,.png,.mp3,.wav',
  },
  'pitch-deck': {
    title: "What we need for your Pitch Deck",
    required: ['Business overview doc or notes (even rough is fine)', 'Target audience for the deck (investors, partners, clients)'],
    optional: ['Financial projections or data', 'Brand guide', 'Previous deck if updating one', 'Competitor analysis'],
    formats: '.pdf,.pptx,.doc,.docx,.xls,.xlsx',
    note: 'The more context you give us, the more persuasive the deck.',
  },
  'llc-formation': {
    title: "What we need for LLC Formation",
    required: ['Government-issued ID', 'Desired business name (plus 2 alternates)', 'Business address'],
    optional: ['Operating agreement template preferences', 'Business bank preferences'],
    formats: '.jpg,.jpeg,.png,.pdf',
    note: 'SWRV handles the filing. You review and sign.',
  },
  'artist-development': {
    title: "What we need for Artist Development",
    required: ['Artist bio (short version is fine)', 'Links to existing music, video, or social media'],
    optional: ['Existing press kit or EPK', 'Goals and timeline doc', 'Current team structure'],
    formats: '.pdf,.doc,.docx,.jpg,.png,.mp3',
  },
};

// ── SERVICE PACKAGES (Fiverr-style tiers) ───────────────────────────────
export const SERVICE_PACKAGES: Record<string, Array<{
  name: string;
  price: string;
  deliveryDays: number;
  revisions: number;
  includes: string[];
  featured?: boolean;
}>> = {
  website: [
    {
      name: 'The Presence',
      price: '$750',
      deliveryDays: 7,
      revisions: 1,
      includes: ['Up to 3 pages', 'Mobile responsive', 'SEO foundations', 'Contact form', '1 round of revisions'],
    },
    {
      name: 'The Platform',
      price: '$1,500',
      deliveryDays: 14,
      revisions: 2,
      includes: ['Up to 5 pages', 'Booking or inquiry system', 'Blog or content section', 'Analytics', '2 rounds of revisions'],
      featured: true,
    },
    {
      name: 'The Ecosystem',
      price: '$3,000',
      deliveryDays: 21,
      revisions: 3,
      includes: ['Full modular site', 'Custom integrations', 'E-commerce or booking', 'Brand Transmission section', '3 rounds of revisions', 'SEO audit at 90 days'],
    },
  ],
  video: [
    {
      name: 'Promo',
      price: '$3,750',
      deliveryDays: 2,
      revisions: 2,
      includes: ['Under 60 seconds', 'Concept + shoot + edit', 'Color grading', '2 revision rounds'],
    },
    {
      name: 'Music Video',
      price: '$15,000',
      deliveryDays: 7,
      revisions: 2,
      includes: ['2:30–4 minutes', 'Full concept development', '1-day shoot', '5-day post-production', 'Unlimited premium effects', 'Color grading', '2 revision rounds'],
      featured: true,
    },
  ],
  music: [
    {
      name: 'Single',
      price: '$9,000',
      deliveryDays: 5,
      revisions: 2,
      includes: ['Full beat production', 'Studio recording', 'Vocal coaching', 'Mixing', 'Mastering', 'Ready for distribution'],
      featured: true,
    },
    {
      name: 'Mix Only',
      price: '$1,500',
      deliveryDays: 3,
      revisions: 2,
      includes: ['Stem mixing', 'Broadcast-ready output', 'Stereo + stems delivery', '2 revision rounds'],
    },
    {
      name: 'Master Only',
      price: '$1,500',
      deliveryDays: 2,
      revisions: 1,
      includes: ['Streaming-ready master', 'Broadcast loudness standards', 'WAV + MP3 delivery'],
    },
  ],
  brand: [
    {
      name: 'Logo',
      price: '$750',
      deliveryDays: 10,
      revisions: 2,
      includes: ['Primary logo mark', 'Color variants (light + dark)', 'Web + print formats', '2 revision rounds'],
    },
    {
      name: 'Brand Planning',
      price: '$750',
      deliveryDays: 1,
      revisions: 1,
      includes: ['Vision + mission statement', 'Brand color palette', 'AI Roadmap session', 'Strategic brief'],
    },
    {
      name: 'Full Identity',
      price: '$3,000',
      deliveryDays: 14,
      revisions: 3,
      includes: ['Brand planning', 'Logo design', 'Typography system', 'Color palette', 'Social templates', 'Brand guide PDF'],
      featured: true,
    },
  ],
};


// ── REFERRAL / AFFILIATE CONFIG ────────────────────────────────────────
// SWRV clients and partners get a unique referral code.
// Anyone who books via their link → they earn a finder fee.
// Payout is tracked automatically and sent manually (or via PayPal Payouts API later).
export const REFERRAL_CONFIG = {
  finderFeePercent: 15,          // 15% of the service price goes to the referrer
  cookieDays: 30,                // how many days the referral attribution lasts
  badgeText: 'Built by SWRV On The Go',
  badgeCta: 'Want a site like this?',
  baseUrl: 'https://swrvonthego.pro',
  // Add partner referral codes here as you sign them up
  // Format: { code: 'UNIQUE_CODE', name: 'Business Name', payTo: 'cash.app/$handle or email' }
  partners: [] as Array<{ code: string; name: string; payTo: string }>,
} as const;


// ── SWRV PIPELINE — Pre-rollout projects ───────────────────────────
export interface PipelineProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: 'live-preview' | 'in-development' | 'coming-soon';
  statusLabel: string;
  url?: string;
  ctaLabel: string;
  accentColor: string;
  supportCta?: string;     // optional "Support this project" link
  supportUrl?: string;
}

export const PIPELINE_PROJECTS: PipelineProject[] = [
  {
    id: 'no-bs-bible',
    name: 'The SWRV No BS Bible',
    tagline: 'The Word — without the whitewash.',
    description: `A free Bible for everyone. Original canons translated the way they were actually written — with kingdom culture, historical accuracy, and zero colonial agenda. We are not afraid of the truth. We are afraid of what happens when young people never encounter it.\n\nThis includes the Book of Enoch, the Dead Sea Scrolls, and every scripture source that is historically relevant and aligned with the Word as God intended it. We have also documented how the Bible was assembled — not to create controversy, but because the people deserve to understand what they are reading and why.\n\nBuilt with AI tools wielded by people who actually have a relationship with God. Free to access. Supported by the community.`,
    status: 'live-preview',
    statusLabel: 'Live Preview',
    url: 'https://swrv-on-bs-bible.swrvonthego.workers.dev/',
    ctaLabel: 'Access the Preview →',
    accentColor: '#c8a84b',
    supportCta: 'Support This Project',
    supportUrl: 'https://square.link/u/wXrlUcBY?src=sheet',
  },
];


// ── LAUNCH MODE ────────────────────────────────────────────────────
// Set to true to hide pricing and drive inquiries.
// Flip to false when ready to show prices again.
export const LAUNCH_MODE = {
  active: false,
  badge: 'NOW OPEN',
  headline: 'SWRV On The Go — Grand Opening',
  subline: 'We are officially open for business and now accepting new clients. Reach out to discuss your project and receive custom pricing.',
  pricingCta: 'Request Pricing',
  pricingNote: 'Pricing available on request. Book a consultation or reach out directly.',
} as const;


// ── PORTFOLIO — Showcase for employers / collaborators ─────────────
export interface PortfolioProject {
  id: string;
  name: string;
  type: string;            // "Full-Stack Web App", "Website", "SPA", "Tool"
  description: string;
  role: string;            // what Zion did
  stack: string[];         // tech / skills
  status: 'live' | 'in-development' | 'ongoing';
  statusLabel: string;
  url?: string;
  showcaseUrl?: string;    // dedicated showcase/landing page for this app
  accent: string;          // hex accent color
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'swrv-otg',
    name: 'SWRV On The Go',
    type: 'Full-Stack Creative Platform',
    description: 'The flagship. A complete creative agency platform with an AI-powered vision experience (The Roadmap), e-commerce, booking system, payment integrations, referral tracking, and dynamic service marketplace — all custom built.',
    role: 'Sole creator — design, development, and everything end to end',
    stack: ['React', 'TypeScript', 'Cloudflare Workers', 'AI Integration', 'Stripe/PayPal'],
    status: 'live',
    statusLabel: 'Live',
    url: 'https://swrvonthego.pro',
    accent: '#c8a84b',
  },
  {
    id: 'no-bs-bible',
    name: 'The SWRV No BS Bible',
    type: 'Full-Stack Web App',
    description: 'A free, historically accurate Bible web app featuring original canon translations, the Book of Enoch, and Dead Sea Scrolls — with documentation on how scripture was assembled. Built to make the Word accessible without whitewashing.',
    role: 'Sole creator — design, development, research, everything end to end',
    stack: ['React', 'Cloudflare Workers', 'AI-Assisted Translation', 'Payment Integration'],
    status: 'live',
    statusLabel: 'Live',
    url: 'https://swrv-on-bs-bible.swrvonthego.workers.dev/',
    showcaseUrl: '/apps/no-bs-bible.html',
    accent: '#c87941',
  },
  {
    id: 'birdsong-method',
    name: 'The Birdsong Method',
    type: 'AI Vocal Analysis Platform',
    description: 'An AI-powered vocal coaching platform built on 25 years of real experience. Record or upload a performance, get instant scored feedback on pitch, tone, breath control, and style — with actionable next steps, not just a number.',
    role: 'Sole creator — design, development, and everything end to end',
    stack: ['React', 'TypeScript', 'AI Integration', 'Web Audio API', 'Cloudflare Workers'],
    status: 'in-development',
    statusLabel: 'In Development',
    showcaseUrl: '/apps/birdsong-method.html',
    accent: '#9d4edd',
  },
  {
    id: 'trainbyob',
    name: 'TrainBYOB.me',
    type: 'Business Website',
    description: 'Fitness and self-defense coaching website — "Train your body, protect your peace." Built to convert visitors into booked coaching clients with a clean, motivating brand presence.',
    role: 'Sole creator — design, development, and everything end to end',
    stack: ['React', 'Cloudflare Pages', 'Responsive Design', 'Brand Identity'],
    status: 'live',
    statusLabel: 'Live',
    url: 'https://trainbyob.me',
    showcaseUrl: '/apps/trainbyob.html',
    accent: '#e07a5f',
  },
  {
    id: 'mypatrol',
    name: 'MyPatrol — Patrol Shift Log',
    type: 'Voice-First Field App',
    description: 'A voice-driven shift documentation system built for security professionals. Speak your shift — the app fills both patrol forms automatically. Deployed for Southern Protection Agency, Fairfield Plantation.',
    role: 'Sole creator — design, development, and everything end to end',
    stack: ['Vanilla JS', 'HTML/CSS', 'Voice API', 'Cloudflare Workers', 'PWA'],
    status: 'live',
    statusLabel: 'Live',
    url: 'https://spa-patrol.swrvonthego.workers.dev/app',
    showcaseUrl: 'https://spa-patrol.swrvonthego.workers.dev',
    accent: '#3d5a80',
  },
  {
    id: 'byob-timer',
    name: 'BYOB Timer',
    type: 'Web Tool / App',
    description: 'A custom interval and workout timer built for the BYOB training programs — purpose-built for coaching sessions, rounds, and structured workouts. Zero setup, offline-ready, mobile-first.',
    role: 'Sole creator — built completely end to end',
    stack: ['JavaScript', 'Web App', 'UI/UX Design'],
    status: 'live',
    statusLabel: 'Live',
    url: '/apps/byob-timer/',
    showcaseUrl: '/apps/byob-timer/',
    accent: '#81b29a',
  },
];


export const BRAND = {
  name: 'SWRV On The Go',
  shortName: 'SWRV',
  fullAcronym: 'Serving With Righteous Vision',
  tagline: 'Let Love GPS',
  description:
    'Full-service creative agency for artists, solopreneurs, and visionaries. Music production, brand strategy, video, and web — built to last.',
  url: 'https://swrvonthego.pro',
  founderName: 'Zion SWRV Birdsong',
  contactEmail: 'info@swrvonthego.pro',
  bookingEmail: 'info@swrvonthego.pro',
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
  youtube: 'https://youtube.com/@swrvbirdsong',
  facebook: '',
  twitter: 'https://twitter.com/swrvbirdsong',
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
  price: string;
  priceNumeric: number;
  blurb: string;
  deliveryDays?: number;
  revisions?: number;
  includes?: string[];
  notIncludes?: string[];
  assetsNeeded?: string[];
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
    deliveryDays: 2,
    revisions: 1,
    includes: ["60-min brand strategy session", "Mission & vision statement", "AI Roadmap session (full blueprint)", "Brand color palette", "Brand voice guide", "Delivered as PDF brand brief"],
    notIncludes: ["Logo design (separate service)", "Website design (separate service)"],
    assetsNeeded: ["Any existing brand materials (logos, colors, past designs)", "Description of your business and target audience", "3 competitor brands or brands you admire"],
  },
  {
    id: 'logo-design',
    name: 'Logo & Brand Identity Design',
    category: 'identity',
    price: '$250',
    priceNumeric: 250,
    blurb: 'Custom logo system with primary, secondary, and submark variations. 2 rounds of revisions. Proprietary — not templated.',
    deliveryDays: 10,
    revisions: 2,
    includes: ["Primary logo mark", "2 alternate versions (horizontal, icon-only)", "Full color + black/white versions", "Source files (.ai, .eps, .svg, .png)", "2 rounds of revisions"],
    notIncludes: ["Brand strategy (see Brand Planning)", "Business cards or print design"],
    assetsNeeded: ["Business name (final — not placeholder)", "Brand description and audience", "Color preferences or existing brand colors", "Examples of logos you like and why"],
  },
  {
    id: 'photography',
    name: 'Photography Package',
    category: 'identity',
    price: '$800',
    priceNumeric: 800,
    blurb: 'Half-day brand + lifestyle photoshoot. Full day of shooting, 3-5 hours of professional editing. Color grading included. Deliverables ready for web, press, and social.',
    deliveryDays: 7,
    revisions: 0,
    includes: ["Half-day shoot (3-5 hours)", "Professional editing", "Color grading", "30+ final edited images", "Delivery via online gallery"],
    notIncludes: ["Travel outside metro area (fee may apply)", "Wardrobe styling"],
    assetsNeeded: ["Shot list or creative direction (optional)", "Wardrobe options (3-4 looks recommended)", "Location preferences or approval to select"],
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
    name: 'Website — The Presence ($300 Special)',
    category: 'execution',
    featured: true,
    price: '$300',
    priceNumeric: 300,
    blurb: 'The $300 special. Pick from 10 professionally designed template styles or go custom — we swap in your brand, your words, and your photos. Mobile-friendly. Domain + email setup included. Live in 5 days.',
    deliveryDays: 5,
    revisions: 1,
    includes: ["Your choice of 10 template styles (or custom 3-page)", "Your brand colors, logo & content", "Mobile responsive design", "Contact form", "Basic SEO setup", "1 round of revisions", "Live in 5 days"],
    notIncludes: ["E-commerce", "Booking system", "Custom animations"],
    assetsNeeded: ["Logo (any format)", "Written copy for each page", "1-3 high quality photos or images", "Color preferences (if no branding exists yet)"],
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
    blurb: 'A multifaceted digital home for solopreneurs who operate as a whole company. Custom-built — you won\'t find this anywhere else because we designed this concept. Vision-first: we get what\'s in your head out and into a digital space you can grow into over time. Your Roadmap drives every design decision. Includes domain, email, SEO audit at 3-6 months. Live in 21 days.',
    deliveryDays: 21,
    revisions: 3,
    includes: ["Full modular website", "Custom brand integration", "Mobile-first responsive design", "Booking or inquiry system", "Blog or content hub", "E-commerce ready", "SEO foundations", "Brand Transmission section", "3 rounds of revisions", "SEO audit at 90 days"],
    notIncludes: ["Monthly hosting fees (billed separately)", "Content writing (can be added)", "Custom photography (can be added)"],
    assetsNeeded: ["Logo files (.svg, .png)", "Brand colors and fonts (if available)", "All written copy for each page", "Professional photos or imagery", "Any existing domain/hosting login credentials"],
  },
  {
    id: 'enterprise-ecosystem',
    name: 'Enterprise Ecosystem',
    category: 'execution',
    price: 'From $5,000',
    priceNumeric: 5000,
    blurb: 'For those building something the size of Apple, Microsoft, or a full digital record label — with multiple divisions, offices, and operations under one digital roof. Multi-brand architecture, team portals, artist rosters, revenue streams, and expansive infrastructure. Vision-first, built to scale. Starts at $5,000, custom-quoted by scope.',
    featured: true,
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
    blurb: 'Complete song from concept to master — beat/instrumental creation, vocal recording, arranging, vocal production, vocal coaching, mixing, mastering, and final delivery. 5-day turnaround. Half the industry rate — same broadcast-ready quality.',
    featured: true,
    deliveryDays: 5,
    revisions: 2,
    includes: ["Custom beat/production", "Studio recording session", "Vocal coaching & direction", "Mixing", "Mastering", "Broadcast-ready stereo file (.wav)", "2 rounds of revisions"],
    notIncludes: ["Lyric writing (can be added)", "Music video production"],
    assetsNeeded: ["Written lyrics or concept notes", "Reference tracks for sound direction", "Any existing stems or recordings if building on prior work"],
  },
  {
    id: 'mixing',
    name: 'Mixing',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    blurb: 'Professional mixing for your finished recordings. Balances every element — levels, panning, EQ, compression, effects. Broadcast-ready output.',
    deliveryDays: 3,
    revisions: 2,
    includes: ["Professional mix of 1 song", "Vocal balance, EQ, compression, effects", "Broadcast-ready stereo file (.wav)", "2 rounds of revisions"],
    notIncludes: ["Mastering (separate service — bundle for savings)", "Beat production"],
    assetsNeeded: ["All individual track files (stems) in .wav format", "Reference track for mix direction", "Tempo/key info if available"],
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
    price: '$100 + $50/hr',
    priceNumeric: 250,
    blurb: '$250 covers full strategy, branding, and tech setup — hosting, RSS, distribution on Spotify + Apple Podcasts. Recording sessions at $125/hr. Everything built around your voice and audience.',
    deliveryDays: 7,
    revisions: 1,
    includes: ["Show concept consultation", "RSS feed setup", "Cover art design", "Submission to Spotify & Apple Podcasts", "Episode template", "Launch strategy doc"],
    notIncludes: ["Ongoing episode editing (see Podcast Editing)", "Recording equipment"],
    assetsNeeded: ["Show name and description", "Target audience description", "Host name and bio", "Headshot for cover art"],
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
    blurb: 'Full music video production — concept, 1-day shoot, 5-day post-production, unlimited premium effects and transitions, color grading, and 2 rounds of revisions. A third of what studios charge for the same finish.',
    featured: true,
    deliveryDays: 7,
    revisions: 2,
    includes: ["Concept development session", "1 full day of filming", "5-day professional edit", "Unlimited premium effects & transitions", "Color grading", "2 rounds of revisions", "Delivery in 4K + compressed web version"],
    notIncludes: ["Song production (must be mixed & mastered)", "Talent casting fees", "Location permits"],
    assetsNeeded: ["Finished, mastered audio file (.wav or .mp3)", "Creative concept or mood board (optional but helpful)", "Any specific wardrobe, props, or visual references"],
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
    price: '$300/hr',
    priceNumeric: 300,
    blurb: 'Real-time multi-platform streaming to YouTube, Instagram, Facebook, or Twitch. Includes setup, camera switching, audio management, live chat monitoring, and audience engagement throughout the broadcast.',
  },
  {
    id: 'short-form-content',
    name: 'Reels / Short-Form Content',
    category: 'execution',
    price: '$100/batch',
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


// ── NEED A WEBSITE? — template storefront section ───────────
// videoUrl: set to your promo video URL (Cloudinary / R2 / CDN) to show
// the video banner. Leave '' to show the styled CTA banner instead.
export const NEED_A_WEBSITE = {
  videoUrl: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/v15044gf0000d8gahu7og65l6v48v87g.mp4',
  eyebrow: 'NEED A WEBSITE?',
  headline: 'Pick a style. We make it yours.',
  subline:
    "Ten professionally built templates — every style of business covered. We swap in your brand, your words, your photos, and hand you a live website in days. One price, no surprises: $300 flat.",
  price: '$300',
} as const;

export interface WebsiteTemplate {
  id: string;
  name: string;
  style: string;        // one-line style descriptor
  bestFor: string;      // who it's for
  // Mini-mockup design tokens (CSS-generated preview card)
  bg: string;           // preview background
  ink: string;          // preview text color
  accent: string;       // preview accent color
  font: 'serif' | 'sans' | 'mono';
  layout: 'hero' | 'grid' | 'split' | 'centered' | 'list';
  // Real live-preview link — a portfolio site or /templates example
  // that matches this style, so buyers can see a finished version
  // instead of only the CSS thumbnail.
  previewUrl: string;
  previewLabel: string; // short caption for the "See Live Preview" link
}

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  { id: 'tpl-clean-slate', name: 'The Clean Slate', style: 'Minimal, editorial, lots of air', bestFor: 'Consultants, writers, professionals', bg: '#faf9f6', ink: '#1a1a1a', accent: '#1a1a1a', font: 'serif', layout: 'centered',
    previewUrl: '/templates/presence-example.html', previewLabel: 'Marcus Hill, LLC — Tax & Financial Services' },
  { id: 'tpl-bold-drop',   name: 'The Bold Drop', style: 'Dark, loud, streetwear energy', bestFor: 'Brands, apparel, culture drops', bg: '#0d0d0d', ink: '#ffffff', accent: '#ff4d00', font: 'sans', layout: 'hero',
    previewUrl: 'https://swrvonthego.pro', previewLabel: 'SWRV On The Go — Full brand experience' },
  { id: 'tpl-gallery',     name: 'The Gallery', style: 'Image-first grid, zero clutter', bestFor: 'Photographers, artists, models', bg: '#111111', ink: '#eeeeee', accent: '#c8a84b', font: 'sans', layout: 'grid',
    previewUrl: '/templates/ecosystem-example.html', previewLabel: 'VANTA Creative — Roster + portfolio grid' },
  { id: 'tpl-storefront',  name: 'The Storefront', style: 'Product cards, clean checkout flow', bestFor: 'Shops, merch, small product lines', bg: '#ffffff', ink: '#222222', accent: '#2f7d5c', font: 'sans', layout: 'grid',
    previewUrl: '/templates/platform-example.html', previewLabel: 'Kofi Ware Music — Beats & booking commerce' },
  { id: 'tpl-booking-pro', name: 'The Booking Pro', style: 'Services up top, calendar built in', bestFor: 'Barbers, coaches, trainers, studios', bg: '#f4f2ee', ink: '#20242c', accent: '#3d5a80', font: 'sans', layout: 'split',
    previewUrl: 'https://trainbyob.me', previewLabel: 'TrainBYOB — Coaching site with booking' },
  { id: 'tpl-stage',       name: 'The Stage', style: 'Full-bleed hero, music player ready', bestFor: 'Artists, bands, performers', bg: '#08060c', ink: '#f5f0ff', accent: '#9d4edd', font: 'sans', layout: 'hero',
    previewUrl: '/apps/birdsong-method.html', previewLabel: 'The Birdsong Method — Artist platform' },
  { id: 'tpl-table',       name: 'The Table', style: 'Warm tones, menu-forward', bestFor: 'Restaurants, food trucks, caterers', bg: '#fdf6ec', ink: '#3a2a1a', accent: '#c87941', font: 'serif', layout: 'list',
    previewUrl: '/templates/presence-example.html', previewLabel: 'Marcus Hill, LLC — Warm, list-driven layout' },
  { id: 'tpl-pulpit',      name: 'The Pulpit', style: 'Welcoming, community-centered', bestFor: 'Churches, ministries, nonprofits', bg: '#fffdf7', ink: '#2c2418', accent: '#8b6f3e', font: 'serif', layout: 'centered',
    previewUrl: 'https://swrv-on-bs-bible.swrvonthego.workers.dev/', previewLabel: 'The SWRV No BS Bible — Community-centered' },
  { id: 'tpl-launchpad',   name: 'The Launchpad', style: 'One page, countdown, email capture', bestFor: 'Launches, events, pre-orders', bg: '#0a1128', ink: '#e8ecf4', accent: '#00d1b2', font: 'mono', layout: 'centered',
    previewUrl: '/apps/byob-timer.html', previewLabel: 'BYOB Timer — Focused single-purpose page' },
  { id: 'tpl-boss-card',   name: 'The Boss Card', style: 'One-page personal brand hub', bestFor: 'Creators, speakers, link-in-bio upgrade', bg: '#16121c', ink: '#f2eef8', accent: '#e8c96a', font: 'sans', layout: 'list',
    previewUrl: 'https://spa-patrol.swrvonthego.workers.dev', previewLabel: 'MyPatrol — Personal branded hub' },
];


// ── SERVICE SUB-CATEGORIES — premium organized taxonomy ─────
// Groups the à la carte SERVICES catalog into shopper-friendly buckets
// (video, audio, web, etc.) for display in the Marketplace and Services Menu.
export interface SubCategory {
  id: string;
  label: string;
  tagline: string;
  emoji: string;
  serviceIds: string[];
}

export const SERVICE_SUBCATEGORIES: SubCategory[] = [
  {
    id: 'videography',
    label: 'Videography',
    tagline: 'Moving picture, fully produced.',
    emoji: '🎬',
    serviceIds: [
      'music-video',
      'video-promo',
      'on-site-video',
      'live-streaming',
      'short-form-content',
      'ai-motion-30',
      'ai-motion-60',
      'ai-motion-120',
      'video-edit-alacarte',
    ],
  },
  {
    id: 'audio-production',
    label: 'Audio Production',
    tagline: 'Music, voice, and everything between.',
    emoji: '🎵',
    serviceIds: [
      'music-production',
      'mixing',
      'mastering',
      'live-recording',
      'jingle',
      'voiceover',
      'audiobook',
      'podcast-launch',
      'podcast-editing',
      'audio-edit-alacarte',
    ],
  },
  {
    id: 'web-digital',
    label: 'Web & Digital',
    tagline: 'Vision-first. Custom-built. Yours alone.',
    emoji: '🌐',
    serviceIds: [
      'website-presence',
      'website-platform',
      'website-ecosystem',
      'enterprise-ecosystem',
      'website-management',
      'website-maintenance',
      'fundraising-site',
    ],
  },
  {
    id: 'brand-identity',
    label: 'Brand Identity',
    tagline: 'Define who you are before you put it anywhere.',
    emoji: '✨',
    serviceIds: [
      'brand-planning',
      'logo-design',
      'photography',
      'content-system',
    ],
  },
  {
    id: 'coaching',
    label: 'Coaching & Mentorship',
    tagline: 'One-on-one development to level up.',
    emoji: '🎯',
    serviceIds: [
      'vocal-training',
      'recording-booth',
      'artist-development',
      'consulting-call',
    ],
  },
  {
    id: 'content-business',
    label: 'Content & Business',
    tagline: 'Books, decks, LLCs — everything to operate.',
    emoji: '📚',
    serviceIds: [
      'book-format',
      'pitch-deck',
      'keynote-slides',
      'llc-formation',
    ],
  },
];


// ── WEB PACKAGES (subset of services, displayed as comparison tiers) ──
export const WEB_PACKAGES = {
  tiers: [
    {
      id: 'presence',
      name: 'THE PRESENCE',
      price: 300,
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
    { label: 'Extra pages (beyond 5)', price: '+$100 each' },
    { label: 'Monthly management (full service)', price: '$125/mo' },
    { label: 'Additional promo video', price: '$1,250' },
    { label: '3-6 month SEO audit', price: 'Included' },
  ],
} as const;

// ── FOOTER ─────────────────────────────────────────────────
export const FOOTER = {
  ecosystemLinks: [
    { label: 'Artist Development',    href: '#services' },
    { label: 'Brand Planning & LLCs', href: '#services' },
    { label: 'Web Design & Strategy', href: '#web-packages' },
    { label: 'Books & Wisdom',        href: '#contact',   event: 'swrv:zion-section', detail: 'books' },
    { label: 'Music & Podcast',       href: '#contact',   event: 'swrv:zion-section', detail: 'podcast' },
  ],
  resourceLinks: [
    { label: 'About',        href: '#about-swrv' },
    { label: 'Services',     href: '#services',  event: 'swrv:open-services' },
    { label: 'Contact',      href: '#contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  legalLinks: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }],
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
    { image: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/cld-sample_p72mk2.jpg', title: 'PET LOVERS', subtitle: 'COMMUNITY' },
    { image: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/shoe_e9qvna.jpg', title: 'TRAVELERS', subtitle: 'EXPLORATION' },
    { image: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/man-portrait_xykmg4.jpg', title: 'FASHION DESIGNERS', subtitle: 'STYLE' },
  ],
  column2: [
    { image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop', title: 'MUSICAL ARTISTS', subtitle: 'PRODUCTION' },
    { image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop', title: 'FAN ENGAGEMENT', subtitle: 'COMMUNITY' },
    { image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop', title: 'GRAPHIC DESIGNERS', subtitle: 'CREATIVE' },
    { image: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/1752950982581945_2_kk3jt3_ui7upw.png', title: 'CONTENT CREATORS', subtitle: 'DIGITAL MEDIA' },
    { image: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/woman-on-a-football-field_agfcng.jpg', title: 'SUPER-DOPE PEOPLE', subtitle: 'LIFESTYLE' },
  ],
};

// ── INTRO VIDEOS ───────────────────────────────────────────
export const INTRO_VIDEOS = {
  // Full-screen takeover that plays before the page is interactive
  primary:
    'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/SWRV_WEB_4k_gifq4n_u5zwta.mp4',
  // Secondary intro that plays after the primary shrinks
  secondary:
    'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/copy_506106AC-E7D2-4CDF-A553-6E2DC5A6894F_ckn5nm_cynppw.mov',
} as const;

// ── SCHEDULING (Calendar / Contact form) ───────────────────
export const SCHEDULING: {
  contactEmail: string;
  availableDays: number[];
  timeSlots: string[];
  topics: string[];
} = {
  contactEmail: 'info@swrvonthego.pro',
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
  liveExample?: {         // optional live demo preview
    url: string;          // can be external link or '/templates/xxx.html'
    label: string;        // 'See Live Example →'
    description: string;  // 'A live LLC presence page'
  };
}

export const WEB_PACKAGE_TIERS: WebPackageTier[] = [
  {
    id: 'presence',
    name: 'THE PRESENCE',
    price: 300,
    iconName: 'Globe',
    tagline: 'The $300 website special. Live in 5 days.',
    badge: 'THE $300 SPECIAL',
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
    liveExample: {
      url: '/templates/presence-example.html',
      label: 'See a Live Presence Example →',
      description: 'A real LLC presence page — clean, professional, ready for funding apps or portfolio links.',
    },
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
    note: 'The brand video alone runs $500+ on the open market. Bundled here at half that.',
    color: 'border-lion-orange',
    accentColor: 'text-lion-orange',
    badgeBg: 'bg-lion-orange',
    cta: 'Get The Platform',
    liveExample: {
      url: '/templates/platform-example.html',
      label: 'See a Live Platform Example →',
      description: 'Kofi Ware Music — beats for sale, session booking, sync licensing. A creator who sells.',
    },
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
      { label: 'Extra pages (beyond 5)', price: '+$50 each' },
      { label: 'Monthly management (full service)', price: '$125/mo' },
      { label: 'Additional brand video', price: '+$100' },
      { label: '3-6 month SEO audit', price: 'Included' },
    ],
    note: 'Multi-page sites run $3,000–$15,000+ everywhere else. This is intentional.',
    color: 'border-white/20',
    accentColor: 'text-white',
    badgeBg: '',
    cta: 'Get The Ecosystem',
    liveExample: {
      url: '/templates/ecosystem-example.html',
      label: 'See a Live Ecosystem Example →',
      description: 'VANTA Creative — artist development agency. Multi-section, roster, full services, application booking.',
    },

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
    { label: 'PORTFOLIO', href: '#portfolio', external: false },
    { label: 'THE SWRV ECOSYSTEM', href: '#ecosystem', external: false },
    { label: 'ABOUT SWRV ON THE GO', href: '#about-swrv', external: false },
    { label: 'ZION BIRDSONG', href: '#meet-zion', external: false },
    { label: 'THE BIRDSONG METHOD', href: '#birdsong-method', external: false },
    { label: 'TRAIN BYOB', href: '#byob', external: false },
    { label: 'TAKE THE ROADMAP', href: '/roadmap', external: false },
    { label: 'REVVING UP', href: '#revving-up', external: false },
    { label: 'CONTACT', href: '#contact', external: false },
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
    description: 'Blueprint Your Vision — an interactive AI-powered experience that maps your gift, your work, your purpose, and your brand identity. Your Roadmap drives every service recommendation.',
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

