import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Client Testimonials & Reviews | Best Agency in Gorakhpur",
  description: `Read what clients say about working with ${config.name}, the best digital marketing agency in Gorakhpur. Verified reviews on our local SEO, social media, PPC, and website designing services.`,
  keywords: [
    "best digital marketing agency in gorakhpur reviews",
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "digital marketing agency India reviews",
    "best digital marketing agency testimonials",
    "digital marketing company ratings India",
    "SEO agency reviews India",
    "social media marketing agency feedback India",
    "Google Ads agency reviews",
    "trusted digital marketing agency India",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/testimonials`,
    title: "Client Testimonials & Reviews | Best Agency in Gorakhpur",
    description: `Client reviews and testimonials for ${config.name}, the leading digital marketing company in Gorakhpur.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Testimonials & Reviews` }],
  },
};

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
