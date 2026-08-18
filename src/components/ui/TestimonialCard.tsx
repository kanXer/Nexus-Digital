"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{ y: -6 }}
      className="group glass-card rounded-2xl p-6 flex flex-col gap-4 h-full hover:border-white/15 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 border border-brand-blue/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-brand-blue-light" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
          {testimonial.result}
        </span>
      </div>

      <div className="flex gap-0.5 relative z-10">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <p className="text-white/60 text-sm leading-relaxed flex-1 relative z-10">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-3 border-t border-white/8 relative z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_4px_10px_rgba(220,38,38,0.3)]">
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{testimonial.name}</p>
          <p className="text-white/35 text-xs">{testimonial.role}, {testimonial.company}</p>
        </div>
      </div>
    </motion.div>
  );
}
