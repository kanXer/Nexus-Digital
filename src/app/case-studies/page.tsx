"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { caseStudies } from "@/data/caseStudies";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";

export default function CaseStudiesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Case Studies</motion.span>
          <AnimatedTitle
            as="h1"
            title="Real Clients. Real Results."
            highlight="Real Results."
            className="text-[clamp(2rem,5vw,3.75rem)] font-black text-white leading-[1.05] tracking-[-0.04em] mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55 leading-relaxed">
            Detailed breakdowns of campaigns delivering steady, measurable results for our clients — from Google Ads PPC management and SEO to lead generation for businesses in Gorakhpur, Uttar Pradesh &amp; India.
          </motion.p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto space-y-8">
          {caseStudies.map((cs, i) => (
            <motion.div key={cs.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}>
              <div className={`glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 ${expanded === cs.id ? "border-brand-blue/40 shadow-[0_0_40px_rgba(220,38,38,0.1)]" : ""}`}>
                <div className="p-6 md:p-8 cursor-pointer" onClick={() => setExpanded(expanded === cs.id ? null : cs.id)}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="tag-badge text-[10px]">{cs.industry}</span>
                        <span className="text-white/30 text-xs">{cs.duration}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white">{cs.headline}</h2>
                      <p className="text-white/45 text-sm mt-1">{cs.client} &middot; {cs.service}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-2xl md:text-3xl font-black gradient-text">{cs.highlight}</p>
                        <p className="text-white/30 text-xs">peak improvement</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expanded === cs.id ? "bg-brand-blue rotate-180" : "bg-white/8"}`}>
                        <ArrowDown className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cs.results.map((r) => (
                      <div key={r.metric} className="bg-white/4 border border-white/8 rounded-xl p-3 text-center hover:bg-white/6 transition-all">
                        <p className="text-brand-blue-light text-xs font-semibold mb-1">{r.metric}</p>
                        <p className="text-white font-bold text-lg">{r.after}</p>
                        <p className="text-green-400 text-xs font-medium">{r.improvement}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <AnimatePresence>
                  {expanded === cs.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-6 md:px-8 pb-8 border-t border-white/8 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /> The Problem</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{cs.problem}</p>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400" /> The Solution</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{cs.solution}</p>
                          </div>
                        </div>
                        <div className="mt-8">
                          <h3 className="text-white font-bold text-lg mb-4">Detailed Results</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/8">
                                  <th className="text-left py-3 px-4 text-white/40 font-medium">Metric</th>
                                  <th className="text-center py-3 px-4 text-white/40 font-medium">Before</th>
                                  <th className="text-center py-3 px-4 text-white/40 font-medium">After</th>
                                  <th className="text-right py-3 px-4 text-white/40 font-medium">Improvement</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cs.results.map((r) => (
                                  <tr key={r.metric} className="border-b border-white/5">
                                    <td className="py-3 px-4 text-white font-medium">{r.metric}</td>
                                    <td className="py-3 px-4 text-center text-white/45">{r.before}</td>
                                    <td className="py-3 px-4 text-center text-white font-semibold">{r.after}</td>
                                    <td className="py-3 px-4 text-right text-green-400 font-bold">{r.improvement}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {cs.tags.map((t) => (
                            <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-blue/10 text-brand-blue-light border border-brand-blue/20">{t}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 text-center bg-white/2 border-t border-white/6 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-2xl mx-auto relative z-10">
          <AnimatedTitle
            as="h2"
            title="Want Results Like These?"
            className="text-3xl font-black text-white mb-4"
            initialDelay={0.1}
          />
          <p className="text-white/50 mb-8">Let&apos;s build your success story. Book a free strategy session today.</p>
          <Link href="/contact#book-consultation" className="btn-primary px-8 py-4 group">
            Get Free Strategy Session
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
