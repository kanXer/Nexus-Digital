"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle, BarChart3 } from "lucide-react";
import { config } from "@/lib/config";
import { WordRotator } from "@/components/ui/WordRotator";

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
      <section ref={heroRef} className="relative min-h-screen flex items-start lg:items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none" />

        {/* Animated orbs */}
        <motion.div animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-32 left-15 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-brand-blue/8 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <motion.div animate={{ x: [0, -30, 20, 0], y: [0, 30, -40, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-32 right-15 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-purple-600/8 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />

        {/* Floating decorative elements */}
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 right-[15%] w-2 h-2 rounded-full bg-brand-blue/40 shadow-[0_0_15px_rgba(220,38,38,0.5)] pointer-events-none" />
        <motion.div animate={{ y: [10, -15, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-60 left-[12%] w-3 h-3 rounded-full bg-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] pointer-events-none" />
        <motion.div animate={{ y: [-8, 12, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-48 right-[20%] w-1.5 h-1.5 rounded-full bg-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.3)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="container-custom section-padding relative z-10 w-full">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div initial="hidden" animate="show" variants={containerVariants} className="text-center lg:text-left">
              <motion.div variants={itemVariants}>
                <span className="tag-badge mb-5 inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Digital Marketing Agency in Gorakhpur, UP
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="font-display text-[clamp(1.4rem,5.5vw,2.3rem)] font-bold text-white leading-[1.2] tracking-[-0.03em] mb-5 break-words">
                <motion.span
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } } }}
                  className="whitespace-nowrap"
                >
                  {["Best", "Digital", "Marketing"].map((w) => (
                    <motion.span
                      key={w}
                      variants={{ hidden: { opacity: 0, y: 32, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } }}
                      className="inline-block mr-[0.22em]"
                    >
                      {w}
                    </motion.span>
                  ))}
                </motion.span>
                <br className="block" />
                <motion.span
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } } }}
                  className="whitespace-nowrap"
                >
                  {["Agency"].map((w) => (
                    <motion.span
                      key={w}
                      variants={{ hidden: { opacity: 0, y: 32, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } }}
                      className="inline-block mr-[0.3em]"
                    >
                      {w}
                    </motion.span>
                  ))}
                </motion.span>{" "}
                <WordRotator words={["in Gorakhpur", "in Lucknow", "in U.P.", "Across India"]} className="gradient-text animate-gradient-text" />
              </motion.h1>

              <motion.p variants={itemVariants} className="text-base md:text-lg text-white/55 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                We are a top digital marketing company in Gorakhpur &amp; Uttar Pradesh — the best digital marketing agency in Gorakhpur — helping businesses across India generate more leads, sales, and revenue through Social Media Marketing, SEO, Google Ads, and Website Development.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link href="/enquiry#enquiry-form" className="btn-primary text-base px-7 py-3.5 group relative overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse-slow">
                  <span className="relative z-10 flex items-center font-bold">
                    Start Growing Today
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link href="/pricing" className="btn-secondary text-base px-7 py-3.5 group">
                  <Play className="w-4 h-4 text-brand-red group-hover:text-white transition-colors" />
                  See Our Packages
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4 mb-8">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="flex text-yellow-400 text-[10px]">★★★★★</span>
                  <span className="text-white/60 text-xs font-semibold ml-1">5.0 Google Rating</span>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-2 pt-1.5">
                  {["Trusted by 200+ Businesses", "Results in 30 days"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs text-white/45 font-medium">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Dashboard Mockup */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }} className="relative">
              <div className="relative perspective-1000">
                <motion.div
                  initial={{ rotateY: -8, rotateX: 5 }}
                  animate={{ rotateY: -5, rotateX: 3 }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                  className="glass-card rounded-2xl p-3 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(220,38,38,0.1)]"
                >
                  <div className="flex items-center gap-1.5 mb-3 px-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <div className="flex-1 mx-3 h-5 rounded-md bg-white/5 border border-white/8 flex items-center px-3">
                      <span className="text-[10px] text-white/25 tracking-tight">{config.website.replace("https://", "")}/dashboard</span>
                    </div>
                    <BarChart3 className="w-3.5 h-3.5 text-white/20" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: "Total Leads", value: "186", change: "+18%", up: true },
                      { label: "ROAS", value: "2.6X", change: "+9%", up: true },
                      { label: "Ad Spend", value: "₹48K", change: "+6%", up: false },
                      { label: "Conv. Rate", value: "12%", change: "+2%", up: true },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/4 border border-white/8 rounded-lg p-2.5">
                        <p className="text-white/35 text-[10px] font-medium mb-0.5">{m.label}</p>
                        <p className="text-white font-bold text-base">{m.value}</p>
                        <p className={`text-[10px] font-semibold ${m.up ? "text-green-400" : "text-brand-blue-light"}`}>{m.change}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/3 border border-white/6 rounded-lg p-3 h-28 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 95, 60, 88, 72, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.8 + i * 0.04, duration: 0.4, ease: "easeOut" }}
                        className="flex-1 rounded-t-sm relative group/bar origin-bottom"
                        style={{ background: `linear-gradient(180deg, rgba(220, 38, 38, ${0.4 + h / 200}) 0%, rgba(239, 68, 68, ${0.2 + h / 200}) 100%)`, height: `${h}%` }}
                      >
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue-light opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating stat badges */}
                <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-3 right-2 sm:-right-3 glass-card rounded-lg px-3 py-1.5 border border-white/10 shadow-lg">
                  <p className="text-green-400 text-xs font-bold">+40% Leads</p>
                </motion.div>
                <motion.div animate={{ y: [4, -8, 4] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-2 left-2 sm:-left-2 glass-card rounded-lg px-3 py-1.5 border border-white/10 shadow-lg">
                  <p className="text-brand-blue-light text-xs font-bold">⭐ 4.9 Rating</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ BELOW THE FOLD (lazy loaded) ═══ */}
      <HomeBelowFold />
    </div>
  );
}
