"use client";

import Image from "next/image";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
        <p className="text-sm text-white/50">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 text-center max-w-sm w-full space-y-5">
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
            <Lock className="w-3 h-3" /> Secure & passwordless login
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
