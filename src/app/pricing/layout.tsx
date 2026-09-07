import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/pricing" },
  title: "Affordable Digital Marketing Agency in Gorakhpur, Uttar Pradesh | Pricing & Packages",
  description: `Find transparent and affordable digital marketing packages in Gorakhpur, Uttar Pradesh. Nexus Digital offers top SEO, social media marketing, and website design plans for local businesses with no hidden fees.`,
  keywords: [
    "affordable digital marketing agency in gorakhpur",
    "digital marketing services in gorakhpur",
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "digital marketing agency pricing gorakhpur",
    "digital marketing packages gorakhpur",
    "digital marketing cost lucknow",
    "digital marketing pricing India",
    "digital marketing cost India",
    "digital marketing package rates",
    "social media marketing price India",
    "SEO pricing India",
    "Google Ads management cost India",
    "affordable digital marketing agency India",
    "digital marketing plans for small business India",
    "website development cost India",
    "digital marketing retainer India",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/pricing`,
    title: "Affordable Digital Marketing Agency in Gorakhpur, Uttar Pradesh | Pricing & Packages",
    description: `Affordable digital marketing packages in Gorakhpur, Uttar Pradesh. Transparent pricing for SEO, ads, social media, and web services.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Digital Marketing Pricing Gorakhpur, Uttar Pradesh` }],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
