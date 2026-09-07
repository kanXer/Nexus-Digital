import type { Metadata } from "next";
import { config } from "@/lib/config";
import { faqs } from "@/data/faq";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "FAQ | Best Web Development & Digital Marketing Agency in Gorakhpur, Uttar Pradesh & India",
  description: `Find expert answers to your questions about website development, e-commerce, SEO, Google Ads, Meta Ads, and social media marketing from ${config.name}, founded by Sahil Srivastava. Serving Gorakhpur, Uttar Pradesh, Lucknow, and all of India.`,
  keywords: [
    "best website development company in gorakhpur",
    "website designing company gorakhpur",
    "best website developer in gorakhpur",
    "website development cost in gorakhpur",
    "custom ecommerce website development gorakhpur",
    "next js web development company gorakhpur",
    "sahil srivastava web developer gorakhpur",
    "sahil srivastava nexus digital",
    "best digital marketing agency in gorakhpur",
    "digital marketing agency in gorakhpur",
    "best digital marketing agency gorakhpur",
    "digital marketing agency gorakhpur",
    "digital marketing agency uttar pradesh",
    "best digital marketing agency in uttar pradesh",
    "best web development agency in uttar pradesh",
    "website development company in lucknow",
    "digital marketing company in lucknow",
    "faq digital marketing gorakhpur",
    "faq website development india",
    "digital marketing questions answers",
    "how much does website development cost",
    "how much does digital marketing cost",
    "how long does seo take",
    "what is local seo",
    "google maps ranking gorakhpur",
    "Google Ads vs Meta Ads",
    "lead generation agency gorakhpur",
    "seo agency in gorakhpur",
    "best seo company in gorakhpur",
    "social media marketing agency gorakhpur",
  ],
  openGraph: {
    type: "website",
    url: `${config.website}/faq`,
    title: "FAQ | Best Digital Marketing Agency in Gorakhpur, Uttar Pradesh",
    description: `Everything you need to know about digital marketing, SEO, ads, and web development — answered by the best digital marketing agency in Gorakhpur, Uttar Pradesh.`,
    images: [{ url: config.ogImage, width: 1200, height: 630, alt: `${config.name} — FAQ` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Best Digital Marketing Agency in Gorakhpur, Uttar Pradesh",
    description: "Answers to the most common digital marketing, SEO, and website development questions from Gorakhpur, Uttar Pradesh's #1 digital marketing agency.",
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
