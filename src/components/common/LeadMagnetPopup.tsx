"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";

export function LeadMagnetPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("lead-popup-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("lead-popup-dismissed", "true");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: "Lead Magnet" }),
      });
    } catch {
      // silent
    }
    setLoading(false);
    setSubmitted(true);
    setTimeout(dismiss, 3000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg w-full z-50"
          >
            <div className="glass-card-brand rounded-3xl overflow-hidden border border-brand-blue/25">
              {/* Top gradient bar */}
              <div className="h-1 w-full bg-gradient-brand" />

              <div className="p-8">
                <button
                  onClick={dismiss}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {!submitted ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-5 shadow-glow">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                    <span className="tag-badge mb-4 inline-flex">🎁 Free Resource</span>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      Get Your Free <span className="gradient-text-brand">Marketing Audit</span>
                    </h3>
                    <p className="text-white/55 text-sm mb-6 leading-relaxed">
                      Enter your email and we&apos;ll send you a personalised 10-point marketing audit report for your business — completely free.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="input-field"
                        required
                      />
                      <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
                        {loading ? "Sending..." : <>Send My Free Audit <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                    <p className="text-white/30 text-xs mt-3 text-center">No spam. Unsubscribe anytime.</p>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-white mb-2">You&apos;re all set!</h3>
                    <p className="text-white/55 text-sm">
                      We&apos;ll send your free marketing audit to <strong className="text-white">{email}</strong> within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
