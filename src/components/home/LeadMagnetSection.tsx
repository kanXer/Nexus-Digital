"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ArrowRight, X, CheckCircle2, Loader2, CheckSquare, MapPin, Calculator, BookOpen, Rocket, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { leadMagnets, LeadMagnet } from "@/data/leadMagnets";

const ICONS: Record<string, React.ElementType> = { CheckSquare, MapPin, Calculator, BookOpen, Rocket };

interface LeadResult {
  ok: boolean;
  resourceTitle?: string;
  error?: string;
}

export default function LeadMagnetSection() {
  const [active, setActive] = useState<LeadMagnet | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, resource: active.id }),
      });
      const d: LeadResult = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Failed to submit");
    }
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Free Resources"
          title="Grow Faster With Our "
          highlight="Free Toolkits"
          subtitle="Done-for-you checklists and calculators we use with paying clients — grab yours in exchange for an email. No spam, ever."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {leadMagnets.map((m, i) => {
            const Icon = ICONS[m.icon] || BookOpen;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 border border-white/8 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-glow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-blue/15 text-brand-blue-light border border-brand-blue/30">{m.tag}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">{m.description}</p>
                <ul className="space-y-1.5 mb-5">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue-light shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setActive(m); setStatus("idle"); setMsg(""); }} className="btn-primary justify-center text-sm group">
                  Get this free
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Lead-gain CTA — turn free-download visitors into qualified enquiries */}
        <div className="mt-10 max-w-3xl mx-auto glass-card rounded-2xl border border-white/8 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-glow-sm shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm sm:text-base">Want a custom growth plan?</p>
              <p className="text-white/45 text-xs sm:text-sm">Book a free strategy call and we&apos;ll audit your SEO + ads for free.</p>
            </div>
          </div>
          <Link href="/enquiry" className="btn-primary justify-center text-sm whitespace-nowrap">
            Get a free audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Gate modal */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setActive(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-secondary)] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-6 relative"
            >
              <button onClick={() => setActive(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-glow-sm mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>

              {status === "done" ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl mb-2">You&apos;re all set!</h3>
                  <p className="text-white/55 text-sm mb-6">Your copy of <span className="text-white">{active.title}</span> is ready.</p>
                  <a href={active.file} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center text-sm group w-full">
                    Download now
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                  <p className="text-white/30 text-[11px] mt-4">We&apos;ll also send a copy to your inbox.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-bold text-xl mb-1 pr-8">{active.title}</h3>
                  <p className="text-white/50 text-sm mb-5">Enter your details and we&apos;ll unlock the download instantly.</p>
                  <form onSubmit={submit} className="space-y-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-red-400/80 outline-none focus:border-brand-blue/50"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Work email *"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-red-400/80 outline-none focus:border-brand-blue/50"
                    />
                    {status === "error" && <p className="text-red-400 text-xs">{msg}</p>}
                    <button type="submit" disabled={status === "loading"} className="btn-primary justify-center text-sm group w-full">
                      {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {status === "loading" ? "Unlocking..." : "Unlock free download"}
                    </button>
                  </form>
                  <p className="text-white/30 text-[11px] mt-4 text-center">No spam. Unsubscribe anytime.</p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
