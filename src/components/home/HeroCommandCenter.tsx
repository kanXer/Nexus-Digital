"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  Flame,
  Globe2,
  Star,
} from "lucide-react";

const simulatedLeads = [
  { name: "Dr. K. Sharma Clinic", city: "Gorakhpur, Uttar Pradesh", service: "Full-Stack Web App + Local SEO", value: "₹55,000", time: "Just now" },
  { name: "Avadh E-Commerce Hub", city: "Lucknow, Uttar Pradesh", service: "Custom Online Store + Ads", value: "₹85,000", time: "3m ago" },
  { name: "Royal Banquets & Resort", city: "Gorakhpur, Uttar Pradesh", service: "Meta Ads + Google Map Pack", value: "₹42,000/mo", time: "8m ago" },
  { name: "Purvanchal Agro Traders", city: "Gorakhpur, Uttar Pradesh", service: "E-Commerce + Payment Gateway", value: "₹1,10,000", time: "14m ago" },
];

export default function HeroCommandCenter() {
  const [activeTab, setActiveTab] = useState<"roi" | "speed" | "seo">("roi");
  const [budget, setBudget] = useState<number>(35000);
  const [leadIndex, setLeadIndex] = useState(0);
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [speedProgress, setSpeedProgress] = useState(99);

  // Cycle simulated live leads every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLeadIndex((prev) => (prev + 1) % simulatedLeads.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleTestSpeed = () => {
    setIsSpeedTesting(true);
    setSpeedProgress(20);
    const interval = setInterval(() => {
      setSpeedProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          setIsSpeedTesting(false);
          return 99;
        }
        return prev + 15;
      });
    }, 120);
  };

  // Dynamic ROI calculation based on budget
  const estimatedClicks = Math.round(budget / 14);
  const estimatedLeads = Math.round(budget / 380);
  const projectedRevenue = Math.round(budget * 3.8);

  const currentLead = simulatedLeads[leadIndex];

  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
      {/* Ambient glow backdrop */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue/30 via-purple-600/20 to-brand-blue/30 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

      {/* Main Glass Dashboard Card */}
      <div className="relative glass-card-luxury rounded-2xl md:rounded-3xl p-4 sm:p-5 border border-white/12 shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_50px_rgba(220,38,38,0.15)] overflow-hidden">
        
        {/* Top Command Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/8">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[11px] font-mono font-medium text-white/40 tracking-wider">
              COMMAND_CENTER.v2
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-[11px] font-semibold text-green-400">
            <span className="radar-dot bg-green-400" />
            <span className="text-[10px] uppercase tracking-wider">Live System</span>
          </div>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/8 mb-4">
          <button
            onClick={() => setActiveTab("roi")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "roi"
                ? "bg-brand-blue text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ROI Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("speed")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "speed"
                ? "bg-brand-blue text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Speed 99/100</span>
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "seo"
                ? "bg-brand-blue text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>#1 SEO Rank</span>
          </button>
        </div>

        {/* Tab 1: Live Growth ROI Engine */}
        {activeTab === "roi" && (
          <motion.div
            key="roi-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3.5"
          >
            {/* Live Incoming Lead Simulation Toast */}
            <div className="relative rounded-xl p-3 bg-gradient-to-r from-brand-blue/15 via-purple-600/10 to-brand-blue/5 border border-brand-blue/30 overflow-hidden">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="flex items-center gap-1.5 text-brand-blue-light font-bold">
                  <Flame className="w-3.5 h-3.5 text-brand-blue-light animate-pulse" />
                  Live Verified Enquiry
                </span>
                <span className="text-white/40 text-[10px] font-mono">{currentLead.time}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLead.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-xs font-bold">{currentLead.name} <span className="text-white/40 font-normal">({currentLead.city})</span></p>
                    <p className="text-white/60 text-[11px]">{currentLead.service}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 font-bold text-xs border border-green-500/30">
                      {currentLead.value}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Interactive Monthly Ad/Campaign Budget Slider */}
            <div className="bg-white/4 rounded-xl p-3 border border-white/8">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-white/60 font-medium">Monthly Growth Budget</span>
                <span className="text-white font-bold text-sm text-brand-blue-light">
                  ₹{budget.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={150000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-brand-blue h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/35 mt-1 font-mono">
                <span>₹15K</span>
                <span>₹75K</span>
                <span>₹1.5L+</span>
              </div>
            </div>

            {/* Projected Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/4 border border-white/8 rounded-xl p-2.5 text-center">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">High-Intent Leads</p>
                <p className="text-white font-bold text-base md:text-lg">~{estimatedLeads}</p>
                <span className="text-[10px] text-green-400 font-semibold">+38% vs Avg</span>
              </div>

              <div className="bg-white/4 border border-white/8 rounded-xl p-2.5 text-center">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Targeted Clicks</p>
                <p className="text-white font-bold text-base md:text-lg">{estimatedClicks.toLocaleString()}</p>
                <span className="text-[10px] text-brand-blue-light font-semibold">98.4% Quality</span>
              </div>

              <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-xl p-2.5 text-center">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Projected Revenue</p>
                <p className="text-brand-blue-light font-bold text-base md:text-lg">₹{(projectedRevenue / 1000).toFixed(0)}K</p>
                <span className="text-[10px] text-green-400 font-semibold">3.8X ROAS</span>
              </div>
            </div>

            {/* Micro Graph Bar Visualizer */}
            <div className="bg-white/3 border border-white/6 rounded-xl p-2.5 flex items-end gap-1.5 h-16">
              {[35, 55, 42, 68, 50, 85, 62, 92, 75, 98, 88, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                  <div
                    className="w-full h-full rounded-t-sm transition-all duration-300"
                    style={{
                      background: `linear-gradient(180deg, rgba(220, 38, 38, ${0.5 + h / 200}) 0%, rgba(239, 68, 68, 0.2) 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Core Web Vitals & Next.js Turbopack Speed */}
        {activeTab === "speed" && (
          <motion.div
            key="speed-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3.5"
          >
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-green-500/5 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-400">{speedProgress}/100</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Grade A+ (Google Passed)
                  </span>
                </div>
                <p className="text-white/60 text-xs mt-0.5">Next.js 16 + React 19 + Turbopack</p>
              </div>

              <button
                onClick={handleTestSpeed}
                disabled={isSpeedTesting}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSpeedTesting ? "Auditing..." : "Re-test Speed"}
              </button>
            </div>

            {/* Comparison Matrix: Nexus vs Standard WordPress */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white/4 border border-white/8 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Nexus Custom Architecture</p>
                    <p className="text-white/40 text-[10px]">Zero template bloat · SSR &amp; Edge caching</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold font-mono text-sm">0.7s Load</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between text-xs opacity-75">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold">✕</span>
                  <div>
                    <p className="text-white/80 font-medium">Standard WordPress / Wix</p>
                    <p className="text-white/35 text-[10px]">Heavy plugins, slow database queries</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold font-mono text-sm">4.6s Load</span>
              </div>
            </div>

            {/* Core Web Vitals Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/4 p-2 rounded-lg border border-white/8">
                <span className="text-emerald-400 font-bold font-mono text-sm">0.3s</span>
                <p className="text-white/40 text-[10px] mt-0.5">LCP (Fast)</p>
              </div>
              <div className="bg-white/4 p-2 rounded-lg border border-white/8">
                <span className="text-emerald-400 font-bold font-mono text-sm">0.00</span>
                <p className="text-white/40 text-[10px] mt-0.5">CLS (Zero Shift)</p>
              </div>
              <div className="bg-white/4 p-2 rounded-lg border border-white/8">
                <span className="text-emerald-400 font-bold font-mono text-sm">12ms</span>
                <p className="text-white/40 text-[10px] mt-0.5">INP (Instant)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Google SEO #1 Ranking Simulator */}
        {activeTab === "seo" && (
          <motion.div
            key="seo-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3.5"
          >
            {/* Google Search Bar Mockup */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/6 border border-white/12 text-xs">
              <Search className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/80 font-mono truncate text-[11px]">
                best digital marketing &amp; web development in gorakhpur, uttar pradesh
              </span>
            </div>

            {/* Simulated #1 Google Result Card */}
            <div className="p-3.5 rounded-xl bg-white/4 border border-brand-blue/40 shadow-[0_4px_20px_rgba(220,38,38,0.15)] relative overflow-hidden">
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-brand-blue text-white text-[10px] font-bold">
                RANK #1
              </div>

              <div className="flex items-center gap-2 text-[11px] text-white/50 mb-1">
                <Globe2 className="w-3.5 h-3.5 text-brand-blue-light" />
                <span>thenexusdigital.in</span>
              </div>

              <h4 className="text-white font-bold text-sm hover:text-brand-blue-light transition-colors cursor-pointer">
                Nexus Digital — Top Digital Marketing &amp; Web Agency in Gorakhpur, Uttar Pradesh
              </h4>

              <div className="flex items-center gap-1.5 my-1.5 text-xs">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-white/70 font-semibold text-[11px]">5.0</span>
                <span className="text-white/40 text-[11px]">(48+ verified client reviews)</span>
              </div>

              <p className="text-white/50 text-[11px] leading-relaxed line-clamp-2">
                Dominate your market in Gorakhpur, Uttar Pradesh &amp; India. High-speed custom web development, Google Ads ROAS, Local SEO Map Pack #1 rankings, and automated lead generation.
              </p>

              {/* Sitelinks */}
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-white/8">
                <span className="text-[10px] text-brand-blue-light font-medium flex items-center gap-1">
                  • Next.js Web Development
                </span>
                <span className="text-[10px] text-brand-blue-light font-medium flex items-center gap-1">
                  • Google Maps Local SEO #1
                </span>
                <span className="text-[10px] text-brand-blue-light font-medium flex items-center gap-1">
                  • High-Converting Meta Ads
                </span>
                <span className="text-[10px] text-brand-blue-light font-medium flex items-center gap-1">
                  • Free Instant Growth Audit
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Proof Strip */}
        <div className="mt-3.5 pt-3 border-t border-white/8 flex items-center justify-between text-[11px] text-white/45">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            Verified ROI Tracking
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue-light" />
            Active across Gorakhpur, Uttar Pradesh &amp; India
          </span>
        </div>
      </div>

      {/* Floating Glass Badges */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="hidden sm:flex absolute -top-3.5 -right-3.5 glass-card-luxury px-3 py-1.5 rounded-full border border-green-500/30 items-center gap-1.5 shadow-lg z-20"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 text-xs font-bold">+340% Traffic Spike</span>
      </motion.div>

      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden sm:flex absolute -bottom-3 -left-3 glass-card-luxury px-3 py-1.5 rounded-full border border-brand-blue/30 items-center gap-1.5 shadow-lg z-20"
      >
        <Zap className="w-3 h-3 text-brand-blue-light" />
        <span className="text-white text-xs font-bold">⚡ &lt;1.0s Speed Guarantee</span>
      </motion.div>
    </div>
  );
}
