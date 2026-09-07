import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/services" },
  title: "Website Development & Digital Marketing Services in Gorakhpur, Uttar Pradesh | Nexus Digital",
  description: `Explore ${config.name}'s services in Gorakhpur, Uttar Pradesh, founded by Sahil Srivastava. Best website development company in Gorakhpur, Uttar Pradesh, Next.js web applications, e-commerce stores, top SEO, Google Ads PPC, and social media marketing.`,
  keywords: [
    "best web development company in gorakhpur",
    "web development company in gorakhpur",
    "website designing company gorakhpur",
    "best website developer in gorakhpur",
    "custom ecommerce website development gorakhpur",
    "next js web development company gorakhpur",
    "digital marketing services in gorakhpur",
    "best seo company in gorakhpur",
    "social media marketing agency gorakhpur",
    "ppc services in gorakhpur",
    "best digital marketing agency in gorakhpur",
    "digital marketing company in gorakhpur",
    "top digital marketing agency gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "sahil srivastava web developer gorakhpur",
    "sahil srivastava nexus digital",
    "digital marketing services in India",
    "website development company in lucknow",
    "digital marketing agency in uttar pradesh",
    "Meta ads agency India",
    "Google Ads agency India",
    "google ads expert in gorakhpur",
    "PPC management India",
    "SEO services India",
    "seo agency in gorakhpur",
    "local SEO services India",
    "website development company India",
    "website development company in gorakhpur",
    "landing page design India",
    "marketing automation agency India",
    "WhatsApp marketing services India",
    "lead generation services India",
    "performance marketing agency India",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/services`,
    title: "Website Development & Digital Marketing Services in Gorakhpur, Uttar Pradesh | Nexus Digital",
    description: `Complete full-stack website development & digital marketing services across Gorakhpur, Uttar Pradesh, and India: Next.js, E-Commerce, Meta & Google Ads, SEO, and Automation.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Website Development & Marketing Services India` }],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
