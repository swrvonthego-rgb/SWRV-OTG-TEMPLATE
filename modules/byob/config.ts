// ════════════════════════════════════════════════════════════
// modules/byob/config.ts — BYOB Training overlay configuration
// ════════════════════════════════════════════════════════════
//
// All editable copy + media for the BYOB Training in-site overlay.
// This is a CONDENSED version of the full trainbyob.me site —
// hero, philosophy, disciplines, youth, virtual — that drives serious
// leads to the standalone trainbyob.me site for booking + waivers.
//
// The standalone site stays live independently; this overlay is a
// SECOND distribution surface for visitors who entered through SWRV.
// ════════════════════════════════════════════════════════════

export const BYOB_CONFIG = {
  // ── EXTERNAL LINKS ──────────────────────────────────────
  externalSiteUrl: 'https://trainbyob.me',
  bookingUrl: 'https://trainbyob.me/#pricing',
  joinUrl: 'https://trainbyob.me/join',
  virtualPortalUrl: 'https://trainbyob.me/virtual-portal',

  // ── HERO ────────────────────────────────────────────────
  hero: {
    eyebrow: 'BUILD YOUR OWN BODYGUARD',
    title: 'BYOB',
    subtitle: 'Train your body. Protect your peace.',
    body: 'A modern self-defense system rooted in awareness, mentality, and movement. For adults who want to feel ready, and youth who deserve to grow up confident.',
    primaryCta: { label: 'Book a Session', href: 'https://trainbyob.me/#pricing' },
    secondaryCta: { label: 'Visit trainbyob.me →', href: 'https://trainbyob.me' },
    backgroundVideo:
      'https://res.cloudinary.com/dqm5ehvto/video/upload/v1773584653/BYOB_KID_VID_1080_STUDIO_xlyper.mp4',
  },

  // ── MARQUEE STRIP ───────────────────────────────────────
  marqueeText:
    '⚔ TRAIN BY OWN BODYGUARD · MENTAL SWITCH · DISRUPT · MOVE · AWARENESS · ',

  // ── ABOUT ───────────────────────────────────────────────
  about: {
    eyebrow: 'WHO WE TRAIN',
    title: 'For people who matter to themselves and to someone else.',
    paragraphs: [
      "BYOB isn't martial arts. It isn't a fitness class. It's a self-defense system designed for adults living real lives — parents, professionals, students, anyone who's tired of feeling unprepared.",
      "We pull from Jeet Kune Do, Muay Thai, boxing, and Kali. We strip out the tournament posturing. What's left is pure functionality: awareness, decision-making, body mechanics, and the mental switch that lets you act when it matters.",
    ],
  },

  // ── DISCIPLINES (the 3 pillars) ─────────────────────────
  disciplines: [
    {
      title: 'Mental Switch',
      icon: 'Brain',
      desc: "The body already knows what to do. The mind has to give it permission. BYOB coaches the mental switch — moving from calm to fully present in an instant, and back to calm just as quickly. This is not aggression. This is clarity.",
      accent: 'neon-orange',
    },
    {
      title: 'Disrupt',
      icon: 'Zap',
      desc: "Most situations end before they begin. BYOB coaches you to intercept problems early — to read the moment before it becomes a threat. Disruption is initiative, not aggression.",
      accent: 'neon-yellow',
    },
    {
      title: 'Move',
      icon: 'Shield',
      desc: "Position is everything. Footwork, timing, distance, and angular movement train you to never be where the problem is going. Movement is thinking with your feet.",
      accent: 'neon-blue',
    },
  ],

  // ── YOUTH SECTION ───────────────────────────────────────
  youth: {
    eyebrow: 'YOUTH PROGRAM',
    title: 'Confidence is a curriculum.',
    body: "Kids deserve to grow up feeling capable, not afraid. Our youth program teaches body awareness, conflict de-escalation, and the discipline of self-trust through age-appropriate movement. Dollar Saturdays available — first session is just $1.",
    cta: { label: 'Learn More About Youth', href: 'https://trainbyob.me/#youth' },
  },

  // ── VIRTUAL COACHING ────────────────────────────────────
  virtual: {
    eyebrow: 'CAN\'T MAKE IT IN PERSON?',
    title: 'Virtual coaching available.',
    body: 'Live one-on-one virtual sessions for awareness, scenario training, and mindset coaching — anywhere in the world.',
    cta: { label: 'Virtual Portal →', href: 'https://trainbyob.me/virtual-portal' },
  },

  // ── CTA BAR ────────────────────────────────────────────
  ctaBar: {
    headline: 'Ready to train?',
    body: 'Booking, scheduling, waiver signing, and Dollar Saturday signup all happen on the main BYOB site.',
    primary: { label: 'Visit trainbyob.me', href: 'https://trainbyob.me' },
    secondary: { label: 'Book Your Session', href: 'https://trainbyob.me/#pricing' },
  },
} as const;
