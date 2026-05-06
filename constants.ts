import { Service, Question, NavItem, ExecutionService } from './types';

export const SERVICES: Service[] = [
  {
    title: "Brand Planning",
    description: "Map your vision roadmap. AI helps clarify your path, then we support you in executing it with power and passion.",
    icon: "Briefcase"
  },
  {
    title: "Artist Development",
    description: "The one-stop shop for your bigger vision. We handle the logistics so you can create the art.",
    icon: "Globe"
  },
  {
    title: "BYOB Training",
    description: "Fitness & Self-Defense Coaching. Train your body, protect your peace. Visit trainbyob.me.",
    icon: "CheckCircle"
  },
  {
    title: "Authorship",
    description: "Books to guide your journey: 'SWRV In Your Gift' and 'The RoadMap (Blueprint Your Vision)'.",
    icon: "FileText"
  },
  {
    title: "SWRV Talk Podcast",
    description: "Wisdom, motivation, and behind-the-scenes stories from the journey. Tune in to the conversation.",
    icon: "Database"
  }
];

export const EXECUTION_SERVICES: ExecutionService[] = [
  // Branding & Design
  {
    id: "logo-design",
    name: "Logo Design",
    category: "Branding & Identity",
    description: "Custom logo design with 3 concepts, 2 revision rounds, multiple file formats",
    price: 500
  },
  {
    id: "brand-identity",
    name: "Complete Brand Identity System",
    category: "Branding & Identity",
    description: "Logo, color palette, typography system, brand guidelines, icon system, social templates",
    price: 1500
  },
  {
    id: "mission-vision",
    name: "Mission, Vision & Positioning",
    category: "Branding & Identity",
    description: "Mission statement, vision statement, core values, unique positioning, slogan options",
    price: 800
  },
  {
    id: "social-strategy",
    name: "Social Media Strategy",
    category: "Marketing & Growth",
    description: "Content calendar (3 months), platform strategy, posting optimization, engagement guide",
    price: 500
  },
  
  // Digital Platforms
  {
    id: "website-basic",
    name: "Professional Website (5 Pages)",
    category: "Digital Presence",
    description: "Responsive website with portfolio, about, services, contact, SEO-ready structure",
    price: 1200
  },
  {
    id: "website-custom",
    name: "Custom Website Build",
    category: "Digital Presence",
    description: "10+ page professional website with advanced features, CRM integration, analytics",
    price: 3000
  },
  {
    id: "ecommerce-setup",
    name: "E-Commerce Store Setup",
    category: "Digital Presence",
    description: "Shopify integration, Printful setup, product templates, inventory management, payment processing",
    price: 2000
  },
  {
    id: "email-marketing",
    name: "Email Marketing Setup",
    category: "Digital Presence",
    description: "Email platform setup, automation sequences, subscriber capture forms, templates",
    price: 400
  },

  // Business Infrastructure
  {
    id: "llc-formation",
    name: "LLC Formation & Documents",
    category: "Business Infrastructure",
    description: "LLC filing, business bank account setup consultation, legal contract templates",
    price: 1500
  },
  {
    id: "accounting-setup",
    name: "Accounting & Bookkeeping System",
    category: "Business Infrastructure",
    description: "QuickBooks setup, expense tracking, accounting system, tax preparation guide",
    price: 800
  },
  {
    id: "business-insurance",
    name: "Business Insurance Consultation",
    category: "Business Infrastructure",
    description: "Insurance strategy review, coverage recommendations, provider connections",
    price: 300
  },

  // Performance Rights & Sync
  {
    id: "pro-workshop",
    name: "Performance Rights Organization Workshop",
    category: "Rights & Licensing",
    description: "BMI vs ASCAP vs SESAC education, registration assistance, performance royalties explained",
    price: 400
  },
  {
    id: "pro-registration",
    name: "Complete PRO Registration",
    category: "Rights & Licensing",
    description: "Full registration with BMI, ASCAP, and SESAC, songwriting info upload, split ownership",
    price: 500
  },
  {
    id: "sync-licensing",
    name: "Sync Licensing Network & Education",
    category: "Rights & Licensing",
    description: "Sync licensing education, platform submissions, licensing deal structure guidance",
    price: 1000
  },

  // Audio & Recording
  {
    id: "vocal-coaching",
    name: "Vocal Coaching (Birdsong Method)",
    category: "Music Production",
    description: "Voice training, range expansion, vocal technique, 5 sessions",
    price: 750
  },
  {
    id: "recording-session",
    name: "Professional Recording Session",
    category: "Music Production",
    description: "Studio time with engineer, recording, mixing, mastering (per song)",
    price: 300
  },
  {
    id: "songwriting-workshop",
    name: "Songwriting Workshop",
    category: "Music Production",
    description: "4-session songwriting bootcamp, melody, lyrics, song structure",
    price: 800
  },

  // Media & Content
  {
    id: "photography-shoot",
    name: "Professional Photography Shoot",
    category: "Media Production",
    description: "4-hour shoot, 200+ edited photos, social media versions, print-ready files",
    price: 800
  },
  {
    id: "videography",
    name: "Videography & Content Creation",
    category: "Media Production",
    description: "Behind-the-scenes footage, testimonial videos, promotional clips, 10+ social video cuts",
    price: 1500
  },
  {
    id: "media-kit",
    name: "Professional Media Kit",
    category: "Marketing & Growth",
    description: "4-6 page PDF media kit, statistics, press mentions, sponsorship opportunities",
    price: 500
  },

  // Merchandise
  {
    id: "merchandise-design",
    name: "Merchandise Design & Strategy",
    category: "Merchandise & Products",
    description: "Merchandise strategy, product design, print-on-demand setup",
    price: 1000
  },

  // Coaching & Strategy
  {
    id: "business-coaching",
    name: "Monthly Business Coaching",
    category: "Strategy & Growth",
    description: "Monthly calls, business planning, accountability, problem-solving",
    price: 500
  },
  {
    id: "quarterly-retreat",
    name: "Quarterly Strategy Retreat",
    category: "Strategy & Growth",
    description: "Full-day strategic planning, goal setting, team coordination, deep work",
    price: 1500
  },
  {
    id: "contract-review",
    name: "Contract Review & Negotiation Guidance",
    category: "Strategy & Growth",
    description: "Non-legal contract review, deal structure guidance, hourly consultations",
    price: 200
  },

  // Package Deals
  {
    id: "tier-1-bundle",
    name: "Tier 1: Core Branding Foundation",
    category: "Package Deals",
    description: "Logo, brand identity, mission/vision, 5-page website, onboarding call",
    price: 3500
  },
  {
    id: "tier-2-bundle",
    name: "Tier 2: Full Ecosystem Build",
    category: "Package Deals",
    description: "Everything in Tier 1 + LLC formation, PRO setup, social strategy, e-commerce, sync licensing, 3 coaching calls",
    price: 8500
  },
  {
    id: "tier-3-bundle",
    name: "Tier 3: Artist Development Package",
    category: "Package Deals",
    description: "Everything in Tier 2 + recording, photography/video, premium website, media kit, quarterly coaching (1 year)",
    price: 15000
  }
];

