"use client";
import { Fragment } from "react";
import { motion } from "framer-motion";

interface AnimatedTitleProps {
  as?: "h1" | "h2" | "h3";
  title: string;
  highlight?: string;
  className?: string;
  stagger?: number;
  initialDelay?: number;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function AnimatedTitle({
  as: Tag = "h1",
  title,
  highlight,
  className = "",
  stagger = 0.12,
  initialDelay = 0.15,
}: AnimatedTitleProps) {
  const parts: { text: string; gradient: boolean }[] = [];
  if (highlight) {
    const [before, after] = title.split(highlight);
    if (before) parts.push({ text: before, gradient: false });
    parts.push({ text: highlight, gradient: true });
    if (after) parts.push({ text: after, gradient: false });
  } else {
    parts.push({ text: title, gradient: false });
  }

  let index = 0;

  const renderWords = (text: string, gradient: boolean) =>
    text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const delay = initialDelay + index * stagger;
        index += 1;
        return (
          <Fragment key={`w-${index}`}>
            <motion.span
              className="inline-block mr-[0.22em]"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay, duration: 0.7, ease: easeOut }}
            >
              <span className={gradient ? "gradient-text animate-gradient-text" : ""}>{word}</span>
            </motion.span>
          </Fragment>
        );
      });

  return (
    <Tag className={className}>
      {parts.map((part, pi) => (
        <Fragment key={`p-${pi}`}>{renderWords(part.text, part.gradient)}</Fragment>
      ))}
    </Tag>
  );
}