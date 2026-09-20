"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A section's background that opens like a sheet as the section arrives: it
 * starts slightly inset and widens to full bleed by the time its top edge
 * reaches the upper part of the screen. When the section leaves, the sheet
 * closes again and slides up under the next one, so two sheets never meet on a
 * hard edge. Only the background layer moves, so sticky content inside the
 * section is unaffected.
 *
 * Only transforms are animated. These layers are several screens tall, and
 * animating anything that needs a repaint (a border radius, a clip path) would
 * re-rasterise all of that on every frame; a transform is composited as is.
 */
export function SheetBackground({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: opening } = useScroll({ target: ref, offset: ["start end", "start 15%"] });
  const { scrollYProgress: closing } = useScroll({ target: ref, offset: ["end 85%", "end 20%"] });
  const open = useTransform(opening, [0, 1], [reduce ? 1 : 0.94, 1]);
  const close = useTransform(closing, [0, 1], [1, reduce ? 1 : 0.94]);
  const scaleX = useTransform([open, close] as const, ([a, b]: number[]) => a * b);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <motion.div
        style={{ scaleX }}
        className={cn("absolute inset-0 origin-top overflow-hidden rounded-t-[2.5rem] rounded-b-[2.5rem] will-change-transform", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
