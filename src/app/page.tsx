"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles, Zap, ShieldCheck, Star, Rocket } from "lucide-react";
import { config } from "@/lib/config";
import { WordRotator } from "@/components/ui/WordRotator";
import { trackEvent, WHATSAPP_AUDIT, waLink } from "@/lib/analytics";
import HeroCommandCenter from "@/components/home/HeroCommandCenter";

const HomeBelowFold = dynamic(() => import("@/components/home/HomeBelowFold"), { ssr: false });

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div className="bg-black overflow-hidden">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-start lg:items-center pt-24 pb-12 lg:pb-16 overflow-hidden ambient-mesh">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 bg-nexus-constellation pointer-events-none opacity-90" />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none" />

        {/* Dynamic Chromatic Nebula — 4-Point Floating Photons */}
        <motion.div animate={{ x: [0, 35, -25, 0], y: [0, -35, 25, 0], scale: [1, 1.08, 0.95, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-10 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-600/15 rounded-full blur-[100px] md:blur-[140px] pointer-events-none" />
        <motion.div animate={{ x: [0, -30, 25, 0], y: [0, 30, -35, 0], scale: [1, 0.95, 1.08, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 right-10 w-[260px] h-[260px] md:w-[520px] md:h-[520px] bg-purple-600/14 rounded-full blur-[90px] md:blur-[130px] pointer-events-none" />
        <motion.div animate={{ x: [0, 25, -20, 0], y: [0, -25, 20, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/4 w-[220px] h-[220px] md:w-[400px] md:h-[400px] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <motion.div animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/3 right-1/4 w-[180px] h-[180px] md:w-[320px] md:h-[320px] bg-emerald-500/8 rounded-full blur-[70px] md:blur-[110px] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="container-custom section-padding relative z-10 w-full">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content (7 columns on desktop) */}
            <motion.div initial="hidden" animate="show" variants={containerVariants} className="lg:col-span-7 text-center lg:text-left">
              <motion.div variants={itemVariants}>
                <span className="tag-badge mb-5 inline-flex items-center gap-2 border-brand-blue/30 bg-brand-blue/10 text-white/90">
                  <span className="radar-dot bg-green-400" />
                  <span>Next-Gen Web Architecture &amp; Performance Growth · Gorakhpur, Uttar Pradesh &amp; Pan-India</span>
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="font-display text-[clamp(2.1rem,5.5vw,3.5rem)] font-extrabold text-white leading-[1.12] tracking-[-0.035em] mb-5 break-words">
                Turn Clicks Into <br className="hidden sm:inline" />
                <span className="text-white">Paying Clients.</span>
                <br />
                <WordRotator
                  words={[
                    "10X Faster Websites.",
                    "Dominate Google #1.",
                    "Scale High-ROAS Ads.",
                    "Automate Lead Capture."
                  ]}
                  className="gradient-text animate-gradient-text"
                />
              </motion.h1>

              <motion.p variants={itemVariants} className="text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal">
                We build high-speed custom web applications and manage profit-engineered SEO &amp; Paid Ad campaigns. No slow templates, no fluff — just measurable leads, sales, and explosive growth for businesses in Gorakhpur, Uttar Pradesh, and across India.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-7">
                <Link
                  href="/enquiry#enquiry-form"
                  onClick={() => trackEvent("hero_cta_click", { cta: "get_free_growth_audit", location: "hero" })}
                  className="btn-cta-premium text-base px-8 py-4 group"
                >
                  <span className="relative z-10 flex items-center font-bold tracking-tight">
                    <Rocket className="w-4.5 h-4.5 mr-2.5 text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                    Claim Free Growth &amp; Tech Audit
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <a
                  href={waLink(WHATSAPP_AUDIT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { cta: "whatsapp_us", location: "hero" })}
                  className="btn-secondary text-base px-7 py-4 group border-white/12 hover:border-green-500/40"
                >
                  <MessageCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">WhatsApp Instant Connect</span>
                </a>
              </motion.div>

              {/* Trust Badges */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-white font-bold">{config.gmbRating}</span>
                  <span className="text-white/45">(48+ Reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-white/60">
                  <Zap className="w-3.5 h-3.5 text-brand-blue-light" />
                  <span className="font-medium">&lt;1.0s Speed Guarantee</span>
                </div>

                <div className="flex items-center gap-2 text-white/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  <span className="font-medium">Gorakhpur, Uttar Pradesh · India</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Command Center (5 columns on desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              className="lg:col-span-5 relative"
            >
              <HeroCommandCenter />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ BELOW THE FOLD (lazy loaded) ═══ */}
      <HomeBelowFold />
    </div>
  );
}
