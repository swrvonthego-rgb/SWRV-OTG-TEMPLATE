// ════════════════════════════════════════════════════════════
// modules/shop/config.ts — Shop module configuration
// ════════════════════════════════════════════════════════════
//
// Edit this file to update product images, labels, accent colors,
// and the storefront URL. The Shop component (Shop.tsx) reads
// everything from here.
//
// To clone for a new client:
//   1. Update STORE_URL to the client's storefront
//   2. Update HEADER copy
//   3. Update FEATURED with their product photos
// ════════════════════════════════════════════════════════════

export interface ShopProduct {
  label: string;
  tagline: string;
  /** Tailwind gradient classes (used for hover wash on the tile) */
  accent: string;
  /** Product image URL — full Cloudinary or other CDN URL */
  image: string;
  /** If true, image sits on a white background tile (funky pop-out) */
  bgWhite?: boolean;
}

export const SHOP_CONFIG = {
  storeName: 'SWERVE Get In Gear',
  storeNameAccent: 'Get In Gear', // italicized in heading
  storeNamePrefix: 'SWERVE',
  tagline: 'Keep it rolling.',
  description:
    'Hoodies, tees, and the gear that goes with the message. Every piece is a small ride forward.',
  storeUrl: 'https://swrv.printful.me/',
  ctaPrimary: 'Browse the Whole Store',
  fulfillmentNote: 'Shipped via Printful · Worldwide delivery',

  featured: [
    {
      label: 'Cropped Hoodies',
      tagline: 'wear the wisdom',
      accent: 'from-orange-500/15 via-orange-500/5 to-transparent',
      image:
        'https://res.cloudinary.com/dastq6bk5/image/upload/v1778299527/womens-cropped-hoodie-black-front-69fdcb05dc414_lqi1p7.png',
      bgWhite: true,
    },
    {
      label: 'Performance Tees',
      tagline: 'everyday revolution',
      accent: 'from-amber-500/15 via-amber-500/5 to-transparent',
      image:
        'https://res.cloudinary.com/dastq6bk5/image/upload/v1778299621/all-over-print-recycled-unisex-sports-jersey-white-front-69fdcb512b252_mxop04.png',
    },
    {
      label: 'Dad Hats',
      tagline: 'small flexes',
      accent: 'from-yellow-500/15 via-yellow-500/5 to-transparent',
      image:
        'https://res.cloudinary.com/dastq6bk5/image/upload/v1778299694/classic-dad-hat-black-front-69fdcbb11318f_rlpg8c.png',
    },
  ] as ShopProduct[],
} as const;
