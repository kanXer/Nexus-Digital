"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Lock, Mail, User } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/verify-admin");
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            router.replace("/admin/dashboard");
          }
        }
      } catch {
        // ignore — show login form
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (mode === "register") {
        setMode("login");
        setError("");
        setPassword("");
        setConfirm("");
        setSuccess("Account created! Please login to continue.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="max-w-md mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-brand-blue-light" /></div>
              <h1 className="text-white font-bold text-xl">Admin Panel</h1>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6 bg-white/4 border border-white/8 rounded-xl p-1">
              <button
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-brand-blue/20 text-white" : "text-white/45 hover:text-white"}`}
              >
                Login
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === "register" ? "bg-brand-blue/20 text-white" : "text-white/45 hover:text-white"}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/45 text-xs font-medium mb-1.5 block">Admin Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email"
                    className="input-field-with-icon"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/45 text-xs font-medium mb-1.5 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Password"
                    className="input-field-with-icon"
                  />
                </div>
              </div>
              {mode === "register" && (
                <div>
                  <label className="text-white/45 text-xs font-medium mb-1.5 block">Confirm Password *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Confirm Password"
                      className="input-field-with-icon"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
              )}

              {success && (
                <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{success}</div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</> : mode === "login" ? "Login" : "Create Account"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
