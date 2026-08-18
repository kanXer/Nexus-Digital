import type { Metadata } from "next";
import { config } from "@/lib/config";
import { faqs } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ | Best Digital Marketing Agency in Gorakhpur",
  description: `Frequently asked questions about digital marketing, SEO, Google Ads, social media, and web design. Get clear answers from ${config.name}, the best digital marketing agency in Gorakhpur.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "digital marketing agency in gorakhpur faq",
    "top digital marketing agency gorakhpur",
    "digital marketing company in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "google ads expert in gorakhpur",
    "website designing company gorakhpur",
    "best seo company in gorakhpur",
    "digital marketing faq",
    "digital marketing agency questions",
    "how much does digital marketing cost",
    "how much does website development cost in India",
    "website development services",
    "website management services",
    "what is SEO",
    "Google Ads vs Meta Ads",
    "local SEO for business",
    "best digital marketing company in India",
    "digital marketing services",
    "how long to build a website",
    "website maintenance plans",
    "social media marketing agency",
    "lead generation agency",
    "seo agency in lucknow",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/faq`,
    title: "FAQ | Best Digital Marketing Agency in Gorakhpur",
    description: `Everything you need to know about digital marketing, SEO, ads, and web development answered by the top digital marketing agency in Gorakhpur.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — FAQ` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Best Digital Marketing Agency in Gorakhpur",
    description: "Answers to the most common digital marketing, SEO, and website development questions.",
    images: [config.ogImage],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
