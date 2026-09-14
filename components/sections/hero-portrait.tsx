"use client";

import Image from "next/image";
import { CheckCircle2, Cloud, Briefcase } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { EASE_OUT } from "@/components/motion/fade-in";

function Chip({
  className,
  delay,
  children,
  y,
}: {
  className: string;
  delay: number;
  children: React.ReactNode;
  y: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      style={{ y }}
      initial={reduce ? false : { opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      className={`absolute z-10 flex items-center gap-2.5 rounded-2xl bg-white/90 px-3.5 py-2.5 shadow-[0_1px_2px_rgb(15_23_42/0.06),0_18px_40px_-16px_rgb(15_23_42/0.3)] ring-1 ring-line backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroPortrait({
  alt,
  locale,
  months,
  labels,
}: {
  alt: string;
  locale: string;
  months: number;
  labels: { months: string; tests: string; cloud: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });
  const imageY = useTransform(smooth, [0, 1], [0, reduce ? 0 : 60]);
  const slow = useTransform(smooth, [0, 1], [0, reduce ? 0 : -40]);
  const fast = useTransform(smooth, [0, 1], [0, reduce ? 0 : -110]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 }}
      className="relative mx-auto w-full max-w-[26rem] lg:max-w-none"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-primary-soft via-white to-white shadow-[0_1px_2px_rgb(15_23_42/0.05),0_40px_80px_-40px_rgb(37_99_235/0.45)] ring-1 ring-line">
        <div aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div aria-hidden className="absolute left-1/2 top-[30%] size-[70%] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <motion.div style={{ y: imageY }} className="absolute inset-x-0 bottom-0 top-[8%]">
          <Image
            src="/images/nossair-sedki.png"
            alt={alt}
            fill
            priority
            quality={90}
            sizes="(min-width: 1024px) 38vw, 26rem"
            className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
          />
        </motion.div>
      </div>

      <Chip className="-left-3 top-[12%] sm:-left-8" delay={0.9} y={slow}>
        <span className="grid size-8 place-items-center rounded-lg bg-primary-soft text-primary">
          <Briefcase aria-hidden className="size-4" />
        </span>
        <span className="leading-tight">
          <AnimatedNumber value={months} locale={locale} className="block text-base font-semibold tabular-nums" />
          <span className="block text-xs text-muted">{labels.months}</span>
        </span>
      </Chip>

      <Chip className="-right-3 top-[46%] sm:-right-6" delay={1.05} y={fast}>
        <span className="grid size-8 place-items-center rounded-lg bg-green-50 text-success">
          <CheckCircle2 aria-hidden className="size-4" />
        </span>
        <span className="leading-tight">
          <AnimatedNumber value={265} locale={locale} className="block text-base font-semibold tabular-nums" />
          <span className="block text-xs text-muted">{labels.tests}</span>
        </span>
      </Chip>

      <Chip className="bottom-[9%] left-4 sm:-left-4" delay={1.2} y={slow}>
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-white">
          <Cloud aria-hidden className="size-4" />
        </span>
        <span className="text-sm font-medium">{labels.cloud}</span>
      </Chip>
    </motion.div>
  );
}
