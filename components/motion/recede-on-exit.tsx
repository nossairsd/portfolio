"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Content that steps back as the next section slides over it: while its
 * bottom edge travels up the screen, it shrinks slightly towards that edge and
 * dims, like a card pushed under a new sheet. Transforms and opacity only.
 */
export function RecedeOnExit({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["end end", "end 25%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.35]);
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);

  return (
    <motion.div ref={ref} style={{ scale, opacity, y, transformOrigin: "50% 100%" }} className={className}>
      {children}
    </motion.div>
  );
}
