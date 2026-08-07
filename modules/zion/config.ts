// ════════════════════════════════════════════════════════════
// modules/zion/config.ts — Zion artist page configuration
// ════════════════════════════════════════════════════════════
//
// Single source of truth for all editable content on the Zion
// SWRV Birdsong artist page. The component (Zion.tsx) reads from
// here instead of hardcoded strings.
//
// To rebrand for another artist:
//   1. Update IDENTITY (name, role, slogan, taglines)
//   2. Update IMAGES (hero portrait, about photo, etc.)
//   3. Update STATS, BOOKS, PODCAST, SERVICES, BOOKING
// ════════════════════════════════════════════════════════════

export const ZION_CONFIG = {
  // ── IDENTITY ────────────────────────────────────────────
  identity: {
    firstName: 'Zion',
    middle: '"SWRV"',
    lastName: 'Birdsong',
    roles: 'Singer · Songwriter · Producer · Author · Performer',
    fullAcronym: 'Serving With Righteous Vision',
    slogan: 'Swerve on your roadblocks · Let love GPS',
    backLabel: '← SWRV OTG',
  },

  // ── HERO ────────────────────────────────────────────────
  hero: {
    portraitUrl:
      'https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/IMG_0394_ltsii7_e8t7lp.jpg',
    primaryCta: { label: 'Book a Performance', href: '#booking' },
    secondaryCta: { label: 'Get the Books', href: '#books' },
  },

  // ── ABOUT ───────────────────────────────────────────────
  about: {
    eyebrow: 'Who I Am',
    title: 'The Story Behind The Sound',
    photoUrl:
      'https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/8A350C02-C84D-41B2-8893-80A79AF3883D_kwild2_flwsqm.png',
    workWithMeCta: { label: 'Work With Me', href: '#booking' },
    paragraphs: [
      "I'm Zion 'SWRV' Birdsong — a singer, songwriter, producer, author, and performer who built his sound the same way he builds everything: from the inside out.",
      "Music came first. Then the words wanted to be on a page. Then the wisdom needed to reach further than a stage. That's how SWRV — Serving With Righteous Vision — went from being something I lived to something I teach.",
      "I work with artists, brands, and movements who know they have something to say but need help making it sound like itself. That's the work.",
    ],
    stats: [
      { value: '15+', label: 'Years in Music' },
      { value: '2', label: 'Books Published' },
      { value: '50+', label: 'Songs to Release' },
      { value: '1', label: 'One Movement' },
    ],
  },

  // ── SERVICES (artist-side, not the agency catalog) ──────
  services: {
    eyebrow: 'What I Offer',
    title: 'Performance · Coaching · Collaboration',
    items: [
      {
        title: 'Live Performances',
        body:
          'Solo or with a band. Acoustic intimate sets to full-stage shows. House parties, weddings, corporate, listening rooms.',
      },
      {
        title: 'Vocal Coaching',
        body:
          'The Birdsong Method — projection, breath control, and the kind of presence that fills a room without forcing anything.',
      },
      {
        title: 'Recording & Production',
        body:
          'In-studio production, vocal direction, and collaboration on your record. I bring the room with me.',
      },
      {
        title: 'Speaking & Workshops',
        body:
          'Wisdom talks, leadership keynotes, and creative workshops drawn from 20+ years of building lives and brands from the ground up.',
      },
    ],
  },

  // ── BOOKS ───────────────────────────────────────────────
  books: {
    eyebrow: 'The Books',
    title: 'Wisdom in Print',
    items: [
      {
        title: 'The Roadmap (Blueprint Your Vision)',
        coverUrl:
          'https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/The_Roadmap_Front_Cover_fqpeds.jpg',
        audiobookCoverUrl:
          'https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/The_Roadmap_Front_Cover_AUDIOBOOK_gwjmil.jpg',
        blurb:
          'A practical guide to mapping your gift, your work, your purpose, and the path between where you are and where you\'re going.',
        buyUrl: 'https://www.amazon.com/dp/B0F9R3D9KN',
      },
      {
        title: 'SWRV In Your Gift',
        coverUrl:
          'https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/IMG_3064_2_ol70jx_v0xprq.jpg',
        blurb:
          'Living from your righteous vision in a world built on borrowed ones.',
        buyUrl: 'https://www.amazon.com/author/zionbirdsong',
      },
    ],
  },

  // ── PODCAST ─────────────────────────────────────────────
  podcast: {
    eyebrow: 'The Podcast',
    title: 'SWRV Talk',
    coverUrl:
      'https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/swrv-talk-podcast_kxxhdb.jpg',
    blurb:
      'Wisdom, motivation, and behind-the-scenes stories from the journey. Tune in to the conversation.',
    listenUrl: 'https://swrvtalk.com',
    cta: 'Listen to SWRV Talk',
  },

  // ── BOOKING ─────────────────────────────────────────────
  booking: {
    eyebrow: 'Book Me',
    title: 'Book SWRV Birdsong For Your Event',
    blurb:
      'Weddings, festivals, private parties, corporate events, bookstore takeovers, listening rooms — pick your date, tell me the vision, and lock it in.',
    // ── DEPOSIT ──────────────────────────────────────────
    // A $50 deposit secures the date. paypal.me supports a preset amount
    // via the /50 path form, so this link opens PayPal pre-filled at $50.
    depositAmount: 50,
    depositUrl: 'https://paypal.me/swrvonthego/50',
    depositNote:
      'A $50 deposit secures your date. The rest of the fee is negotiated based on your event, location, and set length — I\'ll follow up personally to lock in the details.',
    submitTo: 'info@swrvonthego.pro',
    // Event booking inquiry types
    inquiryTypes: [
      'Live Performance / Event',
      'Wedding / Private Party',
      'Corporate / Brand Event',
      'Bookstore / Listening Room',
      'Speaking / Workshop',
      'Recording / Production',
      'Something Else',
    ],
  },

  // ── PHILOSOPHY MARQUEE ──────────────────────────────────
  philosophyText:
    '🏁 SWRV · SWERVE ON YOUR ROADBLOCKS · LET LOVE GPS · SERVING WITH RIGHTEOUS VISION · ',

  // ── FOOTER ──────────────────────────────────────────────
  footer: {
    socialLinks: [
      { label: 'Instagram', href: 'https://instagram.com/zionswrvbirdsong' },
      { label: 'YouTube', href: '' },
      { label: 'Spotify', href: '' },
      { label: 'Apple Music', href: '' },
    ],
    ecosystemBarText: 'Part of the SWRV ecosystem',
    ecosystemBarLink: 'SWRV ON THE GO ECOSYSTEM →',
  },
} as const;
