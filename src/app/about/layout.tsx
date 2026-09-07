import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us | Best Web Development & Digital Marketing Agency in Gorakhpur, Uttar Pradesh",
  description: `Learn about ${config.name}, founded by Sahil Srivastava. The top web development & digital marketing agency in Gorakhpur, Uttar Pradesh, delivering high-speed Next.js websites, technical SEO, and ROI-driven paid ads.`,
  keywords: [
    "about nexus digital gorakhpur",
    "sahil srivastava founder nexus digital",
    "sahil srivastava web developer gorakhpur",
    "best digital marketing agency in gorakhpur",
    "best web development company in gorakhpur",
    "top digital marketing agency gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "digital marketing team gorakhpur",
    "digital marketing company uttar pradesh",
    "best digital marketing agency India",
    "digital marketing experts India",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/about`,
    title: "About Us | Best Web Development & Digital Marketing Agency in Gorakhpur, Uttar Pradesh",
    description: `${config.name}, founded by Sahil Srivastava, is the best web development & digital marketing agency in Gorakhpur, Uttar Pradesh.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Best Digital Marketing Agency Gorakhpur, Uttar Pradesh` }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
