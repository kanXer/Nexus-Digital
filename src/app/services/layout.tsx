import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Digital Marketing Services in Gorakhpur | Best SEO & PPC",
  description: `Explore ${config.name}'s professional digital marketing services in Gorakhpur. As the best seo company in gorakhpur and a top website designing company gorakhpur, we offer expert social media marketing agency gorakhpur services and elite ppc services in gorakhpur to scale your business.`,
  keywords: [
    "digital marketing services in gorakhpur",
    "best seo company in gorakhpur",
    "social media marketing agency gorakhpur",
    "website designing company gorakhpur",
    "ppc services in gorakhpur",
    "best digital marketing agency in gorakhpur",
    "digital marketing company in gorakhpur",
    "top digital marketing agency gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "digital marketing services in India",
    "digital marketing agency services",
    "social media marketing services India",
    "social media marketing agency in gorakhpur",
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
    "email marketing agency India",
    "lead generation services India",
    "performance marketing agency India",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/services`,
    title: "Digital Marketing Services in India",
    description: `Complete digital marketing services across India: Social Media, Meta & Google Ads, SEO, Website Design, and Automation.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Digital Marketing Services India` }],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
