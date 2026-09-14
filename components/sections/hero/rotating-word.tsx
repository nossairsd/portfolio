"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Cycles through a few words in place. The widest word reserves the space, so
 * the line never reflows while words change.
 */
export function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(timer);
  }, [reduce, words.length, interval]);

  return (
    <span className="relative inline-grid align-bottom">
      {/* Accessible text: every variant, read once. */}
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap px-3">
        {longest}
      </span>
      <span
        aria-hidden
        className="col-start-1 row-start-1 overflow-hidden rounded-xl bg-primary-soft px-3 text-primary ring-1 ring-inset ring-primary-100"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[index]}
            className="block whitespace-nowrap"
            initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
