"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Users, IndianRupee, ArrowRight, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const INDUSTRIES = [
  { id: "local", label: "Local Business / Store", cpl: 180, conv: 0.14 },
  { id: "realestate", label: "Real Estate", cpl: 320, conv: 0.07 },
  { id: "ecommerce", label: "E-commerce / Online Store", cpl: 140, conv: 0.035 },
  { id: "healthcare", label: "Healthcare / Clinic", cpl: 220, conv: 0.11 },
  { id: "education", label: "Education / Coaching", cpl: 200, conv: 0.09 },
  { id: "service", label: "Services / Consultancy", cpl: 260, conv: 0.09 },
];

const formatINR = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(0)}K`
    : `₹${n}`;

export default function LeadCalculator() {
  const [budget, setBudget] = useState(25000);
  const [industryId, setIndustryId] = useState(INDUSTRIES[0].id);
  const [avgValue, setAvgValue] = useState(6000);

  const industry = INDUSTRIES.find((i) => i.id === industryId) ?? INDUSTRIES[0];

  const result = useMemo(() => {
    // Illustrative model: paid leads at industry CPL + ~35% organic lift from SEO/social.
    const paidLeads = Math.max(0, Math.round(budget / industry.cpl));
    const totalLeads = Math.round(paidLeads * 1.35);
    const customers = Math.round(totalLeads * industry.conv);
    const revenue = customers * avgValue;
    const roas = budget > 0 ? revenue / budget : 0;
    return { totalLeads, customers, revenue, roas };
  }, [budget, industry, avgValue]);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Free Lead Calculator"
          title="How Many Leads Could You "
          highlight="Really Get?"
          subtitle="Slide to match your business and see the kind of leads, customers and revenue a proper digital marketing engine can generate for you."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="glass-card rounded-2xl p-6 sm:p-8 border border-white/8"
          >
            <div className="space-y-7">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-brand-blue-light" /> Monthly Marketing Budget
                  </label>
                  <span className="text-sm font-bold text-white">{formatINR(budget)}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={300000}
                  step={5000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-[#DC2626]"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
                  <span>₹5K</span>
                  <span>₹3L</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-brand-blue-light" /> Your Industry
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setIndustryId(ind.id)}
                      className={`text-[12px] px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                        industryId === ind.id
                          ? "bg-brand-blue/15 border-brand-blue/40 text-white"
                          : "bg-white/3 border-white/8 text-white/55 hover:border-white/20"
                      }`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-blue-light" /> Avg. Customer Value
                  </label>
                  <span className="text-sm font-bold text-white">{formatINR(avgValue)}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={avgValue}
                  onChange={(e) => setAvgValue(Number(e.target.value))}
                  className="w-full accent-[#DC2626]"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
                  <span>₹1K</span>
                  <span>₹1L</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="glass-card-brand rounded-2xl p-6 sm:p-8 border border-brand-blue/30 relative overflow-hidden flex flex-col"
          >
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex-1 flex flex-col">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-blue-light/80 mb-1">
                Estimated Monthly Potential
              </p>
              <h3 className="text-white font-bold text-lg mb-6">With a real growth engine</h3>

              <div className="space-y-5">
                <ResultRow
                  icon={<Users className="w-5 h-5" />}
                  label="New Leads / month"
                  value={<AnimatedCounter end={result.totalLeads} duration={1.2} />}
                  accent
                />
                <ResultRow
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="New Customers / month"
                  value={<AnimatedCounter end={result.customers} duration={1.2} />}
                />
                <ResultRow
                  icon={<IndianRupee className="w-5 h-5" />}
                  label="Extra Revenue / month"
                  value={<AnimatedCounter end={result.revenue} prefix="₹" duration={1.4} />}
                />
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-sm text-white/60">Projected Return (ROAS)</span>
                  <span className="text-2xl font-black gradient-text">
                    {result.roas.toFixed(1)}x
                  </span>
                </div>
              </div>

              <Link
                href="/enquiry#enquiry-form"
                className="btn-primary justify-center text-sm mt-7 group"
              >
                Get this exact plan for my business
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <p className="text-[10px] text-white/30 text-center mt-3 leading-relaxed">
                Illustrative estimate based on industry averages. Actual results depend on market, competition & strategy — we&apos;ll give you a real number in your free consultation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ResultRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2.5 text-sm text-white/60">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-brand-blue/20 text-brand-blue-light" : "bg-white/5 text-white/60"}`}>
          {icon}
        </span>
        {label}
      </span>
      <span className={`text-2xl font-black ${accent ? "gradient-text" : "text-white"}`}>{value}</span>
    </div>
  );
}
