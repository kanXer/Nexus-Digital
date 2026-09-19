/**
 * Standardized Agency Services & Catalog Pricing Utility
 * Maps every agency service to its authoritative monthly or one-time price.
 */

export interface ServicePricingMeta {
  price: number;
  cycle: "monthly" | "one-time";
  label: string;
  category: string;
}

export const AGENCY_SERVICE_PRICING: Record<string, ServicePricingMeta> = {
  "Performance Marketing (Meta/Google Ads)": {
    price: 20000,
    cycle: "monthly",
    label: "₹20,000 / month",
    category: "Performance Marketing",
  },
  "Search Engine Optimization (SEO)": {
    price: 12000,
    cycle: "monthly",
    label: "₹12,000 / month",
    category: "Organic Growth",
  },
  "Social Media Marketing & Content": {
    price: 10000,
    cycle: "monthly",
    label: "₹10,000 / month",
    category: "Social Media",
  },
  "Website Design & Development": {
    price: 15000,
    cycle: "one-time",
    label: "₹15,000 one-time",
    category: "Web Engineering",
  },
  "Full-Stack Growth Retainer": {
    price: 30000,
    cycle: "monthly",
    label: "₹30,000 / month",
    category: "360° Retainer",
  },
  "Brand Identity & Creative Strategy": {
    price: 8000,
    cycle: "one-time",
    label: "₹8,000 one-time",
    category: "Branding",
  },
  "Lead Generation & Funnel Building": {
    price: 8000,
    cycle: "one-time",
    label: "₹8,000 one-time",
    category: "AI & Automations",
  },
};

export const STANDARD_SERVICES_LIST = Object.keys(AGENCY_SERVICE_PRICING);

export function getServicePricing(serviceName?: string): ServicePricingMeta {
  if (!serviceName) {
    return AGENCY_SERVICE_PRICING["Performance Marketing (Meta/Google Ads)"];
  }

  if (AGENCY_SERVICE_PRICING[serviceName]) {
    return AGENCY_SERVICE_PRICING[serviceName];
  }

  const s = serviceName.toLowerCase();
  if (s.includes("retainer") || s.includes("growth") || s.includes("360") || s.includes("premium")) {
    return AGENCY_SERVICE_PRICING["Full-Stack Growth Retainer"];
  }
  if (s.includes("seo") || s.includes("search") || s.includes("ranking") || s.includes("gmb")) {
    return AGENCY_SERVICE_PRICING["Search Engine Optimization (SEO)"];
  }
  if (s.includes("web") || s.includes("site") || s.includes("landing") || s.includes("ecommerce") || s.includes("store")) {
    return AGENCY_SERVICE_PRICING["Website Design & Development"];
  }
  if (
    s.includes("ad") ||
    s.includes("meta") ||
    s.includes("google") ||
    s.includes("performance") ||
    s.includes("ppc") ||
    s.includes("pmax")
  ) {
    return AGENCY_SERVICE_PRICING["Performance Marketing (Meta/Google Ads)"];
  }
  if (s.includes("social") || s.includes("smm") || s.includes("instagram") || s.includes("reel") || s.includes("video")) {
    return AGENCY_SERVICE_PRICING["Social Media Marketing & Content"];
  }
  if (s.includes("brand") || s.includes("logo") || s.includes("identity") || s.includes("graphic")) {
    return AGENCY_SERVICE_PRICING["Brand Identity & Creative Strategy"];
  }
  if (s.includes("funnel") || s.includes("lead") || s.includes("automation") || s.includes("crm")) {
    return AGENCY_SERVICE_PRICING["Lead Generation & Funnel Building"];
  }

  return {
    price: 15000,
    cycle: "monthly",
    label: "₹15,000 / month",
    category: "Digital Agency Service",
  };
}
