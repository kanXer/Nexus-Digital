"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Building2, HeartPulse, UtensilsCrossed, GraduationCap, ShoppingBag, Scissors } from "lucide-react";
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
  const current = INDUSTRIES[active];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Built For Your Industry"
          title="Digital Marketing That Speaks "
          highlight="Your Business Language"
          subtitle="We don't do one-size-fits-all. Here's how we grow businesses like yours — across Gorakhpur, Uttar Pradesh and all of India."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-1">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.icon;
              const isActive = i === active;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border whitespace-nowrap lg:whitespace-normal text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-blue/15 border-brand-blue/40 text-white"
                      : "bg-white/3 border-white/8 text-white/55 hover:border-white/20"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-blue-light" : "text-white/45"}`} />
                  <span className="text-sm font-medium">{ind.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
              className="glass-card rounded-2xl p-6 sm:p-8 border border-white/8 relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-glow-sm">
                    <current.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl">{current.label}</h3>
                </div>

                <div className="mb-5 p-4 rounded-xl bg-white/4 border border-white/8">
                  <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">The problem we hear most</p>
                  <p className="text-white/70 text-sm leading-relaxed">{current.pain}</p>
                </div>

                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-brand-blue-light/80 mb-3">How we fix it</p>
                <ul className="space-y-2.5 mb-7">
                  {current.solutions.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-sm text-white/70">
                      <span className="w-5 h-5 rounded-full bg-brand-blue/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-brand-blue-light" />
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>

                <Link href="/enquiry#enquiry-form" className="btn-primary justify-center text-sm group w-full sm:w-auto">
                  Get a growth plan for my {current.label.toLowerCase()}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
