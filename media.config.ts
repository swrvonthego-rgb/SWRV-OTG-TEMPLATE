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

const R2 = {
  swrvOtg: 'https://assets.swrvonthego.pro/SWRV%20OTG%20Assets',
  roadmap: 'https://assets.swrvonthego.pro/The%20Roadmap%20App%20Assets',
} as const;

export const MEDIA = {
  brand: {
    logo: `${R2.swrvOtg}/SWRV_BADGE_2024_transparent_bb8kyy.png`,
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
      petLovers: `${R2.swrvOtg}/cld-sample-4_r2rwnh.jpg`,
      travelers: `${R2.swrvOtg}/shoe_e9qvna.jpg`,
      fashionDesigners: `${R2.swrvOtg}/man-portrait_xykmg4.jpg`,
      musicalArtists:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
    },
  },

  services: {
    // The "Meet the Leader of the Revolution" tile image
    leaderTile: `${R2.swrvOtg}/1752950982581945_2_kk3jt3_ui7upw.png`,
  },
} as const;
