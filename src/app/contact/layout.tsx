import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact Top Digital Marketing Agency Gorakhpur | Nexus Digital",
  description: `Contact ${config.name}, the best digital marketing agency in Gorakhpur, for a free consultation. Get a custom growth plan featuring social media, Google Ads, SEO, website design, and marketing automation.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "contact digital marketing agency India",
    "digital marketing consultation India",
    "free marketing consultation",
    "digital marketing agency near me",
    "hire digital marketing company India",
    "digital marketing agency Gorakhpur",
    "digital marketing agency Uttar Pradesh",
    "best digital marketing agency India contact",
    "free website audit India",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/contact`,
    title: "Contact Top Digital Marketing Agency Gorakhpur | Nexus Digital",
    description: `Get a free consultation from ${config.name}, the leading digital marketing company in Gorakhpur. Custom growth plans for businesses in UP.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Contact Top Digital Marketing Agency Gorakhpur` }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
