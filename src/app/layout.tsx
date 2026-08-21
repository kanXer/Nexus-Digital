import type { Metadata, Viewport } from "next";
import { Poppins, Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import { config } from "@/lib/config";
import SiteChrome from "@/components/layout/SiteChrome";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

const title = `${config.name} — ${config.tagline}`;
const ogImage = config.ogImage;

export const metadata: Metadata = {
  title: { default: `${config.name} | Best Digital Marketing Agency in Gorakhpur`, template: `%s | ${config.name}` },
  description: `Nexus Digital is the Best Digital Marketing Agency in Gorakhpur & UP. We specialize in Social Media Marketing, SEO, Website Development, and Google Ads to grow your business across Gorakhpur, Lucknow, and all of India.`,
  keywords: [
    "best digital marketing agency in india",
    "best digital marketing company",
    "top digital marketing agency in india",
    "best digital marketing agency in gorakhpur",
    "top digital marketing agency gorakhpur",
    "digital marketing services in gorakhpur",
    "top digital marketing company in gorakhpur",
    "digital marketing agency near me in gorakhpur",
    "website development company in gorakhpur",
    "seo agency in gorakhpur",
    "seo services in gorakhpur",
    "best seo company in gorakhpur",
    "local seo company gorakhpur",
    "local seo company in gorakhpur",
    "google ads expert in gorakhpur",
    "google ads agency gorakhpur",
    "google ads ppc management gorakhpur",
    "social media marketing agency in gorakhpur",
    "social media marketing agency gorakhpur",
    "website designing company gorakhpur",
    "ppc services in gorakhpur",
    "nexus digital marketing agency gorakhpur",
    "lead generation services gorakhpur",
    "meta ads specialist in gorakhpur",
    "meta ads specialist gorakhpur",
    "website design and digital marketing gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "best digital marketing expert gorakhpur",
    "best digital marketing expert in gorakhpur",
    "local business promotion in gorakhpur",
    "online business growth agency gorakhpur",
    "digital marketing company in gorakhpur",
    "digital marketing agency for real estate in gorakhpur",
    "digital marketing for hospitals in gorakhpur",
    "digital marketing agency in uttar pradesh",
    "best digital marketing company in up",
    "digital marketing services up india",
    "top digital marketing agency in up",
    "local seo services in uttar pradesh",
    "lead generation agency in up",
    "ppc management agency uttar pradesh",
    "social media management services in up",
    "performance marketing agency in up",
    "top performance marketing agency up",
    "b2b digital marketing company uttar pradesh",
    "b2b digital marketing services up",
    "healthcare digital marketing services in up",
    "school college promotion agency in up",
    "e-commerce digital marketing agency up",
    "best digital marketing agency in lucknow",
    "top digital marketing company in lucknow",
    "best digital marketing agency in up",
    "top digital marketing agency in uttar pradesh",
    "digital marketing services in lucknow",
    "seo company in lucknow",
    "digital marketing agency in India",
    "digital marketing company India",
    "full service digital marketing agency",
    "performance marketing agency in india",
    "digital marketing services company",
    "best seo agency in india",
    "local seo services for small business",
    "google business profile optimization services",
    "website seo optimization company",
    "best website development company",
    "custom website design services",
    "e-commerce website development agency",
    "responsive web design company",
    "pay per click management agency",
    "google ads management company",
    "performance marketing services",
    "lead generation agency in india",
    "social media management agency",
    "instagram marketing services",
    "brand promotion agency",
    "digital marketing agency Delhi",
    "digital marketing agency Mumbai",
    "digital marketing agency Bangalore",
    "digital marketing agency Hyderabad",
    "digital marketing agency Pune",
    "digital marketing agency Chennai",
    "digital marketing agency Kolkata",
    "digital marketing agency Jaipur",
    "digital marketing agency Ahmedabad",
    "digital marketing agency Lucknow",
    "digital marketing agency Kanpur",
    "digital marketing agency Gorakhpur",
    "marketing automation India",
    "WhatsApp marketing agency India",
    "email marketing agency India",
    "growth marketing India",
  ],
  authors: [{ name: config.name }],
  creator: config.name,
  publisher: config.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: config.website,
    siteName: config.name,
    title,
    description: `We help businesses across India grow through Social Media, Paid Ads, Local SEO, and Marketing Automation. Focused on delivering measurable results for every client.`,
    images: [{ url: ogImage, width: 1200, height: 630, alt: `${config.name} — Digital Marketing Agency India` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: `We help businesses across India grow through Social Media, Paid Ads, Local SEO, and Marketing Automation.`,
    images: [ogImage],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  verification: { google: "your-google-verification-code" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

const schemaMarkup = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${config.website}/#organization`,
      name: config.name,
      url: config.website,
      logo: { "@type": "ImageObject", url: `${config.website}/logo.png`, width: 180, height: 60 },
      contactPoint: { "@type": "ContactPoint", telephone: config.phone, contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi"] },
      sameAs: [
        "https://www.facebook.com/nexusdigital",
        "https://www.instagram.com/nexusdigital",
        "https://www.linkedin.com/company/nexusdigital",
        "https://twitter.com/nexusdigital",
      ],
    },
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": `${config.website}/#localbusiness`,
      name: `${config.gmbName} Gorakhpur`,
      image: ogImage,
      url: config.website,
      telephone: config.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Gorakhpur",
        addressLocality: "Gorakhpur",
        addressRegion: "Uttar Pradesh",
        postalCode: "273001",
        addressCountry: "IN"
      },
      geo: { "@type": "GeoCoordinates", latitude: 26.777896, longitude: 83.370204 },
      areaServed: ["Gorakhpur", "Lucknow", "Uttar Pradesh", "India"],
      openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: config.gmbRating, reviewCount: config.gmbReviewCount },
      sameAs: [config.gmbUrl],
      priceRange: "₹₹",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Nexus Digital Marketing Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Social Media Marketing",
              description: "Result-driven social media management and campaigns from the top social media marketing agency gorakhpur."
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Search Engine Optimization (SEO)",
              description: "Rank #1 on Google and dominate maps with the best seo company in gorakhpur."
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website Designing & Development",
              description: "High-performance web development and design from the best website designing company gorakhpur."
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "PPC Services",
              description: "High-converting search and social ad campaigns backed by the best ppc services in gorakhpur."
            }
          }
        ]
      }
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className={`${poppins.variable} ${unbounded.variable}`} data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.telegram.org" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden">
	<Analytics/>
        <main>{children}</main>
        <SiteChrome />
      </body>
    </html>
  );
}
