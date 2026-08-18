"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface WordRotatorProps {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

type Phase = "pop" | "typing" | "pause" | "deleting" | "rest";

export function WordRotator({
  words,
  className = "",
  typeSpeed = 80,
  deleteSpeed = 45,
  pauseDuration = 2000,
}: WordRotatorProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("pop");
  const [charCount, setCharCount] = useState(0);

  const current = words[wordIndex % words.length];

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "pop":
        // Wait for fade-up pop, then begin typing the word
        t = setTimeout(() => setPhase("typing"), 400);
        break;
      case "typing":
        if (charCount < current.length) {
          t = setTimeout(() => setCharCount((c) => c + 1), typeSpeed);
        } else {
          t = setTimeout(() => setPhase("pause"), 0);
        }
        break;
      case "pause":
        t = setTimeout(() => setPhase("deleting"), pauseDuration);
        break;
      case "deleting":
        if (charCount > 0) {
          t = setTimeout(() => setCharCount((c) => c - 1), deleteSpeed);
        } else {
          t = setTimeout(() => setPhase("rest"), 0);
        }
        break;
      case "rest":
        // small gap before next word's pop on a fresh index
        t = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase("pop");
        }, 150);
        break;
    }

    return () => clearTimeout(t);
  }, [phase, charCount, current, words, typeSpeed, deleteSpeed, pauseDuration]);

  return (
    <span className={`relative inline-flex items-baseline whitespace-nowrap ${className}`}>
      <motion.span
        key={wordIndex}
        initial={{ opacity: 0, y: -40, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
      >
        {current.slice(0, charCount)}
        <span className="inline-block w-[2px] h-[0.85em] ml-0.5 align-middle bg-brand-blue-light animate-pulse" />
      </motion.span>
    </span>
  );
}