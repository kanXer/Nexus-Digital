"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useAuth();

  // ── LOADING: Firebase is resolving the persisted session ──
  // Never flash the login wall — wait for auth to fully hydrate first.
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        {/* Spinning ring */}
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-brand-blue/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-blue-light" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-1"
        >
          <p className="text-sm font-semibold text-white/60">Verifying your session…</p>
          <p className="text-xs text-white/30">This takes less than a second</p>
        </motion.div>
      </div>
    );
  }

  // ── NOT LOGGED IN: Show a clean login prompt ──
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 text-center max-w-sm w-full space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto ring-1 ring-white/20 shadow-glow-sm">
            <Image src="/favicon.svg" alt="Nexus Digital" width={64} height={64} className="w-full h-full object-cover" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Login Required</h2>
            <p className="text-white/55 text-sm mt-1.5">
              This page is only available to signed-in members. Sign in to view your cart, checkout and orders.
            </p>
          </div>

          <button onClick={openAuthModal} className="w-full btn-primary py-3 rounded-xl justify-center font-bold text-sm">
            <Lock className="w-4 h-4 mr-1.5" /> Sign In / Create Account
          </button>

          <p className="text-[11px] text-white/35 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" /> Secure &amp; passwordless login
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
