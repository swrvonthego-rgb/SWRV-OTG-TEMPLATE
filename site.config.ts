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
// Every payment routes through Stripe. Card, Klarna, Afterpay and Affirm
// are all enabled on the Stripe Payment Links themselves, so there are no
// per-platform handles or separate BNPL merchant applications to track —
// turning a method on in the Stripe dashboard turns it on for the site.
//
// Paste the Payment Link URLs from Stripe → Payment Links. Until a link is
// set, the booking flow tells the client a secure link is coming by email
// rather than showing a dead button.
export const PAYMENT_CONFIG = {
  stripe: {
    // Fixed $100 — secures a booking (Zion's calendar, or a general service
    // request). The remaining balance is negotiated/invoiced separately;
    // this link only ever collects the deposit.
    //
    // ⚠ depositAmount must match the amount the Payment Link actually charges.
    // A Stripe Payment Link's price cannot be edited after creation — changing
    // the deposit means creating a NEW link in Stripe and pasting it here.
    depositAmount: 100,
    depositUrl: 'https://buy.stripe.com/14A4gydAO0HKdd20mPaEE01',
    // Built with "let customers choose what they pay": for a future full
    // pay-in-full flow. Not currently linked from anywhere.
    serviceUrl: '',
  },
} as const;


// ── ROADMAP ────────────────────────────────────────────────────────────
// The Roadmap is FREE — it's the top of the funnel, not a product.
// There is one experience (no tiers) and nothing is charged for it.
export const ROADMAP_PRICING = {
  full: {
    price: 'Free',
    priceNumeric: 0,
    label: 'The Roadmap',
    tagline: 'Your vision, mapped to the services that build it.',
    bulletPoints: [
      'Deep evidence-based analysis of your vision',
      '7-part life blueprint (mindset, diet, fitness, community)',
      'Every service you need, mapped to what you said',
      'Yours to download, email, and bring to your consultation',
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
    title: "What we need for your Complete Branding Package",
    required: ['Business name (final — not a placeholder)', 'Brief description of your business and target audience', 'What you want your business to be known for'],
    optional: ['Existing logo or brand elements', 'Competitor examples', 'Color preferences', 'Visual inspiration (Pinterest board, screenshots, links)'],
    formats: '.pdf,.doc,.docx,.jpg,.png,.ai,.eps',
    note: 'You don\'t need a logo, vision, or mission going in — building those is the whole point of this package.',
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
    required: ['Logo file (PNG, SVG, or AI format)', 'Vision statement', 'Mission statement', 'Images (photos of you, your work, or your space)', 'Written content for each page (copy, bio, services)'],
    optional: ['Video content', 'Professional photography', 'Color palette / brand colors', 'Reference websites you like'],
    formats: '.pdf,.ai,.eps,.svg,.png,.jpg,.doc,.docx,.txt,.mp4,.mov',
    note: 'Don\'t have a logo, vision, or mission yet? Tell us in your notes and we\'ll help you pull it together. The more content you provide, the faster and better the result.',
  },
  'website-platform': {
    title: "What we need for your Website",
    required: ['Logo file + brand colors', 'Vision statement', 'Mission statement', 'Images / photography', 'Written copy for all pages'],
    optional: ['Video content', 'Competitor / reference sites', 'Sitemap or page structure preference', 'Existing domain/hosting credentials'],
    formats: '.pdf,.ai,.eps,.svg,.png,.jpg,.doc,.docx,.mp4,.mov',
    note: 'Don\'t have a logo, vision, or mission yet? Tell us in your notes and we\'ll help you pull it together.',
  },
  'website-ecosystem': {
    title: "What we need for your Website Ecosystem",
    required: ['Full brand guide (logo, colors, fonts)', 'Vision statement', 'Mission statement', 'Photography / visual assets', 'Video content', 'All written copy (or approve SWRV to write it)', 'Domain and hosting access'],
    optional: ['CRM / booking system preferences', 'E-commerce product list if applicable', 'Any API keys (Stripe, etc.)'],
    formats: '.pdf,.ai,.eps,.svg,.png,.jpg,.doc,.docx,.zip,.mp4,.mov',
    note: 'Don\'t have a logo, vision, or mission yet? Tell us in your notes and we\'ll help you pull it together. For Ecosystem builds, a kickoff call is included. Come prepared.',
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

// ── SERVICE PACKAGES ───────────────────────────────────────────────────
// Removed — pricing is defined in WEB_PACKAGE_TIERS for websites and SERVICES for everything else.


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

// ── SOCIAL ACCOUNT ACCESS ──────────────────────────────────
// How clients give SWRV posting access for event coverage and social
// management WITHOUT sharing a password (see the Event intake in
// intake.config.ts). Clients add SWRV in Meta Business Suite:
//   - metaBusinessId set  -> they add SWRV as a *partner* by this ID
//     (Business Suite -> Settings -> Business info shows yours). Cleanest:
//     access is tied to the SWRV business, not a person.
//   - metaBusinessId empty -> they add accessEmail as a *person* instead.
export const SOCIAL_ACCESS = {
  metaBusinessId: '',
  accessEmail: 'info@swrvonthego.pro',
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
// ── BOOK & PAY ADD-ONS ─────────────────────────────────────
// 'flat' adds a fixed amount; 'percent' adds a share of the package's own
// base price (not of other add-ons), so a rush on The Feature is +$375.
export interface AddOn {
  id: string;
  label: string;
  description: string;
  kind: 'flat' | 'percent';
  amount: number; // dollars for 'flat', percent for 'percent'
}

export const ADD_ONS: Record<string, AddOn> = {
  songwriting: {
    id: 'songwriting', label: 'Songwriting', kind: 'flat', amount: 200,
    description: 'Zion writes the lyrics and melody for his part. He keeps his writer share, registered with BMI.',
  },
  'rush-48': {
    id: 'rush-48', label: '48-hour rush', kind: 'percent', amount: 50,
    description: 'Delivered within 48 hours instead of the usual turnaround.',
  },
  // Extra platforms for Social Brand Management (monthly, on top of
  // Instagram). Billed every month with the plan.
  'platform-facebook': { id: 'platform-facebook', label: 'Facebook', kind: 'flat', amount: 150, description: 'Your Facebook Page managed alongside Instagram, with posts adapted for Facebook.' },
  'platform-threads': { id: 'platform-threads', label: 'Threads', kind: 'flat', amount: 100, description: 'Regular Threads posts and replies in your brand voice.' },
  'platform-linkedin': { id: 'platform-linkedin', label: 'LinkedIn', kind: 'flat', amount: 200, description: 'LinkedIn posts written for a professional audience, for you or your company page.' },
  'platform-tiktok': { id: 'platform-tiktok', label: 'TikTok', kind: 'flat', amount: 250, description: 'TikTok-native short videos, trends and captions, edited for the platform.' },
  'platform-youtube': { id: 'platform-youtube', label: 'YouTube', kind: 'flat', amount: 300, description: 'YouTube Shorts plus channel upkeep: titles, descriptions, thumbnails and playlists.' },
  'on-location-atl': {
    id: 'on-location-atl', label: 'On-location session (Atlanta)', kind: 'flat', amount: 50,
    description: 'Zion comes to you anywhere in Atlanta for the directed session. Remote sessions and in-studio sessions in Atlanta have no travel fee.',
  },
};

export function addOnPrice(base: number, addOn: AddOn): number {
  return addOn.kind === 'flat' ? addOn.amount : Math.round(base * addOn.amount) / 100;
}

// The one price calculation used by both the Book & Pay modal and the
// Worker, so what the client sees is exactly what Stripe charges. When a
// service has options (e.g. one song vs. two songs), the chosen option's
// price is the base; an unknown option id gets no option (the Worker
// rejects that before charging).
export function checkoutTotal(
  service: { priceNumeric: number; addOns?: string[]; options?: ServiceOption[] },
  addOnIds: string[] = [],
  optionId?: string,
) {
  const option = service.options?.length ? service.options.find((o) => o.id === optionId) : undefined;
  const base = option ? option.price : service.priceNumeric;
  const chosen = [...new Set(addOnIds)]
    .filter((id) => service.addOns?.includes(id) && ADD_ONS[id])
    .map((id) => ADD_ONS[id]);
  const lines = chosen.map((a) => ({ id: a.id, label: a.label, amount: addOnPrice(base, a) }));
  const total = base + lines.reduce((t, l) => t + l.amount, 0);
  return { base, option, lines, total };
}

// A priced choice the client picks at checkout (one per booking).
export interface ServiceOption {
  id: string;
  label: string;
  description: string;
  price: number;
}

export type IntakePath = 'website' | 'video' | 'music' | 'brand' | 'business' | 'podcast' | 'event' | 'song' | 'vocals' | 'social' | 'consult' | 'other';

export interface Service {
  id: string;
  name: string;
  category: 'execution' | 'experience' | 'identity';
  price: string;
  priceNumeric: number;
  // Fixed-price, one-time services only — hourly rates, "From $X" custom
  // quotes, and monthly subscriptions stay inquiry-only, since self-serve
  // checkout needs a known total to split into a 50% deposit + balance.
  checkoutEnabled?: boolean;
  // 'monthly' = a Stripe subscription: the first month is charged in full
  // at checkout and Stripe bills the same total every month after.
  checkoutCategory?: 'event' | 'project' | 'monthly';
  // Same shape as WebPackageTier.liveExample — an optional sample of real
  // finished work, shown as a link on the service card.
  liveExample?: { url: string; label: string; description: string };
  // Overrides the intake question set inherited from the service's
  // category (SERVICE_SUBCATEGORIES.intakePath). Only needed when a
  // service belongs to a category but needs different questions (podcast
  // services sit under Audio) or isn't listed in any category.
  intakePath?: IntakePath;
  // Optional extras a client can tick in Book & Pay (ids from ADD_ONS).
  // The server recomputes the total from these — hever trusts the browser.
  addOns?: string[];
  // Priced choices picked in Book & Pay (the client must pick one). The
  // server prices the chosen option; priceNumeric stays the "From" price.
  options?: ServiceOption[];
  // Rights / credit / delivery terms shown before payment.
  terms?: string;
  // Charge the whole price at checkout instead of a 50% deposit (small,
  // one-sitting services like a consultation). No balance invoice.
  payInFull?: boolean;
  // After payment, send the client to The Roadmap (vision + questionnaire)
  // — shown on the confirmation page and in the welcome email.
  roadmapAfterPurchase?: boolean;
  // Question ids to leave out of the inherited intake set — e.g. a live
  // performance uses the Event questions but not the social-posting ones.
  skipQuestions?: string[];
  blurb: string;
  deliveryDays?: number;
  revisions?: number;
  includes?: string[];
  notIncludes?: string[];
  assetsNeeded?: string[];
  featured?: boolean;
}

export const ALL_SERVICES: Service[] = [

  // ── BRAND IDENTITY ──────────────────────────────────────────────────────
  {
    id: 'brand-planning',
    name: 'Complete Branding Package',
    category: 'identity',
    price: '$300',
    priceNumeric: 300,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Everything that makes a brand a brand — logo, colors, vision and mission statements, vision mapping, and a business plan foundation. One flat $300. This is the groundwork every website is built on, so most people start here.',
    featured: true,
    deliveryDays: 10,
    revisions: 2,
    includes: [
      "60-min brand strategy session",
      "Custom logo design (primary + alternate versions)",
      "Brand color palette — picked for your business, not a template",
      "Vision statement",
      "Mission statement",
      "Vision mapping — your vision translated into layout and design direction",
      "Business plan foundation",
      "Brand voice guide",
      "AI Roadmap session (full blueprint)",
      "Logo source files (.ai, .eps, .svg, .png)",
      "Delivered as a PDF brand brief",
      "2 rounds of revisions",
    ],
    notIncludes: ["Website build (see Website packages — branding pairs with any tier)", "Professional photography (separate service)"],
    assetsNeeded: ["Business name (final — not placeholder)", "Description of your business and target audience", "Any existing brand materials (logos, colors, past designs)", "3 competitor brands or brands you admire"],
  },
  {
    id: 'logo-design',
    name: 'Logo & Brand Identity Design',
    category: 'identity',
    price: '$250',
    priceNumeric: 250,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Logo only, à la carte. Custom logo system with primary, secondary, and submark variations. 2 rounds of revisions. Proprietary — not templated. For $50 more, the Complete Branding Package adds colors, vision + mission, vision mapping, and a business plan foundation — most people go that route.',
    deliveryDays: 10,
    revisions: 2,
    includes: ["Primary logo mark", "2 alternate versions (horizontal, icon-only)", "Full color + black/white versions", "Source files (.ai, .eps, .svg, .png)", "2 rounds of revisions"],
    notIncludes: ["Brand strategy, colors, vision & mission (see Complete Branding Package — $300)", "Business cards or print design"],
    assetsNeeded: ["Business name (final — not placeholder)", "Brand description and audience", "Color preferences or existing brand colors", "Examples of logos you like and why"],
  },
  {
    id: 'photography',
    name: 'Photography Package',
    category: 'identity',
    price: '$800',
    priceNumeric: 800,
    checkoutEnabled: true,
    checkoutCategory: 'project',
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Custom content calendar, brand voice guide, social media templates, hashtag strategy, engagement framework, and post scheduling system. Bespoke — built around your audience.',
  },

  // ── SOCIAL MEDIA — the look (one-time) and the monthly management.
  {
    id: 'brand-consultation',
    name: 'Brand Plan Consultation',
    category: 'identity',
    intakePath: 'consult',
    roadmapAfterPurchase: true,
    price: '$100',
    priceNumeric: 100,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    payInFull: true,
    terms: "Paid in full when you book. Your $100 pays for your time with SWRV. It is not a deposit and it is not credited toward any project; projects are quoted and paid for separately. Pick your preferred date and we'll confirm the exact time with you. Once you pay, your Roadmap unlocks so we can start from your long-term vision.",
    blurb: 'Clarity on where your brand is going and how to get there. A one-on-one session with SWRV to shape your brand plan: your vision, your audience, your look, and the platforms and next steps that fit.',
    includes: ['One-on-one consultation with SWRV', 'Brand vision and audience review', 'Look, voice and platform recommendations', 'Your brand plan and next steps, in writing', 'The Roadmap, to start from your long-term vision'],
    notIncludes: ['Design work (see the Social Brand Kit)', 'Monthly management (see Social Brand Management)'],
  },
  {
    id: 'social-brand-kit',
    name: 'Social Brand Kit',
    category: 'identity',
    roadmapAfterPurchase: true,
    intakePath: 'brand',
    skipQuestions: ['deliverables'],
    price: '$450',
    priceNumeric: 450,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    terms: "After checkout you'll take The Roadmap: we walk through your long-term vision and you answer the questionnaire, so the look we build fits where your brand is going. 50% today, balance when your kit is delivered.",
    blurb: 'A look your audience recognizes in one scroll. We build your mood board, color palette and type, then turn them into ready-to-post graphics for every platform you use.',
    deliveryDays: 7,
    revisions: 2,
    includes: ['30-minute brand discovery call', 'Mood board', 'Color palette with hex codes', 'Font pairing', 'Profile image and cover/banner graphics sized for each platform', '6 branded post templates', 'Instagram highlight covers', 'Bio rewrite for sach platform', 'Brand board PDF and all source files', '2 rounds of revisions'],
    notIncludes: ['Logo design', 'Monthly posting (see Social Brand Management)'],
    assetsNeeded: ['Your logo (if you have one)', 'Photos of you, your product or your space', '3 brands or accounts whose look you admire'],
  },
  {
    id: 'social-management',
    name: 'Social Brand Management',
    category: 'identity',
    roadmapAfterPurchase: true,
    intakePath: 'social',
    price: '$500/mo',
    priceNumeric: 500,
    checkoutEnabled: true,
    checkoutCategory: 'monthly',
    featured: true,
    addOns: ['platform-facebook', 'platform-threads', 'platform-linkedin', 'platform-tiktok', 'platform-youtube'],
    terms: "Month to month: you're billed today for your first month, then every month on the same date. Cancel anytime before your next billing date by emailing info@swrvonthego.pro. Your accounts and content stay yours. SWRV works through Meta Business Suite and each platform's manager access, never your passwords. After checkout you'll take The Roadmap, so we build from your long-term vision.",
    blurb: 'Your brand, run for you, in your voice. We gather the content, create the posts and manage your Instagram behind the scenes every month, so your online presence stays consistent while you run the business. Add Facebook, Threads, LinkedIn, TikTok or YouTube from $100/mo each.',
    includes: ['Instagram, managed in your brand voice', '12 feed posts a month (reels and carousels)', 'Stories 3 times a week', 'Captions, hashtags and a posting schedule', 'Monthly content gathering: we plan the shots, collect your photos and video, and create the graphics', 'Comment and DM replies on weekdays', 'Monthly performance report and 30-minute strategy call', 'Add platforms: Facebook +$150 · Threads +$100 · LinkedIn +$200 · TikTok +$250 · YouTube +$300 (per month)'],
    notIncludes: ['Paid ad spend', 'On-site shoots (book event content separately)'],
    assetsNeeded: ['Logo and brand colors (or a Social Brand Kit)', 'Photos and video you already have', 'Your current handles on each platform'],
  },

  // ── WEB & DIGITAL ────────────────────────────────────────────────────────
  {
    id: 'website-presence',
    name: 'Website — The Presence ($300 Special)',
    category: 'execution',
    featured: true,
    price: '$300',
    priceNumeric: 300,
    checkoutEnabled: true,
    checkoutCategory: 'project',
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Portfolio site plus the back end to sell products — Stripe checkout, booking integration, email capture, and content sections. Domain + email included. SEO audit at 3-6 months included. Live in 1 week.',
    deliveryDays: 7,
    revisions: 2,
  },
  {
    id: 'website-ecosystem',
    name: 'Website — The Ecosystem',
    category: 'execution',
    price: '$1,000',
    priceNumeric: 1000,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'A multifaceted digital home for solopreneurs who operate as a whole company. Custom-built — you won\'t find this anywhere else because we designed this concept. Vision-first: we get what\'s in your head out and into a digital space you can grow into over time. Your Roadmap drives every design decision. All the bells and whistles: full SEO, product selling, multiple pages, an AI chat assistant for your clients, and calendar + scheduling. Includes domain, email, SEO audit at 3-6 months. Live in 2 weeks.',
    deliveryDays: 14,
    revisions: 3,
    includes: ["Full modular website", "Custom brand integration", "Mobile-first responsive design", "Booking or inquiry system", "Calendar & scheduling system", "AI chat assistant for your clients", "Blog or content hub", "E-commerce / product selling", "Full SEO optimization", "Brand Transmission section", "3 rounds of revisions", "SEO audit at 90 days"],
    notIncludes: ["Monthly hosting fees (billed separately)", "Content writing (can be added)", "Custom photography (can be added)"],
    assetsNeeded: ["Logo files (.svg, .png)", "Vision statement", "Mission statement", "Brand colors and fonts (if available)", "All written copy for each page", "Professional photos or imagery", "Video content", "Any existing domain/hosting login credentials"],
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Campaign page, donation/payment flow, progress tracker, and supporter recognition — built to raise money. A GoFundMe alternative you actually own.',
  },

  // ── MUSIC & AUDIO ────────────────────────────────────────────────────────
  {
    id: 'music-production',
    name: 'Full Song Production',
    category: 'execution',
    price: '$3,000',
    priceNumeric: 3000,
    checkoutEnabled: true,
    checkoutCategory: 'project',
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Final mastering to streaming and broadcast standards. Loudness normalization, stereo enhancement, and platform-optimized delivery.',
  },
  {
    id: 'jingle',
    name: 'Jingle / Brand Audio',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Original brand jingle, sonic logo, or audio bumper. Custom-written and produced to live in your audience\'s head.',
  },
  {
    id: 'voiceover',
    name: 'Voiceover Recording & Production',
    category: 'execution',
    price: '$100/hr',
    priceNumeric: 100,
    blurb: 'Professional voiceover for ads, brand intros, audiobooks, or content. Over 25 years in the music business — you\'re paying for the mic, the ear, and the experience.',
  },
  {
    id: 'audiobook',
    name: 'Audiobook Production',
    category: 'execution',
    price: '$100/hr',
    priceNumeric: 100,
    blurb: 'Studio narration, noise cleanup, mastering, and ACX/Findaway-ready deliverables. Broadcast-ready. Every session managed with 25 years of production experience.',
  },
  {
    id: 'live-recording',
    name: 'Audio Recording & Production',
    category: 'execution',
    price: '$100/hr',
    priceNumeric: 100,
    blurb: 'Studio recording, vocal recording, vocal coaching, audiobook narration, and live session capture in broadcast-ready quality. Includes editing and production. 25+ years of music industry experience.',
  },
  {
    id: 'audio-edit-alacarte',
    name: 'Audio Editing',
    category: 'execution',
    price: '$100/hr',
    priceNumeric: 100,
    blurb: 'Scrubbing, noise cancellation, reverb, compression, effects, and mastering. You\'re not just paying for editing — you\'re paying for someone who\'s been in the music business for over 25 years, delivering broadcast-ready quality with meticulous attention to detail.',
  },
  {
    id: 'podcast-launch',
    intakePath: 'podcast',
    name: 'Podcast Launch Kit',
    category: 'execution',
    price: '$100 + $50/hr',
    priceNumeric: 100,
    blurb: '$250 covers full strategy, branding, and tech setup — hosting, RSS, distribution on Spotify + Apple Podcasts. Recording sessions at $125/hr. Everything built around your voice and audience.',
    deliveryDays: 7,
    revisions: 1,
    includes: ["Show concept consultation", "RSS feed setup", "Cover art design", "Submission to Spotify & Apple Podcasts", "Episode template", "Launch strategy doc"],
    notIncludes: ["Ongoing episode editing (see Podcast Editing)", "Recording equipment"],
    assetsNeeded: ["Show name and description", "Target audience description", "Host name and bio", "Headshot for cover art"],
  },
  {
    id: 'podcast-editing',
    intakePath: 'podcast',
    name: 'Podcast Episode Production',
    category: 'execution',
    price: '$125/hr',
    priceNumeric: 125,
    blurb: 'Per-hour recording + editing, leveling, intro/outro integration, and delivery. Broadcast-ready every episode. Bulk sessions available.',
  },

  // ── LIVE PERFORMANCES ─────────────────────────────────────────────────────
  {
    id: 'live-performance',
    intakePath: 'event',
    name: 'Live Performance',
    category: 'execution',
    price: 'From $100/hr',
    priceNumeric: 100,
    blurb: 'Live performances tailored to your event. Coffee shop performances: $100/hr. Weddings: $500/person. Large events: $500/song. Pricing negotiable based on equipment needs and event complexity.',
  },

  // ââ MOTIVATIONAL PERFORMANCE âââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'motivational-performance',
    name: 'Motivational Performance',
    category: 'execution',
    intakePath: 'event',
    skipQuestions: ['socials', 'metaAccess', 'otherAccess'],
    price: 'From $2,500',
    priceNumeric: 2500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    featured: true,
    options: [
      { id: 'public-speaking', label: 'Public Speaking (1 hr)', price: 2500, description: 'A 1-hour live talk drawn from The Roadmap or Swerve In Your Gift. With or without guitar. Campus, church, nonprofit, or community event.' },
      { id: 'corporate-keynote', label: 'Corporate Keynote (1 hr)', price: 5000, description: 'A 1-hour keynote for corporate events, conferences, or leadership summits. Original message, professional delivery, live performance woven in.' },
      { id: 'full-experience', label: 'Full Experience', price: 5000, description: 'Talk + live songs + book signing + meet & greet. Travel expenses billed at cost â no markup. Quote provided after booking inquiry.' },
    ],
    terms: 'A 50% deposit reserves your date; balance is invoiced before your event. Travel within Atlanta: $50. Travel beyond Atlanta: billed at cost (flight, hotel, ground transport â no markup). Zion performs in person â no remote option.',
    blurb: "A live hour your audience won't forget. Zion speaks from his own published books, performs original songs, and signs copies on the way out. Book as a talk, a keynote, or the full experience â all three work with or without guitar.",
    deliveryDays: 0,
    includes: [
      '1-hour live talk drawn from The Roadmap or Swerve In Your Gift',
      'Live vocal performance (with or without guitar)',
      'Book signing and meet & greet',
      'Setlist and topic consultation before your event',
      'Travel in Atlanta: $50 Â· Beyond Atlanta: billed at cost',
    ],
    notIncludes: ['PA system or backline (venue-provided or quoted)', 'Multiple performances in one day (quoted separately)'],
  },

  // ââ AI VIDEO ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'ai-video-short',
    name: 'AI Video',
    category: 'execution',
    intakePath: 'video',
    price: 'From $200',
    priceNumeric: 200,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    options: [
      { id: 'ai-video-30s', label: '30 Seconds', price: 200, description: 'AI-generated 30-second video â social content, intros, branded clips.' },
      { id: 'ai-video-60s', label: '1 Minute', price: 300, description: 'AI-generated 1-minute video â ads, promos, short-form content.' },
      { id: 'ai-video-120s', label: '2 Minutes', price: 500, description: 'AI-generated 2-minute video â full mini-docs, extended promos, event recaps.' },
    ],
    terms: 'Work for hire â you own the delivered video. Remote by default, delivered as MP4. 1 round of revisions included. Rush delivery (24 hrs) available â add Rush 24-Hr Delivery at checkout.',
    blurb: 'AI-generated video from a script or concept. Social clips, branded intros, promos â delivered as a finished MP4 ready to post.',
    deliveryDays: 3,
    revisions: 1,
    includes: [
      'Script consultation or your script used as-is',
      'AI-generated visuals matched to your brand/concept',
      'Music or audio sync (you provide or we source royalty-free)',
      'Delivered as MP4 (1080p)',
      '1 round of revisions',
    ],
    notIncludes: ['Live footage or on-location filming (see Videography)', 'Custom original music (see Song Production)'],
    assetsNeeded: ['Script or creative brief', 'Brand colors, fonts, or logo (optional)', 'Any reference videos or mood board (optional)'],
  },

  // ── VIDEOGRAPHY ──────────────────────────────────────────────────────────
  {
    id: 'music-video',
    name: 'Music Video (2:30–4 min)',
    category: 'execution',
    price: '$5,000',
    priceNumeric: 5000,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    liveExample: {
      url: 'https://youtu.be/ScA8gsOkbrE',
      label: 'See An Example Music Video →',
      description: 'A real finished music video, shot and produced by SWRV — this is the quality and style you\'re booking.',
    },
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Complete 1-minute promo — concept to delivery in 1 day. Includes shoot, edit, color grading, and 2 revision rounds. Everything included, nothing recycled.',
  },
  // ── SWRV COVERAGE — event and brand content, sold as fixed on-site
  // packages rather than an open-ended hourly quote. Fixed + one-time, so
  // all three are self-serve checkoutable (category: 'event' collects the
  // event date and auto-invoices the balance a few days out).
  {
    id: 'coverage-quick-stop',
    name: 'On The Go',
    category: 'execution',
    price: '$500',
    priceNumeric: 500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    blurb: 'A quick hour on-site — we capture the moment and you have edited reels the same day.',
    deliveryDays: 1,
    includes: ['1 hour on-site coverage', 'iPhone-shot content', 'Creative direction on-site', '6 edited reels', 'Reels delivered same day', 'Raw footage delivered'],
  },
  {
    id: 'coverage-on-the-go-day',
    name: 'The Drive-Through',
    category: 'execution',
    price: '$1,500',
    priceNumeric: 1500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    featured: true,
    blurb: 'Two hours with a plan behind it — mood board, content strategy, and your socials posting live while it happens.',
    deliveryDays: 1,
    includes: ['2 hours on-site', 'Pre-shoot questionnaire', 'Custom mood board', 'Content strategy + planning', 'Creative direction on-site', 'iPhone + video content', 'Gimbal-stabilized footage', 'Real-time story posting to your socials', '12 edited reels', 'Raw footage delivered'],
  },
  {
    id: 'coverage-full-convoy',
    name: 'The Pull-Up',
    category: 'execution',
    price: '$2,500',
    priceNumeric: 2500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    blurb: 'Three hours of full production — a professional photographer, edited brand photos, and live posting while we take over your socials.',
    deliveryDays: 1,
    includes: ['3 hours on-site', 'Pre-shoot strategy call + concept', 'Mood board + shot list', 'Creative direction on-site', 'iPhone + video content', 'Gimbal-stabilized footage', 'Professional photographer', 'Edited brand photos', 'Up to 3 looks', 'Real-time story + reel posting throughout', '12 edited reels', 'Raw footage delivered'],
  },
  {
    id: 'coverage-air-support',
    name: 'Air Support',
    category: 'execution',
    price: '$3,500',
    priceNumeric: 3500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    blurb: 'Everything in The Pull-Up, plus drone footage from above — the venue, the arrivals, and the whole crowd in one shot. Outdoor aerials, weather and airspace permitting.',
    deliveryDays: 1,
    includes: ['Everything in The Pull-Up', 'Drone footage by an FAA-licensed pilot', 'Aerial shots of the venue, arrivals and crowd', 'Aerial photos', '3 edited aerial reels (15 reels total)'],
  },

  // ── MOTIVATIONAL PERFORMANCE — Zion speaking, keynotes, full experience.
  {
    id: 'motivational-performance',
    name: 'Motivational Performance',
    category: 'execution',
    intakePath: 'event',
    skipQuestions: ['socials', 'metaAccess', 'otherAccess'],
    price: 'From $2,500',
    priceNumeric: 2500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    options: [
      { id: 'public-speaking', label: 'Public Speaking (1 hr)', price: 2500, description: 'A one-hour motivational talk for your audience.' },
      { id: 'corporate-keynote', label: 'Corporate Keynote (1 hr)', price: 5000, description: 'A one-hour keynote tailored to your company or conference.' },
      { id: 'full-experience', label: 'Full Experience', price: 5000, description: 'Talk + songs + book signing. Travel at cost.' },
    ],
    terms: 'Public Speaking (1 hr) $2,500 · Corporate Keynote (1 hr) $5,000 · Full Experience $5,000 (talk + songs + book signing, travel at cost). A 50% deposit reserves your date; the balance is invoiced before your event.',
    blurb: 'Motivational speaking and performance for schools, churches, companies, and conferences. Book a one-hour talk, a corporate keynote, or the full experience: talk, live songs, and a book signing.',
    includes: ['One-hour talk or keynote', 'Full Experience: talk + songs + book signing', 'Travel at cost'],
  },

  // ── AI VIDEO — short AI-generated video, priced by length.
  {
    id: 'ai-video-short',
    name: 'AI Video',
    category: 'execution',
    price: 'From $200',
    priceNumeric: 200,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    options: [
      { id: '30s', label: '30 Seconds', price: 200, description: 'A 30-second AI-generated video.' },
      { id: '1m', label: '1 Minute', price: 300, description: 'A 1-minute AI-generated video.' },
      { id: '2m', label: '2 Minutes', price: 500, description: 'A 2-minute AI-generated video.' },
    ],
    blurb: 'Short AI-generated video, made fast: 30 seconds $200 · 1 minute $300 · 2 minutes $500.',
  },

  // ── ZION VOCALS — Zion singing on other artists' tracks (and producing
  // their vocals). Remote worldwide by default; in-studio in Atlanta.
  {
    id: 'vocal-live-event',
    name: 'Zion Sings At Your Event',
    category: 'execution',
    intakePath: 'event',
    skipQuestions: ['socials', 'metaAccess', 'otherAccess'],
    price: 'From $500',
    priceNumeric: 500,
    checkoutEnabled: true,
    checkoutCategory: 'event',
    options: [
      { id: 'one-song-live', label: 'One Song Live', price: 500, description: 'One song performed live by Zion, with or without guitar.' },
      { id: 'custom-song', label: 'Custom Song', price: 750, description: 'An original song written and produced for your event, performed live by Zion.' },
      { id: 'two-songs-live', label: 'Two Songs Live', price: 1000, description: 'Two songs performed live by Zion, with or without guitar.' },
    ],
    terms: "Your investment is set by the song: One Song Live $500 · Custom Song $750 · Two Songs Live $1,000. A 50% deposit reserves your date; the balance is invoiced before your event. Zion performs in person, so there is no remote option. On-location travel in Atlanta is $50; travel beyond Atlanta is quoted.",
    blurb: "A live vocal moment your guests will remember. Zion performs at your wedding, celebration, corporate event, church service or private event, with or without guitar. Booked by the song: One Song Live $500 · Custom Song $750, an original written and produced for your event · Two Songs Live $1,000.",
    includes: ['Live vocal performance by Zion, with or without guitar', 'Song selection consultation', 'Custom Song: an original written and produced for your event', 'On-location travel in Atlanta: $50'],
  },
  {
    id: 'vocal-hook',
    name: 'The Hook',
    category: 'execution',
    intakePath: 'vocals',
    price: '$350',
    priceNumeric: 350,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    addOns: ['songwriting', 'rush-48'],
    terms: "Work for hire: you own the recording of Zion's vocal for your song. If Zion writes any lyrics or melody, he keeps his writer share, registered with BMI. Remote from anywhere in the world by default; in-studio sessions available in Atlanta. Credit: Zion SWRV Birdsong in the liner notes.",
    blurb: "A hook that carries your record. Zion delivers up to 8 bars cut to your key and tempo, with doubles and ad libs, ready to drop into your session.",
    deliveryDays: 3,
    revisions: 1,
    includes: ['Up to 8 bars performed by Zion', 'Doubles and ad libs', 'Matched to your key and tempo', 'Dry and processed WAV stems', '1 round of revisions', 'Liner-notes credit'],
    notIncludes: ['Mixing and mastering of the full song'],
    assetsNeeded: ['Beat or session file (with BPM and key)', 'Reference tracks', 'Lyrics or concept'],
  },
  {
    id: 'vocal-feature',
    name: 'The Feature',
    category: 'execution',
    intakePath: 'vocals',
    price: '$750',
    priceNumeric: 750,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    featured: true,
    addOns: ['songwriting', 'rush-48'],
    terms: "Work for hire: you own the recording of Zion's vocal for your song. If Zion writes any lyrics or melody, he keeps his writer share, registered with BMI. Remote from anywhere in the world by default; in-studio sessions available in Atlanta. Credit: feat. Zion SWRV Birdsong.",
    blurb: "A complete featured performance on your record: a 16-bar verse and the hook, with leads, doubles, harmonies and ad libs, comped and tuned, credited feat. Zion SWRV Birdsong.",
    deliveryDays: 5,
    revisions: 2,
    includes: ['16-bar verse and hook', 'Lead vocals, doubles, harmonies and ad libs', 'Comped and tuned WAV stems', '"feat. Zion SWRV Birdsong" credit', '2 rounds of revisions'],
    notIncludes: ['Mixing and mastering of the full song'],
    assetsNeeded: ['Beat or session file (with BPM and key)', 'Reference tracks', 'Lyrics or concept'],
  },
  {
    id: 'vocal-session-full',
    name: 'Session Vocals — Full Song',
    category: 'execution',
    intakePath: 'vocals',
    price: '$1,200',
    priceNumeric: 1200,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    addOns: ['songwriting', 'rush-48', 'on-location-atl'],
    terms: "Work for hire: you own the recording of Zion's vocal for your song. If Zion writes any lyrics or melody, he keeps his writer share, registered with BMI. Remote from anywhere in the world by default; in-studio sessions available in Atlanta. Credit: Zion SWRV Birdsong in the liner notes.",
    blurb: "Your whole song, sung and arranged. Zion delivers the lead vocal, the background arrangement and the harmony stacks, shaped in a live directed session.",
    deliveryDays: 7,
    revisions: 2,
    includes: ['Full lead vocal', 'Background vocal arrangement', 'Harmony stacks', '1 live directed session, remote or in Atlanta', 'Comped and tuned WAV stems', '2 rounds of revisions', 'Liner-notes credit'],
    notIncludes: ['Mixing and mastering of the full song'],
    assetsNeeded: ['Beat or session file (with BPM and key)', 'Reference tracks', 'Lyrics or concept'],
  },
  {
    id: 'vocal-production',
    name: 'Vocal Production — Your Voice',
    category: 'execution',
    intakePath: 'vocals',
    price: '$600',
    priceNumeric: 600,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    addOns: ['songwriting', 'rush-48', 'on-location-atl'],
    terms: "You own everything you record. If Zion writes any lyrics or melody, he keeps his writer share, registered with BMI. Remote from anywhere in the world by default; in-studio sessions available in Atlanta. Credit: Zion SWRV Birdsong (vocal production) in the liner notes.",
    blurb: "Your own voice, produced at its best. Zion directs a 2-hour session in the Birdsong Method, then arranges your harmonies and comps and tunes your vocal into clean stems.",
    deliveryDays: 5,
    revisions: 2,
    includes: ['2-hour directed session in the Birdsong Method', 'Harmony arrangement', 'Comping and tuning', 'Cleaned WAV stems', '2 rounds of revisions'],
    notIncludes: ['Mixing and mastering of the full song'],
    assetsNeeded: ['Beat or session file (with BPM and key)', 'Reference tracks', 'Lyrics or concept'],
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
    priceNumeric: 100,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Batch of 5-10 short-form videos (TikTok, Instagram Reels, YouTube Shorts). Edited, captioned, and optimized for each platform.',
  },
  {
    id: 'ai-motion-30',
    name: 'AI Motion Graphics — 30 Seconds',
    category: 'execution',
    price: '$600',
    priceNumeric: 600,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: '30-second AI-generated video — intro, animated collage, or branded content. 5 premium effects, 5 premium transitions, 2 revision rounds. 3-hour production time at $200/hr.',
  },
  {
    id: 'ai-motion-60',
    name: 'AI Motion Graphics — 60 Seconds',
    category: 'execution',
    price: '$800',
    priceNumeric: 800,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: '60-second AI-generated video with 8-10 premium effects and transitions. 2 revision rounds. Built with cutting-edge AI tools and edited to broadcast standards.',
  },
  {
    id: 'ai-motion-120',
    name: 'AI Motion Graphics — Up to 2 Minutes',
    category: 'execution',
    price: '$1,200',
    priceNumeric: 1200,
    checkoutEnabled: true,
    checkoutCategory: 'project',
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
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Investor-ready pitch deck (up to 12 slides) plus a full business plan document. Narrative arc, design, financial overview, and ask slide — everything you need to walk into the room ready.',
  },
  {
    id: 'keynote-slides',
    name: 'Keynote / Speaking Slides',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Custom slide deck for talks, workshops, or presentations. Visual storytelling that amplifies your message — inot generic templates.',
  },
  {
    id: 'book-format',
    name: 'Book Formatting + Marketing Launch',
    category: 'execution',
    price: '750',
    priceNumeric: 750,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Professional interior formatting + cover layout for KDP, IngramSpark, or print — plus a full marketing launch strategy and social media rollout plan. Built for artists who need their book to sell, not just exist.',
  },
  {
    id: 'llc-formation',
    name: 'LLC Formation + Business Banking',
    category: 'execution',
    price: '$250',
    priceNumeric: 250,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Done-for-you LLC paperwork, EIN setup, business banking connection, and account guidance — everything to make your brand legally operational. All-inclusive.',
  },

  // ── COACHING & MENTORsHIP ────────────────────────────────────────────────
  {
    id: 'vocal-training',
    name: 'Vocal Training (Birdsong Method)',
    category: 'experience',
    price: '$700',
    priceNumeric: 700,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: '4-session vocal coaching — projection, breath control, performance presence, and voice preservation. The Birdsong Method: developed from 25+ years in the music business.',
  },
  {
    id: 'recording-booth',
    name: 'Recording Booth Training',
    category: 'experience',
    price: '$875',
    priceNumeric: 875,
    checkoutEnabled: true,
    checkoutCategory: 'project',
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

  // ── MUSIC & VIDEO PACKAGES ────────────────────────────────────────────────
  // Relationship-building rates — full song, full video, or both together.
  // These are the intro prices Swerve offers to new clients he's building
  // a long-term working relationship with. Premium full-service rates are
  // in the music-production and music-video entries above.
  {
    id: 'song-production-intro',
    name: 'Song Production',
    category: 'execution',
    intakePath: 'music',
    price: '$1,000',
    priceNumeric: 1000,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    featured: true,
    deliveryDays: 14,
    revisions: 2,
    blurb: 'A complete, release-ready original song — custom instrumental, your vocals produced and directed, mixed, mastered, and delivered with everything you need to release it. 2-week turnaround. 50% to start, 50% on completion.',
    includes: [
      'Custom original instrumental/beat',
      'Vocal production & direction (coaching included)',
      'Mixing',
      'Mastering',
      'Session stems delivered (.wav)',
      'Split sheet for sync licensing',
      'Copyright & online distribution guidance',
      '2 rounds of revisions',
    ],
    notIncludes: ['Music video (see Song + Video Bundle — $2,000)', 'Lyric writing (can be added)'],
    terms: 'Work for hire: you own the finished master. 50% deposit secures your session; the balance is due on delivery. 2-week turnaround from deposit date. Credit: Produced by Zion SWRV Birdsong.',
    assetsNeeded: ['Voice memo of your melody or concept (even rough)', 'Reference tracks for sound direction', 'Lyrics or concept notes'],
  },
  {
    id: 'music-video-intro',
    name: 'Music Video',
    category: 'execution',
    intakePath: 'video',
    price: '$1,500',
    priceNumeric: 1500,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    featured: true,
    deliveryDays: 21,
    revisions: 2,
    blurb: 'A full 3-minute music video, shot and produced — plus behind-the-scenes footage for a documentary or Vlog, 10 4K edited photos for social, and 10 reels cut from your shoot. Everything you need to drop a project.',
    includes: [
      '3-minute music video, fully produced',
      'Behind-the-scenes footage (documentary/vlog ready)',
      '10 4K edited photos for social media',
      '10 reels cut from your video shoot',
      '2 rounds of revisions',
    ],
    notIncludes: ['Song production (see Song + Video Bundle — $2,000)', 'Song must be final mix/mastered before shoot day'],
    terms: '50% deposit secures your shoot date; the balance is due on delivery. Final mixed and mastered song must be provided before production begins.',
    assetsNeeded: ['Mastered song file (.wav or .mp3)', 'Concept or treatment ideas (even rough)', 'Location ideas or mood board', 'Artist reference photos'],
  },
  {
    id: 'song-video-bundle',
    name: 'Song + Video Bundle',
    category: 'execution',
    intakePath: 'music',
    price: '$2,000',
    priceNumeric: 2000,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    featured: true,
    deliveryDays: 28,
    revisions: 2,
    blurb: 'The full package — original song produced and mastered, plus a full 3-minute music video, BTS footage, 10 4K photos, and 10 reels. $500 off when you book both together. This is the relationship-building price — for artists ready to build something real.',
    includes: [
      'Everything in Song Production ($1,000 value)',
      'Everything in Music Video ($1,500 value)',
      '$500 savings vs. booking separately',
      'Custom instrumental, vocals produced & directed',
      'Mixing & mastering',
      'Session stems + split sheet',
      'Copyright & distribution guidance',
      '3-min music video, BTS footage',
      '10 4K edited photos + 10 reels',
    ],
    notIncludes: ['Lyric writing (can be added)'],
    terms: '50% deposit secures your project; the balance is due on delivery. Song is produced first (2 weeks), then the video shoots once the master is done. Total delivery: ~4 weeks. Credit: Produced by Zion SWRV Birdsong.',
    assetsNeeded: ['Voice memo of your melody or concept', 'Reference tracks', 'Lyrics or concept notes'],
  },
  {
    id: 'social-content-daily',
    name: 'Social Media — Daily Content',
    category: 'identity',
    intakePath: 'social',
    price: '$200/mo',
    priceNumeric: 200,
    checkoutEnabled: true,
    checkoutCategory: 'monthly',
    deliveryDays: 0,
    blurb: 'Your content pushed 3–5 times daily at peak social traffic times. We handle the scheduling, captions, and consistency — you handle the business. Month-to-month, cancel anytime.',
    includes: [
      'Content posted 3–5x daily at peak traffic times',
      'Captions and hashtag strategy',
      'Instagram (primary platform)',
      'Posting schedule built around your audience',
      'Month-to-month — no long-term contract',
    ],
    notIncludes: ['Content creation (you provide the photos/videos)', 'Paid ad spend', 'Multiple platform management (see Social Brand Management — $500/mo)'],
    terms: 'Month-to-month. First month billed at checkout; same date every month after. Cancel before your next billing date at info@swrvonthego.pro. Content must be provided by you — this plan handles scheduling and captions, not content creation.',
    assetsNeeded: ['Your Instagram handle and access (via Meta Business Suite — no password sharing)', 'A library of existing photos/videos to start', 'Your brand voice and any do-not-post rules'],
  },
];

// ── WHAT'S ON OFFER RIGHT NOW ─────────────────────────────
// Only these services appear anywhere on the site (menus, Book & Pay,
// the Roadmap's recommendations, the chat widget). Everything else in
// ALL_SERVICES is kept, just hidden until its package is ready — add its
// id here to bring it back everywhere at once. The Zion performance
// booking page and the website packages section are separate and stay up.
export const ACTIVE_SERVICE_IDS = new Set<string>([
  'coverage-quick-stop',     // On The Go
  'coverage-on-the-go-day',  // The Drive-Through
  'coverage-full-convoy',    // The Pull-Up
  'coverage-air-support',    // Air Support
  'vocal-live-event',        // Zion Sings At Your Event
  'vocal-production',        // Vocal Production â Your Voice
  'brand-consultation',      // Brand Plan Consultation ($100, paid in full)
  'social-brand-kit',        // Social Brand Kit
  'social-management',       // Social Brand Management (monthly)
  'website-presence',
  'website-platform',
  'website-ecosystem',
  // ââ Music & Video intro packages ââ
  'song-production-intro',   // Song Production ($1,000)
  'music-video-intro',       // Music Video ($1,500)
  'song-video-bundle',       // Song + Video Bundle ($2,000 â $500 off)
  'social-content-daily',    // Social Media Daily Content ($200/mo)
  'motivational-performance', // Motivational Performance (speaking + songs, from $2,500)
  'ai-video-short',           // AI Video (30s $200 Â· 1min $300 Â· 2min $500)
]);

export const SERVICE_SUBCATEGORIES: SubCategory[] = [
  {
    id: 'music-video-packages',
    label: 'Music & Video',
    tagline: 'From concept to release â song, video, or both.',
    emoji: 'ð¬',
    intakePath: 'music',
    serviceIds: ['song-production-intro', 'music-video-intro', 'song-video-bundle'],
    note: {
      text: 'New to SWRV? These are relationship-building rates. Book a song and a video together and save $500. Affirm, Klarna, and Afterpay are all accepted at checkout â break it into payments with zero back-and-forth.',
      linkLabel: 'Questions? Book a strategy call â',
      to: '/about',
    },
  },
  {
    id: 'zion-vocals',
    label: 'Zion Vocals',
    tagline: 'Zion SWRV Birdsong, live at your event or producing your vocal.',
    emoji: 'ðï¸',
    intakePath: 'vocals',t   serviceIds: ['motivational-performance', 'vocal-live-event', 'vocal-hook', 'vocal-feature', 'vocal-session-full', 'vocal-production'],
  },
  {
    id: 'social-media',
    label: 'Social Media',
    tagline: 'Your brand, built and run in your voice.',
    emoji: 'ð±',
    intakePath: 'social',
    serviceIds: ['brand-consultation', 'social-brand-kit', 'social-content-daily', 'social-management'],
    note: {
      text: "Every brand we build starts with your long-term vision. Once you book, you'll take The Roadmap: we talk through your vision, you answer the questionnaire, and together we map where your brand is going before we build it.",
      linkLabel: 'See how The Roadmap works â',
      to: '/roadmap',
    },
  },
  {
    id: 'videography',
    intakePath: 'video',
    label: 'Videography',
    tagline: 'Moving picture, fully produced.',
    emoji: 'ð¬',
    serviceIds: [
      'music-video',
      'video-promo',
      'on-site-video',
      'live-streaming',
      'short-form-content',
      'ai-video-short',
      'ai-motion-30',
      'ai-motion-60',
      'ai-motion-120',
      'video-edit-alacarte',
    ],
  },
  {
    id: 'audio-production',
    intakePath: 'music',
    label: 'Audio Production',
    tagline: 'Music, voice, and everything between.',
    emoji: 'ð­',
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
    intakePath: 'website',
    label: 'Web & Digital',
    tagline: 'Vision-first. Custom-built. Yours alone.',
    emoji: 'ð',
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
    intakePath: 'brand',
    label: 'Brand Identity',
    tagline: 'Define who you are before you put it anywhere.',
    emoji: 'â¨',
    serviceIds: [
      'brand-planning',
      'logo-design',
      'photography',
      'content-system',
    ],
  },
  {
    id: 'coaching',
    intakePath: 'other',
    label: 'Coaching & Mentorship',
    tagline: 'One-on-one development to level up.',
    emoji: 'ð§',
    serviceIds: [
      'vocal-training',
      'recording-booth',
      'artist-development',
      'consulting-call',
    ],
  },
  {
    id: 'content-business',
    intakePath: 'business',
    label: 'Content & Business',
    tagline: 'Books, decks, LLCs â everything to operate.',
    emoji: 'ð',
    serviceIds: [
      'book-format',
      'pitch-deck',
      'keynote-slides',
      'llc-formation',
    ],
  },
];
