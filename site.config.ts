// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// site.config.ts â SINGLE SOURCE OF TRUTH
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//
// Everything client-customizable lives here. To clone this template
// for a new client, copy the repo and edit ONLY this file (plus
// modules/roadmap/config.ts and modules/zion/config.ts for the
// per-experience modules).
//
// What lives here:
//   â¢ Brand identity (name, tagline, contact email, social links)
//   â¢ Logo + primary brand image URLs
//   â¢ Hero copy
//   â¢ About / story copy
//   â¢ Stats numbers
//   â¢ WebPackages tiers + add-ons
//   â¢ Service catalog (also imported by Roadmap config to keep them in sync)
//   â¢ Footer content
//   â¢ Brand color tokens (also read by tailwind.config.js + CSS modules)
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ââ BRAND IDENTITY âââââââââââââââââââââââââââââââââââââââââ
// ââ PAYMENT CONFIG âââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Every payment routes through Stripe. Card, Klarna, Afterpay and Affirm
// are all enabled on the Stripe Payment Links themselves, so there are no
// per-platform handles or separate BNPL merchant applications to track â
// turning a method on in the Stripe dashboard turns it on for the site.
//
// Paste the Payment Link URLs from Stripe â Payment Links. Until a link is
// set, the booking flow tells the client a secure link is coming by email
// rather than showing a dead button.
export const PAYMENT_CONFIG = {
  stripe: {
    // Fixed $100 â secures a booking (Zion's calendar, or a general service
    // request). The remaining balance is negotiated/invoiced separately;
    // this link only ever collects the deposit.
    //
    // â  depositAmount must match the amount the Payment Link actually charges.
    // A Stripe Payment Link's price cannot be edited after creation â changing
    // the deposit means creating a NEW link in Stripe and pasting it here.
    depositAmount: 100,
    depositUrl: 'https://buy.stripe.com/14A4gydAO0HKdd20mPaEE01',
    // Built with "let customers choose what by email
// rather than showing a dead button.
export const PAYMENT_CONFIG = {
  stripe: {
    // Fixed $100 â secures a booking (Zion's calendar, or a general service
    // request). The remaining balance is negotiated/invoiced separately;
    // this link only ever collects the deposit.
    //
    // â  depositAmount must match the amount the Payment Link actually charges.
    // A Stripe Payment Link's price cannot be edited after creation â changing
    // the deposit means creating a NEW link in Stripe and pasting it here.
    depositAmount: 100,
    depositUrl: 'https://buy.stripe.com/14A4gydAO0HKdd20mPaEE01',
    // Built with "let customers choose what they pay": for a future full
    // pay-in-full flow. Not currently linked from anywhere.
    serviceUrl: '',
  },
} as const;


// ââ ROADMAP ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// The Roadmap is FREE â it's the top of the funnel, not a product.
// There is one experience (no tiers) and nothing is charged for it.
export const ROADMAP_PRICING = {
  full: {
    price: 'Free',
    priceNumeric: 0,
    label: 'The Roadmap',
    tagline: 'Your complete blueprint â vision mapped to services.',
    bulletPoints: [
      'Deep evidence-based analysis of your vision',
      '7-part life blueprint (mindset, diet, fitness, community)',
      'Every service you need, mapped to what you said',
      'Yours to download, email, and bring to the booking',
    ],
  },
} as const;


// ââ SERVICE ASSET REQUIREMENTS ââââââââââââââââââââââââââââââââââââââââââ
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
    required: ['Business name (final â not a placeholder)', 'Brief description of your business and target audience', 'What you want your business to be known for'],
    optional: ['Existing logo or brand elements', 'Competitor examples', 'Color preferences', 'Visual inspiration (Pinterest board, screenshots, links)'],
    formats: '.pdf,.doc,.docx,.jpg,.png,.ai,.eps',
    note: 'You don\'t need a logo, vision, or mission going in â building those is the whole point of this package.',
  },
  'logo-design': {
    title: "What we need for Logo Design",
    required: ['Brand planning brief or answers to our intake form', 'Color preferences or mood reference'],
    optional: ['Existing brand assets to work with or replace', 'Font preferences', 'Examples of logos you like or dislike andeo content', 'Professional photography', 'Color palette / brand colors', 'Reference websites you like'],
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
    title: "Enterprise Intake â Custom Scope",
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

// ââ SERVICE PACKAGES âââââââââââââââââââââââââââââââââââââââââââââââââââ
// Removed â pricing is defined in WEB_PACKAGE_TIERS for websites and SERVICES for everything else.


// ââ REFERRAL / AFFILIATE CONFIG ââââââââââââââââââââââââââââââââââââââââ
// SWRV clients and partners get a unique referral code.
// Anyone who books via their link â they earn a finder fee.
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


// ââ SWRV PIPELINE â Pre-rollout projects âââââââââââââââââââââââââââ
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
    tagline: 'The Word â without the whitewash.',
    description: `A free Bible for everyone. Original canons translated the way they were actually written â with kingdom culture, historical accuracy, and zero colonial agenda. We are not afraid of the truth. We are afraid of what happens when young people never encounter it.\n\nThis includes the Book of Enoch, the Dead Sea Scrolls, and every scripture source that is historically relevant and aligned with the Word as God intended it. We have also documented how the Bible was assembled â not to create controversy, but because the people deserve to understand what they are reading and why.\n\nBuilt with AI tools wielded by people who actually have a relationship with God. Free to access. Supported by the community.`,
    status: 'live-preview',
    statusLabel: 'Live Preview',
    url: 'https://swrv-on-bs-bible.swrvonthego.workers.dev/',
    ctaLabel: 'Access the Preview â',
    accentColor: '#c8a84b',
    supportCta: 'Support This Project',
    supportUrl: 'https://square.link/u/wXrlUcBY?src=sheet',
  },
];


// ââ LAUNCH MODE ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Set to true to hide pricing and drive inquiries.
// Flip to false when ready to show prices again.
export const LAUNCH_MODE = {
  active: false,
  badge: 'NOW OPEN',
  headline: 'SWRV On The Go â Grand Opening',
  subline: 'We are officially open for business and now accepting new clients. Reach out to discuss your project and receive custom pricing.',
  pricingCta: 'Request Pricing',
  pricingNote: 'Pricing available on request. Book a consultation or reach out directly.',
} as const;


// ââ PORTFOLIO â Showcase for employers / collaborators âââââââââââââ
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
    description: 'The flagship. A complete creative agency platform with an AI-powered vision experience (The Roadmap), e-commerce, booking system, payment integrations, referral tracking, and dynamic service marketplace â all custom built.',
    role: 'Sole creator â design, development, and everything end to end',
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
    description: 'A free, historically accurate Bible web app featuring original canon translations, the Book of Enoch, and Dead Sea Scrolls â with documentation on how scripture was assembled. Built to make the Word accessible without whitewashing.',
    role: 'Sole creator â design, development, research, everything end to end',
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
    description: 'An AI-powered vocal coaching platform built on 25 years of real experience. Record or upload a performance, get instant scored feedback on pitch, tone, breath control, and style â with actionable next steps, not just a number.',
    role: 'Sole creator â design, development, and everything end to end',
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
    description: 'Fitness and self-defense coaching website â "Train your body, protect your peace." Built to convert visitors into booked coaching clients with a clean, motivating brand presence.',
    role: 'Sole creator â design, development, and everything end to end',
    stack: ['React', 'Cloudflare Pages', 'Responsive Design', 'Brand Identity'],
    status: 'live',
    statusLabel: 'Live',
    url: 'https://trainbyob.me',
    showcaseUrl: '/apps/trainbyob.html',
    accent: '#e07a5f',
  },
  {
    id: 'mypatrol',
    name: 'MyPatrol â Patrol Shift Log',
    type: 'Voice-First Field App',
    description: 'A voice-driven shift documentation system built for security professionals. Speak your shift â the app fills both patrol forms automatically. Deployed for Southern Protection Agency, Fairfield Plantation.',
    role: 'Sole creator â design, development, and everything end to end',
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
    description: 'A custom interval and workout timer built for the BYOB training programs â purpose-built for coaching sessions, rounds, and structured workouts. Zero setup, offline-ready, mobile-first.',
    role: 'Sole creator â built completely end to end',
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
    'Full-service creative agency for artists, solopreneurs, and visionaries. Music production, brand strategy, video, and web â built to last.',
  url: 'https://swrvonthego.pro',
  founderName: 'Zion SWRV Birdsong',
  contactEmail: 'info@swrvonthego.pro',
  bookingEmail: 'info@swrvonthego.pro',
  logoUrl:
    'https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png',
  // Used in the Roadmap experience CTA + email tier-selection link
  ctaUrl: 'https://swrvonthego.pro/services',
} as const;

// ââ SOCIAL ACCOUNT ACCESS ââââââââââââââââââââââââââââââââââ
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

