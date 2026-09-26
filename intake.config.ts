import { SERVICES, SERVICE_SUBCATEGORIES, SERVICE_ASSETS, SOCIAL_ACCESS, type IntakePath } from './site.config';

// ════════════════════════════════════════════════════════════
// intake.config.ts — the intake questions, tied to the service catalog
// ════════════════════════════════════════════════════════════
// Every intake on the site (the "Request a Quote" form in ProjectIntake
// and the "Book & Pay" checkout) reads its questions from here, and works
// out WHICH questions from site.config.ts rather than its own list:
//   - a service gets the question set of the category it's listed under
//     (SERVICE_SUBCATEGORIES[].intakePath), unless the service overrides
//     it with its own `intakePath`;
//   - every service also gets a "what do you already have?" question
//     built from its own asset list (SERVICE_ASSETS / assetsNeeded).
// So adding, renaming, or re-categorising a service in site.config.ts
// changes its intake automatically. Only edit this file to change the
// questions themselves.
// ════════════════════════════════════════════════════════════

// ── TYPES ─────────────────────────────────────────────────────────────
export type AnswerValue = string | string[];
export interface Question {
  id: string;
  question: string;
  sub?: string;
  type: 'single' | 'multi' | 'text' | 'textarea';
  options?: string[];
  optional?: boolean;
  placeholder?: string;
  // Step-by-step instructions shown under a "How do I do this?" toggle.
  help?: string[];
}

// ── UNIVERSAL BUDGET QUESTION ─────────────────────────────────────────
// Injected into every path so no brief ever reaches SWRV without a
// budget — the #1 thing customers leave out. Required (not optional).
export const BUDGET_Q: Question = {
  id: 'budget',
  question: "What\'s your budget for this?",
  type: 'single',
  options: [
    'Under $300',
    '$300 – $750',
    '$750 – $2,000',
    '$2,000 – $5,000',
    '$5,000+',
    "Not sure — show me options",
  ],
};

// ── ACCOUNT ACCESS (event path) ───────────────────────────────────────
// Real-time posting at an event needs access to the client's accounts.
// This never collects a password: Instagram/Facebook access is granted
// through Meta Business Suite (revocable, no password shared), and for
// anything that truly needs a login the client sends it through a
// self-destructing link outside this site. 'metaAccess' / 'otherAccess'
// ids are read back by the Worker to flag access status in the booking
// email — keep them stable.
const META_ADD_STEP = SOCIAL_ACCESS.metaBusinessId
  ? `Under Users → Partners, tap Add → "Give a partner access to your assets" and enter SWRV's Business ID: ${SOCIAL_ACCESS.metaBusinessId}.`
  : `Under Users → People, tap Add people and enter ${SOCIAL_ACCESS.accessEmail}.`;

export const ACCESS_QUESTIONS: Question[] = [
  {
    id: 'metaAccess',
    question: "Have you given SWRV posting access to your Instagram / Facebook?",
    sub: "No password needed — you add us in Meta Business Suite, and remove us with one tap after the event.",
    type: 'single',
    options: [
      "Yes — SWRV is added in Meta Business Suite",
      "Not yet — I'll do it before the event",
      "I need help setting it up",
      "Not posting to Instagram or Facebook",
    ],
    help: [
      "Open business.facebook.com/settings on a computer, or the Meta Business Suite app → Settings.",
      META_ADD_STEP,
      "Select your Instagram account (and Facebook Page) and turn on content access — creating and publishing posts, reels and stories. Leave everything else off.",
      "After the event, remove SWRV from the same screen. Your password never changes hands, so there's nothing to reset.",
    ],
  },
  {
    id: 'otherAccess',
    question: "TikTok or any other account that isn't in Meta Business Suite?",
    sub: "Never type a password into this form, email, or a text message.",
    type: 'single',
    optional: true,
    options: [
      "Not needed — Instagram / Facebook only",
      "I'll sign SWRV in on-site before the event starts",
      "I'll send the login through a one-time link",
    ],
    help: [
      "Easiest: when we arrive, you sign in on our device yourself — you approve any login code on your own phone, and we never see the password.",
      "If you can't be there: go to onetimesecret.com (free, no account), paste the login, and send us the link. It deletes itself the moment we open it.",
      "Either way, change that password after the event.",
    ],
  },
];

