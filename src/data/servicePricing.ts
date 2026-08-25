export interface ServicePricingItem {
  id: string;
  serviceName: string;
  deliverables: string[];
  freelanceInr: number;
  agencyInr: number;
  cycle: "monthly" | "one-time";
  disclaimer: string;
}

export interface ServicePricingCategory {
  category: string;
  items: ServicePricingItem[];
}

export const servicePricing: ServicePricingCategory[] = [
  {
    category: "Performance Marketing",
    items: [
      {
        id: "meta-ads-ai",
        serviceName: "Meta Ads Management + AI Optimization",
        deliverables: [
          "AI-Powered Copywriting & Dynamic Visual Creative Variations",
          "Automated Rules Setup (Budget Scaling & Fatigue Pause)",
          "Meta Pixel, Custom Conversion & CAPI Setup",
          "Audience Segmentation & Lookalike AI Expansion",
          "Weekly Performance & ROAS Optimization Report",
        ],
        freelanceInr: 10000,
        agencyInr: 20000,
        cycle: "monthly",
        disclaimer:
          "This is purely our service/management fee. Ad spend budget is NOT included and must be paid directly by the client to Meta.",
      },
      {
        id: "google-ads-ai",
        serviceName: "Google Ads + Performance Max AI Strategy",
        deliverables: [
          "Performance Max Campaign Building & AI Bidding Setup",
          "AI Keyword Intent Mapping & Negative Keyword Filtering",
          "Automated Bidding Strategies (Target CPA / Target ROAS)",
          "Conversion Tracking, Tag Manager & GA4 Integration",
          "Weekly Ad Budget Optimization & Scaling",
        ],
        freelanceInr: 12000,
        agencyInr: 22000,
        cycle: "monthly",
        disclaimer:
          "This is purely our service/management fee. Ad spend budget is NOT included and must be paid directly by the client to Google.",
      },
    ],
  },
  {
    category: "AI Integrations & Automations",
    items: [
      {
        id: "ai-lead-automation",
        serviceName: "AI Lead Capture & CRM Automation Pipeline",
        deliverables: [
          "Meta/Google Ads to WhatsApp & Email AI Bot Pipeline",
          "AI Lead Qualification & Auto-Followup Agent Setup",
          "CRM / Google Sheets Real-Time Syncing (n8n / Zapier)",
          "Automated Custom Client Dashboard Setup",
        ],
        freelanceInr: 8000,
        agencyInr: 18000,
        cycle: "one-time",
        disclaimer:
          "One-time service setup fee. Third-party software costs (Zapier/Make/OpenAI API/WhatsApp Business API) are to be paid directly by the client.",
      },
    ],
  },
  {
    category: "Social Media Management",
    items: [
      {
        id: "smm-starter",
        serviceName: "Basic Social Media Management",
        deliverables: [
          "8-10 Custom Graphic Posts",
          "2 Short-Form Videos / Reels (Editing)",
          "Monthly Content Calendar",
          "Basic Hashtag Strategy & Captions",
          "Profile Optimization (Bio & Highlights)",
        ],
        freelanceInr: 6000,
        agencyInr: 12000,
        cycle: "monthly",
        disclaimer: "Includes content design and publishing service fee only.",
      },
      {
        id: "smm-ai-pro",
        serviceName: "Pro SMM + AI Creative Engine",
        deliverables: [
          "12-15 Custom Graphic Posts + 6-8 AI-Edited Reels",
          "AI Scriptwriting & Voiceover Synthesis for Reels",
          "Daily Story Graphics (15-20 / month)",
          "Community Management & DM/Comment Replies",
          "Competitor Analysis & Monthly Analytics Report",
        ],
        freelanceInr: 12000,
        agencyInr: 25000,
        cycle: "monthly",
        disclaimer: "Covers content creation, video editing, and strategy execution only.",
      },
    ],
  },
  {
    category: "Search Engine Optimization",
    items: [
      {
        id: "seo-local",
        serviceName: "Local SEO & GMB Optimization",
        deliverables: [
          "Google My Business (GMB) Complete Profile Setup",
          "Local Map Pack Ranking Optimization",
          "15 Local Citation Submissions",
          "Customer Review Strategy & Template Automation",
          "Weekly GMB Posts & Q/A Management",
        ],
        freelanceInr: 5000,
        agencyInr: 10000,
        cycle: "monthly",
        disclaimer: "Service fee only for GMB optimization and local ranking management.",
      },
      {
        id: "seo-full-ai",
        serviceName: "Full-Scale Technical SEO & GEO (Generative Engine Optimization)",
        deliverables: [
          "Technical Audit, Schema Markup & Page Speed Tuning",
          "On-Page Optimization + GEO Readiness for AI Search Platforms",
          "High-DA Niche Backlink Building (5-8 / month)",
          "Monthly Traffic, Keyword Ranking & Search Insights Report",
        ],
        freelanceInr: 12000,
        agencyInr: 28000,
        cycle: "monthly",
        disclaimer:
          "Service fee only. Paid guest posts or paid link placements extra if required.",
      },
    ],
  },
  {
    category: "Website & Web Development",
    items: [
      {
        id: "web-landing",
        serviceName: "High-Converting AI Landing Page",
        deliverables: [
          "Single Page High-Converting Layout (Next.js / WordPress Stack)",
          "Mobile-Responsive & Fast Loading Speed (< 2s)",
          "Lead Form & WhatsApp Click-to-Chat Integration",
          "Meta Pixel & Google Analytics Setup",
          "Copywriting & Hero Section Design",
        ],
        freelanceInr: 6000,
        agencyInr: 15000,
        cycle: "one-time",
        disclaimer:
          "Development fee only. Domain name and hosting charges borne by the client.",
      },
      {
        id: "web-corporate",
        serviceName: "Full Business Website (Up to 5 Pages)",
        deliverables: [
          "5 Page Responsive Business Site (Home, About, Services, Blog, Contact)",
          "Custom UI/UX & Responsive Styling",
          "CMS Setup (WordPress or Headless)",
          "On-Page SEO Ready & Basic SSL Setup",
          "Speed & Security Optimization",
        ],
        freelanceInr: 15000,
        agencyInr: 35000,
        cycle: "one-time",
        disclaimer:
          "Covers website design and development service fee only. Domain, hosting, and paid plugins are paid separately by client.",
      },
    ],
  },
  {
    category: "Content & Video Marketing",
    items: [
      {
        id: "content-video",
        serviceName: "Short Video / Reel Editing Pack",
        deliverables: [
          "10 Custom Edited Short Reels / Shorts",
          "Captions, Subtitles, Motion Graphics & Sound Effects",
          "AI Voiceover Synthesis & Scripting Assistance",
          "Format Optimization for Instagram & YouTube Shorts",
        ],
        freelanceInr: 8000,
        agencyInr: 15000,
        cycle: "monthly",
        disclaimer:
          "Editing and post-production service fee only. Raw video footage to be provided by client.",
      },
    ],
  },
  {
    category: "Branding & Graphic Design",
    items: [
      {
        id: "branding-design",
        serviceName: "Brand Identity Package",
        deliverables: [
          "Primary & Secondary Logo Design",
          "Brand Color Palette & Typography Guidelines",
          "Social Media Kit (Profile Pictures, Banners, Templates)",
          "Business Card & Letterhead Mockups",
        ],
        freelanceInr: 8000,
        agencyInr: 20000,
        cycle: "one-time",
        disclaimer: "Service fee for graphic design and branding assets delivery.",
      },
    ],
  },
  {
    category: "Full Retainer Packages",
    items: [
      {
        id: "full-360-bundle",
        serviceName: "360-Degree Growth & AI Marketing Suite",
        deliverables: [
          "Complete SMM + AI Reels Creation Engine",
          "Meta Ads + Google Ads Strategy & Management",
          "SEO & Local GMB Management",
          "WhatsApp / Lead Automation Pipeline Setup",
          "Dedicated Account Executive & Weekly Strategy Calls",
        ],
        freelanceInr: 32000,
        agencyInr: 65000,
        cycle: "monthly",
        disclaimer:
          "Covers agency management and service fee only. Ad budgets, domain/hosting, and API costs across platforms must be funded directly by the client.",
      },
    ],
  },
];