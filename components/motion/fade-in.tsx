"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  as?: "div" | "li" | "article" | "section" | "p" | "span";
};

/** Rise and fade in once, when the element scrolls into view. */
export function FadeIn({ delay = 0, y = 20, as = "div", children, ...rest }: FadeInProps) {
  const reduce = useReducedMotion();
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}
