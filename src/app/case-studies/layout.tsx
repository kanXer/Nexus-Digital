import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Digital Marketing Case Studies | Top Agency in Gorakhpur",
  description: `In-depth case studies from ${config.name}, the best digital marketing agency in Gorakhpur. Learn how we generate leads, increase ROAS, and rank local businesses on search engines.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "digital marketing services in gorakhpur",
    "digital marketing case studies India",
    "digital marketing results India",
    "ROAS case study India",
    "lead generation success stories India",
    "SEO ranking case studies India",
    "social media marketing results India",
    "Google Ads case study India",
    "digital marketing ROI India",
    "digital marketing agency gorakhpur case studies",
    "seo results gorakhpur",
    "local business marketing results up",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/case-studies`,
    title: "Digital Marketing Case Studies | Top Agency in Gorakhpur",
    description: `Real ROI results from the leading digital marketing company in Gorakhpur. Read our case studies.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Case Studies` }],
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