// ── INTAKE PATHS BY SERVICE GROUP ─────────────────────────────────────
export const INTAKE_PATHS: Record<IntakePath, Question[]> = {
  website: [
    { id: 'goal', question: "What does this website need to do?", sub: "Select everything that applies.", type: 'multi',
      options: ['Showcase my portfolio / work', 'Book clients / sell services', 'Sell physical or digital products', 'Tell my brand story', 'Raise money / crowdfund', 'Build a community or membership', 'Replace or upgrade an existing site'] },
    { id: 'branding', question: "Do you have existing branding?", type: 'single',
      options: ['Yes — logo, colors, fonts, the works', 'Partial — I have a logo but not much else', 'Starting completely from scratch', 'Not sure — let\'s figure it out together'] },
    { id: 'content', question: "What content do you have ready to go?", sub: "Be honest — we'll plan around where you are.", type: 'multi',
      options: ['Written copy / text for the pages', 'Professional photos', 'Videos', 'Product images', 'Nothing yet — I need help creating it', 'I have some things and need to fill gaps'] },
    { id: 'pages', question: "How many pages are we thinking?", type: 'single',
      options: ['1–3 pages (focused, tight, powerful)', '4–7 pages (standard professional site)', '8–15 pages (full content site)', '15+ pages (large scale / e-commerce)', 'Not sure yet — help me decide'] },
    { id: 'features', question: "Any special functionality needed?", sub: "Select all that apply.", type: 'multi',
      options: ['Online booking / scheduling', 'E-commerce / online store', 'Blog or content hub', 'Email list / lead capture', 'Client portal or members area', 'Donation or crowdfunding', 'Live chat or support', 'Video or audio player', 'Custom contact forms', 'Multi-language', 'Nothing beyond the basics'] },
    { id: 'domain', question: "What's your domain and hosting situation?", type: 'single',
      options: ['I have a domain and hosting already', 'I have a domain but no hosting', 'I need both — starting fresh', 'I have an existing site to replace', 'Not sure what I have'] },
    { id: 'timeline', question: "When do you need this live?", type: 'single',
      options: ['ASAP — within 2 weeks', 'About a month', '2–3 months', 'No hard deadline — get it right'] },
    { id: 'references', question: "Any websites you love that we should reference?", sub: "Paste URLs, describe vibes, or say what you like about them.", type: 'textarea', optional: true, placeholder: "e.g. apple.com — love the clean layout. Also like the dark feel of studio-era artists sites..." },
    { id: 'notes', question: "Anything else SWRV needs to know before we start?", type: 'textarea', optional: true, placeholder: "Special requirements, hard constraints, things that went wrong with past sites, budget range, goals you haven't mentioned yet..." },
  ],

  video: [
    { id: 'type', question: "What kind of video are we creating?", type: 'single',
      options: ['Music video (full song)', 'Promo / brand video (under 1 min)', 'Live event coverage', 'Short-form content (Reels / TikTok)', 'AI motion graphics', 'Podcast / interview visuals', 'Something else'] },
    { id: 'length', question: "How long is the video?", type: 'single',
      options: ['Under 60 seconds', '1–3 minutes', '3–5 minutes', '5+ minutes', 'Not sure yet'] },
    { id: 'audio', question: "Is the song or audio finalized?", type: 'single',
      options: ['Yes — mixed and mastered, ready to go', 'Mixed but not mastered yet', 'Still in production — need that too', 'No audio yet — need to start there', 'Instrumental / no vocals'] },
    { id: 'concept', question: "Do you have a creative concept or treatment?", type: 'single',
      options: ['Yes — detailed concept, mood board, references', 'General idea — need help developing it', 'Completely open — give me your creative direction', 'I know the vibe but not the story'] },
    { id: 'location', question: "Where are we filming?", type: 'multi',
      options: ['My location (I\'ll provide details)', 'Studio / controlled environment', 'Outdoor / natural settings', 'Multiple locations', 'Remote / digital / green screen', 'Not sure yet'] },
    { id: 'cast', question: "Who\'s in front of the camera?", type: 'multi',
      options: ['Just me', 'Me and my group / band', 'We need to cast additional talent', 'No people — product or concept-based', 'To be determined'] },
    { id: 'references', question: "Reference videos that capture what you\'re going for?", type: 'textarea', optional: true, placeholder: "YouTube links, artists, directors, or describe the visual aesthetic..." },
    { id: 'timeline', question: "When does this need to be done?", type: 'single',
      options: ['Within 2 weeks', 'About a month', '2–3 months', 'No hard deadline'] },
    { id: 'notes', question: "Anything else — hard constraints, budget range, specific requirements?", type: 'textarea', optional: true, placeholder: "Anything SWRV needs to know upfront..." },
  ],

  music: [
    { id: 'type', question: "What are we creating?", type: 'single',
      options: ['Original song (full production)', 'Beat / instrumental only', 'Jingle or brand audio', 'Voiceover or narration', 'Audiobook recording', 'Podcast production', 'Mixing / mastering only (I have recordings)', 'Live session recording'] },
    { id: 'genre', question: "What\'s the genre and vibe?", type: 'textarea', placeholder: "Hip-hop, R&B, gospel, pop, cinematic... and describe the feeling you\'re going for. Reference artists if helpful.", sub: "Be specific — this shapes everything." },
    { id: 'lyrics', question: "Where are the lyrics?", type: 'single',
      options: ['Complete and ready to record', 'Work in progress — mostly done', 'Just the hook / concept — need to develop it', 'Need help writing them too', 'No lyrics — instrumental project'] },
    { id: 'performers', question: "Who\'s performing?", type: 'multi',
      options: ['Me (solo artist)', 'Group / ensemble', 'Looking for features or collaborators', 'Instrumental — no performers', 'Still figuring out'] },
    { id: 'purpose', question: "What\'s this music for?", type: 'multi',
      options: ['Official release / distribution', 'Content / social media', 'Commercial or brand use', 'Film / TV / sync', 'Personal or private project', 'Showcase / demo'] },
    { id: 'references', question: "Reference tracks that capture the sound you\'re chasing?", type: 'textarea', optional: true, placeholder: "Song titles, artists, or Spotify links. Tell us what specifically you like about them." },
    { id: 'timeline', question: "Timeline?", type: 'single',
      options: ['Within 2 weeks', 'About a month', '1–3 months', 'No hard deadline'] },
    { id: 'notes', question: "Anything else SWRV should know?", type: 'textarea', optional: true, placeholder: "Budget range, session details, technical requirements, past recording experience..." },
  ],

  brand: [
    { id: 'stage', question: "Where are you in your brand journey?", type: 'single',
      options: ['Brand new — starting from zero', 'Have a name, need everything else', 'Existing brand that needs a refresh', 'Rebrand — changing direction entirely', 'Just need specific pieces (logo, etc.)'] },
    { id: 'business', question: "Describe your business or project in one sentence.", type: 'textarea', placeholder: "What do you do, who do you do it for, and what makes you different?" },
    { id: 'audience', question: "Who is your audience?", sub: "The more specific, the better.", type: 'textarea', placeholder: "e.g. Independent artists between 18-35 who are building their brand but don\'t have label support..." },
    { id: 'vibe', question: "What\'s the vibe?", sub: "Select everything that resonates.", type: 'multi',
      options: ['Premium / Luxury', 'Bold / Disruptive', 'Clean / Minimal', 'Creative / Expressive', 'Community / Approachable', 'Professional / Corporate', 'Gritty / Authentic', 'Spiritual / Purposeful'] },
    { id: 'deliverables', question: "What specifically do you need?", type: 'multi',
      options: ['Logo (primary mark)', 'Color palette', 'Typography selection', 'Brand guide / style document', 'Business cards / print materials', 'Social media templates', 'Brand photography', 'Content strategy', 'All of the above — full system'] },
    { id: 'feeling', question: "What do you want people to FEEL when they encounter your brand?", type: 'textarea', placeholder: "Describe the emotional response. Inspired? Trusted? Impressed? Like they found their people?" },
    { id: 'references', question: "Brands you love or want to reference?", type: 'textarea', optional: true, placeholder: "Could be direct competitors, brands in different industries, or just aesthetic references..." },
    { id: 'notes', question: "Anything else?", type: 'textarea', optional: true, placeholder: "Timeline, budget range, things to avoid, past branding attempts..." },
  ],

  business: [
    { id: 'type', question: "What are we building?", type: 'single',
      options: ['Pitch deck (investors / partners)', 'Business plan document', 'Keynote / speaking presentation', 'Book (format + launch)', 'LLC formation + banking setup', 'Multiple — full launch package'] },
    { id: 'purpose', question: "Who is this for and what do you need it to do?", type: 'textarea', placeholder: "e.g. Investor pitch for a Series A raise. Audience is VC firms in the music tech space. Goal is to get meetings." },
    { id: 'existing', question: "What do you have already?", type: 'multi',
      options: ['Detailed notes or an outline', 'A rough draft', 'Financial projections', 'Visual assets / branding', 'Market research', 'Previous version to update', 'Starting from scratch'] },
    { id: 'scope', question: "Do you need strategy + writing, or design only?", type: 'single',
      options: ['Strategy + writing + design (full service)', 'I have the content — just need design', 'I have a design — just need content/strategy', 'Not sure — let\'s assess together'] },
    { id: 'timeline', question: "When do you need this?", type: 'single',
      options: ['Within a week (urgent)', 'Within 2 weeks', 'About a month', 'No hard deadline'] },
    { id: 'notes', question: "Context SWRV needs to know — audience, stakes, any hard constraints?", type: 'textarea', optional: true, placeholder: "The more context, the better the output..." },
  ],

  podcast: [
    { id: 'concept', question: "What\'s the show about?", type: 'textarea', placeholder: "Name, concept, and who it\'s for. What gap does it fill? What do listeners walk away with?" },
    { id: 'format', question: "What\'s the format?", type: 'multi',
      options: ['Solo (just you)', 'Co-hosted', 'Interview / guests', 'Panel discussions', 'Narrative / storytelling', 'Educational / how-to', 'Mix of formats'] },
    { id: 'frequency', question: "How often will you publish?", type: 'single',
      options: ['Daily', 'Multiple times a week', 'Weekly', 'Bi-weekly', 'Monthly', 'Seasonal / limited series', 'Not sure yet'] },
    { id: 'equipment', question: "What recording setup do you have?", type: 'single',
      options: ['Professional setup — good to go', 'Basic mic — decent quality', 'Just my phone / laptop mic', 'Nothing yet — need guidance on setup', 'Remote guests on different equipment'] },
    { id: 'distribution', question: "Where do you want the show?", type: 'multi',
      options: ['Spotify', 'Apple Podcasts', 'YouTube', 'Google Podcasts', 'Amazon Music', 'Website / RSS', 'All major platforms'] },
    { id: 'existing', question: "Have you recorded any episodes yet?", type: 'single',
      options: ['Yes — ready to edit and publish', 'Recorded a pilot episode', 'Not yet — planning stage', 'I want to record the first episode with SWRV'] },
    { id: 'timeline', question: "When do you want to launch?", type: 'single',
      options: ['ASAP', 'Within a month', '2–3 months', 'No rush — let\'s build it right'] },
    { id: 'notes', question: "Anything else about the show or what you need from SWRV?", type: 'textarea', optional: true, placeholder: "Budget, sponsors, video component, social media strategy..." },
  ],

  other: [
    { id: 'describe', question: "Tell us what you\'re working on.", type: 'textarea', placeholder: "Describe your project, what you need, and what success looks like. The more detail the better — SWRV has seen a lot, nothing surprises us." },
    { id: 'urgency', question: "How urgent is this?", type: 'single',
      options: ['Urgent — need to move now', 'Moderate — within a month', 'Planning ahead — no rush', 'Exploring options — not decided yet'] },
    { id: 'budget', question: "What\'s the budget range?", type: 'single',
      options: ['Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000 – $10,000', '$10,000+', 'Not established yet'] },
    { id: 'notes', question: "Anything else — constraints, past experiences, goals?", type: 'textarea', optional: true, placeholder: "Context that helps SWRV understand the full picture..." },
  ],
  // Custom birthday song — also used standalone by the /song page, which
  // is linked from a client's invoice so the details arrive with the deposit.
  song: [
    { id: 'honoree', question: "Who is the song for — and how do you say their name?", sub: "Spell out the pronunciation so it's sung right the first time.", type: 'text', placeholder: "e.g. Name — sounds like: ..." },
    { id: 'nameStory', question: "Is there a story behind the name?", type: 'textarea', optional: true, placeholder: "Named after someone, a song, a place..." },
    { id: 'milestone', question: "Which birthday is it?", sub: "Only if you'd like it in the song.", type: 'text', optional: true, placeholder: "e.g. 40th" },
    { id: 'theme', question: "Is there a theme for the celebration?", type: 'text', optional: true, placeholder: "e.g. a garden party, 70s soul, 'a life in full bloom'" },
    { id: 'people', question: "Who should the song mention?", sub: "Names (and how to say them), plus who they are to the birthday person.", type: 'textarea', optional: true, placeholder: "e.g. Mom (Denise), best friend Kay, the twins..." },
    { id: 'memories', question: "Memories, inside jokes, or proud moments to include", type: 'textarea', placeholder: "The more specific, the more it'll feel like theirs." },
    { id: 'favorites', question: "Favorite things", type: 'textarea', optional: true, placeholder: "Foods, places, sayings, colors, music they love..." },
    { id: 'style', question: "What style should the song be?", type: 'single',
      options: ['Soulful & heartfelt (acoustic)', 'Upbeat & fun — everyone sings along', 'Gospel / inspirational', 'R&B / smooth', 'Jazz / classic', 'Afro-soul inspired', 'Surprise me'] },
    { id: 'mustSay', question: "Anything to include word-for-word — or to stay away from?", type: 'textarea', optional: true, placeholder: "A phrase they always say, a topic to avoid..." },
    { id: 'notes', question: "Anything else?", type: 'textarea', optional: true, placeholder: "When you'd like the recording, surprises to keep quiet..." },
  ],

  // Zion Vocals — Zion singing on (or producing vocals for) a client's track.
  // The beat, references and lyrics are asked for by the automatic
  // "which of these do you have ready" question built from assetsNeeded.
  vocals: [
    { id: 'artist', question: "Artist name and song title", type: 'text', placeholder: "e.g. Kay Monroe — \"Slow Burn\"" },
    { id: 'beatLink', question: "Link to the beat or session files", sub: "Dropbox, Google Drive, WeTransfer — anything we can download.", type: 'text', optional: true, placeholder: "https://..." },
    { id: 'bpmKey', question: "BPM and key", type: 'text', optional: true, placeholder: "e.g. 92 BPM, F minor" },
    { id: 'part', question: "Where does Zion come in?", sub: "Which section, and the vibe you want there.", type: 'textarea', placeholder: "e.g. The hook after verse 1 — smooth, falsetto on the last line" },
    { id: 'references', question: "Reference tracks", type: 'textarea', optional: true, placeholder: "Songs or artists that capture the sound you want" },
    { id: 'lyrics', question: "Lyrics", type: 'single',
      options: ['I have the lyrics written', 'I have a concept — Zion writes (songwriting add-on)', 'Zion freestyles within my concept'] },
    { id: 'session', question: "Session preference", sub: "Only matters for packages with a live directed session.", type: 'single', optional: true,
      options: ['Remote (anywhere in the world)', 'In studio — Atlanta', 'On location — Atlanta (+$50 add-on)'] },
    { id: 'credit', question: "How should the credit read?", type: 'text', optional: true, placeholder: "e.g. Kay Monroe feat. Zion SWRV Birdsong" },
    { id: 'notes', question: "Anything else?", type: 'textarea', optional: true, placeholder: "Release date, what you'll use the song for, anything to avoid..." },
  ],

  // Monthly social management. Access ids 'metaAccess' / 'otherAccess'
  // match the event path so the owner email flags access status the
  // same way; option wording keeps the prefixes accessStatusLines reads.
  social: [
    { id: 'brandName', question: "Brand or business name", type: 'text', placeholder: "e.g. Marcus Hill, LLC" },
    { id: 'handles', question: "Your current handles", sub: "Instagram, plus any platforms you added.", type: 'text', placeholder: "e.g. @marcushillllc on Instagram and TikTok" },
    { id: 'goal', question: "What should your social presence do for you?", sub: "Select everything that applies.", type: 'multi',
      options: ['Grow a following', 'Drive sales or bookings', 'Build authority in my field', 'Launch something new', 'Stay consistent without doing it myself'] },
    { id: 'audience', question: "Who are you trying to reach?", type: 'textarea', placeholder: "e.g. Small-business owners in Atlanta who need their books done right..." },
    { id: 'voice', question: "How should your brand sound?", type: 'multi',
      options: ['Polished and professional', 'Warm and personal', 'Bold and energetic', 'Faith-centered', 'Luxury and understated', 'Playful'] },
    { id: 'contentSource', question: "Where will the content come from?", sub: "Select all that apply. We fill the gaps.", type: 'multi',
      options: ['I have photos and video ready', "I'll capture content on my phone each month", 'I have past content we can repurpose', 'I need you to create the content'] },
    {
      id: 'metaAccess',
      question: "Have you given SWRV access to your Instagram / Facebook?",
      sub: "No password needed. You add us in Meta Business Suite and can remove us with one tap at any time.",
      type: 'single',
      options: [
        "Yes — SWRV is added in Meta Business Suite",
        "Not yet — I'll do it before we start",
        "I need help setting it up",
      ],
      help: [...(ACCESS_QUESTIONS[0].help || []).slice(0, 3), "If you ever end the plan, remove SWRV from the same screen. Your password never changes hands, so there's nothing to reset."],
    },
    {
      id: 'otherAccess',
      question: "Access for TikTok, YouTube or LinkedIn",
      sub: "Only if you added those platforms. Never type a password into this form, email, or a text message.",
      type: 'single',
      optional: true,
      options: [
        "Not needed — Instagram / Facebook / Threads only",
        "I'll add SWRV as a manager where the platform allows it (YouTube, LinkedIn)",
        "I'll send the login through a one-time link",
      ],
      help: [
        "YouTube: Settings → Permissions → Invite, add info@swrvonthego.pro as Manager.",
        "LinkedIn company page: Admin tools → Manage admins → add SWRV as Content admin.",
        "TikTok or anything else: go to onetimesecret.com (free, no account), paste the login, and send us the link. It deletes itself the moment we open it.",
      ],
    },
    { id: 'avoid', question: "Anything we should never post or talk about?", type: 'textarea', optional: true, placeholder: "Topics, competitors, words or photos to stay away from..." },
    { id: 'notes', question: "Anything else?", type: 'textarea', optional: true, placeholder: "Upcoming launches, events, promotions, how you like to approve posts..." },
  ],

  event: [
    { id: 'eventType', question: "What kind of event is it?", type: 'single',
      options: ['Birthday / private party', 'Wedding', 'Corporate or brand event', 'Conference, retreat, or launch', 'Concert or festival', 'Something else'] },
    { id: 'venue', question: "Where is it? Venue name and address.", type: 'text', placeholder: "e.g. Trileth Guesthouse Ballroom, 123 Main St" },
    { id: 'eventTime', question: "What time does it start and end?", type: 'text', placeholder: "e.g. 7:00 PM – 9:00 PM" },
    { id: 'arrival', question: "What time can we arrive to set up?", sub: "Setup happens before your start time — this keeps the clock honest on both sides.", type: 'text', optional: true, placeholder: "e.g. 6:15 PM" },
    { id: 'guests', question: "How many guests are you expecting?", type: 'single',
      options: ['Under 50', '50 – 150', '150 – 300', '300+'] },
    { id: 'onsiteContact', question: "Who's our point of contact on the day?", sub: "Name and phone of whoever will be running things on-site.", type: 'text', placeholder: "e.g. Tasha — (555) 123-4567" },
    { id: 'socials', question: "Which social accounts should content go to?", type: 'text', optional: true, placeholder: "e.g. @yourbrand on Instagram and TikTok" },
    ...ACCESS_QUESTIONS,
    { id: 'planAround', question: "Anything we should plan around?", sub: "Select all that apply.", type: 'multi', optional: true,
      options: ['Stage or performance area', 'Power outlets near our spot', 'Livestream needed', 'Another photographer/videographer on-site', 'Food provided for crew', 'Parking or load-in instructions', 'Strict run-of-show / schedule', 'Outdoor space where a drone can fly (Air Support)'] },
    { id: 'notes', question: "Anything else we should know before the day?", type: 'textarea', optional: true, placeholder: "Special moments to catch, people who must be on camera, things to avoid..." },
  ],
};

