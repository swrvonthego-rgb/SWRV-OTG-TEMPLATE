// ════════════════════════════════════════════════════════════
// media.config.ts — Central media manifest
// ════════════════════════════════════════════════════════════
//
// All Cloudinary URLs and image references live here, organized by
// section. To swap an image: edit one URL in this file. Components
// import named keys (e.g. `MEDIA.brand.logo`, `MEDIA.shop.hoodie`).
//
// NOTE: the modules (modules/roadmap, modules/zion, modules/shop)
// have their OWN config files for their own assets — those are
// authoritative for those modules. THIS file is for assets used
// by the main marketing site (Header, Hero, Services, Footer, About).
//
// Cloudinary accounts in use:
//   • dzqxce5hv  — main brand logo
//   • dastq6bk5  — hero/services/shop product mockups
//   • dlxkwdyk7  — Zion artist photos (used by zion module)
//   • ddzyvfolr  — roadmap theme music tracks
// ════════════════════════════════════════════════════════════

const CLOUDINARY = {
  brand: 'https://res.cloudinary.com/dzqxce5hv/image/upload',
  marketing: 'https://res.cloudinary.com/dastq6bk5/image/upload',
  artist: 'https://res.cloudinary.com/dlxkwdyk7/image/upload',
  music: 'https://res.cloudinary.com/ddzyvfolr/video/upload',
} as const;

export const MEDIA = {
  brand: {
    logo: `${CLOUDINARY.brand}/v1772222265/Swerve_Badge_eow6m0.png`,
  },

  hero: {
    // Hero column cards (carousel images). Each used in Hero.tsx
    columns: {
      fightingArts:
        'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop',
      culinary:
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop',
      realtors:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
      petLovers: `${CLOUDINARY.marketing}/v1776950508/cld-sample_p72mk2.jpg`,
      travelers: `${CLOUDINARY.marketing}/v1776950507/shoe_e9qvna.jpg`,
      fashionDesigners: `${CLOUDINARY.marketing}/v1776950507/man-portrait_xykmg4.jpg`,
      musicalArtists:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
    },
  },

  services: {
    // The "Meet the Leader of the Revolution" tile image
    leaderTile: `${CLOUDINARY.marketing}/v1775906943/1752950982581945_2_kk3jt3_ui7upw.png`,
  },
} as const;
