"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WordRotatorProps {
  words: string[];
  className?: string;
  interval?: number;
}

/**
 * Premium word rotator — each word slides up through a mask and fades.
 * Animates transform/opacity only (GPU-composited, zero layout thrash) and
 * re-renders once per cycle instead of per character. A hidden sizer reserves
 * the widest word's width so the heading never reflows between swaps.
 */
export function WordRotator({ words, className = "", interval = 2600 }: WordRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);

  const longest = useMemo(
    () => words.reduce((a, b) => (b.length > a.length ? b : a), ""),
    [words]
  );

  const current = words[index % words.length];

  return (
    <span className="relative inline-block whitespace-nowrap align-bottom">
      {/* Invisible sizer — holds the widest word so layout stays stable */}
      <span className="invisible" aria-hidden="true">
        {longest}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ y: "0.85em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.85em", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute left-0 top-0 w-full will-change-transform ${className}`}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
