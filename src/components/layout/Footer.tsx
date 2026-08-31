"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Phone, MapPin, ArrowRight, CheckCircle, Loader2, X } from "lucide-react";
import { config } from "@/lib/config";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { trackEvent } from "@/lib/analytics";

const footerLinks = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Enquiry", href: "/enquiry#enquiry-form" },
  ],
  services: [
    { label: "SEO Services in Gorakhpur", href: "/services#seo" },
    { label: "Local SEO Company Gorakhpur", href: "/services#seo" },
    { label: "Social Media Marketing Agency Gorakhpur", href: "/services#social-media" },
    { label: "Meta Ads Specialist Gorakhpur", href: "/services#paid-marketing" },
    { label: "Google Ads PPC Management Gorakhpur", href: "/services#paid-marketing" },
    { label: "Lead Generation Services Gorakhpur", href: "/services#paid-marketing" },
    { label: "Website Design & Development Gorakhpur", href: "/services#website-automation" },
    { label: "Digital Marketing Pricing Gorakhpur", href: "/pricing" },
  ],
};

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/__sahil.srivastava__",
    svg: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16m0 1.94c-3.15 0-3.52.01-4.77.07-1.08.05-1.66.23-2.05.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.05-.06 1.25-.07 1.62-.07 4.77s.01 3.52.07 4.77c.05 1.08.23 1.66.38 2.05.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.05.38 1.25.06 1.62.07 4.77.07s3.52-.01 4.77-.07c1.08-.05 1.66-.23 2.05-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.05.06-1.25.07-1.62.07-4.77s-.01-3.52-.07-4.77c-.05-1.08-.23-1.66-.38-2.05-.2-.51-.44-.88-.82-1.26a3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.05-.38-1.25-.06-1.62-.07-4.77-.07m0 3.3a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2m0 1.94a2.66 2.66 0 1 0 0 5.32 2.66 2.66 0 0 0 0-5.32m5.29-3.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14"/></svg>,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/sahil.srivastava.1004/",
    svg: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kanxer/",
    svg: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/itsSrivastava_",
    svg: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>,
  },
  {
    label: "GitHub",
    href: "https://github.com/kanXer",
    svg: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.79 23.38c.6.12.82-.26.82-.57v-2c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.38.82 1.11.82 2.23v3.3c0 .32.21.7.82.58A12 12 0 0 0 12 .3z"/></svg>,
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Footer() {
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      if (!res.ok) throw new Error();
      setSubStatus("success");
      setSubEmail("");
      setShowToast(true);
    } catch {
      setSubStatus("error");
    }
  };
  return (
    <footer className="relative bg-[#050505] border-t border-white/8 overflow-hidden">
      {/* Animated top accent line */}
      <div className="footer-border-flow absolute top-0 inset-x-0 h-px pointer-events-none" />
      {/* Background decor */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[900px] h-[260px] bg-brand-blue/8 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 grid-dots opacity-15 pointer-events-none" />
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      {/* Giant brand watermark */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center overflow-hidden" aria-hidden="true">
        <span className="text-[22vw] lg:text-[14rem] font-black leading-none tracking-tighter bg-gradient-to-b from-white/[0.05] to-transparent bg-clip-text text-transparent whitespace-nowrap">
          {config.name}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        {/* CTA banner */}
        <motion.div {...fadeUp(0)} className="mb-16 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-blue/10 via-white/[0.02] to-purple-600/10 p-8 md:p-12 text-center">
          <div className="absolute inset-0 grid-dots opacity-15 pointer-events-none" />
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[600px] h-[240px] bg-brand-blue/10 blur-[110px] pointer-events-none" />
          <div className="relative z-10">
            <span className="tag-badge mb-4 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Ready to Grow?
            </span>
            <AnimatedTitle
              as="h2"
              title="Let's Grow Your Business in Gorakhpur & UP Together"
              highlight="Gorakhpur &"
              className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight tracking-tight"
              initialDelay={0.05}
            />
            <p className="text-white/50 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Get a free consultation and a custom growth plan from the best digital marketing agency in Gorakhpur — no cost, no pressure, no long-term contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/enquiry#enquiry-form" onClick={() => trackEvent("hero_cta_click", { cta: "get_free_growth_audit", location: "footer" })} className="btn-primary px-7 py-3 text-sm group">
                Get Free Growth Audit
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a href={`tel:${config.phone}`} onClick={() => trackEvent("phone_click", { location: "footer" })} className="btn-secondary px-7 py-3 text-sm">
                <Phone className="w-4 h-4" />
                Call Us Now
              </a>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Brand */}
          <motion.div {...fadeUp(0.05)} className="col-span-2 lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-[0_4px_15px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-white">{config.shortName}<span className="text-brand-blue-light">{config.name.replace(config.shortName, "")}</span></span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              The best digital marketing agency in Gorakhpur &amp; UP — a top digital marketing company in Gorakhpur helping businesses grow with SEO services, Google Ads PPC management, social media marketing, and lead generation services across Gorakhpur, Uttar Pradesh, and India.
            </p>
            <div className="space-y-2.5">
              <a href={`tel:${config.phone}`} className="flex items-center justify-center md:justify-start gap-2.5 text-sm text-white/40 hover:text-white transition-colors group">
                <Phone className="w-4 h-4 text-brand-blue group-hover:text-brand-blue-light transition-colors shrink-0" />
                {config.phone}
              </a>
              <a href={`mailto:${config.email}`} className="flex items-center justify-center md:justify-start gap-2.5 text-sm text-white/40 hover:text-white transition-colors group">
                <Mail className="w-4 h-4 text-brand-blue group-hover:text-brand-blue-light transition-colors shrink-0" />
                {config.email}
              </a>
              <a
                href={config.gmbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2.5 text-sm text-white/40 hover:text-white transition-colors group"
              >
                <MapPin className="w-4 h-4 text-brand-blue mt-0.5 shrink-0 group-hover:text-brand-blue-light transition-colors" />
                <span className="text-center md:text-left">{config.address}</span>
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div {...fadeUp(0.12)} className="col-span-1 lg:col-span-2">
            <div className="mb-5 flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em]">Quick Links</h4>
              <span className="mt-2 block w-8 h-0.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light" />
            </div>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-brand-blue-light" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div {...fadeUp(0.19)} className="col-span-1 lg:col-span-3">
            <div className="mb-5 flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em]">Services</h4>
              <span className="mt-2 block w-8 h-0.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light" />
            </div>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-brand-blue-light" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Socials */}
          <motion.div {...fadeUp(0.26)} className="col-span-2 lg:col-span-3 flex flex-col">
            <div className="mb-5 flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold text-xs uppercase tracking-[0.15em]">Stay Updated</h4>
              <span className="mt-2 block w-8 h-0.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light" />
            </div>
            <p className="text-sm text-white/40 mb-4 leading-relaxed">
              Get marketing tips, industry insights, and growth strategies straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input type="email" value={subEmail} onChange={(e) => { setSubEmail(e.target.value); setSubStatus("idle"); }} placeholder="Enter your email" className="input-field text-sm w-full" required />
              <button type="submit" disabled={subStatus === "loading"} className="btn-primary w-full justify-center text-sm py-2.5 group disabled:opacity-60">
                {subStatus === "loading" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subscribing...</> : subStatus === "success" ? <><CheckCircle className="w-3.5 h-3.5" /> Subscribed!</> : <><ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" /> Subscribe</>}
              </button>
              {subStatus === "error" && <p className="text-red-400 text-xs">Something went wrong. Try again.</p>}
            </form>
            <div className="mt-6">
              <p className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-semibold mb-3">Follow Us</p>
              <div className="flex gap-2 flex-wrap">
                {socials.map(({ svg, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-brand-blue/40 hover:bg-brand-blue/10 hover:-translate-y-1 transition-all duration-200"
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.3)} className="mt-16 pt-8 pb-4 border-t border-white/8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
          <p className="text-xs text-white/25 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link href="/refund-cancellation" className="text-xs text-white/25 hover:text-white/50 transition-colors">Refund &amp; Cancellation</Link>
            <Link href="/terms" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="text-xs text-white/25 hover:text-white/50 transition-colors">Sitemap</Link>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="bg-white text-black rounded-2xl shadow-xl border border-black/10 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Subscribed!</p>
                <p className="text-xs text-black/50 truncate">{subEmail}</p>
              </div>
              <button onClick={() => setShowToast(false)} className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center shrink-0 hover:bg-black/10 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}