export const PATH_LABELS: Record<IntakePath, string> = {
  website: 'Website Project', video: 'Video Production', music: 'Music & Audio',
  brand: 'Brand Identity', business: 'Business Documents', podcast: 'Podcast',
  event: 'Event Coverage', song: 'Custom Song', vocals: 'Zion Vocals', social: 'Social Media', other: 'Project',
};

export function getIntakePath(serviceId: string | undefined): IntakePath | null {
  if (!serviceId) return null;
  const svc = SERVICES.find((s) => s.id === serviceId);
  if (svc?.intakePath) return svc.intakePath;
  const sub = SERVICE_SUBCATEGORIES.find((c) => c.serviceIds.includes(serviceId));
  if (sub) return sub.intakePath;
  if (svc?.checkoutCategory === 'event') return 'event';
  return svc ? 'other' : null;
}

// Built from what the service page itself says it needs — so the moment
// a service's asset list changes in site.config.ts, this question changes.
export function assetsQuestion(serviceId: string | undefined): Question | null {
  if (!serviceId) return null;
  const listed = SERVICE_ASSETS[serviceId];
  const svc = SERVICES.find((s) => s.id === serviceId);
  const items = listed ? [...listed.required, ...listed.optional] : (svc?.assetsNeeded || []);
  if (!items.length) return null;
  return {
    id: 'assetsReady',
    question: 'Which of these do you already have ready?',
    sub: 'Straight from what this service needs — we plan around whatever is missing.',
    type: 'multi',
    optional: true,
    options: [...items, "None of these yet — I'll need help"],
  };
}

