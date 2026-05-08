/**
 * Roadmap Module — Configuration
 * ─────────────────────────────────────────────────────────
 * This file is the ONLY place a new client ecosystem needs to edit
 * to rebrand the Roadmap experience. The component code is generic.
 *
 * To clone for a new client:
 *   1. Copy /modules/roadmap/ into the new client's repo
 *   2. Edit this file: brand name, services, AI prompt, copy
 *   3. Done.
 */

export interface RoadmapService {
  name: string;
  price: string;
  category?: string;
}

export type Theme = 'luxe' | 'cyberpunk' | 'earth' | 'street' | 'sonic';

export interface ThemeMeta {
  id: Theme;
  name: string;
  tagline: string;
  audio: { url: string; name: string } | null;
}

export interface RoadmapConfig {
  /** Brand identity for the AI to reference */
  brandName: string;
  brandUrl: string;
  founderName: string;
  founderTitle: string;

  /** Where the "Let's Build This Together" CTA points */
  ctaUrl: string;

  /** Copy that appears on each screen — overridable per client */
  copy: {
    introLogo: string;
    introTitle: { line1: string; emphasis: string; line3: string };
    introSub: string;
    videoLabel: string;
    nameFieldLabel: string;
    namePlaceholder: string;
    introCta: string;

    disclaimerTitle: { line1: string; line2: string };
    disclaimerBody: Array<string>;
    disclaimerNote: string;
    disclaimerBack: string;
    disclaimerNext: string;

    visionPrompt: { line1: string; emphasis: string; line3: string };
    visionSub: string;
    visionPlaceholder: string;
    visionCta: string;

    emailTitle: { line1: string; line2: string };
    emailSub: string;
    emailCta: string;
    emailSkip: string;

    processingTitle: string;
    processingSteps: string[];

    resultsHeadline: { plain: string; emphasis: string };
    resultsCtaButton: string;
  };

  /** Service catalog the AI can recommend from. Use exact names + prices. */
  services: RoadmapService[];

  /** Default theme on first load (overridden by user's localStorage choice). */
  defaultTheme: Theme;

  /** Theme picker entries. Order = display order in the panel. */
  themes: ThemeMeta[];

  /** AI system prompt — the soul of the experience.
   *  {{services}} will be replaced with the formatted services list. */
  systemPrompt: string;
}

// ══════════════════════════════════════════════════════════
// SWRV ON THE GO — DEFAULT CONFIG
// ══════════════════════════════════════════════════════════

const SWRV_SERVICES: RoadmapService[] = [
  { name: 'Logo & Brand Identity Design', price: '$350' },
  { name: 'Vision Statement + Mission Statement Writing', price: '$150' },
  { name: 'Custom Brand Color Palette & Style Guide', price: '$200' },
  { name: 'Jingle / Brand Audio Creation', price: '$500' },
  { name: 'Photography Package (Brand/Lifestyle)', price: '$600' },
  { name: 'Promo Video / Music Video Production', price: '$1,200' },
  { name: 'Website Design & Development', price: '$1,800' },
  { name: 'Voiceover Recording & Production', price: '$300' },
  { name: 'On-Site Filmography & Videography', price: '$900' },
  { name: 'Book Formatting & Layout', price: '$400' },
  { name: 'Audiobook Production', price: '$650' },
  { name: 'Vocal Training (Birdsong Method – 4-session)', price: '$280' },
  { name: 'Recording Booth Training (Artist Package)', price: '$350' },
  { name: 'Content Strategy & Social Media Kit', price: '$250' },
];

