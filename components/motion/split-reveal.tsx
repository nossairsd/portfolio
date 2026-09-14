"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

type SplitRevealProps = {
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  children: React.ReactNode;
  delay?: number;
  /** Play on mount (above the fold) instead of when scrolled into view. */
  immediate?: boolean;
};

/**
 * Lines rise out of their own mask, one after another. Text is hidden by CSS
 * until it has been split (see `.js [data-split]`), so there is no flash of the
 * final state before the animation starts.
 */
export function SplitReveal({ as: Tag = "h2", className, children, delay = 0, immediate = false }: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(element, { visibility: "visible" });
        return;
      }

      SplitText.create(element, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(element, { visibility: "visible" });
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.15,
            ease: "expo.out",
            stagger: 0.09,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: element, start: "top 88%", once: true },
          });
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-split className={className}>
      {children}
    </Tag>
  );
}
