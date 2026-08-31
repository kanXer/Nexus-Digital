"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ShieldCheck, Zap, Star, Users, ArrowUpRight } from "lucide-react";

// High-converting, realistic social proof events
const EVENTS = [
  {
    name: "Ravi K.",
    city: "Gorakhpur",
    action: "just signed up for Google Ads Management",
    result: "Expected 3× ROI in 30 days",
    ago: "2 min ago",
    icon: TrendingUp,
    color: "#22c55e",
    glow: "rgba(34,197,94,0.25)",
  },
  {
    name: "Priya S.",
    city: "Lucknow",
    action: "booked a Free SEO Strategy Call",
    result: "Ranking #1 for local keywords",
    ago: "6 min ago",
    icon: Star,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    name: "Amit T.",
    city: "Varanasi",
    action: "started Social Media Marketing",
    result: "+240% followers in 60 days",
    ago: "11 min ago",
    icon: Users,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.25)",
  },
  {
    name: "Neha G.",
    city: "Kanpur",
    action: "purchased Website + SEO Bundle",
    result: "Live in 7 days, guaranteed",
    ago: "18 min ago",
    icon: Zap,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
  },
  {
    name: "Sandeep M.",
    city: "Gorakhpur",
    action: "activated Meta Ads Campaign",
    result: "₹12,000 leads on Day 1",
    ago: "29 min ago",
    icon: TrendingUp,
    color: "#22c55e",
    glow: "rgba(34,197,94,0.25)",
  },
  {
    name: "Kavya R.",
    city: "Allahabad",
    action: "enrolled in Full Digital Package",
    result: "Brand authority in 45 days",
    ago: "41 min ago",
    icon: ShieldCheck,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    name: "Imran A.",
    city: "Lucknow",
    action: "started Local SEO + GMB Setup",
    result: "Top 3 Maps result in 30 days",
    ago: "54 min ago",
    icon: Star,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.25)",
  },
  {
    name: "Divya P.",
    city: "Gorakhpur",
    action: "claimed Free Website Audit",
    result: "Found 23 growth opportunities",
    ago: "1 hr ago",
    icon: Zap,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
  },
];

const DISPLAY_DURATION = 6500; // how long the popup stays visible

export function SocialProofPopup() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState(0);

  // First show after 5s
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, [dismissed]);

  // Cycle to next event
  useEffect(() => {
    if (!visible || dismissed) return;
    setProgress(0);

    // Animate progress bar
    const start = Date.now();
    const raf = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / DISPLAY_DURATION) * 100, 100));
    }, 50);

    const cycle = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % EVENTS.length);
        setVisible(true);
      }, 500);
    }, DISPLAY_DURATION);

    return () => {
      clearInterval(raf);
      clearTimeout(cycle);
    };
  }, [visible, idx, dismissed]);

  if (dismissed) return null;

  const ev = EVENTS[idx];
  const Icon = ev.icon;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -40, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="always-dark fixed bottom-6 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs lg:max-w-none lg:w-[310px]"
        >
          <Link
            href="/enquiry#enquiry-form"
            className="block relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(20, 20, 25, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), 0 4px 20px ${ev.glow}`,
            }}
          >
            {/* Top accent bar */}
            <div
              className="h-[2px] w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${ev.color}, transparent)` }}
            />

            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 0% 50%, ${ev.glow} 0%, transparent 70%)`,
              }}
            />

            {/* Dismiss button */}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDismissed(true);
              }}
              className="absolute top-2.5 right-2.5 z-20 w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/15 transition-all"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="relative z-10 p-4">
              {/* Header row */}
              <div className="flex items-start gap-3">
                {/* Icon avatar */}
                <div
                  className="relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${ev.color}22, ${ev.color}44)`,
                    border: `1px solid ${ev.color}55`,
                    boxShadow: `0 4px 16px ${ev.glow}`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: ev.color }} />
                  {/* Live pulse dot */}
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f14]"
                    style={{ background: ev.color }}
                  >
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-75"
                      style={{ background: ev.color }}
                    />
                  </span>
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-[12px] leading-snug text-white/60">
                    <span className="font-semibold text-white">{ev.name}</span>
                    {" "}from{" "}
                    <span style={{ color: ev.color }} className="font-medium">{ev.city}</span>
                  </p>
                  <p className="text-[12.5px] font-semibold text-white mt-0.5 leading-snug">
                    {ev.action}
                  </p>
                </div>
              </div>

              {/* Result badge */}
              <div
                className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
                style={{
                  background: `linear-gradient(135deg, ${ev.color}10, ${ev.color}18)`,
                  border: `1px solid ${ev.color}30`,
                }}
              >
                <span className="text-[11px] font-bold" style={{ color: ev.color }}>
                  ✦ {ev.result}
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] font-semibold text-white/40 group-hover:text-white/70 transition-colors"
                >
                  Start now
                  <ArrowUpRight
                    className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    style={{ color: ev.color }}
                  />
                </span>
              </div>

              {/* Timestamp + progress */}
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-white/25">{ev.ago}</span>
                <span className="text-[10px] text-white/25 flex items-center gap-1">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: ev.color }}
                  />
                  Live activity
                </span>
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="h-[2px] w-full bg-white/5">
              <motion.div
                className="h-full"
                style={{ width: `${progress}%`, background: ev.color }}
                transition={{ ease: "linear" }}
              />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
