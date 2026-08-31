import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/portfolio" },
  title: "Digital Marketing Portfolio | Top Agency in Gorakhpur",
  description: `See how ${config.name}, the best digital marketing agency in Gorakhpur, helps brands grow through social media, paid ads, SEO, and website design. Explore our local work samples.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "website designing company gorakhpur",
    "best seo company in gorakhpur",
    "social media marketing agency gorakhpur",
    "digital marketing portfolio India",
    "digital marketing agency work India",
    "web design portfolio India",
    "social media marketing portfolio India",
    "SEO portfolio India",
    "digital marketing projects India",
    "digital marketing agency India work samples",
    "website development company in gorakhpur portfolio",
    "digital marketing agency gorakhpur work",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/portfolio`,
    title: "Digital Marketing Portfolio | Top Agency in Gorakhpur",
    description: `Real local results from the best digital marketing agency in Gorakhpur & UP. View our portfolio.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — Digital Marketing Portfolio Gorakhpur` }],
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
