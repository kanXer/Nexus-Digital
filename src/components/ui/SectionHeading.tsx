"use client";
import { motion } from "framer-motion";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  highlight,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`${align === "center" ? "text-center" : "text-left"} ${className}`}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          className="inline-block mb-5"
        >
          <span className="tag-badge">{badge}</span>
        </motion.div>
      )}
      <AnimatedTitle
        as="h2"
        title={title}
        highlight={highlight}
        initialDelay={badge ? 0.1 : 0.15}
        className="text-[clamp(1.75rem,4vw,3rem)] font-black text-white leading-[1.08] tracking-[-0.03em]"
      />
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
          className={`mt-4 text-base md:text-lg text-white/50 leading-relaxed ${align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
