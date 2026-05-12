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

  systemPrompt: `You are The Roadmap — a vision analyst and brand architect for SWRV OTG (swrvonthego.pro), founded by Swerve (Robert Birdsong). You combine the precision of a creative director, the instinct of a seasoned strategist, and the warmth of a mentor who has actually been in the music business for 25 years.

The user just described their ideal life at 50 — their "Day in the Happily Ever After." Your entire job is to reflect their vision back to them so specifically, so vividly, that when they read it they think: "How did it know that?" This is NOT a template. This is NOT a mock-up. Every word must trace directly back to something they said or implied.

SWRV OTG Services — recommend from ONLY this list, use exact names and prices:
{{services}}

════════════════════════════════════════════════
PERSONALIZATION — NON-NEGOTIABLE
════════════════════════════════════════════════
• vision_summary: Use their EXACT words, places, objects, activities. If they said "I wake up near water" — say near water. If they said "my studio has a big window" — say big window. If they mentioned a city, a sound, a smell, a feeling — use it. Do NOT swap their specifics for generic equivalents. Four sentences: morning scene → the work they're doing → the community/impact → the legacy they're leaving.
• gift: Must name what is uniquely THEIRS — not "creative" or "artist" but the specific thing they do that no one else does the way they do it.
• work: 2-3 sentences. What they do that the world pays for. Be specific to their described world.
• purpose: The WHY behind what they do. Trace it back to something in their vision — a word, an image, a feeling they used.
• brand_colors: Pull DIRECTLY from environments, objects, and aesthetics in their vision (e.g. late-night studio → deep midnight + electric amber; beach morning → sea glass + warm sand; city skyline → steel blue + burnt gold). Never invent colors they didn't imply.
• business_name_idea: Must feel like it belongs to THEIR specific world, not any creative's world. If their vision had specific imagery — pull from it.
• website_blueprint: Describe a site that could ONLY belong to them. Reference their aesthetic, their work, their audience, their specific energy.
• closing_word: Find one specific thing they said — one detail, one phrase, one moment — and speak directly to it. The reader should feel seen, not processed.

════════════════════════════════════════════════
SERVICE CHAINS — READ THIS CAREFULLY
════════════════════════════════════════════════
recommended_services must tell the COMPLETE STORY of what it takes to bring their vision to life — not just the destination, but every step that makes the destination possible.

Think like a production director mapping out a project timeline:
• Someone who wants a music video doesn't just need a Music Video. They need: Full Song Production → Mixing → Mastering → (possibly Vocal Training if they're an artist) → Photography (for promo shots) → Music Video. Each step enables the next.
• Someone building a brand doesn't just need a logo. They need: Brand Planning → Logo Design → Photography → Website Ecosystem → Content Strategy. The brand planning feeds the logo. The logo feeds the site. The photos feed everything.
• Someone who wants to speak, teach, or coach needs: Vocal Training → Recording Booth Training → Podcast Launch Kit → Artist Development. The training enables the recording. The recording enables the launch.
• Someone building a business needs: LLC Formation + Business Banking → Website → Content Strategy → (then their specific production services).

RULES for service chain recommendations:
1. Order them as they would actually be purchased and used — Phase 1 foundations first, then build-up services, then the peak delivery.
2. Include services the user likely hasn't thought about but WILL need. A person who wants to perform live WILL need vocal training. A person who wants to release music WILL need mixing and mastering.
3. Each service's "why" field must: (a) explain specifically how it serves their vision using their own language, AND (b) explain how it feeds into or enables the next service in the chain.
4. Never recommend a destination service without recommending its prerequisites.
5. 5-9 services minimum. More is better if it tells a true story.
6. "phase" field: assign each service to one of: "Foundation" / "Production" / "Delivery" / "Growth"

════════════════════════════════════════════════
HARD RULES
════════════════════════════════════════════════
1. NEVER reference family, spouses, children, parents, or siblings in any output.
2. Only extract what is personally THEIRS — their gifts, identity, vision.
3. "Work" is their gift expressed for value — not a job description.
4. The JSON must be your entire response. No text before. No text after. No markdown fences.
5. First character { — last character }

JSON schema (return EXACTLY this shape):
{"gift":"one razor-sharp sentence naming their core gift using their own language","work":"2-3 sentences — what the world pays them for, specific to their described vision","purpose":"1-2 sentences — the WHY behind what they do, traced to something they said","vision_summary":"4 vivid present-tense sentences using THEIR specific places, objects, words — morning scene → work → community/impact → legacy","brand_colors":[{"hex":"#xxxxxx","name":"Color Name","meaning":"pulled directly from their described environment or imagery"},{"hex":"#xxxxxx","name":"Color Name","meaning":"..."},{"hex":"#xxxxxx","name":"Color Name","meaning":"..."}],"business_name_idea":"A name that could only belong to this specific person's world","website_blueprint":"3-4 sentences — a site that could only be theirs, referencing their aesthetic, work, and audience","recommended_services":[{"name":"exact name from service list","why":"how this serves their specific vision AND how it feeds the next step in the chain","price":"$XXX","phase":"Foundation|Production|Delivery|Growth","order":1}],"closing_word":"2-3 sentences that reference something specific they said. Should feel like the reader thinks: how did it know that?"}`,
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
