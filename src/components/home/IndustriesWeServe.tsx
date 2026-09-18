"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Building2, HeartPulse, UtensilsCrossed, GraduationCap, ShoppingBag, Scissors, AlertCircle, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const INDUSTRIES = [
  {
    id: "realestate",
    label: "Real Estate & Builders",
    icon: Building2,
    pain: "Inventory sits unsold while competitors grab serious buyers first.",
    solutions: ["Local SEO for project pages", "Meta & Google Ads for qualified buyer leads", "Virtual tour & landing pages that convert"],
  },
  {
    id: "healthcare",
    label: "Healthcare & Clinics",
    icon: HeartPulse,
    pain: "Patients can't find you on Google Maps and calls are inconsistent.",
    solutions: ["Google Business Profile optimisation", "Local SEO & reputation management", "Appointment-driving ad campaigns"],
  },
  {
    id: "restaurant",
    label: "Restaurants & Cafés",
    icon: UtensilsCrossed,
    pain: "Empty weekday tables and low repeat orders from nearby customers.",
    solutions: ["Instagram & Reels content that drives footfall", "Local ads + Google Maps presence", "Online order & review automation"],
  },
  {
    id: "education",
    label: "Education & Coaching",
    icon: GraduationCap,
    pain: "Admissions depend on word-of-mouth with no predictable enquiries.",
    solutions: ["Admission enquiry funnels", "YouTube & social content strategy", "Retargeting to undecided parents"],
  },
  {
    id: "ecommerce",
    label: "E-commerce & D2C",
    icon: ShoppingBag,
    pain: "Spending on ads but ROAS is low and carts get abandoned.",
    solutions: ["Google Shopping & Performance Max", "Meta catalogue & remarketing", "CRO-focused landing pages"],
  },
  {
    id: "local",
    label: "Salons, Gyms & Local Retail",
    icon: Scissors,
    pain: "Great service, but new customers only come from old referrals.",
    solutions: ["Hyper-local social campaigns", "Google Maps & review growth", "WhatsApp booking & offers automation"],
  },
];

export default function IndustriesWeServe() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const current = INDUSTRIES[active];

  // Auto-advance rotation every 5 seconds unless hovered/focused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % INDUSTRIES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Keep active tab visible only inside its own container without scrolling the window!
  useEffect(() => {
    const container = tabsContainerRef.current;
    const el = tabRefs.current[active];
    if (container && el) {
      // Local container scroll only (on mobile horizontal row)
      const scrollLeft = el.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (el.clientWidth / 2);
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
  }, [active]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + INDUSTRIES.length) % INDUSTRIES.length);
  };

  const handleNext = () => {
    setActive((prev) => (prev + 1) % INDUSTRIES.length);
  };

  return (
    <section className="section-padding relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Built For Your Industry"
          title="Digital Marketing That Speaks "
          highlight="Your Business Language"
          subtitle="We don't do one-size-fits-all. Here's how we grow businesses like yours — across Gorakhpur, Uttar Pradesh and all of India."
        />

        {/* Outer container strictly preventing any div overflow */}
        <div
          className="mt-12 max-w-5xl mx-auto overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-6 items-start">
            {/* Tabs column - smoothly scrollable if items expand, no overflow outside container */}
            <div
              ref={tabsContainerRef}
              className="w-full flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[460px] no-scrollbar custom-scrollbar pb-2 lg:pb-0 pr-0.5"
            >
              {INDUSTRIES.map((ind, i) => {
                const Icon = ind.icon;
                const isActive = i === active;
                return (
                  <button
                    key={ind.id}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal overflow-hidden ${isActive
                      ? "bg-brand/10 dark:bg-brand/20 border-2 border-brand text-brand dark:text-white font-extrabold shadow-sm ring-1 ring-brand/30"
                      : "bg-white dark:bg-white/[0.04] border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:border-brand/40 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.08] shadow-xs"
                      }`}
                  >
                    {/* Mini animated progress bar on active tab */}
                    {isActive && !isPaused && (
                      <motion.div
                        key={`prog-${active}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-brand to-amber-500 pointer-events-none"
                      />
                    )}

                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive
                        ? "bg-brand text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                        }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                    </div>
                    <span className={`text-sm font-bold tracking-tight truncate ${isActive ? "text-brand dark:text-white" : "text-slate-950 dark:text-white"}`}>
                      {ind.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panel Card - Explicit Light Background in Light Mode and Dark in Dark Mode */}
            <div className="w-full relative min-h-[380px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                  className="bg-white dark:bg-[#0B1120] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-2xl flex flex-col justify-between"
                >
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    {/* Top Row: Icon, Title & Navigation Controls */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-dark via-brand to-amber-500 flex items-center justify-center shadow-md text-white">
                          <current.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-brand dark:text-brand-light">Targeted Growth</span>
                          <h3 className="text-slate-950 dark:text-white font-extrabold text-xl sm:text-2xl tracking-tight leading-snug">
                            {current.label}
                          </h3>
                        </div>
                      </div>

                      {/* Pagination Indicator & Navigation Arrows */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg border border-slate-300 dark:border-white/15">
                          {active + 1}/{INDUSTRIES.length}
                        </span>
                        <button
                          type="button"
                          onClick={handlePrev}
                          aria-label="Previous Industry"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          aria-label="Next Industry"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* The Problem Section - Deep contrast in light mode */}
                    <div className="mb-5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                      <p className="text-[11.5px] uppercase tracking-[0.14em] font-extrabold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        The problem we hear most
                      </p>
                      <p className="text-slate-950 dark:text-slate-100 text-sm sm:text-[15px] leading-relaxed font-semibold">
                        {current.pain}
                      </p>
                    </div>

                    {/* Solutions Section - Bold & High Contrast */}
                    <div className="mb-7">
                      <p className="text-[11.5px] uppercase tracking-[0.14em] font-extrabold text-brand dark:text-brand-light mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        How we fix it
                      </p>
                      <ul className="space-y-2.5">
                        {current.solutions.map((s) => (
                          <li key={s} className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-950 dark:text-slate-100 font-medium">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300 dark:border-emerald-700">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                            <span className="leading-snug">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action CTA */}
                    <Link
                      href="/enquiry#enquiry-form"
                      className="btn-primary justify-center text-sm font-bold group w-full sm:w-auto shadow-md"
                    >
                      Get a growth plan for my {current.label.toLowerCase()}
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
