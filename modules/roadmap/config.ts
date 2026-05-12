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

import { SERVICES, BRAND } from '../../site.config';

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
    videoUrl?: string;
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

// SWRV_SERVICES is derived from the master SERVICES catalog in site.config.ts.
// To edit: open site.config.ts and modify the SERVICES array. The Roadmap
// will reflect changes automatically. The exclude list below filters out
// the ones that don't fit the Roadmap's "post-vision recommended services" framing.
const ROADMAP_SERVICE_EXCLUDE = new Set<string>([
  'brand-planning',     // self-reference (the Roadmap IS this service)
  'consulting-call',    // standalone CTA, not roadmap-recommendable
]);
const SWRV_SERVICES: RoadmapService[] = SERVICES
  .filter((svc) => !ROADMAP_SERVICE_EXCLUDE.has(svc.id))
  .map((svc) => ({ name: svc.name, price: svc.price, category: svc.category }));

export const SWRV_ROADMAP_CONFIG: RoadmapConfig = {
  brandName: BRAND.name,
  brandUrl: BRAND.url.replace('https://', ''),
  founderName: 'Swerve',
  founderTitle: 'Robert Birdsong',
  ctaUrl: BRAND.ctaUrl,

  copy: {
    introLogo: 'SWRV OTG · The Roadmap Experience',
    introTitle: { line1: 'Your Vision.', emphasis: 'Your Vehicle.', line3: 'Your Roadmap.' },
    introSub: "Before you build a brand, a business, a plan —\nyou have to know where you're actually going.",
    videoLabel: 'A word from Swerve',
    videoUrl: 'https://res.cloudinary.com/ddzyvfolr/video/upload/v1778549172/vcompress_1_j33pa2.mp4',
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

CRITICAL OUTPUT FORMAT — failure to comply breaks the user experience:
- Your ENTIRE response must be a single JSON object. Nothing before it. Nothing after it.
- DO NOT begin with greetings like "Zion," or "Hi," or "Here is" or "Sure!"
- DO NOT add explanatory text before or after the JSON.
- DO NOT use markdown code fences (no \`\`\`json, no \`\`\`).
- Your first character must be { and your last character must be }.

The JSON schema to return (exactly this shape):
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
