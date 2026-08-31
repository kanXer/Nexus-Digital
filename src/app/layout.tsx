import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { config } from "@/lib/config";
import SiteChrome from "@/components/layout/SiteChrome";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import UserProfileModal from "@/components/auth/UserProfileModal";
import CartDrawer from "@/components/auth/CartDrawer";
import OrdersModal from "@/components/auth/OrdersModal";
import { Toaster } from "react-hot-toast";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

const title = `${config.name} — ${config.tagline}`;
const ogImage = config.ogImage;

export const metadata: Metadata = {
  metadataBase: new URL(config.website),
  title: { default: `${config.name} | Best Digital Marketing Agency in Gorakhpur`, template: `%s | ${config.name}` },
  description: `Nexus Digital is the Best Digital Marketing Agency in Gorakhpur & UP. We specialize in Social Media Marketing, SEO, Website Development, and Google Ads to grow your business across Gorakhpur, Lucknow, and all of India.`,
  keywords: [
    // Primary — Wordlist (All 29 terms included)
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
    "Best Digital Marketing Agency in Gorakhpur",
    "Digital Marketing Agency in Gorakhpur",
    "Best Digital Marketing Agency Gorakhpur",
    "Digital Marketing Agency Gorakhpur",
    "Digital Marketing",
    "Digital Marketing Website",
    "Best Digital Marketing Agency",
    "Digital Marketing Agency",
    "Digital Marketing Agency Uttar Pradesh",
    "Best Digital Marketing Agency in Uttar Pradesh",
    "Digital Marketing Agency in Uttar Pradesh",
    "Best Digital Marketing Agency Uttar Pradesh",
    "Nexus Digital Marketing Agency",
    "Nexus Digital Marketing Agency in Gorakhpur",
    "nexus digital marketing agency in gorakhpur",
    "Nexus Digital Marketing Agency Gorakhpur",
    "nexus digital marketing agency gorakhpur",
    // Local Gorakhpur
    "top digital marketing agency gorakhpur",
    "digital marketing services in gorakhpur",
    "top digital marketing company in gorakhpur",
    "digital marketing agency near me in gorakhpur",
    "digital marketing company in gorakhpur",
    "affordable digital marketing agency in gorakhpur",
    "best digital marketing expert gorakhpur",
    "best digital marketing expert in gorakhpur",
    "local business promotion in gorakhpur",
    "online business growth agency gorakhpur",
    "nexus digital marketing agency gorakhpur",
    // SEO
    "seo agency in gorakhpur",
    "seo services in gorakhpur",
    "best seo company in gorakhpur",
    "local seo company gorakhpur",
    "local seo company in gorakhpur",
    "local seo services in uttar pradesh",
    "website seo optimization company",
    "google business profile optimization services",
    // Paid Ads
    "google ads expert in gorakhpur",
    "google ads agency gorakhpur",
    "google ads ppc management gorakhpur",
    "ppc services in gorakhpur",
    "meta ads specialist in gorakhpur",
    "meta ads specialist gorakhpur",
    "pay per click management agency",
    "google ads management company",
    // Social Media
    "social media marketing agency in gorakhpur",
    "social media marketing agency gorakhpur",
    "instagram marketing services",
    "social media management agency",
    "social media management services in up",
    // Website Development
    "website development company in gorakhpur",
    "website designing company gorakhpur",
    "website design and digital marketing gorakhpur",
    "best website development company",
    "custom website design services",
    "e-commerce website development agency",
    "responsive web design company",
    // Lead Generation
    "lead generation services gorakhpur",
    "lead generation agency in india",
    "lead generation agency in up",
    // UP & India
    "top digital marketing company in up",
    "top digital marketing agency in uttar pradesh",
    "best digital marketing company in up",
    "digital marketing services up india",
    "performance marketing agency in up",
    "top performance marketing agency up",
    "b2b digital marketing company uttar pradesh",
    "b2b digital marketing services up",
    "healthcare digital marketing services in up",
    "digital marketing agency for real estate in gorakhpur",
    "digital marketing for hospitals in gorakhpur",
    "e-commerce digital marketing agency up",
    "best digital marketing agency in lucknow",
    "top digital marketing company in lucknow",
    "digital marketing services in lucknow",
    "seo company in lucknow",
    "digital marketing agency in India",
    "digital marketing company India",
    "performance marketing agency in india",
    "best seo agency in india",
    "local seo services for small business",
    // Blood Bank & Portfolio
    "blood bank website gorakhpur",
    "radhe radhe blood bank gorakhpur",
    "charitable blood bank website design",
    // Automation
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
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  interactiveWidget: "resizes-content",
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
      <html lang="en" className={`${jakarta.variable} ${outfit.variable}`} data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.telegram.org" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

        {/* Google Analytics (GA4) */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden">
        <Analytics/>
        <AuthProvider>
          <main>{children}</main>
          <SiteChrome />
          <AuthModal />
          <UserProfileModal />
          <CartDrawer />
          <OrdersModal />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
