"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, ArrowUpRight } from "lucide-react";

const EVENTS = [
  { name: "Ravi", city: "Gorakhpur", action: "requested a free strategy call", ago: "2 min ago" },
  { name: "Priya", city: "Lucknow", action: "enquired about Local SEO", ago: "8 min ago" },
  { name: "Amit", city: "Varanasi", action: "started a Google Ads plan", ago: "15 min ago" },
  { name: "Neha", city: "Kanpur", action: "booked a website audit", ago: "21 min ago" },
  { name: "Sandeep", city: "Allahabad", action: "requested a free strategy call", ago: "34 min ago" },
  { name: "Kavya", city: "Gorakhpur", action: "enquired about Social Media", ago: "47 min ago" },
  { name: "Imran", city: "Lucknow", action: "started a Meta Ads plan", ago: "1 hr ago" },
];

const initials = (n: string) => n.slice(0, 2).toUpperCase();

export function SocialProofPopup() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const showTimer = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(showTimer);
  }, [dismissed]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % EVENTS.length);
        setVisible(true);
      }, 600);
    }, 7000);
    return () => clearInterval(id);
  }, [visible]);

  if (dismissed) return null;

  const ev = EVENTS[idx];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed bottom-6 left-4 z-40 hidden lg:block max-w-[300px]"
        >
          <Link
            href="/enquiry#enquiry-form"
            className="block glass-card rounded-2xl p-3.5 border border-white/12 shadow-card hover:border-brand-blue/40 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/8 to-transparent pointer-events-none" />
            <button
              type="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.preventDefault();
                setDismissed(true);
              }}
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="relative z-10 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
                  {initials(ev.name)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center">
                  <UserPlus className="w-2 h-2 text-black" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] text-white/80 leading-snug">
                  <span className="font-semibold text-white">{ev.name}</span> from {ev.city}{" "}
                  <span className="text-white/60">{ev.action}</span>
                </p>
                <p className="text-[10px] text-white/35 mt-0.5 flex items-center gap-1">
                  {ev.ago} · tap to grow your business too
                  <ArrowUpRight className="w-3 h-3 text-brand-blue-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
