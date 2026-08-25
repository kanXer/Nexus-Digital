"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, sendEmailLinkLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Google Sign-In failed or popup was closed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendEmailLinkLogin(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send passwordless login link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-backdrop fixed inset-0 backdrop-blur-md"
          onClick={closeAuthModal}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/12 auth-modal-card overflow-hidden"
        >
          {/* Top glow decoration */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-blue/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-3 ring-1 ring-white/20 shadow-glow-sm">
              <Image src="/favicon.svg" alt="Nexus Digital" width={56} height={56} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Welcome to Nexus</h3>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              Sign in to manage your orders, cart, and profile auto-fill.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Login Link Sent!</h4>
              <p className="text-white/70 text-sm">
                We sent a passwordless sign-in link to <strong className="text-white">{email}</strong>. Check your inbox and click the link to log in instantly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-brand-blue-light hover:underline font-semibold"
              >
                Use a different email or sign in method
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.31v3.15C3.29 21.29 7.37 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.31C.47 8.27 0 10.08 0 12s.47 3.73 1.31 5.39l3.97-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.71 1.31 6.61l3.97 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                Sign in with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="border-t border-white/10 flex-1" />
                <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider shrink-0">
                  Or passwordless email
                </span>
                <div className="border-t border-white/10 flex-1" />
              </div>

              {/* Passwordless Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="input-field-with-icon text-sm"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl justify-center font-bold text-sm"
                >
                  {loading ? "Sending link..." : "Send Passwordless Link"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-white/40">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                100% Secure & Passwordless
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
