"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";

/**
 * Letters sharpen into place, as on the Meta Ads Report Studio landing page.
 * Each word stays one unbreakable inline-block so a line only wraps between
 * words, never inside one.
 */
export function BlurText({
  text,
  className,
  charClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  /**
   * Styles for each letter. A background-clip gradient must go here, not on
   * the wrapper: letters with their own transform and filter do not inherit
   * the parent's clipped background and would render invisible.
   */
  charClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  let index = 0;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {word.split("").map((char) => {
              const i = index++;
              return (
                <motion.span
                  key={i}
                  className={charClassName ? `inline-block ${charClassName}` : "inline-block"}
                  initial={reduce ? false : { opacity: 0, filter: "blur(24px)", y: 18, scale: 0.94 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                  transition={{ delay: delay + i * 0.035, ease: [0.16, 1, 0.3, 1], duration: 0.9 }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