export const NAV_ITEMS: NavItem[] = [
  { label: "THE ECOSYSTEM", href: "#ecosystem" },
  { label: "BYOB TRAINING", href: "https://trainbyob.me", target: "_blank" },
  { label: "ABOUT SWRV", href: "#about-swrv" },
  { label: "ZION SWRV BIRDSONG", href: "https://swrvbirdsong.netlify.app/", target: "_blank" },
];

export const CONSULTATION_QUESTIONS: Question[] = [
  {
    id: "identity",
    category: "Artist Identity",
    text: "What is the core emotion of your current era?",
    context: "We align our visual strategy with the emotional tone of your latest work.",
    options: ["Rebellious & Raw", "Polished & Pop", "Introspective & Deep", "Experimental & Avant-Garde"]
  },
  {
    id: "stage",
    category: "Career Stage",
    text: "Where are you in your journey?",
    context: "Our services scale from independent breakouts to stadium headliners.",
    options: ["Emerging Artist", "National Touring Act", "Global Icon", "Legacy Act"]
  },
  {
    id: "focus",
    category: "Strategic Focus",
    text: "What is the immediate priority?",
    context: "Swrv On The Go helps you navigate roadblocks to hit your next milestone.",
    options: ["Tour Logistics", "Album Rollout", "Rebranding", "Fan Base Expansion"]
  },
  {
    id: "platform",
    category: "Digital Presence",
    text: "Where does your community live?",
    context: "We tailor content strategies to where your fans are most active.",
    options: ["TikTok & Instagram", "Spotify & Apple Music", "YouTube & Vevo", "Discord & Twitch"]
  }
];