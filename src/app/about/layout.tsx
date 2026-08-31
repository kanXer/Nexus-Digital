import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us | Best Digital Marketing Agency in Gorakhpur",
  description: `Learn more about ${config.name}, the top digital marketing agency gorakhpur businesses trust. We are a results-driven team of experts delivering affordable digital marketing services.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "about digital marketing agency India",
    "digital marketing company India team",
    "best digital marketing agency India",
    "digital marketing experts India",
    "digital marketing agency India mission",
    "why choose digital marketing agency India",
    "digital marketing company India about us",
    "digital marketing team gorakhpur",
    "digital marketing agency lucknow about us",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/about`,
    title: "About Us | Best Digital Marketing Agency in Gorakhpur",
    description: `${config.name} is the best digital marketing agency in Gorakhpur & UP, helping local businesses grow through social media, paid ads, SEO, and web design.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Best Digital Marketing Agency Gorakhpur` }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
