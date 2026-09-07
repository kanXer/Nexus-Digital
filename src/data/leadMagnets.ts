export interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  icon: "CheckSquare" | "MapPin" | "Calculator" | "BookOpen" | "Rocket";
  bullets: string[];
  tag: string;
  file: string; // path in /public
}

export const leadMagnets: LeadMagnet[] = [
  {
    id: "dm-checklist",
    title: "2025 Digital Marketing Checklist",
    description: "The exact 40-point pre-launch checklist our team uses to plan high-ROI campaigns for local brands.",
    icon: "CheckSquare",
    bullets: ["SEO & Local SEO setup", "Ad account structure", "Landing page CRO", "WhatsApp automation"],
    tag: "Most popular",
    file: "/lead-magnets/digital-marketing-checklist.txt",
  },
  {
    id: "seo-blueprint",
    title: "Local SEO Growth Blueprint",
    description: "A step-by-step blueprint to rank your business on Google Maps and “near me” searches in your city.",
    icon: "MapPin",
    bullets: ["Google Business Profile", "Citation building", "Review strategy", "Content calendar"],
    tag: "For local brands",
    file: "/lead-magnets/local-seo-blueprint.txt",
  },
  {
    id: "roi-calculator",
    title: "Ad Spend ROI Calculator",
    description: "A ready-to-use Google Sheet that tells you exactly how much to spend on Meta & Google Ads to hit your lead target.",
    icon: "Calculator",
    bullets: ["CPL benchmarks", "Budget allocator", "ROAS tracker", "Forecast model"],
    tag: "For advertisers",
    file: "/lead-magnets/ad-roi-calculator.txt",
  },
];
