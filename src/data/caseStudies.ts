export interface CaseStudyResult {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  client: string;
  industry: string;
  service: string;
  duration: string;
  headline: string;
  problem: string;
  solution: string;
  results: CaseStudyResult[];
  tags: string[];
  color: string;
  highlight: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "cs3",
    slug: "gorakhpur-mission-rehab",
    client: "Gorakhpur Mission Rehab",
    industry: "Healthcare",
    service: "Local SEO + Website + Google Business Profile",
    duration: "Live",
    headline: "Best Neuro Physiotherapy Clinic in Gorakhpur — Built & Ranked Online",
    problem: "Gorakhpur Mission Rehab, a leading neuro physiotherapy clinic at Divyaman Hospital, needed a strong online presence so patients searching for stroke recovery, paralysis treatment, and neuro rehab near them could find and trust the clinic.",
    solution: "We designed and developed a high-converting healthcare website, fully optimised it with local SEO targeting 'best neuro physiotherapist in Gorakhpur' and 'neuro physiotherapy near me', and optimised the Google Business Profile to capture local search traffic.",
    results: [
      { metric: "Local Search Visibility", before: "Low", after: "Top Rankings", improvement: "Focus Area" },
      { metric: "Patient Enquiries", before: "Referral only", after: "Online Leads", improvement: "New Channel" },
      { metric: "Google Reviews", before: "—", after: "360+", improvement: "Authority" },
      { metric: "Appointments", before: "Walk-in", after: "Book Online", improvement: "Automated" },
    ],
    tags: ["Local SEO", "Healthcare", "Website Development", "Google Business Profile"],
    color: "from-teal-500/20 to-cyan-500/20",
    highlight: "Online Presence",
  },
  {
    id: "cs4",
    slug: "poultry-conclave-gorakhpur-2026",
    client: "1st Poultry Conclave Gorakhpur",
    industry: "Event / Agriculture",
    service: "Event Website + Lead Generation",
    duration: "Live",
    headline: "1st Poultry Conclave Gorakhpur 2026 — Mega Poultry Event Website",
    problem: "The first-ever Poultry Conclave in Gorakhpur, organised by the UP Government's Animal Husbandry department, needed a modern event website to drive registrations from attendees, exhibitors, and sponsors across Eastern UP.",
    solution: "We designed and built a fast, event-focused website with online registration forms, event agenda, host-city highlights, and full mobile-first experience — engineered to convert visitors into attendees.",
    results: [
      { metric: "Registrations", before: "Offline", after: "Online Form", improvement: "Automated" },
      { metric: "Event Reach", before: "Local", after: "Eastern UP", improvement: "Wide Reach" },
      { metric: "Information", before: "Scattered", after: "Single Site", improvement: "Centralised" },
      { metric: "Stakeholders", before: "—", after: "Attendees + Exhibitors + Sponsors", improvement: "Full Funnel" },
    ],
    tags: ["Event Website", "Registration", "Lead Generation", "Agriculture"],
    color: "from-amber-500/20 to-yellow-500/20",
    highlight: "Event Registrations",
  },
  {
    id: "cs5",
    slug: "khabari-in-news-decode",
    client: "KHABRI.IN",
    industry: "News / Media",
    service: "News Platform Website + AI-Powered Content",
    duration: "Live",
    headline: "KHABRI.IN — AI-Powered Global News Platform",
    problem: "KHABRI.IN, a premium news brand, wanted a high-end digital platform that could deliver real-time news updates and in-depth stories across Tech & AI, Business, Sports, and Local news — in a clean, fast, and globally accessible format.",
    solution: "We designed and developed a complete news media website with category-wise sections, live updates feed, dedicated news article pages, bilingual (Hindi/English) content support, and a search experience — engineered for speed, SEO, and reader engagement on every device.",
    results: [
      { metric: "Content Categories", before: "—", after: "Tech & AI, Business, Sports, Local, Dev & Security", improvement: "Structured" },
      { metric: "News Delivery", before: "Static", after: "Real-time Updates", improvement: "Always Fresh" },
      { metric: "Language Reach", before: "English only", after: "Bilingual (Hindi + English)", improvement: "Wider Audience" },
      { metric: "Platform", before: "—", after: "AI-Powered", improvement: "Future-ready" },
    ],
    tags: ["News Website", "Media Platform", "AI Content", "Next.js", "SEO"],
    color: "from-blue-500/20 to-indigo-500/20",
    highlight: "Global Reach",
  },
  {
    id: "cs6",
    slug: "radhey-radhey-blood-bank",
    client: "Radhey Radhey Charitable Blood & Component Centre",
    industry: "Healthcare / Social Impact",
    service: "Website Design + Digital Presence",
    duration: "Live",
    headline: "Radhey Radhey Blood Bank — Gorakhpur's Trusted Blood Bank Goes Digital",
    problem: "Radhey Radhey Charitable Blood & Component Centre, a trusted blood bank serving Gorakhpur, needed a professional digital platform to help community members find, request, and donate blood online — reducing dependency on offline word-of-mouth and improving emergency response time.",
    solution: "We designed and built a purpose-driven healthcare website with blood availability information, donation request flows, contact details, and a clean, accessible UI — optimised for mobile use in emergencies. The site establishes digital credibility for the centre and helps the community connect with life-saving services instantly.",
    results: [
      { metric: "Online Presence", before: "None", after: "Full Website Live", improvement: "100% Digital" },
      { metric: "Blood Request Access", before: "Phone-only", after: "Online + Phone", improvement: "Multi-channel" },
      { metric: "Community Reach", before: "Local referral", after: "Google + Website", improvement: "Widened" },
      { metric: "Emergency Response", before: "Manual", after: "Instant Info Access", improvement: "Faster" },
    ],
    tags: ["Healthcare", "Social Impact", "Website Development", "Gorakhpur", "Blood Bank"],
    color: "from-red-500/20 to-rose-500/20",
    highlight: "Community Reach",
  },
];
