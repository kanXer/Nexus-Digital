"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { config } from "@/lib/config";

import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { testimonials } from "@/data/testimonials";

const stats = [
  { value: "10+", label: "Happy Clients" },
  { value: "5.0", label: "Average Rating", suffix: "/5" },
  { value: "100%", label: "Would Recommend" },
  { value: "12+", label: "Campaigns Delivered" },
];

export default function TestimonialsPage() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Testimonials</motion.span>
          <AnimatedTitle
            as="h1"
            title="What Our Clients Say"
            highlight="Clients Say"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55">
            Don&apos;t take our word for it — here&apos;s what the businesses we work with say about {config.name}, the trusted digital marketing agency in Gorakhpur &amp; Uttar Pradesh.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="glass-card rounded-2xl p-5 text-center border border-white/8">
              <p className="text-3xl font-black text-white">{s.value}</p>
              {s.suffix && <span className="text-white/40 text-sm">{s.suffix}</span>}
              <p className="text-white/45 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All testimonials */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-12 max-w-4xl mx-auto text-center"
        >
          <a
            href={config.gmbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-blue/10 border border-brand-blue/25 hover:bg-brand-blue/20 transition-all group"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            View All Ratings on Google
            <span className="text-xs text-white/50 group-hover:text-white/70">({config.gmbRating} ★ · {config.gmbReviewCount}+ reviews)</span>
          </a>
        </motion.div>
      </section>
    </div>
  );
}