// ââ BRAND COLOR TOKENS âââââââââââââââââââââââââââââââââââââ
// These are the source of truth. Tailwind reads them via tailwind.config.js
// (using the named tokens like `lion-orange`). Modules can also reference
// the hex values directly through this import.
export const BRAND_TOKENS = {
  // â  Tailwind v4 reads its theme from index.css's @theme block â keep
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

// ââ SOCIAL LINKS âââââââââââââââââââââââââââââââââââââââââââ
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

// ââ HERO âââââââââââââââââââââââââââââââââââââââââââââââââââ
export const HERO = {
  eyebrow: 'YOUR ECOSYSTEM. ON THE GO.',
  headline: 'Built for the artist who is everything at once.',
  subheadline:
    'A modular, scalable creative ecosystem for multi-faceted humans. One vision, every direction.',
  primaryCta: { label: 'Enter the Experience', target: 'roadmap' as const },
  secondaryCta: { label: 'See the work', target: '#about' },
} as const;

// ââ ABOUT ââââââââââââââââââââââââââââââââââââââââââââââââââ
export const ABOUT = {
  eyebrow: '// ORIGIN STORY',
  title: 'ABOUT',
  titleAccent: 'SWRV ON THE GO',
  intro: "We didn't start as an agency. We started as a calling â a genuine desire to help artists, visionaries, and everyday people show the world who they really are.",
  blocks: [
    {
      heading: 'Where We Come From',
      paragraphs: [
        'Over 20 years ago, Zion "SWRV" Birdsong started doing something most people couldn\'t put a category on â helping people build their brand before branding was cool. Musicians. Coaches. Pastors. Business owners. People with a vision and no roadmap to execute it.',
        "He showed up with a camera, a microphone, a genuine care for people's stories, and a relentless drive to make their vision real. That's not a pitch. That's just what happened â over and over â for two decades.",
      ],
    },
    {
      heading: "What We've Been Doing",
      paragraphs: [
        'Photography. Videography. Original music and jingles. Commercials. Radio shows turned podcasts. Vision and mission statements. Brand strategy. Web presence. Content creation from concept to delivery.',
        'Not as separate vendors charging you three different invoices â but as one integrated team that knows your story, your voice, and your vision. We build with you. Not just for you.',
      ],
    },
  ],
  timeline: [
    { year: '2005', label: 'Where It Started', detail: 'Zion "SWRV" Birdsong began building brands and telling stories before the industry had a name for it.' },
    { year: '2010', label: 'The Movement Grows', detail: 'Clients from music, ministry, athletics, and business. Real people. Real visions. Real results.' },
    { year: '2015', label: 'Full Service Unlocked', detail: 'Expanded into photography, videography, original music, jingles, and brand media production.' },
    { year: '2020', label: 'Built to Evolve', detail: 'When the world shut down, SWRV adapted. New platforms, new tools, same love-driven mission.' },
    { year: 'NOW',  label: 'SWRV On The Go', detail: 'A full-service brand ecosystem that swerves with you â wherever your vision is trying to go.' },
  ],
} as const;

// ââ STATS ââââââââââââââââââââââââââââââââââââââââââââââââââ
export const STATS = [
  { value: '25+', label: 'Years of Guidance' },
  { value: '350+', label: 'Routes Mapped' },
  { value: '1M+', label: 'Lives Impacted' },
  { value: '500', label: 'Partners' },
] as const;

// ââ SERVICES (root catalog) ââââââââââââââââââââââââââââââââ
// IMPORTANT: this is the SINGLE SOURCE of services for the entire site.
// Both the main Services component AND the Roadmap config import from here.
// Add/remove/edit services in this one place.
// ââ BOOK & PAY ADD-ONS âââââââââââââââââââââââââââââââââââââ
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
  // Fixed-price, one-time services only â hourly rates, "From $X" custom
  // quotes, and monthly subscriptions stay inquiry-only, since self-serve
  // checkout needs a known total to split into a 50% deposit + balance.
  checkoutEnabled?: boolean;
  // 'monthly' = a Stripe subscription: the first month is charged in full
  // at checkout and Stripe bills the same total every month after.
  checkoutCategory?: 'event' | 'project' | 'monthly';
  // Same shape as WebPackageTier.liveExample â an optional sample of real
  // finished work, shown as a link on the service card.
  liveExample?: { url: string; label: string; description: string };
  // Overrides the intake question set inherited from the service's
  // category (SERVICE_SUBCATEGORIES.intakePath). Only needed when a
  // service belongs to a category but needs different questions (podcast
  // services sit under Audio) or isn't listed in any category.
  intakePath?: IntakePath;
  // Optional extras a client can tick in Book & Pay (ids from ADD_ONS).
  // The server recomputes the total from these â client trusts the browser.
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
  // â shown on the confirmation page and in the welcome email.
  roadmapAfterPurchase?: boolean;
  // Question ids to leave out of the inherited intake set â e.g. a live
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

  // ââ BRAND IDENTITY version â ââââââââââââââââââââââââââââââ
  {
    id: 'brand-planning',
    name: 'Complete Branding Package',
    category: 'identity',
    price: '$300',
    priceNumeric: 300,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Everything that makes a brand a brand â logo, colors, vision and mission statements, vision mapping, and a business plan foundation. One flat $300. This is the groundwork every website is built on, so most people start here.',
    featured: true,
    deliveryDays: 10,
    revisions: 2,
    includes: [
      "60-min brand strategy session",
      "Custom logo design (primary + alternate versions)",
      "Brand color palette â picked for your business, not a template",
      "Vision statement",
      "Mission statement",
      "Vision mapping â your vision translated into layout and design direction",
      "Business plan foundation",
      "Brand voice guide",
      "AI Roadmap session (full blueprint)",
      "Logo source files (.ai, .eps, .svg, .png)",
      "Delivered as a PDF brand brief",
      "2 rounds of revisions",
    ],
    notIncludes: ["Website build (see Website packages â branding pairs with any tier)", "Professional photography (separate service)"],
    assetsNeeded: ["Business name (final â l placeholder)", "Description of your business and target audience", "Any existing brand materials (logos, colors, past designs)", "3 competitor brands or brands you admire"],
  },
  {
    id: 'logo-design',
    name: 'Logo & Brand Identity Design',
    category: 'identity',
    price: '$250',
    priceNumeric: 250,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Logo only, Ã  la carte. Custom logo system with primary, secondary, and submark variations. 2 rounds of revisions. Proprietary â not templated. For $50 more, the Complete Branding Package adds colors, vision + mission, vision mapping, and a business plan foundation â most people go that route.',
    deliveryDays: 10,
    revisions: 2,
    includes: ["Primary logo mark", "2 alternate versions (horizontal, icon-only)", "Full color + black/white versions", "Source files (.ai, .eps, .svg, .png)", "2 rounds of revisions"],
    notIncludes: ["Brand strategy, colors, vision & mission (see Complete Branding Package â $300)", "Business cards or print design"],
    assetsNeeded: ["Business name (final â l placeholder)", "Brand description and audience", "Color preferences or existing brand colors", "Examples of logos you like and why"],
  },
  {
    id: 'photographically',
    name: 'Photography Package',
    category: 'identity',
    price: '$800',
    priceNumeric: 800,
    checkoutEnabled: true,
    checkoutCategory: 'project',
    blurb: 'Half-day brand + lifestyle photoshoot. Full day of shooting, 3-5 hours of professional editing. Color grading included. Deliverables ready for web, press, and social.',
    deliveryDays: 7,
    revisions: 0,
    includes: ["Half-day shoot (3-5 hours)", "Professional edi[ÈÛÛÜÜY[ÈÌ
È[[Y]Y[XYÙ\È[]\HXHÛ[HØ[\HKÝ[ÛY\ÎÈ][Ý]ÚYHY]È\XH
YHX^H\JHØ\ØHÝ[[ÈK\ÜÙ]ÓYYYÈÚÝ\ÝÜÜX]]H\XÝ[Û
Ü[Û[
HØ\ØHÜ[ÛÈ
ËMÛÚÜÈXÛÛ[Y[Y
HØØ][ÛY\[Ù\ÈÜ\Ý[ÈÙ[XÝKKÂY	ØÛÛ[\Þ\Ý[IË[YN	ÐÛÛ[Ý]YÞH	ÛØÚX[YYXHÚ]	ËØ]YÛÜN	ÚY[]IËXÙN	É
L	ËXÙS[Y\XÎ
LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÐÝ\ÝÛHÛÛ[Ø[[\[ÚXÙHÝZYKÛØÚX[YYXH[\]\Ë\ÚYÈÝ]YÞK[ØYÙ[Y[[Y]ÛÜË[ÜÝØÚY[[ÈÞ\Ý[K\ÜÚÙH8 %Z[\Ý[[Ý\]YY[ÙKËKËÈ8¥ 8¥ ÓÐÒPSQQPH8 %HÛÚÈ
ÛK][YJH[H[ÛHX[YÙ[Y[ÂY	Ø[XÛÛÝ[][ÛË[YN	Ð[[ÛÛÝ[][ÛËØ]YÛÜN	ÚY[]IË[ZÙT]	ØÛÛÝ[	ËØYX\Y\\Ú\ÙNYKXÙN	ÉL	ËXÙS[Y\XÎLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë^R[[YK\\ÎZY[[Ú[[ÝHÛÚËXÚÈ[Ý\Y\Y]H[ÙIÛÛÛ\HH^XÝ[YHÚ][ÝKYÜH[Ý\Ù\ÜÚ[ÛZÙHHØYX\ÛÈÙHØ[Ý\ÛH[Ý\ÛË]\H\Ú[Û\	ÐÛ\]HÛÚ\H[Ý\[\ÈÛÚ[È[ÝÈÈÙ]\KHÛK[Û[ÛHÙ\ÜÚ[ÛÚ]ÝÙ\HÈÚ\H[Ý\[[[Ý\\Ú[Û[Ý\]YY[ÙK[Ý\ÛÚË[H]Ü\È[^Ý\È]]Ë[ÛY\ÎÉÓÛK[Û[ÛHÛÛÝ[][ÛÚ]ÝÙ\IË	Ð[\Ú[Û[]YY[ÙH]Y]ÉË	ÓÛÚËÚXÙH[]ÜHXÛÛ[Y[][ÛÉË	Ö[Ý\[[[^Ý\Ë[Ü][ÉË	ÕHØYX\ÈÝ\ÛH[Ý\ÛË]\H\Ú[Û×KÝ[ÛY\ÎÉÑ\ÚYÛÛÜÈ
ÙYHHÛØÚX[[Ú]
IË	Ó[ÛHX[YÙ[Y[
ÙYHÛØÚX[[X[YÙ[Y[
I×KKÂY	ÜÛØÚX[X[ZÚ]	Ë[YN	ÔÛØÚX[[Ú]	ËØ]YÛÜN	ÚY[]IËØYX\Y\\Ú\ÙNYK[ZÙT]	Ø[	ËÚÚ\]Y\Ý[ÛÎÉÙ[]\X\É×KXÙN	É

L	ËXÙS[Y\XÎ

LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\\ÎY\ÚXÚÛÝ][ÝIÛZÙHHØYX\ÙHØ[ÈÝYÚ[Ý\ÛË]\H\Ú[Û[[ÝH[ÝÙ\H]Y\Ý[ÛZ\KÛÈHÛÚÈÙHZ[]ÈÚ\H[Ý\[\ÈÛÚ[Ë
L	HÙ^K[[ÙHÚ[[Ý\Ú]\È[]\Y\	ÐHÛÚÈ[Ý\]YY[ÙHXÛÙÛ^\È[ÛHØÜÛÙHZ[[Ý\[ÛÙØ\ÛÛÜ[]H[\K[\[H[ÈXYK]Ë\ÜÝÜ\XÜÈÜ]\H]ÜH[ÝH\ÙKË[]\Q^\Î
Ë]\Ú[ÛÎ[ÛY\ÎÉÌÌ[Z[]H[\ØÛÝ\HØ[	Ë	Ó[ÛÙØ\	Ë	ÐÛÛÜ[]HÚ]^ÛÙ\ÉË	ÑÛZ\[ÉË	ÔÙ[H[XYÙH[ÛÝ\Ø[\Ü\XÜÈÚ^YÜXXÚ]ÜIË	Í[YÜÝ[\]\ÉË	Ò[ÝYÜ[HYÚYÚÛÝ\ÉË	Ð[È]Ü]HÜXXÚ]ÜIË	Ð[Ø\[[ÛÝ\ÙH[\ÉË	ÌÝ[ÈÙ]\Ú[ÛÉ×KÝ[ÛY\ÎÉÓÙÛÈ\ÚYÛË	Ó[ÛHÜÝ[È
ÙYHÛØÚX[[X[YÙ[Y[
I×K\ÜÙ]ÓYYYÉÖ[Ý\ÙÛÈ
Y[ÝH]HÛJIË	ÔÝÜÈÙ[ÝK[Ý\ÙXÝÜ[Ý\ÜXÙIË	ÌÈ[ÈÜXØÛÝ[ÈÚÜÙHÛÚÈ[ÝHYZ\I×KKÂY	ÜÛØÚX[[X[YÙ[Y[	Ë[YN	ÔÛØÚX[[X[YÙ[Y[	ËØ]YÛÜN	ÚY[]IËØYX\Y\\Ú\ÙNYK[ZÙT]	ÜÛØÚX[	ËXÙN	É
LÛ[ÉËXÙS[Y\XÎ
LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	Û[ÛIËX]\YYKYÛÎÉÜ]ÜKYXÙXÛÚÉË	Ü]ÜK]XYÉË	Ü]ÜK[[ÙY[Ë	Ü]ÜK]ZÝÚÉË	Ü]ÜK^[Ý]XI×K\\Î[ÛÈ[Û[ÝIÜH[YÙ^HÜ[Ý\\Ý[Û[]\H[ÛÛHØ[YH]KØ[Ù[[][YHYÜH[Ý\^[[È]HH[XZ[[È[ÐÝÜÛYÛËË[Ý\XØÛÝ[È[ÛÛ[Ý^H[Ý\ËÕÔÛÜÜÈÝYÚY]H\Ú[\ÜÈÝZ]H[XXÚ]ÜIÜÈX[YÙ\XØÙ\ÜË]\[Ý\\ÜÝÛÜËY\ÚXÚÛÝ][ÝIÛZÙHHØYX\ÛÈÙHZ[ÛH[Ý\ÛË]\H\Ú[Û\	Ö[Ý\[[Ü[ÝK[[Ý\ÚXÙKÙHØ]\HÛÛ[ÜX]HHÜÝÈ[X[YÙH[Ý\[ÝYÜ[HZ[HØÙ[\È]\H[ÛÛÈ[Ý\Û[H\Ù[ÙHÝ^\ÈÛÛÚ\Ý[Ú[H[ÝH[H\Ú[\ÜËYXÙXÛÚËXYË[ÙY[ZÕÚÈÜ[ÝUXHÛH	LÛ[ÈXXÚË[ÛY\ÎÉÒ[ÝYÜ[KX[YÙY[[Ý\[ÚXÙIË	ÌLYYÜÝÈH[Û
Y[È[Ø\Ý\Ù[ÊIË	ÔÝÜY\ÈÈ[Y\ÈHÙYZÉË	ÐØ\[ÛË\ÚYÜÈ[HÜÝ[ÈØÚY[IË	Ó[ÛHÛÛ[Ø]\[ÎÙH[HÚÝËÛÛXÝ[Ý\ÝÜÈ[Y[Ë[ÜX]HHÜ\XÜÉË	ÐÛÛ[Y[[H\Y\ÈÛÙYZÙ^\ÉË	Ó[ÛH\ÜX[ÙH\Ü[Ì[Z[]HÝ]YÞHØ[	Ë	ÐY]Ü\ÎXÙXÛÚÈ
ÉML0­ÈXYÈ
ÉL0­È[ÙY[
É0­ÈZÕÚÈ
ÉL0­È[ÝUXH
ÉÌ
\[Û
I×KÝ[ÛY\ÎÉÔZYYÜ[	Ë	ÓÛ\Ú]HÚÛÝÈ
ÛÚÈ][ÛÛ[Ù\\][JI×K\ÜÙ]ÓYYYÉÓÙÛÈ[[ÛÛÜÈ
ÜHÛØÚX[[Ú]
IË	ÔÝÜÈ[Y[È[ÝH[XYH]IË	Ö[Ý\Ý\[[\ÈÛXXÚ]ÜI×KKËÈ8¥ 8¥ ÑP	QÒUS8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ ÂY	ÝÙXÚ]K\\Ù[ÙIË[YN	ÕÙXÚ]H8 %H\Ù[ÙH
	ÌÜXÚX[
IËØ]YÛÜN	Ù^XÝ][ÛËX]\YYKXÙN	ÉÌ	ËXÙS[Y\XÎÌÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÕH	ÌÜXÚX[XÚÈÛHLÙ\ÜÚ[Û[H\ÚYÛY[\]HÝ[\ÈÜÛÈÝ\ÝÛH8 %ÙHÝØ\[[Ý\[[Ý\ÛÜË[[Ý\ÝÜË[Ø[KYY[KÛXZ[
È[XZ[Ù]\[ÛYY]H[
H^\ËË[]\Q^\Î
K]\Ú[ÛÎK[ÛY\ÎÈ[Ý\ÚÚXÙHÙL[\]HÝ[\È
ÜÝ\ÝÛHË\YÙJH[Ý\[ÛÛÜËÙÛÈ	ÛÛ[[Ø[H\ÜÛÚ]H\ÚYÛÛÛXÝÜH\ÚXÈÑSÈÙ]\HÝ[Ù]\Ú[ÛÈ]H[
H^\ÈKÝ[ÛY\ÎÈKXÛÛ[Y\ÙHÛÚÚ[ÈÞ\Ý[HÝ\ÝÛH[[X][ÛÈK\ÜÙ]ÓYYYÈÙÛÈ
[HÜX]
HÜ][ÛÜHÜXXÚYÙHKLÈYÚ]X[]HÝÜÈÜ[XYÙ\ÈÛÛÜY\[Ù\È
YÈ[[È^\ÝÈY]
HKKÂY	ÝÙXÚ]K\]ÜIË[YN	ÕÙXÚ]H8 %H]ÜIËØ]YÛÜN	Ù^XÝ][ÛËXÙN	É
L	ËXÙS[Y\XÎ
LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÔÜÛ[ÈÚ]H\ÈHXÚÈ[ÈÙ[ÙXÝÈ8 %Ý\HÚXÚÛÝ]ÛÚÚ[È[YÜ][Û[XZ[Ø\\K[ÛÛ[ÙXÝ[ÛËÛXZ[
È[XZ[[ÛYYÑSÈ]Y]]ËM[ÛÈ[ÛYY]H[HÙYZËË[]\Q^\Î
Ë]\Ú[ÛÎKÂY	ÝÙXÚ]KYXÛÜÞ\Ý[IË[YN	ÕÙXÚ]H8 %HXÛÜÞ\Ý[IËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉK	ËXÙS[Y\XÎLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÐH][YXÙ]YYÚ][ÛYHÜÛÛÜ[]\ÈÚÈÜ\]H\ÈHÚÛHÛÛ\[KÝ\ÝÛKXZ[8 %[ÝHÛÛ	Ý[\È[]Ú\H[ÙHXØ]\ÙHÙH\ÚYÛY\ÈÛÛÙ\\Ú[ÛY\ÝÙHÙ]Ú]	ÜÈ[[Ý\XYÝ][[ÈHYÚ][ÜXÙH[ÝHØ[ÜÝÈ[ÈÝ\[YK[Ý\ØYX\]\È]\H\ÚYÛXÚ\Ú[Û[H[È[Ú\Ý\Î[ÑSËÙXÝÙ[[Ë][\HYÙ\Ë[RHÚ]\ÜÚ\Ý[Ü[Ý\ÛY[Ë[Ø[[\
ÈØÚY[[Ë[ÛY\ÈÛXZ[[XZ[ÑSÈ]Y]]ËM[ÛË]H[ÙYZÜËË[]\Q^\ÎM]\Ú[ÛÎË[ÛY\ÎÈ[[Ù[\ÙXÚ]HÝ\ÝÛH[[YÜ][Û[Ø[KY\Ý\ÜÛÚ]H\ÚYÛÛÚÚ[ÈÜ[]Z\HÞ\Ý[HØ[[\	ØÚY[[ÈÞ\Ý[HRHÚ]\ÜÚ\Ý[Ü[Ý\ÛY[ÈÙÈÜÛÛ[XKXÛÛ[Y\ÙHÈÙXÝÙ[[È[ÑSÈÜ[Z^][Û[[ÛZ\ÜÚ[ÛÙXÝ[ÛÈÝ[ÈÙ]\Ú[ÛÈÑSÈ]Y]]L^\ÈKÝ[ÛY\ÎÈ[ÛHÜÝ[ÈY\È
[YÙ\\][JHÛÛ[Ü][È
Ø[HYY
HÝ\ÝÛHÝÙÜ\H
Ø[HYY
HK\ÜÙ]ÓYYYÈÙÛÈ[\È
ÝËÊH\Ú[ÛÝ][Y[Z\ÜÚ[ÛÝ][Y[[ÛÛÜÈ[ÛÈ
Y]Z[XJH[Ü][ÛÜHÜXXÚYÙHÙ\ÜÚ[Û[ÝÜÈÜ[XYÙ\HY[ÈÛÛ[[H^\Ý[ÈÛXZ[ÚÜÝ[ÈÙÚ[ÜY[X[ÈKKÂY	Ù[\\ÙKYXÛÜÞ\Ý[IË[YN	Ñ[\\ÙHXÛÜÞ\Ý[IËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÑÛH	
K	ËXÙS[Y\XÎ
L\	ÑÜÜÙHZ[[ÈÛÛY][ÈHÚ^HÙ\KZXÜÜÛÙÜH[YÚ][XÛÜX[8 %Ú]][\H]\Ú[ÛËÙXÙ\Ë[Ü\][ÛÈ[\ÛHYÚ][ÛÙ][KX[\Ú]XÝ\KX[HÜ[Ë\\ÝÜÝ\Ë][YHÝX[\Ë[^[Ú]H[\ÝXÝ\K\Ú[ÛY\ÝZ[ÈØØ[KÝ\È]	
KÝ\ÝÛK\][ÝYHØÛÜKËX]\YYKKÂY	ÝÙXÚ]K[XZ[[[ÙIË[YN	ÕÙXÚ]HXZ[[[ÙH8 %Ù[TÙ\XÙIËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉÌÛ[Û	ËXÙS[Y\XÎÌ\	ÔÙXÝ\]H\]\ËÚÙ[[È^\Ë[ÛÛ[\]\È[ÛK[ÝH[HÚ]H8 %ÙHÙY\]ÛX[[Ý\[ËKÂY	ÝÙXÚ]K[X[YÙ[Y[	Ë[YN	ÕÙXÚ]HX[YÙ[Y[8 %[Ù\XÙIËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉLKÛ[Û	ËXÙS[Y\XÎLK\	ÕÙHX[YÙH]\][È8 %ÙXÝ\]K\]\ËÛÛ[ÑSÈ[Û]Ü[Ë[\ÜX[ÙHÜ[Z^][ÛÈÙ\\]H]Y]YYYØXÝ]KÝXXÝ]KËKÂY	Ù[Z\Ú[Ë\Ú]IË[YN	ÐÜÝÙ[[ÈÈ[Z\Ú[ÈÚ]IËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉK	ËXÙS[Y\XÎLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÐØ[\ZYÛYÙKÛ][ÛÜ^[Y[ÝËÙÜ\ÜÈXÚÙ\[Ý\Ü\XÛÙÛ][Û8 %Z[ÈZ\ÙH[Û^KHÛÑ[YH[\]]H[ÝHXÝX[HÝÛËKËÈ8¥ 8¥ UTÒPÈ	UQSÈ8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ 8¥ ÂY	Û]\ÚXË\ÙXÝ[ÛË[YN	Ñ[ÛÛÈÙXÝ[ÛËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉË	ËXÙS[Y\XÎÌÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÐÛÛ\]HÛÛÈÛHÛÛÙ\ÈX\Ý\8 %X]Ú[Ý[Y[[ÜX][ÛØØ[XÛÜ[Ë\[Ú[ËØØ[ÙXÝ[ÛØØ[ÛØXÚ[ËZ^[ËX\Ý\[Ë[[[[]\K
KY^H\\Ý[[H[\ÝH]H8 %Ø[YHØYØ\Ý\XYH]X[]KËX]\YYK[]\Q^\Î
K]\Ú[ÛÎ[ÛY\ÎÈÝ\ÝÛHX]ÜÙXÝ[ÛÝY[ÈXÛÜ[ÈÙ\ÜÚ[ÛØØ[ÛØXÚ[È	\XÝ[ÛZ^[ÈX\Ý\[ÈØYØ\Ý\XYHÝ\[È[H
Ø]HÝ[ÈÙ]\Ú[ÛÈKÝ[ÛY\ÎÈ\XÈÜ][È
Ø[HYY
H]\ÚXÈY[ÈÙXÝ[ÛK\ÜÙ]ÓYYYÈÜ][\XÜÈÜÛÛÙ\Ý\ÈY\[ÙHXÚÜÈÜÛÝ[\XÝ[Û[H^\Ý[ÈÝ[\ÈÜXÛÜ[ÜÈYZ[[ÈÛ[ÜÛÜÈKKÂY	ÛZ^[ÉË[YN	ÓZ^[ÉËØ]YÛÜN	Ù^XÝ][ÛËXÙN	É
L	ËXÙS[Y\XÎ
LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÔÙ\ÜÚ[Û[Z^[ÈÜ[Ý\[\ÚYXÛÜ[ÜË[[Ù\È]\H[[Y[8 %][Ë[[ËTKÛÛ\\ÜÚ[ÛYXÝËØYØ\Ý\XYHÝ]]Ë[]\Q^\ÎË]\Ú[ÛÎ[ÛY\ÎÈÙ\ÜÚ[Û[Z^ÙHÛÛÈØØ[[[ÙKTKÛÛ\\ÜÚ[ÛYXÝÈØYØ\Ý\XYHÝ\[È[H
Ø]HÝ[ÈÙ]\Ú[ÛÈKÝ[ÛY\ÎÈX\Ý\[È
Ù\\]HÙ\XÙH8 %[HÜØ][ÜÊHX]ÙXÝ[ÛK\ÜÙ]ÓYYYÈ[[]YX[XÚÈ[\È
Ý[\ÊH[Ø]ÜX]Y\[ÙHXÚÈÜZ^\XÝ[Û[\ËÚÙ^H[ÈY]Z[XHKKÂY	ÛX\Ý\[ÉË[YN	ÓX\Ý\[ÉËØ]YÛÜN	Ù^XÝ][ÛËXÙN	É
L	ËXÙS[Y\XÎ
LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	Ñ[[X\Ý\[ÈÈÝX[Z[È[ØYØ\ÝÝ[\ËÝY\ÜÈÜX[^][ÛÝ\[È[[Ù[Y[[]ÜK[Ü[Z^Y[]\KËKÂY	Ú[ÛIË[YN	Ò[ÛHÈ[]Y[ÉËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉL	ËXÙS[Y\XÎLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	Ë\	ÓÜYÚ[[[[ÛKÛÛXÈÙÛËÜ]Y[È[\\Ý\ÝÛK]Ü][[ÙXÙYÈ]H[[Ý\]YY[ÙW	ÜÈXYËKÂY	ÝÚXÙ[Ý\Ë[YN	ÕÚXÙ[Ý\XÛÜ[È	ÙXÝ[ÛËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉLÚËXÙS[Y\XÎL\	ÔÙ\ÜÚ[Û[ÚXÙ[Ý\ÜYË[[ÜË]Y[ØÛÚÜËÜÛÛ[Ý\HYX\È[H]\ÚXÈ\Ú[\ÜÈ8 %[ÝW	ÜH^Z[ÈÜHZXËHX\[H^\Y[ÙKËKÂY	Ø]Y[ØÛÚÉË[YN	Ð]Y[ØÛÚÈÙXÝ[ÛËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉLÚËXÙS[Y\XÎL\	ÔÝY[È\][ÛÚ\ÙHÛX[\X\Ý\[Ë[PÖÑ[]Ø^K\XYH[]\X\ËØYØ\Ý\XYK]\HÙ\ÜÚ[ÛX[YÙYÚ]HYX\ÈÙÙXÝ[Û^\Y[ÙKËKÂY	Û]K\XÛÜ[ÉË[YN	Ð]Y[ÈXÛÜ[È	ÙXÝ[ÛËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉLÚËXÙS[Y\XÎL\	ÔÝY[ÈXÛÜ[ËØØ[XÛÜ[ËØØ[ÛØXÚ[Ë]Y[ØÛÚÈ\][Û[]HÙ\ÜÚ[ÛØ\\H[ØYØ\Ý\XYH]X[]K[ÛY\ÈY][È[ÙXÝ[ÛJÈYX\ÈÙ]\ÚXÈ[\ÝH^\Y[ÙKËKÂY	Ø]Y[ËYY]X[XØ\IË[YN	Ð]Y[ÈY][ÉËØ]YÛÜN	Ù^XÝ][ÛËXÙN	ÉLÚËXÙS[Y\XÎL\	ÔØÜX[ËÚ\ÙHØ[Ù[][Û]\ÛÛ\\ÜÚ[ÛYXÝË[X\Ý\[Ë[ÝW	ÜHÝ\Ý^Z[ÈÜY][È8 %[ÝW	ÜH^Z[ÈÜÛÛY[ÛHÚ×	ÜÈY[[H]\ÚXÈ\Ú[\ÜÈÜÝ\HYX\Ë[]\[ÈÆF67B×&VGVÆGvFÖWF7VÆ÷W2GFVçFöâFòFWFÂârÀ¢ÒÀ¢°¢C¢wöF67BÖÆVæ6rÀ¢çF¶UF¢wöF67BrÀ¢æÖS¢uöF67BÆVæ6¶BrÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rC²CSö"rÀ¢&6TçVÖW&3¢À¢&ÇW&#¢rC#S6÷fW'2gVÆÂ7G&FVwÂ'&æFærÂæBFV66WGW(	B÷7FærÂ%52ÂF7G&'WFöâöâ7÷Fg²ÆRöF67G2â&V6÷&Fær6W76öç2BC#Rö"âWfW'Fær'VÇB&÷VæB÷W"fö6RæBVFVæ6RârÀ¢FVÆfW'F3¢rÀ¢&Wf6öç3¢À¢æ6ÇVFW3¢²%6÷r6öæ6WB6öç7VÇFFöâ"Â%%52fVVB6WGW"Â$6÷fW"'BFW6vâ"Â%7V&Ö76öâFò7÷FgbÆRöF67G2"Â$W6öFRFV×ÆFR"Â$ÆVæ67G&FVwFö2%ÒÀ¢æ÷Dæ6ÇVFW3¢²$öævöærW6öFRVFFær6VRöF67BVFFær"Â%&V6÷&FærWVÖVçB%ÒÀ¢76WG4æVVFVC¢²%6÷ræÖRæBFW67&Föâ"Â%F&vWBVFVæ6RFW67&Föâ"Â$÷7BæÖRæB&ò"Â$VG6÷Bf÷"6÷fW"'B%ÒÀ¢ÒÀ¢°¢C¢wöF67BÖVFFærrÀ¢çF¶UF¢wöF67BrÀ¢æÖS¢uöF67BW6öFR&öGV7FöârÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rC#Rö"rÀ¢&6TçVÖW&3¢#RÀ¢&ÇW&#¢uW"Ö÷W"&V6÷&Fær²VFFærÂÆWfVÆærÂçG&òö÷WG&òçFVw&FöâÂæBFVÆfW'â'&öF67B×&VGWfW'W6öFRâ'VÆ²6W76öç2fÆ&ÆRârÀ¢ÒÀ ¢òò)H)HÄdRU$dõ$Ôä4U2)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H ¢°¢C¢vÆfR×W&f÷&Öæ6RrÀ¢çF¶UF¢vWfVçBrÀ¢æÖS¢tÆfRW&f÷&Öæ6RrÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢tg&öÒCö"rÀ¢&6TçVÖW&3¢À¢&ÇW&#¢tÆfRW&f÷&Öæ6W2FÆ÷&VBFò÷W"WfVçBâ6öffVR6÷W&f÷&Öæ6W3¢Cö"âvVFFæw3¢CS÷W'6öââÆ&vRWfVçG3¢CS÷6öærâ&6æræVv÷F&ÆR&6VBöâWVÖVçBæVVG2æBWfVçB6ö×ÆWGârÀ¢ÒÀ ¢òò)H)HdDTôu$)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H ¢°¢C¢v×W62×fFVòrÀ¢æÖS¢t×W62fFVò#£3(	3BÖârÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rCRÃrÀ¢&6TçVÖW&3¢SÀ¢6V6¶÷WDVæ&ÆVC¢G'VRÀ¢6V6¶÷WD6FVv÷'¢w&ö¦V7BrÀ¢ÆfTW×ÆS¢°¢W&Ã¢vGG3¢ò÷÷WGRæ&Rõ64w4ö¶'$RrÀ¢Æ&VÃ¢u6VRâW×ÆR×W62fFVò(i"rÀ¢FW67&Föã¢t&VÂfæ6VB×W62fFVòÂ6÷BæB&öGV6VB'5u%b(	BF22FRVÆGæB7GÆR÷UÂw&R&öö¶ærârÀ¢ÒÀ¢&ÇW&#¢tgVÆÂ×W62fFVò&öGV7Föâ(	B6öæ6WBÂÖF6ö÷BÂRÖF÷7B×&öGV7FöâÂVæÆÖFVB&VÖVÒVffV7G2æBG&ç6Föç2Â6öÆ÷"w&FærÂæB"&÷VæG2öb&Wf6öç2âF&BöbvB7GVF÷26&vRf÷"FR6ÖRfæ6ârÀ¢fVGW&VC¢G'VRÀ¢FVÆfW'F3¢rÀ¢&Wf6öç3¢"À¢æ6ÇVFW3¢²$6öæ6WBFWfVÆ÷ÖVçB6W76öâ"Â#gVÆÂFöbfÆÖær"Â#RÖF&öfW76öæÂVFB"Â%VæÆÖFVB&VÖVÒVffV7G2bG&ç6Föç2"Â$6öÆ÷"w&Fær"Â#"&÷VæG2öb&Wf6öç2"Â$FVÆfW'âD²²6ö×&W76VBvV"fW'6öâ%ÒÀ¢æ÷Dæ6ÇVFW3¢²%6öær&öGV7Föâ×W7B&RÖVBbÖ7FW&VB"Â%FÆVçB67FærfVW2"Â$Æö6FöâW&ÖG2%ÒÀ¢76WG4æVVFVC¢²$fæ6VBÂÖ7FW&VBVFòfÆRçvb÷"æ×2"Â$7&VFfR6öæ6WB÷"ÖööB&ö&B÷FöæÂ'WBVÇgVÂ"Â$ç7V6f2v&G&ö&RÂ&÷2Â÷"f7VÂ&VfW&Væ6W2%ÒÀ¢ÒÀ¢°¢C¢wfFVò×&öÖòrÀ¢æÖS¢u&öÖòfFVòVæFW"ÖârÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rCÃ#SrÀ¢&6TçVÖW&3¢#SÀ¢6V6¶÷WDVæ&ÆVC¢G'VRÀ¢6V6¶÷WD6FVv÷'¢w&ö¦V7BrÀ¢&ÇW&#¢t6ö×ÆWFRÖÖçWFR&öÖò(	B6öæ6WBFòFVÆfW'âFâæ6ÇVFW26ö÷BÂVFBÂ6öÆ÷"w&FærÂæB"&Wf6öâ&÷VæG2âWfW'Færæ6ÇVFVBÂæ÷Fær&V76ÆVBârÀ¢ÒÀ¢òò)H)H5u%b4õdU$tR(	BWfVçBæB'&æB6öçFVçBÂ6öÆB2fVBöâ×6FP¢òò6¶vW2&FW"Fââ÷VâÖVæFVB÷W&ÇV÷FRâfVB²öæR×FÖRÂ6ð¢òòÆÂF&VR&R6VÆb×6W'fR6V6¶÷WF&ÆR6FVv÷'¢vWfVçBr6öÆÆV7G2FP¢òòWfVçBFFRæBWFòÖçfö6W2FR&Ææ6RfWrF2÷WBà¢°¢C¢v6÷fW&vR×V6²×7F÷rÀ¢æÖS¢töâFRvòrÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rCSrÀ¢&6TçVÖW&3¢SÀ¢6V6¶÷WDVæ&ÆVC¢G'VRÀ¢6V6¶÷WD6FVv÷'¢vWfVçBrÀ¢&ÇW&#¢tV6²÷W"öâ×6FR(	BvR6GW&RFRÖöÖVçBæB÷RfRVFFVB&VVÇ2FR6ÖRFârÀ¢FVÆfW'F3¢À¢æ6ÇVFW3¢²s÷W"öâ×6FR6÷fW&vRrÂvöæR×6÷B6öçFVçBrÂt7&VFfRF&V7Föâöâ×6FRrÂsbVFFVB&VVÇ2rÂu&VVÇ2FVÆfW&VB6ÖRFrÂu&rfö÷FvRFVÆfW&VBuÒÀ¢ÒÀ¢°¢C¢v6÷fW&vRÖöâ×FRÖvòÖFrÀ¢æÖS¢uFRG&fRÕF&÷VvrÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rCÃSrÀ¢&6TçVÖW&3¢SÀ¢6V6¶÷WDVæ&ÆVC¢G'VRÀ¢6V6¶÷WD6FVv÷'¢vWfVçBrÀ¢fVGW&VC¢G'VRÀ¢&ÇW&#¢uGvò÷W'2vFÆâ&VæBB(	BÖööB&ö&BÂ6öçFVçB7G&FVwÂæB÷W"6ö6Ç2÷7FærÆfRvÆRBVç2ârÀ¢FVÆfW'F3¢À¢æ6ÇVFW3¢²s"÷W'2öâ×6FRrÂu&R×6ö÷BVW7Föææ&RrÂt7W7FöÒÖööB&ö&BrÂt6öçFVçB7G&FVw²ÆææærrÂt7&VFfRF&V7Föâöâ×6FRrÂvöæR²fFVò6öçFVçBrÂtvÖ&Â×7F&Æ¦VBfö÷FvRrÂu&VÂ×FÖR7F÷'÷7FærFò÷W"6ö6Ç2rÂs"VFFVB&VVÇ2rÂu&rfö÷FvRFVÆfW&VBuÒÀ¢ÒÀ¢°¢C¢v6÷fW&vRÖgVÆÂÖ6öçf÷rÀ¢æÖS¢uFRVÆÂÕWrÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rC"ÃSrÀ¢&6TçVÖW&3¢#SÀ¢6V6¶÷WDVæ&ÆVC¢G'VRÀ¢6V6¶÷WD6FVv÷'¢vWfVçBrÀ¢&ÇW&#¢uF&VR÷W'2öbgVÆÂ&öGV7Föâ(	B&öfW76öæÂ÷Föw&W"ÂVFFVB'&æB÷F÷2ÂæBÆfR÷7FærvÆRvRF¶R÷fW"÷W"6ö6Ç2ârÀ¢FVÆfW'F3¢À¢æ6ÇVFW3¢²s2÷W'2öâ×6FRrÂu&R×6ö÷B7G&FVw6ÆÂ²6öæ6WBrÂtÖööB&ö&B²6÷BÆ7BrÂt7&VFfRF&V7Föâöâ×6FRrÂvöæR²fFVò6öçFVçBrÂtvÖ&Â×7F&Æ¦VBfö÷FvRrÂu&öfW76öæÂ÷Föw&W"rÂtVFFVB'&æB÷F÷2rÂuWFò2Æöö·2rÂu&VÂ×FÖR7F÷'²&VVÂ÷7FærF&÷Vv÷WBrÂs"VFFVB&VVÇ2rÂu&rfö÷FvRFVÆfW&VBuÒÀ¢ÒÀ¢°¢C¢v6÷fW&vRÖ"×7W÷'BrÀ¢æÖS¢t"7W÷'BrÀ¢6FVv÷'¢vWV7WFöârÀ¢&6S¢rC2ÃSrÀ¢&6TçVÖW&3¢3SÀ¢6V6¶÷WDVæ&ÆVC¢G'VRÀ¢6V6¶÷WD6FVv÷'¢vWfVçBrÀ¢&ÇW&#¢tWfW'FærâFRVÆÂÕWÂÇW2G&öæRfö÷FvRg&öÒ&÷fR(	BFRfVçVRÂFR'&fÇ2ÂæBFRvöÆR7&÷vBâöæR6÷Bâ÷WFFö÷"W&Ç2ÂvVFW"æB'76RW&ÖGFærârÀ¢FVÆfW'F3¢À¢æ6ÇVFW3¢²tWfW'FærâFRVÆÂÕWrÂtG&öæRfö÷FvR'âdÖÆ6Vç6VBÆ÷BrÂtW&Â6÷G2öbFRfVçVRÂ'&fÇ2æB7&÷vBrÂtW&Â÷F÷2rÂs2VFFVBW&Â&VVÇ2R&VVÇ2F÷FÂuÒÀ¢ÒÀ ¢òò)H)H¤ôâdô4Å2(	B¦öâ6æværöâ÷FW"'F7G2rG&6·2æB&öGV6æp¢òòFV"fö6Ç2èÔ[[ÝHÛÜÚYHHY][È[\ÝY[È[][KÂY	ÝØØ[[]KY][	Ë[YN	Ö[ÛÚ[ÜÈ][Ý\][	ËØ]YÛÜN	Ù^XÝ][ÛË[ZÙT]	Ù][	ËÚÚ\]Y\Ý[ÛÎÉÜÛØÚX[ÉË	ÛY]PXØÙ\ÜÉË	ÛÝ\XØÙ\ÜÉ×KXÙN	ÑÛH	
L	ËXÙS[Y\XÎ
LÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	Ù][	ËÜ[ÛÎÂÈY	ÛÛK\ÛÛË[]IËX[	ÓÛHÛÛÈ]IËXÙN
L\ØÜ\[Û	ÓÛHÛÛÈ\ÜYY]HH[ÛÚ]ÜÚ]Ý]ÝZ]\ÈKÈY	ØÝ\ÝÛK\ÛÛÉËX[	ÐÝ\ÝÛHÛÛÉËXÙN
ÍL\ØÜ\[Û	Ð[ÜYÚ[[ÛÛÈÜ][[ÙXÙYÜ[Ý\][\ÜYY]HH[ÛÈKÈY	ÝÛË\ÛÛÜË[]IËX[	ÕÛÈÛÛÜÈ]IËXÙNL\ØÜ\[Û	ÕÛÈÛÛÜÈ\ÜYY]HH[ÛÚ]ÜÚ]Ý]ÝZ]\ÈKK\\Î[Ý\[\ÝY[\ÈÙ]HHÛÛÎÛHÛÛÈ]H	
L0­ÈÝ\ÝÛHÛÛÈ	
ÍL0­ÈÛÈÛÛÜÈ]H	KH
L	H\ÜÚ]\Ù\\È[Ý\]NÈH[[ÙH\È[ÚXÙYYÜH[Ý\][[Û\Ü\È[\ÛÛÛÈ\H\ÈÈ[[ÝHÜ[ÛÛ[ØØ][Û][[][H\È	
LÈ][^[Û][H\È][ÝY\H]HØØ[[ÛY[[Ý\ÝY\ÝÈÚ[[Y[X\[Û\Ü\È][Ý\ÙY[ËÙ[X][ÛÛÜÜ]H][Ú\ÚÙ\XÙHÜ]]H][Ú]ÜÚ]Ý]ÝZ]\ÛÚÙYHHÛÛÎÛHÛÛÈ]H	
L0­ÈÝ\ÝÛHÛÛÈ	
ÍL[ÜYÚ[[Ü][[ÙXÙYÜ[Ý\][0­ÈÛÈÛÛÜÈ]H	K[ÛY\ÎÉÓ]HØØ[\ÜX[ÙHH[ÛÚ]ÜÚ]Ý]ÝZ]\Ë	ÔÛÛÈÙ[XÝ[ÛÛÛÝ[][ÛË	ÐÝ\ÝÛHÛÛÎ[ÜYÚ[[Ü][[ÙXÙYÜ[Ý\][	Ë	ÓÛ[ØØ][Û][[][N	
L	×KKÂY	ÝØØ[ZÛÚÉË[YN	ÕHÛÚÉËØ]YÛÜN	Ù^XÝ][ÛË[ZÙT]	ÝØØ[ÉËXÙN	ÉÍL	ËXÙS[Y\XÎÍLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	ËYÛÎÉÜÛÛÝÜ][ÉË	Ü\ÚM	×K\\ÎÛÜÈÜ\N[ÝHÝÛHXÛÜ[ÈÙ[ÛÜÈØØ[Ü[Ý\ÛÛËY[ÛÜ]\È[H\XÜÈÜY[ÙKHÙY\È\ÈÜ]\Ú\KYÚ\Ý\YÚ]RK[[ÝHÛH[]Ú\H[HÛÜHY][È[\ÝY[ÈÙ\ÜÚ[ÛÈ]Z[XH[][KÜY][ÛÕÔ\ÛÛÈ[H[\Ý\Ë\HÛÚÈ]Ø\Y\È[Ý\XÛÜ[Û[]\È\È\ÈÝ]È[Ý\Ù^H[[\ËÚ]ÝX\È[YXËXYHÈÜ[È[Ý\Ù\ÜÚ[Û[]\Q^\ÎË]\Ú[ÛÎK[ÛY\ÎÉÕ\È\È\ÜYYH[ÛË	ÑÝX\È[YXÉË	ÓX]ÚYÈ[Ý\Ù^H[[\ÉË	ÑH[ØÙ\ÜÙYÐUÝ[\ÉË	ÌHÝ[Ù]\Ú[ÛÉË	Ó[\[Ý\ÈÜY]	×KÝ[ÛY\ÎÉÓZ^[È[X\Ý\[ÈÙH[ÛÛÉ×K\ÜÙ]ÓYYYÉÐX]ÜÙ\ÜÚ[Û[H
Ú]H[Ù^JIË	ÔY\[ÙHXÚÜÉË	Ó\XÜÈÜÛÛÙ\	×KKÂY	ÝØØ[YX]\IË[YN	ÕHX]\IËØ]YÛÜN	Ù^XÝ][ÛË[ZÙT]	ÝØØ[ÉËXÙN	É
ÍL	ËXÙS[Y\XÎ
ÍLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	ËX]\YYKYÛÎÉÜÛÛÝÜ][ÉË	Ü\ÚM	×K\\ÎÛÜÈÜ\N[ÝHÝÛHXÛÜ[ÈÙ[ÛÜÈØØ[Ü[Ý\ÛÛËY[ÛÜ]\È[H\XÜÈÜY[ÙKHÙY\È\ÈÜ]\Ú\KYÚ\Ý\YÚ]RK[[ÝHÛH[]Ú\H[HÛÜHY][È[\ÝY[ÈÙ\ÜÚ[ÛÈ]Z[XH[][KÜY]X][ÛÕÔ\ÛÛË\HÛÛ\]HX]\Y\ÜX[ÙHÛ[Ý\XÛÜHMX\\ÙH[HÛÚËÚ]XYËÝX\Ë\[ÛY\È[YXËÛÛ\Y[[YÜY]YX][ÛÕÔ\ÛÛË[]\Q^\Î
K]\Ú[ÛÎ[ÛY\ÎÉÌMX\\ÙH[ÛÚÉË	ÓXYØØ[ËÝX\Ë\[ÛY\È[YXÉË	ÐÛÛ\Y[[YÐUÝ[\ÉË	ÈX][ÛÕÔ\ÛÛÈÜY]	Ë	ÌÝ[ÈÙ]\Ú[ÛÉ×KÝ[ÛY\ÎÉÓZ^[È[X\Ý\[ÈÙH[ÛÛÉ×K\ÜÙ]ÓYYYÉÐX]ÜÙ\ÜÚ[Û[H
Ú]H[Ù^JIË	ÔY\[ÙHXÚÜÉË	Ó\XÜÈÜÛÛÙ\	×KKÂY	ÝØØ[\Ù\ÜÚ[ÛY[	Ë[YN	ÔÙ\ÜÚ[ÛØØ[È8 %[ÛÛÉËØ]YÛÜN	Ù^XÝ][ÛË[ZÙT]	ÝØØ[ÉËXÙN	ÉK	ËXÙS[Y\XÎLÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	ËYÛÎÉÜÛÛÝÜ][ÉË	Ü\ÚM	Ë	ÛÛ[ØØ][ÛX]	×K\\ÎÛÜÈÜ\N[ÝHÝÛHXÛÜ[ÈÙ[ÛÜÈØØ[Ü[Ý\ÛÛËY[ÛÜ]\È[H\XÜÈÜY[ÙKHÙY\È\ÈÜ]\Ú\KYÚ\Ý\YÚ]RK[[ÝHÛH[]Ú\H[HÛÜHY][È[\ÝY[ÈÙ\ÜÚ[ÛÈ]Z[XH[][KÜY][ÛÕÔ\ÛÛÈ[H[\Ý\Ë\[Ý\ÚÛHÛÛËÝ[È[\[ÙY[Û[]\ÈHXYØØ[HXÚÙÜÝ[\[Ù[Y[[H\[ÛHÝXÚÜËÚ\Y[H]H\XÝYÙ\ÜÚ[Û[]\Q^\Î
Ë]\Ú[ÛÎ[ÛY\ÎÉÑ[XYØØ[	Ë	ÐXÚÙÜÝ[ØØ[\[Ù[Y[	Ë	Ò\[ÛHÝXÚÜÉË	ÌH]H\XÝYÙ\ÜÚ[Û[[ÝHÜ[][IË	ÐÛÛ\Y[[YÐUÝ[\ÉË	ÌÝ[ÈÙ]\Ú[ÛÉË	Ó[\[Ý\ÈÜY]	×KÝ[ÛY\ÎÉÓZ^[È[X\Ý\[ÈÙH[ÛÛÉ×K\ÜÙ]ÓYYYÉÐX]ÜÙ\ÜÚ[Û[H
Ú]H[Ù^JIË	ÔY\[ÙHXÚÜÉË	Ó\XÜÈÜÛÛÙ\	×KKÂY	ÝØØ[\ÙXÝ[ÛË[YN	ÕØØ[ÙXÝ[Û8 %[Ý\ÚXÙIËØ]YÛÜN	Ù^XÝ][ÛË[ZÙT]	ÝØØ[ÉËXÙN	É
	ËXÙS[Y\XÎ
ÚXÚÛÝ][XYYKÚXÚÛÝ]Ø]YÛÜN	ÜÚXÝ	ËYÛÎÉÜÛÛÝÜ][ÉË	Ü\ÚM	Ë	ÛÛ[ØØ][ÛX]	×K\\Î[ÝHÝÛ]\][È[ÝHXÛÜY[ÛÜ]\È[H\XÜÈÜY[ÙKHÙY\È\ÈÜ]\Ú\KYÚ\Ý\YÚ]RK[[ÝHÛH[]Ú\H[HÛÜHY][È[\ÝY[ÈÙ\ÜÚ[ÛÈ]Z[XH[][KÜY][ÛÕÔ\ÛÛÈ
ØØ[ÙXÝ[ÛH[H[\Ý\Ë\[Ý\ÝÛÚXÙKÙXÙY]]È\Ý[Û\XÝÈHZÝ\Ù\ÜÚ[Û[H\Û¹5Ñ¡½°Ñ¡¸ÉÉ¹Ìå½ÕÈ¡Éµ½¹¥Ì¹½µÁÌ¹ÑÕ¹Ìå½ÕÈÙ½°¥¹Ñ¼±¸ÍÑµÌ¸°(±¥ÙÉååÌèÔ°(ÉÙ¥Í¥½¹ÌèÈ°(¥¹±ÕÌèlÈµ¡½ÕÈ¥ÉÑÍÍÍ¥½¸¥¸Ñ¡	¥ÉÍ½¹5Ñ¡½°!Éµ½¹äÉÉ¹µ¹Ð°
½µÁ¥¹¹ÑÕ¹¥¹°
±¹]XÍÑµÌ°ÈÉ½Õ¹Ì½ÉÙ¥Í¥½¹Ìt°(¹½Ñ%¹±ÕÌèl5¥á¥¹¹µÍÑÉ¥¹½Ñ¡Õ±°Í½¹t°(ÍÍÑÍ9èl	Ð½ÈÍÍÍ¥½¸¥±¡Ý¥Ñ 	A4¹­ä¤°IÉ¹ÑÉ­Ì°1åÉ¥Ì½È½¹ÁÐt°(ô°(ì(¥è±¥ÙµÍÑÉµ¥¹°(¹µè1¥ÙMÑÉµ¥¹MÑÕÀAÉ½ÕÑ¥½¸°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÌÀÀ½¡È°(ÁÉ¥9ÕµÉ¥èÌÀÀ°(±ÕÉèI°µÑ¥µµÕ±Ñ¤µÁ±Ñ½É´ÍÑÉµ¥¹Ñ¼e½ÕQÕ°%¹ÍÑÉ´°½½¬°½ÈQÝ¥Ñ ¸%¹±ÕÌÍÑÕÀ°µÉÍÝ¥Ñ¡¥¹°Õ¥¼µ¹µ¹Ð°±¥Ù¡Ðµ½¹¥Ñ½É¥¹°¹Õ¥¹¹µ¹ÐÑ¡É½Õ¡½ÕÐÑ¡É½ÍÐ¸°(ô°(ì(¥èÍ¡½ÉÐµ½É´µ½¹Ñ¹Ð°(¹µèI±Ì¼M¡½ÉÐµ½É´
½¹Ñ¹Ð°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÄÀÀ½Ñ °(ÁÉ¥9ÕµÉ¥èÄÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉè	Ñ ½Ô´ÄÀÍ¡½ÉÐµ½É´Ù¥½Ì¡Q¥­Q½¬°%¹ÍÑÉ´I±Ì°e½ÕQÕM¡½ÉÑÌ¤¸¥Ñ°ÁÑ¥½¹°¹½ÁÑ¥µ¥é½È Á±Ñ½É´¸°(ô°(ì(¥è¤µµ½Ñ¥½¸´ÌÀ°(¹µè$5½Ñ¥½¸ÉÁ¡¥ÌPÌÀM½¹Ì°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èØÀÀ°(ÁÉ¥9ÕµÉ¥èØÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉèÌÀµÍ½¹$µ¹ÉÑÙ¥¼P¥¹ÑÉ¼°¹¥µÑ½±±°½ÈÉ¹½¹Ñ¹Ð¸ÔÁÉµ¥Õ´ÑÌ°ÔÁÉµ¥Õ´ÑÉ¹Í¥Ñ¥½¹Ì°ÈÉÙ¥Í¥½¸É½Õ¹Ì¸Ìµ¡½ÕÈÁÉ½ÕÑ¥½¸Ñ¥µÐÈÀÀ½¡È¸°(ô°(ì(¥è¤µµ½Ñ¥½¸´ØÀ°(¹µè$5½Ñ¥½¸ÉÁ¡¥ÌPØÀM½¹Ì°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èàÀÀ°(ÁÉ¥9ÕµÉ¥èàÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉèØÀµÍ½¹$µ¹ÉÑÙ¥¼Ý¥Ñ à´ÄÀÁÉµ¥Õ´ÑÌ¹ÑÉ¹Í¥Ñ¥½¹Ì¸ÈÉÙ¥Í¥½¸É½Õ¹Ì¸	Õ¥±ÐÝ¥Ñ ÕÑÑ¥¹µ$Ñ½½±Ì¹¥ÑÑ¼É½ÍÐÍÑ¹ÉÌ¸°(ô°(ì(¥è¤µµ½Ñ¥½¸´ÄÈÀ°(¹µè$5½Ñ¥½¸ÉÁ¡¥ÌPUÀÑ¼È5¥¹ÕÑÌ°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÄ°ÈÀÀ°(ÁÉ¥9ÕµÉ¥èÄÈÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉèUÀÑ¼Èµµ¥¹ÕÑ$µ¹ÉÑÙ¥¼Ý¥Ñ à´ÄÀÁÉµ¥Õ´ÑÌ¹ÑÉ¹Í¥Ñ¥½¹Ì¸ÈÉÙ¥Í¥½¸É½Õ¹Ì¸
¥¹µÑ¥ÅÕ±¥ÑäÐÉÑ¥½¸½ÑÉ¥Ñ¥½¹°¹¥µÑ¥½¸½ÍÑÌ¸°(ô°(ì(¥èÙ¥¼µ¥Ðµ±ÉÑ°(¹µèY¥¼¥Ñ¥¹°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÈÔÀ½¡È°(ÁÉ¥9ÕµÉ¥èÈÔÀ°(±ÕÉèAÉ½ÍÍ¥½¹°Ù¥¼¥Ñ¥¹½Èá¥ÍÑ¥¹½½ÑPÕÑÌ°ÑÉ¹Í¥Ñ¥½¹Ì°ÉÁ¡¥Ì°½±½È°¹±¥ÙÉä¸	É¥¹Ñ¡½½Ñ°±ÙÝ¥Ñ ¥¹¥Í¡ÕÑÌ¸°(ô°((¼¼RR 	UM%9ML
=9Q9PRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR (ì(¥èÁ¥Ñ µ¬°(¹µèA¥Ñ ¬¬	ÕÍ¥¹ÍÌA±¸°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÈÔÀ°(ÁÉ¥9ÕµÉ¥èÈÔÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉè%¹ÙÍÑ½ÈµÉäÁ¥Ñ ¬¡ÕÀÑ¼ÄÈÍ±¥Ì¤Á±ÕÌÕ±°ÕÍ¥¹ÍÌÁ±¸½Õµ¹Ð¸9ÉÉÑ¥ÙÉ°Í¥¸°¥¹¹¥°½ÙÉÙ¥Ü°¹Í¬Í±¥PÙÉåÑ¡¥¹å½Ô¹Ñ¼Ý±¬¥¹Ñ¼Ñ¡É½½´Éä¸°(ô°(ì(¥è­å¹½ÑµÍ±¥Ì°(¹µè-å¹½Ñ¼MÁ­¥¹M±¥Ì°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÈÔÀ°(ÁÉ¥9ÕµÉ¥èÈÔÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉè
ÕÍÑ½´Í±¥¬½ÈÑ±­Ì°Ý½É­Í¡½ÁÌ°½ÈÁÉÍ¹ÑÑ¥½¹Ì¸Y¥ÍÕ°ÍÑ½ÉåÑ±±¥¹Ñ¡ÐµÁ±¥¥Ìå½ÕÈµÍÍP¹½Ð¹É¥ÑµÁ±ÑÌ¸°(ô°(ì(¥è½½¬µ½ÉµÐ°(¹µè	½½¬½ÉµÑÑ¥¹¬5É­Ñ¥¹1Õ¹ °(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÜÔÀ°(ÁÉ¥9ÕµÉ¥èÜÔÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉèAÉ½ÍÍ¥½¹°¥¹ÑÉ¥½È½ÉµÑÑ¥¹¬½ÙÈ±å½ÕÐ½È-@°%¹ÉµMÁÉ¬°½ÈÁÉ¥¹ÐPÁ±ÕÌÕ±°µÉ­Ñ¥¹±Õ¹ ÍÑÉÑä¹Í½¥°µ¥É½±±½ÕÐÁ±¸¸	Õ¥±Ð½ÈÉÑ¥ÍÑÌÝ¡¼¹Ñ¡¥È½½¬Ñ¼Í±°°¹½Ð©ÕÍÐá¥ÍÐ¸°(ô°(ì(¥è±±µ½ÉµÑ¥½¸°(¹µè11½ÉµÑ¥½¸¬	ÕÍ¥¹ÍÌ	¹­¥¹°(Ñ½ÉäèáÕÑ¥½¸°(ÁÉ¥èÈÔÀ°(ÁÉ¥9ÕµÉ¥èÈÔÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉè½¹µ½Èµå½Ô11ÁÁÉÝ½É¬°%8ÍÑÕÀ°ÕÍ¥¹ÍÌ¹­¥¹½¹¹Ñ¥½¸°¹½Õ¹ÐÕ¥¹PÙÉåÑ¡¥¹Ñ¼µ­å½ÕÈÉ¹±±±ä½ÁÉÑ¥½¹°¸±°µ¥¹±ÕÍ¥Ù¸°(ô°((¼¼RR 
=
!%959Q=IM!%@RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR (ì(¥èÙ½°µÑÉ¥¹¥¹°(¹µèY½°QÉ¥¹¥¹¡	¥ÉÍ½¹5Ñ¡½¤°(Ñ½ÉäèáÁÉ¥¹°(ÁÉ¥èÜÀÀ°(ÁÉ¥9ÕµÉ¥èÜÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉèÐµÍÍÍ¥½¸Ù½°½¡¥¹PÁÉ½©Ñ¥½¸°ÉÑ ½¹ÑÉ½°°ÁÉ½Éµ¹ÁÉÍ¹°¹Ù½¥ÁÉÍÉÙÑ¥½¸¸Q¡	¥ÉÍ½¹5Ñ¡½èÙ±½ÁÉ½´ÈÔ¬åÉÌ¥¸Ñ¡µÕÍ¥ÕÍ¥¹ÍÌ¸°(ô°(ì(¥èÉ½É¥¹µ½½Ñ °(¹µèI½É¥¹	½½Ñ QÉ¥¹¥¹°(Ñ½ÉäèáÁÉ¥¹°(ÁÉ¥èàÜÔ°(ÁÉ¥9ÕµÉ¥èàÜÔ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(±ÕÉèMÑÕ¥¼Ñ¥ÅÕÑÑ°µ¥Ñ¡¹¥ÅÕ°ÁÉ½ÕÈ±¹Õ°¹¡½ÜÑ¼ÐÑ¡ÍÐ½ÕÐ½ÙÉäÍÍÍ¥½¸¸½ÈÉÑ¥ÍÑÌÝ¡¼Ý¹ÐÑ¼Ý±¬¥¹Ñ¼¹äÍÑÕ¥¼Éä¸°(ô°(ì(¥èÉÑ¥ÍÐµÙ±½Áµ¹Ð°(¹µèÉÑ¥ÍÐÙ±½Áµ¹Ð°(Ñ½ÉäèáÁÉ¥¹°(ÁÉ¥èÉ½´Ä°ÀÀÀ°(ÁÉ¥9ÕµÉ¥èÄÀÀÀ°(±ÕÉè5Õ±Ñ¤µÝ¬µ¹Ñ½ÉÍ¡¥À½ÈÉÑ¥ÍÑÌÐÑ¡¥¹±Ñ¥½¸Á½¥¹Ð¸M½Õ¹°¥µ°ÕÍ¥¹ÍÌ°ÍÑÁÉÍ¹PÕ¥±ÐÉ½Õ¹å½ÕÈÙ¥Í¥½¸°¹½Ð½ÉµÕ±¸AÉ½ÁÉ¥ÑÉä¸AÉÍ½¹°¸IÍÕ±ÑÌµÉ¥Ù¸¸°(ô°(ì(¥è½¹ÍÕ±Ñ¥¹µ±°°(¹µèMÑÉÑä
±°°(Ñ½ÉäèáÁÉ¥¹°(ÁÉ¥èÌÜÔ°(ÁÉ¥9ÕµÉ¥èÌÜÔ°(±ÕÉèØÀµµ¥¹ÕÑ½¹µ½¸µ½¹±°Ñ¼µÀÍÁ¥¥¥Í¥½¸°ÁÉ¥ÁÉ½©Ð°Õ¹±½¬Ñ¡¹áÐµ½Ù°½ÈÕ¥±É½µÀ¸ÈÔåÉÌ½µÕÍ¥ÕÍ¥¹ÍÌ¥¹Í¥¡Ð¥¸½¹¡½ÕÈ¸°(ô°((¼¼RR 5UM%Y%<A
-LRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR (¼¼I±Ñ¥½¹Í¡¥ÀµÕ¥±¥¹ÉÑÌPÕ±°Í½¹°Õ±°Ù¥¼°½È½Ñ Ñ½Ñ¡È¸(¼¼Q¡ÍÉÑ¡¥¹ÑÉ¼ÁÉ¥ÌMÝÉÙ½ÉÌÑ¼¹Ü±¥¹ÑÌ¡ÌÕ¥±¥¹(¼¼±½¹µÑÉ´Ý½É­¥¹É±Ñ¥½¹Í¡¥ÀÝ¥Ñ ¸AÉµ¥Õ´Õ±°µÍÉÙ¥ÉÑÌÉ(¼¼¥¸Ñ¡µÕÍ¥µÁÉ½ÕÑ¥½¸¹µÕÍ¥µÙ¥¼¹ÑÉ¥Ì½Ù¸(ì(¥èÍ½¹µÁÉ½ÕÑ¥½¸µ¥¹ÑÉ¼°(¹µèM½¹AÉ½ÕÑ¥½¸°(Ñ½ÉäèáÕÑ¥½¸°(¥¹Ñ­AÑ èµÕÍ¥°(ÁÉ¥èÄ°ÀÀÀ°(ÁÉ¥9ÕµÉ¥èÄÀÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÄÐ°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉè½µÁ±Ñ°É±ÍµÉä½É¥¥¹°Í½¹PÕÍÑ½´¥¹ÍÑÉÕµ¹Ñ°°å½ÕÈÙ½±ÌÁÉ½Õ¹¥ÉÑ°µ¥á°µÍÑÉ°¹±¥ÙÉÝ¥Ñ ÙÉåÑ¡¥¹å½Ô¹Ñ¼É±Í¥Ð¸ÈµÝ¬ÑÕÉ¹É½Õ¹¸ÔÀÑ¼ÍÑÉÐ°ÔÀ½¸½µÁ±Ñ¥½¸¸°(¥¹±ÕÌèl(
ÕÍÑ½´½É¥¥¹°¥¹ÍÑÉÕµ¹Ñ°½Ð°(Y½°ÁÉ½ÕÑ¥½¸¥ÉÑ¥½¸¡½¡¥¹¥¹±Õ¤°(5¥á¥¹°(5ÍÑÉ¥¹°(MÍÍ¥½¸ÍÑµÌ±¥ÙÉ ¹ÝØ¤°(MÁ±¥ÐÍ¡Ð½ÈÍå¹±¥¹Í¥¹°(
½ÁåÉ¥¡Ð½¹±¥¹¥ÍÑÉ¥ÕÑ¥½¸Õ¥¹°(ÈÉ½Õ¹Ì½ÉÙ¥Í¥½¹Ì°(t°(¹½Ñ%¹±ÕÌèl5ÕÍ¥Ù¥¼¡ÍM½¹¬Y¥¼	Õ¹±PÈ°ÀÀÀ¤°1åÉ¥ÝÉ¥Ñ¥¹¡¸¤t°(ÑÉµÌè]½É¬½È¡¥Éèå½Ô½Ý¸Ñ¡¥¹¥Í¡µÍÑÈ¸ÔÀÁ½Í¥ÐÍÕÉÌå½ÕÈÍÍÍ¥½¸ìÑ¡±¹¥ÌÕ½¸±¥ÙÉä¸ÈµÝ¬ÑÕÉ¹É½Õ¹É½´Á½Í¥ÐÑ¸
É¥ÐèAÉ½Õäi¥½¸M]IX	¥ÉÍ½¹¸°(ÍÍÑÍ9èlY½¥µµ¼½å½ÕÈµ±½ä½È½¹ÁÐ¡Ù¸É½Õ ¤°IÉ¹ÑÉ­Ì½ÈÍ½Õ¹¥ÉÑ¥½¸°1åÉ¥Ì½È½¹ÁÐ¹½ÑÌt°(ô°(ì(¥èµÕÍ¥µÙ¥¼µ¥¹ÑÉ¼°(¹µè5ÕÍ¥Y¥¼°(Ñ½ÉäèáÕÑ¥½¸°(¥¹Ñ­AÑ èÙ¥¼°(ÁÉ¥èÄ°ÔÀÀ°(ÁÉ¥9ÕµÉ¥èÄÔÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÈÄ°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉèÕ±°Ìµµ¥¹ÕÑµÕÍ¥Ù¥¼°Í¡½Ð¹ÁÉ½ÕPÁ±ÕÌ¡¥¹µÑ¡µÍ¹Ì½½Ñ½È½Õµ¹ÑÉä½ÈÙ±½°ÄÀÑ,¥ÑÁ¡½Ñ½Ì½ÈÍ½¥°°¹ÄÀÉ±ÌÕÐÉ½´å½ÕÈÍ¡½½Ð¸ÙÉåÑ¡¥¹å½Ô¹Ñ¼É½ÀÁÉ½©Ð¸°(¥¹±ÕÌèl(Ìµµ¥¹ÕÑµÕÍ¥Ù¥¼°Õ±±äÁÉ½Õ°(	¡¥¹µÑ¡µÍ¹Ì½½Ñ¡½Õµ¹ÑÉä½Ù±½Éä¤°(ÄÀÑ,¥ÑÁ¡½Ñ½Ì½ÈÍ½¥°µ¥°(ÄÀÉ±ÌÕÐÉ½´å½ÕÈÙ¥¼Í¡½½Ð°(ÈÉ½Õ¹Ì½ÉÙ¥Í¥½¹Ì°(t°(¹½Ñ%¹±ÕÌèlM½¹ÁÉ½ÕÑ¥½¸¡ÍM½¹¬Y¥¼	Õ¹±PÈ°ÀÀÀ¤°M½¹µÕÍÐ¥¹°µ¥à½µÍÑÉ½ÉÍ¡½½Ðät°(ÑÉµÌèÔÀÁ½Í¥ÐÍÕÉÌå½ÕÈÍ¡½½ÐÑìÑ¡±¹¥ÌÕ½¸±¥ÙÉä¸¥¹°µ¥á¹µÍÑÉÍ½¹µÕÍÐÁÉ½Ù¥½ÉÁÉ½ÕÑ¥½¸¥¹Ì¸°(ÍÍÑÍ9èl5ÍÑÉÍ½¹¥± ¹ÝØ½È¹µÀÌ¤°
½¹ÁÐ½ÈÑÉÑµ¹Ð¥Ì¡Ù¸É½Õ ¤°1½Ñ¥½¸¥Ì½Èµ½½½É°ÉÑ¥ÍÐÉÉ¹Á¡½Ñ½Ìt°(ô°(ì(¥èÍ½¹µÙ¥¼µÕ¹±°(¹µèM½¹¬Y¥¼	Õ¹±°(Ñ½ÉäèáÕÑ¥½¸°(¥¹Ñ­AÑ èµÕÍ¥°(ÁÉ¥èÈ°ÀÀÀ°(ÁÉ¥9ÕµÉ¥èÈÀÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÈà°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉèQ¡Õ±°Á­P½É¥¥¹°Í½¹ÁÉ½Õ¹µÍÑÉ°Á±ÕÌÕ±°Ìµµ¥¹ÕÑµÕÍ¥Ù¥¼°	QL½½Ñ°ÄÀÑ,Á¡½Ñ½Ì°¹ÄÀÉ±Ì¸ÔÀÀ½Ý¡¸å½Ô½½¬½Ñ Ñ½Ñ¡È¸Q¡¥Ì¥ÌÑ¡É±Ñ¥½¹Í¡¥ÀµÕ¥±¥¹ÁÉ¥P½ÈÉÑ¥ÍÑÌÉäÑ¼Õ¥±Í½µÑ¡¥¹É°¸°(¥¹±ÕÌèl(ÙÉåÑ¡¥¹¥¸M½¹AÉ½ÕÑ¥½¸ Ä°ÀÀÀÙ±Õ¤°(ÙÉåÑ¡¥¹¥¸5ÕÍ¥Y¥¼ Ä°ÔÀÀÙ±Õ¤°(ÔÀÀÍÙ¥¹ÌÙÌ¸½½­¥¹ÍÁÉÑ±ä°(
ÕÍÑ½´¥¹ÍÑÉÕµ¹Ñ°°Ù½±ÌÁÉ½Õ¥ÉÑ°(5¥á¥¹µÍÑÉ¥¹°(MÍÍ¥½¸ÍÑµÌ¬ÍÁ±¥ÐÍ¡Ð°(
½ÁåÉ¥¡Ð¥ÍÑÉ¥ÕÑ¥½¸Õ¥¹°(Ìµµ¥¸µÕÍ¥Ù¥¼°	QL½½Ñ°(ÄÀÑ,¥ÑÁ¡½Ñ½Ì¬ÄÀÉ±Ì°(t°(¹½Ñ%¹±ÕÌèl1åÉ¥ÝÉ¥Ñ¥¹¡¸¤t°(ÑÉµÌèÔÀÁ½Í¥ÐÍÕÉÌå½ÕÈÁÉ½©ÐìÑ¡±¹¥ÌÕ½¸±¥ÙÉä¸M½¹¥ÌÁÉ½Õ¥ÉÍÐ ÈÝ­Ì¤°Ñ¡¸Ñ¡Ù¥¼Í¡½½ÑÌ½¹Ñ¡µÍÑÈ¥Ì½¹¸Q½Ñ°±¥ÙÉäèøÐÝ­Ì¸
É¥ÐèAÉ½Õäi¥½¸M]IX	¥ÉÍ½¹¸°(ÍÍÑÍ9èlY½¥µµ¼½å½ÕÈµ±½ä½È½¹ÁÐ°IÉ¹ÑÉ­Ì°1åÉ¥Ì½È½¹ÁÐ¹½ÑÌt°(ô°(ì(¥èÍ½¥°µ½¹Ñ¹Ðµ¥±ä°(¹µèM½¥°5¥P¥±ä
½¹Ñ¹Ð°(Ñ½Éäè¥¹Ñ¥Ñä°(¥¹Ñ­AÑ èÍ½¥°°(ÁÉ¥èÈÀÀ½µ¼°(ÁÉ¥9ÕµÉ¥èÈÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½Éäèµ½¹Ñ¡±ä°(±¥ÙÉååÌèÀ°(±ÕÉèe½ÕÈ½¹Ñ¹ÐÁÕÍ¡ÏLÔÑ¥µÌ¥±äÐÁ¬Í½¥°ÑÉ¥Ñ¥µÌ¸]¡¹±Ñ¡Í¡Õ±¥¹°ÁÑ¥½¹Ì°¹½¹Í¥ÍÑ¹äPå½Ô¡¹±Ñ¡ÕÍ¥¹ÍÌ¸5½¹Ñ µÑ¼µµ½¹Ñ °¹°¹åÑ¥µ¸°(¥¹±ÕÌèl(
½¹Ñ¹ÐÁ½ÍÑÏLÕà¥±äÐÁ¬ÑÉ¥Ñ¥µÌ°(
ÁÑ¥½¹Ì¹¡Í¡ÑÍÑÉÑä°(%¹ÍÑÉ´¡ÁÉ¥µÉäÁ±Ñ½É´¤°(A½ÍÑ¥¹Í¡Õ±Õ¥±ÐÉ½Õ¹å½ÕÈÕ¥¹°(5½¹Ñ µÑ¼µµ½¹Ñ P¹¼±½¹µÑÉ´½¹ÑÉÐ°(t°(¹½Ñ%¹±ÕÌèl
½¹Ñ¹ÐÉÑ¥½¸¡å½ÔÁÉ½Ù¥Ñ¡Á¡½Ñ½Ì½Ù¥½Ì¤°A¥ÍÁ¹°5Õ±Ñ¥Á±Á±Ñ½É´µ¹µ¹Ð¡ÍM½¥°	É¹5¹µ¹ÐPÔÀÀ½µ¼¤t°(ÑÉµÌè5½¹Ñ µÑ¼µµ½¹Ñ ¸¥ÉÍÐµ½¹Ñ ¥±±Ð¡­½ÕÐìÍµÑÙÉäµ½¹Ñ ÑÈ¸
¹°½Éå½ÕÈ¹áÐ¥±±¥¹ÑÐ¥¹½ÍÝÉÙ½¹Ñ¡¼¹ÁÉ¼¸
½¹Ñ¹ÐµÕÍÐÁÉ½Ù¥äå½ÔPÑ¡¥ÌÁ±¸¡¹±ÌÍ¡Õ±¥¹¹ÁÑ¥½¹Ì°¹½Ð½¹Ñ¹ÐÉÑ¥½¸¸°(ÍÍÑÍ9èle½ÕÈ%¹ÍÑÉ´¡¹±¹ÍÌ¡Ù¥5Ñ	ÕÍ¥¹¹ÍÌMÕ¥Ñ¤°e½ÕÈÉ¹Õ¥±¥¹Ì¼Ù½¥°QÉÐÕ¥¹Ñ¥±Ìt°(¹½ÑèQ¡µ½É½¹ÑáÐå½Ô¥Ù°Ñ¡ÑÑÈå½ÕÈ½¹Ñ¹Ð¸]p°Ñ¥±½ÈÑ½¹°ÍÑå±°¹Á½ÍÐÑ¥µ¥¹Ñ¼å½ÕÈÍÁ¥¥Õ¥¹¸°(ô°)ôì((¼¼ôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôô(¼¼M
Q%=8ÌPMIY%
L(¼¼ôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôôô((¼¼´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´(¼¼Ì¸ÄQ¡ÍÉÙ¥Ñ±½(¼¼´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´(¼¨¨(¨±°ÍÉÙ¥Ìå½Ô½È¸ ¹ÑÉä¹Ìè(¨¥PÕ¹¥ÅÕÍ±Õ¡Í¹­µÍ½È­µÍ¤(¨¹µ´Í¡½Ý¸¥¸U$(¨Ñ½ÉäPÑ¥ÌÑ¼MIY%
}
Q=I%L¹¥(¨¥¹Ñ­AÑ PµÑ¡Ì%9Q-}AQ!L­ä(¨ÁÉ¥P¥ÍÁ±äÍÑÉ¥¹ ÌÀÀ½ÈÌÀÀ½µ¼°Ñ¸¤(¨ÁÉ¥9ÕµÉ¥P¹ÕµÈ¡Íµ½¹Ñ¡±ä½ÈÁÉ½©Ð½ÍÐ¥¸UM¤(¨¡­½ÕÑ¹±PÑÉÕô½½­¥¹±½ÜÑ¥Ù(¨¡­½ÕÑ
Ñ½ÉäPÁÉ½©Ððµ½¹Ñ¡±äðÍÍÍ¥½¸(¨±¥ÙÉååÌP¡½ÁÑ¥½¹°¤¹ÕµÈ(¨ÉÙ¥Í¥½¹ÌP¡½ÁÑ¥½¹°¤¹ÕµÈ(¨¥¹±ÕÌP¡½ÁÑ¥½¹°¤ÍÑÉ¥¹mt(¨±ÕÉP¡½ÁÑ¥½¹°¤Í¡½ÉÐÍÉ¥ÁÑ¥½¸(¨ÑÉµÌ´¡½ÁÑ¥½¹°¤½Ý¹ÉÍ¡¥À¼±°¹½Ñ(¨ÑÕÉP¡½ÁÑ¥½¹°¤Í¡½Ü½¸¡½µÁ(¨¼)áÁ½ÉÐ½¹ÍÐ11}MIY%
Lôl(ì(¥è¥¹Ñ¥ÑäµÁ­°(¹µè%¹Ñ¥ÑäA­°(Ñ½Éäè¥¹Ñ¥Ñä°(¥¹Ñ­AÑ è¥¹Ñ¥Ñä°(ÁÉ¥èÌÀÀ°(ÁÉ¥9ÕµÉ¥èÌÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÜ°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉè1½¼°½±½ÉÌ°¹½¹ÐPÙÉåÑ¡¥¹å½Ô¹Ñ¼±½½¬±¥­É¹¸°(¥¹±ÕÌèl(1½¼Í¥¸¡ÁÉ¥µÉä¬ÙÉ¥¹ÑÌ¤°(
½±½ÈÁ±ÑÑ°(QåÁ½ÉÁ¡äÍåÍÑ´°(	É¹Õ¥±¥¹ÌA°(t°(ô°(ì(¥èÝÍ¥ÑµÁ±Ñ½É´°(¹µè]Í¥ÑA±Ñ½É´°(Ñ½Éäè¥¹Ñ¥Ñä°(¥¹Ñ­AÑ èÝÍ¥Ñ°(ÁÉ¥èÔÀÀ°(ÁÉ¥9ÕµÉ¥èÔÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÄÐ°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉèÕÍÑ½´Õ¥±ÐÝÍ¥Ñ°Í¥¹¹±Õ¹¡¸°(¥¹±ÕÌèl(UÀÑ¼ÔÁÌ°(5½¥±µÉÍÁ½¹Í¥ÙÍ¥¸°(	Í¥M<ÍÑÕÀ°(
½¹ÑÐ½É´°(t°(ô°(ì(¥èÍ½¥°µ½¹Ñ¹Ðµ¥±ä°(¹µèM½¥°5¥P¥±ä
½¹Ñ¹Ð°(Ñ½Éäè¥¹Ñ¥Ñä°(¥¹Ñ­AÑ èÍ½¥°°(ÁÉ¥èÈÀÀ½µ¼°(ÁÉ¥9ÕµÉ¥èÈÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½Éäèµ½¹Ñ¡±ä°(±ÕÉèe½ÕÈ½¹Ñ¹ÐÁÕÍ¡ÏLÔÑ¥µÌ¥±ä¸]¡¹±ÁÑ¥½¹Ì°¡Í¡ÑÌ°¹Í¡Õ±¥¹¸°(¥¹±ÕÌèl(Ì´ÔÁ½ÍÑÌÁÈä°(
ÁÑ¥½¹Ì¬¡Í¡ÑÌ°(M¡Õ±ÅÕÕ°(5½¹Ñ¡±äÁÉ½Éµ¹ÉÁ½ÉÐ°(t°(ô°(ì(¥èÍ½¹µÁÉ½ÕÑ¥½¸µ¥¹ÑÉ¼°(¹µèM½¹AÉ½ÕÑ¥½¸°(Ñ½ÉäèáÕÑ¥½¸°(¥¹Ñ­AÑ èµÕÍ¥°(ÁÉ¥èÄ°ÀÀÀ°(ÁÉ¥9ÕµÉ¥èÄÀÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÄÐ°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉè½µÁ±Ñ°É±ÍµÉä½É¥¥¹°Í½¹ÝÉ¥ÑÑ¸°ÁÉ½Õ°¹µ¥á½Èå½Ô¸°(¥¹±ÕÌèl(=É¥¥¹°½µÁ½Í¥Ñ¥½¸±åÉ¥Ì°(Õ±°ÁÉ½ÕÑ¥½¸¬µ¥à°(]Ø¬5@Ì±¥ÙÉ±Ì°(ÈÉÙ¥Í¥½¸É½Õ¹Ì°(t°(ÑÉµÌè]½É¬½È¡¥Éèe½Ô½Ý¸Ñ¡¥¹¥Í¡µÍÑÈ¸°(ô°(ì(¥èµÕÍ¥µÙ¥¼µ¥¹ÑÉ¼°(¹µè5ÕÍ¥Y¥¼°(Ñ½ÉäèáÕÑ¥½¸°(¥¹Ñ­AÑ èÙ¥¼°(ÁÉ¥èÄ°ÔÀÀ°(ÁÉ¥9ÕµÉ¥èÄÔÀÀ°(¡­½ÕÑ¹±èÑÉÕ°(¡­½ÕÑ
Ñ½ÉäèÁÉ½©Ð°(ÑÕÉèÑÉÕ°(±¥ÙÉååÌèÈÄ°(ÉÙ¥Í¥½¹ÌèÈ°(±ÕÉèÕ±°Ìµ¥¹ÕÑµÕÍ¥Ù¥¼°Í¡½Ð°¥Ñ°½±½ÈµÉ°¹ÉäÑ¼ÕÁ±½¸°(¥¹±ÕÌèl(AÉµÁÉ½ÕÑ¥½¸Á±¹¹¥¹°(=¸µ±½Ñ¥½¸Í¡½½Ð°(AÉ½ÍÍ¥½¹°¥Ð¬½±½ÈÉ°(ÈÉÙ¥Í¥½¸É½Õ¹Ì°(t°(ô°(ì(¥èÍ½¹µÙ¥¼µÕ¹±°(¹µèM½¹¬Y¥¼	Õ¹±°(Ñ½ÉäèáÕÑ¥½¸°(¥¹Ñ­AÑ èµÕÍ¥°(ÁÉ¥èÈ°  previewUrl: '/templates/presence-example.html', previewLabel: 'Marcus Hill, LLC â Tax & Financial Services' },
  { id: 'tpl-bold-drop',   name: 'The Bold Drop', style: 'Dark, loud, streetwear energy', bestFor: 'Brands, apparel, culture drops', bg: '#0d0d0d', ink: '#ffffff', accent: '#ff4d00', font: 'sans', layout: 'hero',
    previewUrl: 'https://swrvonthego.pro', previewLabel: 'SWRV On The Go â Full brand experience' },
  { id: 'tpl-gallery',     name: 'The Gallery', style: 'Image-first grid, zero clutter', bestFor: 'Photographers, artists, models', bg: '#111111', ink: '#eeeeee', accent: '#c8a84b', font: 'sans', layout: 'grid',
    previewUrl: '/templates/ecosystem-example.html', previewLabel: 'VANTA Creative â Roster + portfolio grid' },
  { id: 'tpl-storefront',  name: 'The Storefront', style: 'Product cards, clean checkout flow', bestFor: 'Shops, merch, small product lines', bg: '#ffffff', ink: '#222222', accent: '#2f7d5c', font: 'sans', layout: 'grid',
    previewUrl: '/templates/platform-example.html', previewLabel: 'Kofi Ware Music â Beats & booking commerce' },
  { id: 'tpl-booking-pro', name: 'The Booking Pro', style: 'Services up top, calendar built in', bestFor: 'Barbers, coaches, trainers, studios', bg: '#f4f2ee', ink: '#20242c', accent: '#3d5a80', font: 'sans', layout: 'split',
    previewUrl: 'https://trainbyob.me', previewLabel: 'TrainBYOB â Coaching site with booking' },
  { id: 'tpl-stage',       name: 'The Stage', style: 'Full-bleed hero, music player ready', bestFor: 'Artists, bands, performers', bg: '#08060c', ink: '#f5f0ff', accent: '#9d4edd', font: 'sans', layout: 'hero',
    previewUrl: '/apps/birdsong-method.html', previewLabel: 'The Birdsong Method â Artist platform' },
  { id: 'tpl-table',       name: 'The Table', style: 'Warm tones, menu-forward', bestFor: 'Restaurants, food trucks, caterers', bg: '#fdf6ec', ink: '#3a2a1a', accent: '#c87941', font: 'serif', layout: 'list',
    previewUrl: '/templates/presence-example.html', previewLabel: 'Marcus Hill, LLC â Warm, list-driven layout' },
  { id: 'tpl-pulpit',      name: 'The Pulpit', style: 'Welcoming, community-centered', bestFor: 'Churches, ministries, nonprofits', bg: '#fffdf7', ink: '#2c2418', accent: '#8b6f3e', font: 'serif', layout: 'centered',
    previewUrl: 'https://swrv-on-bs-bible.swrvonthego.workers.dev/', previewLabel: 'The SWRV No BS Bible â Community-centered' },
  { id: 'tpl-launchpad',   name: 'The Launchpad', style: 'One page, countdown, email capture', bestFor: 'Launches, events, pre-orders', bg: '#0a1128', ink: '#e8ecf4', accent: '#00d1b2', font: 'mono', layout: 'centered',
    previewUrl: '/apps/byob-timer.html', previewLabel: 'BYOB Timer â Focused single-purpose page' },
  { id: 'tpl-boss-card',   name: 'The Boss Card', style: 'One-page personal brand hub', bestFor: 'Creators, speakers, link-in-bio upgrade', bg: '#16121c', ink: '#f2eef8', accent: '#e8c96a', font: 'sans', layout: 'list',
    previewUrl: 'https://spa-patrol.swrvonthego.workers.dev', previewLabel: 'MyPatrol â Personal branded hub' },
];


// ââ SERVICE SUB-CATEGORIES â premium organized taxonomy ââââ
// Groups the Ã  la carte SERVICES catalog into shopper-friendly buckets
// (video, audio, web, etc.) for display in the Marketplace and Services Menu.
export interface SubCategory {
  id: string;
  label: string;
  tagline: string;
  emoji: string;
  // Which intake question set (intake.config.ts) every service listed in
  // this category gets. Adding a service to serviceIds below is all it
  // takes for it to get the right intake â no second list to update.
  intakePath: IntakePath;
  serviceIds: string[];
  // Optional short note with a link, shown under the category header.
  note?: { text: string; linkLabel: string; to: string };
}

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
    intakePath: 'vocals',
    serviceIds: ['vocal-live-event', 'vocal-hook', 'vocal-feature', 'vocal-session-full', 'vocal-production'],
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
    emoji: 'ðµ',
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
    emoji: 'ð¯',
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


// ââ WEB PACKAGES âââââââââââââââââââââââââââââââââââââââââââ
// Removed â website tiers live in WEB_PACKAGE_TIERS (the one the site renders).

// ââ FOOTER âââââââââââââââââââââââââââââââââââââââââââââââââ
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
  copyright: `Â© ${new Date().getFullYear()} SWRV On The Go. All rights reserved.`,
} as const;

// ââ CONTACT / SCHEDULING âââââââââââââââââââââââââââââââââââ
export const CONTACT = {
  // Generic topics for the "let's talk" calendar â Roadmap and BYOB scheduling
  // can override with their own topic lists.
  topics: [
    { id: 'roadmap', label: 'Roadmap / Brand Planning' },
    { id: 'website', label: 'Website Project' },
    { id: 'consult', label: 'Strategy Call' },
    { id: 'artist-dev', label: 'Artist Development' },
    { id: 'other', label: 'Something Else' },
  ],
} as const;


// ââ HERO CAROUSEL ââââââââââââââââââââââââââââââââââââââââââ
// The two scrolling columns of cards in the Hero. Each card has an
// image OR video, a title, and an optional subtitle (small label).
// Add/remove cards freely â the component scales.
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
  title: { line1: 'SWRV', line2: 'MEDIA STRATEGIST.' },
  taglineHeading: '"Swrv On Roadblocks. Let Love GPS." â SWRV Birdsong',
  taglineAccent: '',
  taglineBody:
    'When you\'re driven by your passion, we\'re the central hub for your content solutions.',
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

// ââ INTRO VIDEOS âââââââââââââââââââââââââââââââââââââââââââ
export const INTRO_VIDEOS = {
  // Full-screen takeover that plays before the page is interactive
  primary:
    'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/SWRV_WEB_4k_gifq4n_u5zwta.mp4',
  // Secondary intro that plays after the primary shrinks
  secondary:
    'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/copy_506106AC-E7D2-4CDF-A553-6E2DC5A6894F_ckn5nm_cynppw.mov',
} as const;

// ââ SCHEDULING (Calendar / Contact form) âââââââââââââââââââ
export const SCHEDULING: {
  contactEmail: string;
  availableDays: number[];
  timeSlots: string[];
  topics: string[];
} = {
  contactEmail: 'info@swrvonthego.pro',
  // Days you're available (0=Sun, 1=Mon, ... 6=Sat). Default MonâSat.
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

// ââ WEB PACKAGE NOTES (universal disclaimers shown under tiers) ââ
export const WEB_PACKAGE_NOTES = [
  'Every website needs: a logo, a vision statement, a mission statement, images, and video content',
  'Don\'t have those yet? Tell us when you book â we\'ll help you pull them together',
  'Domain & hosting not included â we walk you through setup (~$15/yr domain, ~$10â20/mo hosting)',
  'You own your site 100% after delivery â no lock-in, no hidden fees',
  '50% deposit required to begin Â· 50% due on final delivery',
] as const;


// ââ WEB PACKAGE TIERS (rich tier data) ââââââââââââââââââââââ
// The 3-tier comparison shown on the Web Packages section.
// Icons are referenced by name (component maps name â lucide icon).
// Available icon names: 'Globe', 'Zap', 'Rocket', 'Star', 'Compass', 'Sparkles'
export interface WebPackageTier {
  id: string;
  name: string;
  price: number;
  iconName: 'Globe' | 'Zap' | 'Rocket' | 'Star' | 'Compass' | 'Sparkles';
  tagline: stringì(èÍÑÉ¥¹ð¹Õ±°ì(ÍÑ½ÈèÍÑÉ¥¹ì(±¥ÙÉååÌèÍÑÉ¥¹ì(ÉÙ¥Í¥½¹ÌèÍÑÉ¥¹ì(¥¹±ÕÌèÍÑÉ¥¹mtì(=¹Ìèì±°èÍÑÉ¥¹ìÁÉ¥èÍÑÉ¥¹õmtð¹Õ±°ì(¹½ÑèÍÑÉ¥¹ì(½±½ÈèÍÑÉ¥¹ì¼¼Ñ¥±Ý¥¹½ÉÈ±ÍÌ(¹Ñ
½±½ÈèÍÑÉ¥¹ì¼¼Ñ¥±Ý¥¹ÑáÐ±ÍÌ(	èÍÑÉ¥¹ì¼¼Ñ¥±Ý¥¹±ÍÌ(ÑèÍÑÉ¥¹ì(±¥ÙáµÁ±üèì¼¼½ÁÑ¥½¹°±¥Ùµ¼ÁÉÙ¥Ü(ÕÉ°èÍÑÉ¥¹ì¼¼¸áÑÉ¹°±¥¹¬½È½ÑµÁ±ÑÌ½ááà¹¡Ñµ°(±°èÍÑÉ¥¹ì¼¼M1¥ÙáµÁ±H(ÍÉ¥ÁÑ¥½¸èÍÑÉ¥¹ì¼¼±¥Ù11ÁÉÍ¹Á(ôì)ô()áÁ½ÉÐ½¹ÍÐ]	}A
-}Q%ILè]A­Q¥Émtôl(ì(¥èÁÉÍ¹°(¹µèQ!AIM9
°(ÁÉ¥èÌÀÀ°(¥½¹9µè±½°(Ñ±¥¹èQ¡ÌÀÀÝÍ¥ÑÍÁ¥°¸1¥Ù¥¸ÔåÌ¸°(èQ!ÌÀÀMA
%0°(ÍÑ½ÈèÉÑ¥ÍÑÌ°11¡½±ÉÌ°½¡Ì°¹ÉÑ¥ÙÌÝ¡¼¹±¸°ÁÉ½ÍÍ¥½¹°Á½ÈÕ¹¥¹ÁÁÌ°¥¹ÙÍÑ½È­Ì°Á½ÉÑ½±¥¼Í¡½ÝÍÌ°½ÈÁÉ½Ù¥¹å½Ôá¥ÍÐ½¹±¥¹¸°(±¥ÙÉååÌèÔµäÑÕÉ¹É½Õ¹°(ÉÙ¥Í¥½¹ÌèÄÉ½Õ¹°(¥¹±ÕÌèl(
ÕÍÑ½´Í¥¹±µÁÉÍÁ½¹Í¥ÙÝÍ¥Ñ¡Í­Ñ½À¬µ½¥±¤°(	¥¼¼½ÕÐÍÑ¥½¸°(A½ÉÑ½±¥¼¼Ý½É¬Í¡½ÝÍ°(A¡½Ñ¼±±ÉäPÕÀÑ¼à¥µÌ¡å½ÔÁÉ½Ù¥¤°(±°Í½¥°µ¥ÁÉ½¥±±¥¹­Ì°(
½¹ÑÐ½É´¡µ¥°µ±¥¹­°¹¼ÍÁ´¤°(M<ÍÑÕÀèÁÑ¥Ñ±°µÑÍÉ¥ÁÑ¥½¸°=Á¸ÉÁ ÑÌ°(½½±¹±åÑ¥Ì¥¹ÍÑ±±Ñ¥½¸°(e½ÕÈ±½¼É¹½±½ÉÌÁÁ±¥°(t°(=¹Ìè¹Õ±°°(¹½Ñèe½ÔÁÉ½Ù¥è±½¼°Ù¥Í¥½¸ÍÑÑµ¹Ð°µ¥ÍÍ¥½¸ÍÑÑµ¹Ð°¥µÌ°¹Í¡½ÉÐ¥¼¸9¼±½¼½ÈÙ¥Í¥½¸åÐüQ±°ÕÌÝ¡¸å½Ô½½¬¹Ýp±°¡±À¸°(½±½Èè½ÉÈµÝ¡¥Ñ¼ÄÀ°(¹Ñ
½±½ÈèÑáÐµÝ¡¥Ñ°(	è°(ÑèÐQ¡AÉÍ¹°(±¥ÙáµÁ±èì(ÕÉ°è½ÑµÁ±ÑÌ½ÁÉÍ¹µáµÁ±¹¡Ñµ°°(±°èM1¥ÙAÉÍ¹áµÁ±H°(ÍÉ¥ÁÑ¥½¸èÉ°11ÁÉÍ¹ÁP±¸°ÁÉ½ÍÍ¥½¹°°Éä½ÈÕ¹¥¹ÁÁÌ½ÈÁ½ÉÑ½±¥¼±¥¹­Ì¸°(ô°(ô°(ì(¥èÁ±Ñ½É´°(¹µèQ!A1Q=I4°(ÁÉ¥èÔÀÀ°(¥½¹9µèiÀ°(Ñ±¥¹èM±°¸	½½¬¸Q±°å½ÕÈÍÑ½Éä¸°(è5=MPA=AU1H°(ÍÑ½Èè
ÉÑ½ÉÌ°½¡Ì°ÍÉÙ¥ÁÉ½Ù¥ÉÌ°¹Íµ±°ÕÍ¥¹ÍÍÌÉäÑ¼Ñ­Áåµ¹ÑÌ°½½¬±¥¹ÑÌ°¹µ­¥¹µÑ¥¥ÉÍÐ¥µÁÉÍÍ¥½¸¸°(±¥ÙÉååÌèÄµÝ¬ÑÕÉ¹É½Õ¹°(ÉÙ¥Í¥½¹ÌèÈÉ½Õ¹Ì°(¥¹±ÕÌèl(ÙÉåÑ¡¥¹¥¸Q¡AÉÍ¹°(Õ±°Á½ÉÑ½±¥¼ÍÑ¥½¸°(MÑ½ÉÉ½¹Ð¬¹PÍ±°ÁÉ½ÕÑÌ½ÈÍÉÙ¥Ì¡ÕÀÑ¼Ì±¥ÍÑ¥¹Ì¤°(MÑÉ¥ÁÁåµ¹Ð¥¹ÑÉÑ¥½¸PÉÌ°ÁÁ±Aä°½½±Aä°Õäµ¹½ÜµÁäµ±ÑÈ°(	½½­¥¹¼¥¹ÅÕ¥Éä½É´Ý¥Ñ ÍÉÙ¥Ñ½ÉäÍ±Ñ¥½¸°(µ¥°±¥ÍÐÁÑÕÉ¡¹ÝÍ±ÑÑÈÍ¥¸µÕÀ¥¹ÑÉÑ¥½¸¤°(QÍÑ¥µ½¹¥±ÌÍ½¥°ÁÉ½½ÍÑ¥½¸°(ØÃLäÀÍ½¹ÕÍÑ½´É¹¥¹ÑÉ¼Ù¥¼P¥¹±ÕÌè°(
ÜMÉ¥ÁÐÝÉ¥Ñ¥¹¡å½ÕÈÍÑ½Éä¬Ý¡Ðå½ÔÍÑ¹½È¤°(
Ü
¥¹µÑ¥Ù½¥½ÙÈ¡ÁÉ½ÍÍ¥½¹°°ÁÉ½ÕäM]IX¤°(
Ü=É¥¥¹°­É½Õ¹µÕÍ¥°(
Ü5½Ñ¥½¸ÉÁ¡¥Ì¬ÑáÐ¹¥µÑ¥½¹Ì°(Y¥¼µ¹½ÁÑ¥µ¥é½¸å½ÕÈÁ°(t°(=¹Ìè¹Õ±°°(¹½ÑèQ¡É¹Ù¥¼±½¹ÉÕ¹ÌÔÀÀ¬½¸Ñ¡½Á¸µÉ­Ð¸	Õ¹±¡ÉÐ¡±Ñ¡Ð¸°(½±½Èè½ÉÈµ±¥½¸µ½É¹°(¹Ñ
½±½ÈèÑáÐµ±¥½¸µ½É¹°(	èµ±¥½¸µ½É¹°(ÑèÐQ¡A±Ñ½É´°(±¥ÙáµÁ±èì(ÕÉ°è½ÑµÁ±ÑÌ½Á±Ñ½É´µáµÁ±¹¡Ñµ°°(±°èM1¥ÙA±Ñ½É´áµÁ±H°(ÍÉ¥ÁÑ¥½¸è-½¤]É5ÕÍ¥PÑÌ½ÈÍ±°ÍÍÍ¥½¸½½­¥¹°Íå¹±¥¹Í¥¹¸ÉÑ½ÈÝ¡¼Í±±Ì¸°(ô°(ô°(ì(¥è½ÍåÍÑ´°(¹µèQ!
=MeMQ4°(ÁÉ¥èÄÀÀÀ°(¥½¹9µèI½­Ð°(Ñ±¥¹èe½ÕÈÕ±°Ý½É±¸=¹ÍÑ¥¹Ñ¥½¸¸°(è¹Õ±°°(ÍÑ½ÈèÍÑ±¥Í¡É¹Ì°µ½Ùµ¹ÑÌ°µ¥¹¥ÍÑÉ¥Ì°¹ÕÍ¥¹ÍÍÌÉä½È½µÁ±ÑÕ±°µÍ±ÝÁÉÍ¹Õ¥±Ð¹Ñ¥É±äÉ½Õ¹Ñ¡¥ÈÙ¥Í¥½¸¸°(±¥ÙÉååÌèÈµÝ¬ÑÕÉ¹É½Õ¹°(ÉÙ¥Í¥½¹ÌèÌÉ½Õ¹Ì°(¥¹±ÕÌèl(ÙÉåÑ¡¥¹¥¸Q¡A±Ñ½É´°(Äµ¥¸Á¬ÕÀÑ¼Ô¥Ñ¥½¹°ÁÌ°(¡
¡½½ÍÉ½´è½ÕÐ°MÉÙ¥Ì°M¡½À°A½ÉÑ½±¥¼°Ù¹ÑÌ°	±½°AÉÍÌ-¥Ð°
½¹ÑÐ¤°(Õ±°Í¥Ñ¹Ù¥Ñ¥½¸PÍ­Ñ½Àµ¹Ô¬µ½¥±¡µÕÉÈ°(Õ±°M<½ÁÑ¥µ¥éÑ¥½¸É½ÍÌ±°ÁÌ°(UÀÑ¼ÄÀÁÉ½ÕÑÌ½ÈÍÉÙ¥Ì¥¸å½ÕÈÍ¡½À°(
±¹ÈÍ¡Õ±¥¹ÍåÍÑ´P±¥¹ÑÌ½½¬å½Ô¥ÉÑ±ä°($¡ÐÍÍ¥ÍÑ¹Ð½Èå½ÕÈ±¥¹ÑÌP¹ÍÝÉÌÅÕÍÑ¥½¹ÌÉ½Õ¹Ñ¡±½¬°(	±½¼¹ÝÌÁ¡¥Í±ÑÌ½¹½å½ÕÈÔÁÌ¤°(M½¥°µ¥¥¹ÑÉÑ¥½¸°(	É¹ÍÑå±Õ¥½Õµ¹Ð¡½±½ÉÌ°½¹ÑÌ°±½¼ÕÍÉÕ±Ì¤°(µ¥°ÁÑÕÉ¬ÕÑ½µÑ½±±½ÜµÕÀ°(ÌÀåÌ½Á½ÍÐµ±Õ¹ ÍÕÁÁ½ÉÐµ¥¹½ÈÕÁÑÌ°(AÉ¥½É¥ÑäÉÍÁ½¹ÍÑ¥µ°(t°(=¹Ìèl(ì±°èáÑÉÁÌ¡å½¹Ô¤°ÁÉ¥è¬ÔÀ ô°(ì±°è5½¹Ñ¡±äµ¹µ¹Ð¡Õ±°ÍÉÙ¥¤°ÁÉ¥èÄÈÔ½µ¼ô°(ì±°è¥Ñ¥½¹°É¹Ù¥¼°ÁÉ¥è¬ÄÀÀô°(ì±°èÌ´Øµ½¹Ñ M<Õ¥Ð°ÁÉ¥è%¹±Õô°(t°(¹½Ñè5Õ±Ñ¤µÁÍ¥ÑÌÉÕ¸Ì°ÀÀÃLÄÔ°ÀÀÀ¬ÙÉåÝ¡É±Í¸Q¡¥Ì¥Ì¥¹Ñ¹Ñ¥½¹°¸°(½±½Èè½ÉÈµÝ¡¥Ñ¼ÈÀ°(¹Ñ
½±½ÈèÑáÐµÝ¡¥Ñ°(	è°(ÑèÐQ¡½ÍåÍÑ´°(±¥ÙáµÁ±èì(ÕÉ°è½ÑµÁ±ÑÌ½½ÍåÍÑ´µáµÁ±¹¡Ñµ°°(±°èM1¥Ù½ÍåÍÑ´áµÁ±H°(ÍÉ¥ÁÑ¥½¸èY9Q
ÉÑ¥ÙPÉÑ¥ÍÐÙ±½Áµ¹Ð¹ä¸5Õ±Ñ¤µÍÑ¥½¸°É½ÍÑÈ°Õ±°ÍÉÙ¥Ì°ÁÁ±¥Ñ¥½¸½½­¥¹¸°(ô°((ô°)tì(((¼¼RR !H¡Ñ½ÀÕÑ¥±¥ÑäÈ¬µ¥¸¹Ù¥Ñ¥½¸¤RRRRRRRRRRRRRR (¼¼Q¡Ñ½ÀÕÑ¥±¥ÑäÈ¡Íµ±°±¥¹­Ì½Ùµ¥¸¹Ø¤¹Ñ¡µ¥¸(¼¼¹Ø¸QÉ¥¸	e=ÍÑåÌ¥¹±¥¹¥¸Ñ¡½µÁ½¹¹ÐÍ¥¹¥ÐÌ(¼¼ÁÉµ¹¹Ð¥áÑÕÉÁ½¥¹Ñ¥¹Ñ¼Ñ¡½Õ¹ÈÌ½Ñ¡ÈÍ¥Ñ¸)áÁ½ÉÐ½¹ÍÐ!Hôì(¼¼Mµ±°±¥¹­ÌÍ¡½Ý¸¥¸Ñ¡ÕÑ¥±¥ÑäÈ¡É¥¡ÐÍ¥°¡¥Ì½¸ÍÉ½±°¤(ÕÑ¥±¥Ñå1¥¹­Ìèl(ì±°è	½½­Ì°¡Éè½½­Ì°áÑÉ¹°è±Íô°(ì±°èA½ÍÐ°¡ÉèÁ½ÍÐ°áÑÉ¹°è±Íô°(t°(¼¼5¥¸¹Ù¥Ñ¥½¸¥ÑµÌ(¹Ù%ÑµÌèl(ì±°èA=IQ=1%<°¡ÉèÁ½ÉÑ½±¥¼°áÑÉ¹°è±Íô°(ì±°èQ!M]IX
=MeMQ4°¡Éè½ÍåÍÑ´°áÑÉ¹°è±Íô°(ì±°è	=UPM]IX=8Q!<°¡Éè½ÕÐµÍÝÉØ°áÑÉ¹°è±Íô°(ì±°èi%=8	%IM=9°¡ÉèµÐµé¥½¸°áÑÉ¹°è±Íô°(ì±°èQ!	%IM=95Q!=°¡Éè¥ÉÍ½¹µµÑ¡½°áÑÉ¹°è±Íô°(ì±°èQI%8	e=°¡Éèå½°áÑÉ¹°è±Íô°(ì±°èQ-Q!I=5@°¡Éè½É½µÀ°áÑÉ¹°è±Íô°(ì±°èIYY%9U@°¡ÉèÉÙÙ¥¹µÕÀ°áÑÉ¹°è±Íô°(ì±°è
=9Q
P°¡Éè½¹ÑÐ°áÑÉ¹°è±Íô°(t°(¼¼%¹±¥¹
½¹¹ÐÕÑÑ½¸½Áä(½¹¹Ñ1°è
½¹¹Ð°(¼¼I¥¡ÐµÍ¥ÁÉ¥µÉä
QÌ(½½­9½Ý1°è	==,9=\°(Ñ%¹Q½Õ¡1°èP%8Q=U
 °)ôÌ½¹ÍÐì((¼¼RR MIY%

Q=I%L¡Ñ½Àµ±Ù°MÉÙ¥ÌÑ¥±Ì¤RRRRRRRRRRR (¼¼Q¡ÍÉÑ¡	%Ñ½ÉäÑ¥±ÌÍ¡½Ý¸¥¸Ñ¡µ¥¸MÉÙ¥Ì½µÁ½¹¹Ð¸(¼¼Q¡ä¥ÈÉ½´Ñ¡ÁÉ¥MIY%
LÑ±½£±ÉÑ½,
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

