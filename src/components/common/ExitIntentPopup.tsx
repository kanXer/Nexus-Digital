"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket } from "lucide-react";
import Link from "next/link";

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("exit-popup-dismissed");
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setVisible(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("exit-popup-dismissed", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full z-50"
          >
            <div className="glass-card rounded-3xl overflow-hidden border border-white/12 text-center">
              <div className="h-1 w-full bg-gradient-brand" />
              <div className="p-8">
                <button
                  onClick={dismiss}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow animate-float">
                  <Rocket className="w-8 h-8 text-white" />
                </div>

                <p className="text-brand-blue-light text-sm font-semibold uppercase tracking-widest mb-2">Wait! Before you go...</p>
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                  Get a <span className="gradient-text">Free Strategy Session</span>
                </h3>
                <p className="text-white/55 text-sm mb-6">
                  Book a 30-minute free consultation with our experts and walk away with a custom growth roadmap for your business.
                </p>

                <div className="space-y-3">
                  <Link href="/contact#book-consultation" onClick={dismiss} className="btn-primary w-full justify-center">
                    Book My Free Session
                  </Link>
                  <button onClick={dismiss} className="text-white/35 text-xs hover:text-white/60 transition-colors">
                    No thanks, I&apos;ll figure it out myself
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
