"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Progress = { current: number };

/**
 * Scroll progress (0 → 1) of an element, kept in a mutable ref so a 3D scene
 * can read it every frame without React re-rendering. `onChange` is for the
 * few places where the DOM needs to follow along (an active step, say).
 */
export function useScrollProgress(
  target: React.RefObject<HTMLElement | null>,
  {
    start = "top top",
    end = "bottom bottom",
    onChange,
  }: { start?: string; end?: string; onChange?: (progress: number) => void } = {},
): Progress {
  const progress = useRef(0);

  useGSAP(
    () => {
      if (!target.current) return;
      const trigger = ScrollTrigger.create({
        trigger: target.current,
        start,
        end,
        onUpdate: (self) => {
          progress.current = self.progress;
          onChange?.(self.progress);
        },
        onRefresh: (self) => {
          progress.current = self.progress;
          onChange?.(self.progress);
        },
      });
      return () => trigger.kill();
    },
    { dependencies: [start, end] },
  );

  return progress;
}
