"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WordRotatorProps {
  words: string[];
  className?: string;
  interval?: number;
}

/**
 * Premium word rotator — each word slides up through a mask and fades.
 * Animates transform/opacity only (GPU-composited, zero layout thrash) and
 * re-renders once per cycle instead of per character. Sizes to the current
 * word so every rotation keeps the same tight gap (no reserved-width spacing).
 */
export function WordRotator({ words, className = "", interval = 2600 }: WordRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);

  const current = words[index % words.length];

  return (
    <span className="relative inline-block whitespace-nowrap overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ y: "0.85em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.85em", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block will-change-transform ${className}`}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
