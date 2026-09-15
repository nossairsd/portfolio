"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Each letter rises out of its own mask, one after the other. Only real
 * characters are ever shown: no placeholder glyphs, no layout shift.
 */
export function LetterRise({
  text,
  active,
  delay = 0,
  stagger = 0.035,
  duration = 0.9,
  className,
}: {
  text: string;
  active: boolean;
  /** Seconds before the first letter moves. */
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex whitespace-nowrap", className)}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((char, i) => (
        <span key={i} aria-hidden className="-my-[0.12em] inline-block overflow-hidden py-[0.12em]">
          <motion.span
            data-intro-rise
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={active ? { y: "0%", opacity: 1 } : undefined}
            transition={{ duration, ease: EASE, delay: delay + i * stagger }}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * On hover of the nearest `.group`, every letter rolls up and is replaced by
 * an identical copy from below, with a short stagger.
 */
export function LetterRoll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex whitespace-nowrap", className)}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((char, i) => (
        <span key={i} aria-hidden className="inline-block h-[1.2em] overflow-hidden leading-[1.2em]">
          <span
            className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [text-shadow:0_1.2em_0_currentColor] group-hover:-translate-y-[1.2em]"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {char === " " ? " " : char}
          </span>
        </span>
      ))}
    </span>
  );
}
