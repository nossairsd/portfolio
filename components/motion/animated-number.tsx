"use client";

import NumberFlow from "@number-flow/react";
import { useInView } from "motion/react";
import { useRef } from "react";

type AnimatedNumberProps = {
  value: number;
  locale: string;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/** Digits roll from zero to the value the first time they come into view. */
export function AnimatedNumber({ value, locale, prefix, suffix, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <span ref={ref} className={className}>
      <NumberFlow
        value={inView ? value : 0}
        locales={locale}
        prefix={prefix}
        suffix={suffix}
        transformTiming={{ duration: 1100, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        spinTiming={{ duration: 1100, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </span>
  );
}
