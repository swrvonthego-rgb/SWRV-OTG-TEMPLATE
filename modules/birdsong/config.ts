// ════════════════════════════════════════════════════════════
// modules/birdsong/config.ts — The Birdsong Method overlay
// ════════════════════════════════════════════════════════════
//
// All editable copy + media for The Birdsong Method in-site overlay.
// This is a CONDENSED version of the full the-birdsong-method.pages.dev site —
// hero, philosophy, vocal analyzer hero CTA, programs — that drives serious
// students to the standalone Birdsong site for enrollment.
//
// The standalone site stays live independently; this overlay is a
// SECOND distribution surface for visitors who entered through SWRV.
// ════════════════════════════════════════════════════════════

export const BIRDSONG_CONFIG = {
  // ── EXTERNAL LINKS ──────────────────────────────────────
  externalSiteUrl: 'https://the-birdsong-method.pages.dev',
  analyzerUrl:     'https://the-birdsong-method.pages.dev/vocal-analyzer.html',
  enrollEmail:     'mailto:swrvbirdsong@gmail.com?subject=The Birdsong Method Enrollment',

  // ── HERO ────────────────────────────────────────────────
  hero: {
    eyebrow: 'THE BIRDSONG METHOD',
    title: 'Find Out What\nYour Voice\nCan Do.',
    subtitle: 'Vocal training that unlocks the artist in you.',
    body: 'A studio-trained vocal coaching system built by SWRV Birdsong. Master breath, pitch, range, resonance, and dynamics — then bring the song that\'s already inside you into the world.',
    primaryCta: { label: 'Try the Vocal Analyzer · $1', href: 'https://the-birdsong-method.pages.dev/vocal-analyzer.html' },
    secondaryCta: { label: 'Visit the-birdsong-method →', href: 'https://the-birdsong-method.pages.dev' },
  },

  // ── MARQUEE STRIP ───────────────────────────────────────
  marqueeText:
    '♪ THE BIRDSONG METHOD · BREATH · PITCH · RANGE · RESONANCE · DYNAMICS · YOUR VOICE IS THE INSTRUMENT · ',

  // ── VOCAL ANALYZER FEATURE ──────────────────────────────
  analyzer: {
    eyebrow: 'THE FLAGSHIP TOOL',
    title: 'Hear yourself like a coach would.',
    body: 'Sixty seconds. Five real scores. One clear path forward.',
    description: 'Our AI-powered vocal analyzer takes you through four guided vocal tasks — sustained notes, range slides, natural speech, and melodic humming — then scores your pitch stability, breath support, vocal range, resonance, and dynamic control. You walk away with a personalized radar chart and the exact program built for where you are right now.',
    features: [
      'Real-time pitch detection during recording',
      '5-dimension professional scoring',
      'Personalized tier recommendation',
      'Save your results · come back to challenge yourself',
    ],
    cta: { label: 'Run My Vocal Analysis · $1', href: 'https://the-birdsong-method.pages.dev/vocal-analyzer.html' },
  },

  // ── ABOUT ───────────────────────────────────────────────
  about: {
    eyebrow: 'THE METHOD',
    title: 'Built by a performer, for performers.',
    paragraphs: [
      "SWRV Birdsong is a recording artist, vocal coach, and multi-disciplinary creator who has spent over two decades learning how the voice works — not just mechanically, but as a full expression of identity.",
      "The Birdsong Method is built on one truth: your voice already has everything it needs. This training removes what's in the way — tension, limitation, and fear — and replaces it with technique, confidence, and artistry.",
    ],
    quote: "The song is already in you. We just find the path.",
    quoteAuthor: 'SWRV BIRDSONG',
  },

  // ── INSIDE THE STUDIO (what training actually looks like) ─
  instructors: {
    eyebrow: 'INSIDE THE STUDIO',
    title: 'Studio vocal training that zooms in on you.',
    body: "Every session runs in a real studio — targeted, focused, and captured. We zoom in on the exact technique your voice needs next, then hand you the recordings so you can hear your own progress week over week.",
    coaches: [
      { src: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/Birdsong%20Method%20Guy.png', name: 'Studio-Based Training', role: 'Real mic. Real room. Real time.', alt: 'One-on-one studio vocal training in progress' },
      { src: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/Birdsong%20Method%20Instructor%202.png', name: 'Focused Deep-Dives', role: 'One skill at a time. No filler.', alt: 'Focused vocal technique training' },
      { src: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets/Women%20Vocal%20Trainers.jpeg', name: 'Recordings You Keep', role: 'Every session captured. Track your growth.', alt: 'Students reviewing their recorded vocal training' },
    ],
  },

  // ── PILLARS (what they'll master) ───────────────────────
  pillars: [
    {
      title: 'Breath & Support',
      icon: 'Wind',
      desc: 'Diaphragm-driven control is the engine of every great voice. We build the breath you need to sustain, project, and never run out mid-phrase.',
      accent: 'gold',
    },
    {
      title: 'Pitch & Resonance',
      icon: 'Music',
      desc: "Develop your ear and your tone. We work on pitch accuracy, tonal warmth, and the ability to color your sound intentionally across every register.",
      accent: 'rust',
    },
    {
      title: 'Performance Voice',
      icon: 'Mic',
      desc: 'Technique without presence is empty. We address stage fear, vocal identity, and how to hold a room with full conviction.',
      accent: 'sage',
    },
  ],

  // ── PROGRAMS ────────────────────────────────────────────
  programs: {
    eyebrow: 'PROGRAMS',
    title: 'Choose your flight path.',
    body: 'Every voice is at a different stage. Every program meets you there. Start with the analyzer to know exactly where you land.',
    tiers: [
      { name: 'Early Bird',   price: '$97',  bird: '🐣', tagline: 'Foundational fundamentals' },
      { name: 'The Birdsong', price: '$247', bird: '🎵', tagline: 'Core method, full experience' },
      { name: "Rockin' Robin", price: '$497', bird: '🪶', tagline: 'Most popular · Serious growth' },
      { name: 'The Eagle Course', price: '$997', bird: '🦅', tagline: 'Elite transformation' },
    ],
  },

  // ── CTA BAR ────────────────────────────────────────────
  ctaBar: {
    headline: 'Your voice is waiting.',
    body: "Start with the $1 analyzer. Find out where you are. Then take the path forward that fits.",
    primary:   { label: 'Try the Analyzer · $1', href: 'https://the-birdsong-method.pages.dev/vocal-analyzer.html' },
    secondary: { label: 'Visit Full Site', href: 'https://the-birdsong-method.pages.dev' },
  },
} as const;
