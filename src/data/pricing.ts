export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  priceRange: string;
  period: string;
  priceInr: number;
  badge?: string;
  highlight: boolean;
  features: PricingFeature[];
  cta: string;
  ctaLink: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    tagline: "Best for Tier-2 & Tier-3 Cities",
    priceRange: "₹10,000",
    period: "/month",
    priceInr: 10000,
    highlight: false,
    features: [
      { text: "Social Media Management", included: true },
      { text: "Basic Meta Ads Management", included: true },
      { text: "GMB Optimization", included: true },
      { text: "Monthly Performance Report", included: true },
      { text: "Reels / Short Videos", included: false },
      { text: "Google Search Ads", included: false },
      { text: "Landing Page Setup", included: false },
      { text: "Lead Tracking", included: false },
      { text: "SEO Optimisation", included: false },
      { text: "On-site Video Shoots", included: false },
      { text: "PR & Local News Distribution", included: false },
      { text: "Complete Automation", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/contact#book-consultation",
  },
  {
    id: "growth",
    name: "Growth / Campaign Plan",
    tagline: "For businesses ready to scale with paid ads and lead generation",
    priceRange: "₹20,000",
    period: "/month",
    priceInr: 20000,
    badge: "Most Popular",
    highlight: true,
    features: [
      { text: "Social Media Management + Reels", included: true },
      { text: "Meta Ads", included: true },
      { text: "Google Search Ads", included: true },
      { text: "Landing Page Setup", included: true },
      { text: "Lead Tracking", included: true },
      { text: "One-Time Landing Page", included: true },
      { text: "Monthly Performance Report", included: true },
      { text: "GMB Optimization", included: true },
      { text: "SEO Optimisation", included: false },
      { text: "On-site Video Shoots", included: false },
      { text: "PR & Local News Distribution", included: false },
      { text: "Complete Automation", included: false },
    ],
    cta: "Book Free Consultation",
    ctaLink: "/contact#book-consultation",
  },
  {
    id: "premium",
    name: "Premium Plan",
    tagline: "Full-stack marketing for maximum growth and brand authority",
    priceRange: "₹30,000",
    period: "/month",
    priceInr: 30000,
    highlight: false,
    features: [
      { text: "Full-stack Marketing", included: true },
      { text: "On-site Video Shoots", included: true },
      { text: "PR (Public Relations)", included: true },
      { text: "Local News Distribution", included: true },
      { text: "SEO", included: true },
      { text: "Complete Automation", included: true },
      { text: "Meta Ads", included: true },
      { text: "Google Search Ads", included: true },
      { text: "Monthly Performance Report", included: true },
      { text: "Dedicated Strategy Calls", included: true },
      { text: "Priority Support", included: true },
    ],
    cta: "Book Free Consultation",
    ctaLink: "/contact#book-consultation",
  },
];

export const pricingFaqs = [
  {
    q: "Is there a setup fee?",
    a: "No, there are no hidden setup fees. The price you see is what you pay. We may charge a one-time onboarding fee for Premium plans that require significant initial setup work.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Absolutely. You can upgrade or downgrade at any time with 30 days notice. We will pro-rate any billing differences accordingly.",
  },
  {
    q: "Do you require long-term contracts?",
    a: "We offer month-to-month agreements with no long-term lock-in. However, clients who commit to 6 or 12 months receive priority support and discounted rates.",
  },
  {
    q: "What is the minimum ad spend required?",
    a: "For Meta Ads, we recommend a minimum ad spend of ₹10,000/month. For Google Ads, a minimum of ₹15,000/month is recommended for meaningful results.",
  },
  {
    q: "How soon will I see results?",
    a: "Social media results typically show within 30–60 days. Paid ads can show results within the first week. SEO is a long-term strategy with visible improvements in 3–6 months.",
  },
];
