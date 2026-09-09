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
  title: { default: `${config.name} | Best Digital Marketing Agency in Gorakhpur, Uttar Pradesh`, template: `%s | ${config.name}` },
  description: `Nexus Digital is the Best Digital Marketing and also best Website Development Agency in Gorakhpur, Uttar Pradesh, founded by Sahil Srivastava. We specialize in Custom Next.js Web Development, E-Commerce, SEO, Google Ads, and Social Media Marketing to scale businesses across Gorakhpur, Uttar Pradesh, Lucknow, and all of India.`,
  keywords: [
    // Web Development — Gorakhpur, UP & India
    "best website development in gorakhpur",
    "best web development in gorakhpur",
    "best web developer in gorakhpur",
    "who is the best web developer in gorakhpur",
    "best web developer gorakhpur",
    "best web developer in gorakhpur sahil srivastava",
    "best web development company in gorakhpur",
    "web development company in gorakhpur",
    "website designing company gorakhpur",
    "best website designing company in gorakhpur",
    "website design company in gorakhpur",
    "website developer in gorakhpur",
    "best website developer in gorakhpur",
    "freelance web developer in gorakhpur",
    "custom web application development gorakhpur",
    "ecommerce website development company in gorakhpur",
    "next js web development company gorakhpur",
    "react js developer gorakhpur",
    "full stack web development gorakhpur",
    "affordable website design in gorakhpur",
    "website development cost in gorakhpur",
    "website design services in uttar pradesh",
    "best web development agency in uttar pradesh",
    "website development company in lucknow",
    "custom website development agency india",
    "ecommerce website development agency india",
    "best website development company india",
    "sahil srivastava web developer gorakhpur",
    "sahil srivastava nexus digital",
    "full stack developer sahil srivastava",

    // Digital Marketing — Gorakhpur, UP & India
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
    "Nexus Digital Marketing Agency",
    "Nexus Digital Marketing Agency in Gorakhpur",
    "nexus digital marketing agency in gorakhpur",
    "Nexus Digital Marketing Agency Gorakhpur",
    "nexus digital marketing agency gorakhpur",
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

    // SEO & Maps
    "seo agency in gorakhpur",
    "seo services in gorakhpur",
    "best seo company in gorakhpur",
    "local seo company gorakhpur",
    "local seo company in gorakhpur",
    "local seo services in uttar pradesh",
    "website seo optimization company",
    "google business profile optimization services",
    "google maps ranking gorakhpur",

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

    // Lead Generation & Automation
    "lead generation services gorakhpur",
    "lead generation agency in india",
    "lead generation agency in up",
    "marketing automation India",
    "WhatsApp marketing agency India",
    "email marketing agency India",
    "growth marketing India",

    // UP & India
    "top digital marketing company in up",
    "top digital marketing agency in uttar pradesh",
    "best digital marketing company in up",
    "digital marketing services up india",
    "performance marketing agency in up",
    "best digital marketing agency in lucknow",
    "top digital marketing company in lucknow",
    "digital marketing services in lucknow",
    "seo company in lucknow",
    "digital marketing agency in India",
    "digital marketing company India",
    "performance marketing agency in india",
    "best seo agency in india",

    // Portfolio
    "blood bank website gorakhpur",
    "radhe radhe blood bank gorakhpur",
    "gorakhpur mission rehab website",
  ],
  authors: [{ name: config.name }, { name: config.founder }],
  creator: config.founder,
  publisher: config.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: config.website,
    siteName: config.name,
    title,
    description: `Nexus Digital is the Best Digital Marketing & Website Development Agency in Gorakhpur, Uttar Pradesh, founded by Sahil Srivastava. We build high-speed websites, scale SEO rankings, and run high-ROAS ads across Gorakhpur, Uttar Pradesh, and India.`,
    images: [{ url: ogImage, width: 1200, height: 630, alt: `${config.name} — Digital Marketing & Web Development Agency India` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: `Best Web Development & Digital Marketing Agency in Gorakhpur, Uttar Pradesh, founded by Sahil Srivastava. Custom Next.js websites, SEO, and paid ads.`,
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
      "@type": "Person",
      "@id": `${config.website}/#founder`,
      name: config.founder,
      jobTitle: config.founderRole,
      description: config.founderBio,
      email: config.founderEmail,
      telephone: config.founderPhone,
      image: `${config.website}${config.founderPhoto}`,
      url: config.website,
      worksFor: { "@id": `${config.website}/#organization` },
      sameAs: [
        config.founderSocials.linkedin,
        config.founderSocials.instagram,
        config.founderSocials.twitter,
        config.founderSocials.github,
        config.founderSocials.facebook,
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${config.website}/#website`,
      url: config.website,
      name: config.name,
      description: "Best Digital Marketing & Website Development Agency in Gorakhpur, Uttar Pradesh & India",
      publisher: { "@id": `${config.website}/#organization` },
      inLanguage: ["en-IN", "hi-IN"],
    },
    {
      "@type": "Organization",
      "@id": `${config.website}/#organization`,
      name: config.name,
      alternateName: config.fullName,
      url: config.website,
      logo: { "@type": "ImageObject", url: `${config.website}/logo.png`, width: 180, height: 60 },
      founder: { "@id": `${config.website}/#founder` },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: config.phone,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      sameAs: [
        config.founderSocials.facebook,
        config.founderSocials.instagram,
        config.founderSocials.linkedin,
        config.founderSocials.twitter,
        config.founderSocials.github,
      ],
    },
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": `${config.website}/#localbusiness`,
      name: `${config.gmbName} Gorakhpur, Uttar Pradesh`,
      image: ogImage,
      url: config.website,
      telephone: config.phone,
      founder: { "@id": `${config.website}/#founder` },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Gorakhpur, Uttar Pradesh",
        addressLocality: "Gorakhpur",
        addressRegion: "Uttar Pradesh",
        postalCode: "273001",
        addressCountry: "IN",
      },
      geo: { "@type": "GeoCoordinates", latitude: 26.7780745, longitude: 83.3703093 },
      areaServed: [
        { "@type": "City", name: "Gorakhpur" },
        { "@type": "City", name: "Lucknow" },
        { "@type": "City", name: "Varanasi" },
        { "@type": "City", name: "Kanpur" },
        { "@type": "City", name: "Prayagraj" },
        { "@type": "State", name: "Uttar Pradesh" },
        { "@type": "Country", name: "India" },
      ],
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: config.gmbRating,
        reviewCount: config.gmbReviewCount,
      },
      sameAs: [config.gmbUrl],
      priceRange: "₹₹",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Nexus Digital Web Development & Digital Marketing Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Full-Stack Website Development (Next.js & React)",
              description: "Custom high-speed web application development, responsive design, and SEO-engineered web development from the best website development company in Gorakhpur, Uttar Pradesh.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom E-Commerce Websites & Payment Gateways",
              description: "Full-stack e-commerce stores with Cashfree, Razorpay, and UPI payment integration, inventory management, and fast mobile checkout.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Search Engine Optimization (SEO) & Google Business Profile",
              description: "Rank #1 on Google and dominate local Google Maps 3-pack with the best SEO company in Gorakhpur, Uttar Pradesh.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Social Media Marketing & Content Creation",
              description: "High-engagement social media management, Instagram reels editing, and audience growth from the top social media marketing agency in Gorakhpur, Uttar Pradesh.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Google Ads PPC & Meta Ads Performance Marketing",
              description: "High-converting search, display, and social ad campaigns backed by the best PPC services in Gorakhpur, Uttar Pradesh.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website Maintenance & Security AMC",
              description: "24/7 uptime monitoring, page speed optimization, security updates, and daily cloud backups.",
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className={`${jakarta.variable} ${outfit.variable}`} data-theme="dark" suppressHydrationWarning>
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
      <body className="bg-black text-white antialiased overflow-x-hidden" suppressHydrationWarning>
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
