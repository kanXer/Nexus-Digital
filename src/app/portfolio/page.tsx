"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";


const categories = ["All", "Websites", "Healthcare", "Social Impact"];

const portfolioItems = [
  { id: 1, title: "Gorakhpur Mission Rehab", category: "Websites", tag: "Healthcare", color: "from-teal-500/30 to-cyan-500/20", emoji: "🩺", url: "https://gorakhpurmission.in/", result: "Local SEO · Online Leads" },
  { id: 2, title: "1st Poultry Conclave Gorakhpur 2026", category: "Websites", tag: "Event", color: "from-amber-500/30 to-yellow-500/20", emoji: "🐔", url: "https://poultry-conclave.vercel.app/", result: "Event Registrations" },
  { id: 3, title: "KHABRI.IN — News Decode", category: "Websites", tag: "News / Media", color: "from-blue-500/30 to-indigo-500/20", emoji: "📰", url: "https://khabari-in.vercel.app/", result: "AI News Platform · Real-time Updates" },
  { id: 4, title: "Radhey Radhey Charitable Blood & Component Centre", category: "Websites", tag: "Blood Bank", color: "from-red-500/30 to-rose-500/20", emoji: "🩸", url: "https://radhe-radhe-blood-bank.vercel.app/", result: "Online Presence · Community Reach" },
];

export default function PortfolioPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? portfolioItems : portfolioItems.filter((p) => p.category === active);

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            Our Portfolio
          </motion.span>
          <AnimatedTitle
            as="h1"
            title="Work That Speaks for Itself"
            highlight="Speaks for Itself"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-lg text-white/55"
          >
            A selection of campaigns, websites, and creative work across industries — created by the top digital marketing company in Gorakhpur &amp; Uttar Pradesh.
          </motion.p>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                active === cat
                  ? "bg-gradient-brand text-white shadow-glow-sm"
                  : "glass-card text-white/55 hover:text-white border border-white/8"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer"
                  whileHover={{ y: -6 }}
                >
                  {/* Card visual */}
                  <div className={`h-48 bg-gradient-to-br ${item.color} flex items-center justify-center relative`}>
                    <span className="text-6xl">{item.emoji}</span>
                    {/* Hover overlay */}
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${item.title}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-brand-blue flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </a>
                    ) : (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-brand-blue flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-white/5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-brand-blue-light bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                          {item.tag}
                        </span>
                        <span className="text-xs text-white/40">{item.category}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                    </div>
                    <div>
                      <p className="text-green-400 text-[11px] font-bold uppercase tracking-wider bg-green-400/10 inline-block px-2 py-1 rounded mb-3">✦ {item.result}</p>
                      <Link href="/enquiry#enquiry-form" className="flex items-center justify-between w-full text-xs font-semibold text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded transition-colors group/link">
                        Want these results?
                        <ArrowRight className="w-3.5 h-3.5 text-brand-blue-light transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-brand-red/10 border-t border-brand-red/30 relative overflow-hidden">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-red-600/20 via-rose-600/20 to-orange-600/20 blur-3xl" />
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
          <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 animate-pulse">
            Your Business Could Be Next
          </span>
          <AnimatedTitle
            as="h2"
            title="Ready to dominate your market?"
            className="text-3xl md:text-5xl font-black text-white mb-6"
            initialDelay={0.1}
          />
          <p className="text-white/70 mb-8 max-w-xl text-lg">Stop admiring your competitors' results. Let's build your success story today.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/pricing" className="btn-primary px-8 py-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse-slow text-base font-bold">See Packages <ArrowRight className="w-5 h-5 ml-1" /></Link>
            <Link href="/contact" className="btn-secondary px-8 py-4 text-base">Book Free Audit</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
