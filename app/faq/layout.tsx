import type { Metadata } from "next";
import { config } from "@/lib/config";
import { faqs } from "@/data/faq";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "FAQ | Best Digital Marketing Agency in Gorakhpur & Uttar Pradesh",
  description: `Find answers to your most important questions about digital marketing from the best digital marketing agency in Gorakhpur & Uttar Pradesh. ${config.name} covers SEO, Google Ads, social media, website development, and lead generation.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "digital marketing agency in gorakhpur",
    "best digital marketing agency gorakhpur",
    "digital marketing agency gorakhpur",
    "digital marketing",
    "digital marketing website",
    "best digital marketing agency",
    "digital marketing agency",
    "digital marketing agency uttar pradesh",
    "best digital marketing agency in uttar pradesh",
    "digital marketing agency in uttar pradesh",
    "best digital marketing agency uttar pradesh",
    "faq digital marketing gorakhpur",
    "digital marketing questions answers",
    "how much does digital marketing cost",
    "how long does seo take",
    "what is local seo",
    "Google Ads vs Meta Ads",
    "website development cost india",
    "website maintenance plans",
    "lead generation agency gorakhpur",
    "seo agency in gorakhpur",
    "best seo company in gorakhpur",
    "social media marketing agency gorakhpur",
    "blood bank website gorakhpur",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/faq`,
    title: "FAQ | Best Digital Marketing Agency in Gorakhpur & UP",
    description: `Everything you need to know about digital marketing, SEO, ads, and web development — answered by the best digital marketing agency in Gorakhpur & Uttar Pradesh.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — FAQ` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Best Digital Marketing Agency in Gorakhpur & UP",
    description: "Answers to the most common digital marketing, SEO, and website development questions from Gorakhpur's #1 digital marketing agency.",
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
