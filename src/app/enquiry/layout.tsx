import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/enquiry" },
  title: "Get a Quote | Best Digital Marketing Agency in Gorakhpur",
  description: `Submit a digital marketing enquiry to ${config.name}, the best digital marketing agency in Gorakhpur. Get a customized price quote for SEO, paid ads, web design, or social media management.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "digital marketing services in gorakhpur",
    "digital marketing enquiry India",
    "get digital marketing quote India",
    "digital marketing agency enquiry form",
    "hire digital marketing agency India",
    "digital marketing services quote",
    "free digital marketing quote India",
    "digital marketing agency India enquiry",
    "digital marketing agency gorakhpur enquiry",
    "get digital marketing quote gorakhpur",
    "seo agency gorakhpur enquiry",
    "google ads expert lucknow contact",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/enquiry`,
    title: "Get a Quote | Best Digital Marketing Agency in Gorakhpur",
    description: `Contact the top digital marketing agency in Gorakhpur to get a customized growth plan and pricing.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Enquiry` }],
  },
};

export default function EnquiryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