// In checkout the price is already fixed and the date is picked on the
// calendar, so budget and timeline questions would just be noise there.
const SKIP_IN_CHECKOUT = new Set(['budget', 'timeline', 'urgency']);

export function buildIntakeQuestions(
  serviceId: string | undefined,
  opts: { path?: IntakePath | null; forCheckout?: boolean } = {},
): Question[] {
  const path = opts.path ?? getIntakePath(serviceId);
  if (!path) return [];
  let base = INTAKE_PATHS[path];
  const skip = new Set(SERVICES.find((s) => s.id === serviceId)?.skipQuestions || []);
  if (skip.size) base = base.filter((q) => !skip.has(q.id));
  if (opts.forCheckout) {
    base = base.filter((q) => !SKIP_IN_CHECKOUT.has(q.id));
  } else if (!base.some((q) => q.id === 'budget')) {
    // Every quote request carries a budget — the #1 thing people leave out.
    const notesIdx = base.findIndex((q) => q.id === 'notes');
    base = notesIdx === -1 ? [...base, BUDGET_Q] : [...base.slice(0, notesIdx), BUDGET_Q, ...base.slice(notesIdx)];
  }
  const assets = assetsQuestion(serviceId);
  if (!assets) return base;
  // Ask what they have ready just before the free-form notes question.
  const notesIdx = base.findIndex((q) => q.id === 'notes');
  return notesIdx === -1 ? [...base, assets] : [...base.slice(0, notesIdx), assets, ...base.slice(notesIdx)];
}
