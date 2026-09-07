import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self' https://api.cashfree.com https://*.cashfree.com https://sandbox.cashfree.com",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.cashfree.com https://sdk.cashfree.com https://api.cashfree.com https://static.cloudflareinsights.com https://*.googleapis.com https://apis.google.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.cashfree.com",
              "img-src 'self' data: blob: https://ui-avatars.com https://*.firebasestorage.app https://www.google-analytics.com https://www.gstatic.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://*.cashfree.com https://cashfreelogo.cashfree.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://*.firebaseio.com https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://*.cashfree.com https://sdk.cashfree.com https://api.cashfree.com https://checkout.cashfree.com https://payments.cashfree.com https://*.cloudfunctions.net https://www.google.com https://vercel.live wss: wss://*.firebaseio.com",
              "frame-src 'self' https://*.cashfree.com https://api.cashfree.com https://sdk.cashfree.com https://checkout.cashfree.com https://payments.cashfree.com https://*.firebaseapp.com https://accounts.google.com https://accounts.youtube.com https://vercel.live",
              "media-src 'self' blob: data:",
            ].join("; "),
          },
        ],
      },
      {
        source: "/favicon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/og-image-whatsapp.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/.well-known/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
