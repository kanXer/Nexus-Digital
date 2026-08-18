"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
        >
          <div className="glass-card rounded-2xl p-5 border border-white/12 shadow-card">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0">
                <Cookie className="w-4 h-4 text-brand-blue-light" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">We use cookies 🍪</h4>
                <p className="text-white/50 text-xs leading-relaxed">
                  We use cookies to improve your experience and analyse site traffic. By accepting, you agree to our{" "}
                  <a href="/privacy-policy" className="text-brand-blue-light underline">Privacy Policy</a>.
                </p>
              </div>
              <button onClick={decline} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="btn-primary flex-1 justify-center text-xs py-2"
              >
                Accept All
              </button>
              <button
                onClick={decline}
                className="btn-secondary flex-1 justify-center text-xs py-2"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
