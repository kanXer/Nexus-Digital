"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;

  const go = useCallback(
    (next: number) => {
      setDir(next > index || (index === count - 1 && next === 0) ? 1 : -1);
      setIndex((next + count) % count);
    },
    [index, count]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const t = testimonials[index];

  return (
    <section className="section-padding bg-white/2 border-y border-white/6 relative overflow-hidden">
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Client Love"
          title="Why Business Owners "
          highlight="Trust Us"
          subtitle="Real words from the founders and owners we've helped grow — tap through to read more."
        />

        <div
          className="mt-12 max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="glass-card rounded-2xl p-6 sm:p-9 border border-white/8 relative overflow-hidden min-h-[300px] flex flex-col">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/12 rounded-full blur-3xl pointer-events-none" />
            <Quote className="w-10 h-10 text-brand-blue/25 mb-4" />

            <div className="relative flex-1">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={t.id}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex flex-col h-full"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/80 text-[15px] sm:text-base leading-relaxed flex-1">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-brand-blue-light text-xs">{t.result}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/8">
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => go(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === index ? "w-6 bg-brand-blue" : "w-1.5 bg-white/15 hover:bg-white/30"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-blue/40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next testimonial"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-blue/40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