export const SWRV_ROADMAP_CONFIG: RoadmapConfig = {
  brandName: 'SWRV OTG',
  brandUrl: 'swrvonthego.pro',
  founderName: 'Swerve',
  founderTitle: 'Robert Birdsong',
  ctaUrl: 'https://swrvonthego.pro',

  copy: {
    introLogo: 'SWRV OTG · The Roadmap Experience',
    introTitle: { line1: 'Your Vision.', emphasis: 'Your Vehicle.', line3: 'Your Roadmap.' },
    introSub: "Before you build a brand, a business, a plan —\nyou have to know where you're actually going.",
    videoLabel: 'A word from Swerve — coming soon',
    nameFieldLabel: "What's your first name?",
    namePlaceholder: 'Your name',
    introCta: "I'm Ready",

    disclaimerTitle: { line1: 'Before you begin,', line2: 'there is one rule.' },
    disclaimerBody: [
      'In this space, **you have no family. No partner. No children.** No one who needs you. No one you owe anything to.',
      'You are **20 years old.** Just you, your gifts, and all the resources in the world. Not what someone raised you to want. Not what a role requires. **Just what lives inside you.**',
      "You don't need permission. You don't need a sign. **Trust yourself the way you want others to trust you.**",
      "You were made with intention. Everything good that's grown in you — you haven't had the time to sit with it, nurture it, pull it all the way out. **That's what this is for.**",
    ],
    disclaimerNote: 'No siblings. No parents. No spouse. No children.\nNo outside voices. Just you.',
    disclaimerBack: '← Go Back',
    disclaimerNext: "I Understand. Let's Begin.",

    visionPrompt: {
      line1: 'You are',
      emphasis: '50 years old.',
      line3: "Everything worked out exactly the way it should.\nWalk me through your day.",
    },
    visionSub:
      "Speak or type in the present tense — you are already there.\nMorning, afternoon, evening, night. What do you see? What's your work?\nWho is celebrating you, and what are they saying?",
    visionPlaceholder:
      "I'm waking up to the sound of... I can smell... Outside my window I see... My work today is... By night, people are celebrating me because...",
    visionCta: 'Reveal My Roadmap →',

    emailTitle: { line1: 'Where should we send', line2: 'your Roadmap?' },
    emailSub:
      "We'll hold this for you — your vision, your brand breakdown, your path forward. Drop your email and we'll make sure it finds its way to you.",
    emailCta: 'Build My Roadmap →',
    emailSkip: 'Skip — just show me the roadmap',

    processingTitle: 'Reading your vision',
    processingSteps: [
      'Extracting your core gift',
      'Identifying your work & purpose',
      'Decoding your brand identity',
      'Building your website blueprint',
      'Matching SWRV OTG services',
    ],

    resultsHeadline: { plain: 'Your', emphasis: 'Roadmap' },
    resultsCtaButton: "Let's Build This Together →",
  },

  services: SWRV_SERVICES,

  defaultTheme: 'luxe',

  themes: [
    {
      id: 'luxe',
      name: 'Luxe',
      tagline: 'gold, marble, expensive',
      audio: {
        url: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778186908/ROADMAP_APP_-_LOFI_OCEAN_PIER_ndlqu8.mp3',
        name: 'Lofi Ocean Pier',
      },
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      tagline: 'neon, future, electric',
      audio: null,
    },
    {
      id: 'earth',
      name: 'Earth',
      tagline: 'zen, daylight, grounded',
      audio: {
        url: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778186909/ROADMAP_APP_-_PEACEFUL_NATURE_SOUNDS_vnplxv.mp3',
        name: 'Peaceful Nature Sounds',
      },
    },
    {
      id: 'street',
      name: 'Street',
      tagline: 'graffiti, raw, urban',
      audio: null,
    },
    {
      id: 'sonic',
      name: 'Sonic',
      tagline: 'jazz, brass, velvet',
      audio: {
        url: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778186909/ROADMAP_APP_-_PEACEFUL_NATURE_suii2m.mp3',
        name: 'Peaceful Nature',
      },
    },
  ],

  systemPrompt: `You are The Roadmap — a vision analyst and brand strategist for SWRV OTG (swrvonthego.pro), a full-service branding, content creation, and music production agency founded by Swerve (Robert Birdsong).

The user has described their ideal life at age 50 — their "Day in the Happily Ever After." Extract their core gift, their work, their purpose, their brand identity, and map everything to SWRV OTG services.

SWRV OTG Services (use exact names, exact prices):
{{services}}

HARD RULES — never break these:
1. NEVER reference family members, spouses, children, parents, or siblings in ANY output.
2. Extract only what is personally about THEM — their gifts, their identity, their vision.
3. Brand colors MUST be derived from the environments, places, and imagery they described.
4. "Work" is NOT a job. It is their gift expressed for value in the world.
5. Recommended services must be intelligent and specific — no generic picks.
6. The closing_word should feel like it came from a mentor who just heard them for the first time and truly sees them.

Return ONLY a raw JSON object. No markdown fences, no backticks, no explanation, no preamble:
{"gift":"one sharp sentence naming their core gift","work":"2-3 sentences on what they do that the world pays for","purpose":"1-2 sentences on the deeper WHY behind what they do","vision_summary":"4 vivid present-tense sentences: morning → work → evening → legacy/impact","brand_colors":[{"hex":"#xxxxxx","name":"Color Name","meaning":"what this says about their brand and life"},{"hex":"#xxxxxx","name":"Color Name","meaning":"..."},{"hex":"#xxxxxx","name":"Color Name","meaning":"..."}],"business_name_idea":"A striking brand or business name suggestion","website_blueprint":"3-4 sentences on what their site should look, feel, and function like","recommended_services":[{"name":"exact name from list","why":"one sentence specific to this person's vision","price":"$XXX"}],"closing_word":"2-3 direct, warm, real sentences speaking to them personally. No fluff. No clichés. Speak to what you actually heard."}`,
};

/**
 * Renders the system prompt with the services list interpolated.
 * Called by the API route at request time.
 */
export function renderSystemPrompt(config: RoadmapConfig): string {
  const servicesList = config.services
    .map((s) => `- ${s.name} — ${s.price}`)
    .join('\n');
  return config.systemPrompt.replace('{{services}}', servicesList);
}
