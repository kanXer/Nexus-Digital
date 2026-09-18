"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Three states: "checking" (verifying existing session/firebase), "auto" (firebase user found, auto-logging in), "ready" (show button)
  const [stage, setStage] = useState<"checking" | "auto" | "ready">("checking");

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 1. Check if an admin session cookie already exists
      try {
        const res = await fetch("/api/admin/check");
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.isAdmin || data.verified) {
            router.replace("/admin/dashboard");
            return;
          }
        }
      } catch {
        // ignore — continue to firebase check
      }

      if (cancelled) return;

      // 2. Check if Firebase user is already signed in
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (cancelled) return;

        if (firebaseUser?.email) {
          // User already logged into Firebase — auto-submit their email to the admin login API
          setStage("auto");
          try {
            const res = await fetch("/api/admin/check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: firebaseUser.email }),
            });
            if (!cancelled && res.ok) {
              router.replace("/admin/dashboard");
              return;
            }
            // Firebase user exists but not an authorized admin
            if (!cancelled) {
              setError("Access Denied: Your Google account is not authorized as an admin.");
              setStage("ready");
            }
          } catch {
            if (!cancelled) {
              setError("Failed to verify admin access. Please try again.");
              setStage("ready");
            }
          }
        } else {
          // No Firebase session — show the sign-in button
          if (!cancelled) setStage("ready");
        }

        unsubscribe();
      });
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleFirebaseLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user?.email;

      if (!email) {
        throw new Error("No verified email received from Google authentication.");
      }

      // Verify email against backend superadmin (.env) or database authorized admins
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.isAdmin) {
        throw new Error(data.error || "Access Denied: Your email is not authorized for Admin Access.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Admin sign-in error:", err);
      const code = err?.code || "";
      if (code === "auth/popup-closed-by-user") {
        setLoading(false);
        return;
      }
      setError(err?.message || "Failed to authenticate with Firebase.");
    } finally {
      setLoading(false);
    }
  };

  // Full-screen spinner while checking session or auto-logging in
  if (stage === "checking" || stage === "auto") {
    return (
      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col items-center justify-center gap-5 transition-colors duration-300">
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
          <p className="text-sm font-semibold text-slate-700 dark:text-white/60">
            {stage === "auto" ? "Verifying your admin access…" : "Checking admin session…"}
          </p>
          <p className="text-xs text-slate-500 dark:text-white/30">Just a moment</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300">
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="max-w-md mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h1 className="text-black dark:text-white font-bold text-xl">Admin Security Portal</h1>
                <p className="text-xs text-slate-500 dark:text-white/45">Authorized Personnel Only</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
              <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed">
                Admin authentication is managed securely via <strong className="text-black dark:text-white">Firebase Google Identity</strong>. Only emails authorized by the Super Admin (<code className="text-brand text-[11px]">.env</code>) are granted access.
              </p>
            </div>

            {error && (
              <div className="mb-5 text-red-600 dark:text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            <button
              type="button"
              onClick={handleFirebaseLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-black dark:text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-brand" />
                  <span>Verifying authorization...</span>
                </>
              ) : (
                <>
                  {/* Google G Logo SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google (Firebase)</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
