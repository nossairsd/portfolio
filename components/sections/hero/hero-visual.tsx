"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import {
  siDocker,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siSpringboot,
  siTypescript,
} from "simple-icons";
import { LocalTime } from "@/components/ui/local-time";
import { DeployTerminal, type TerminalLabels } from "./deploy-terminal";

const EASE = [0.16, 1, 0.3, 1] as const;

type Orbiter = { icon: { path: string; hex: string; title: string }; angle: number; ring: "inner" | "outer" };

// The stack itself orbits the portrait, on two rings turning opposite ways.
const ORBITERS: Orbiter[] = [
  { icon: siReact, angle: 200, ring: "outer" },
  { icon: siTypescript, angle: 258, ring: "outer" },
  { icon: siSpringboot, angle: 318, ring: "outer" },
  { icon: siDocker, angle: 20, ring: "outer" },
  { icon: siNextdotjs, angle: 150, ring: "inner" },
  { icon: siPostgresql, angle: 232, ring: "inner" },
  { icon: siNodedotjs, angle: 300, ring: "inner" },
];

function Ring({
  size,
  duration,
  reverse,
  orbiters,
  dashed,
}: {
  size: string;
  duration: number;
  reverse?: boolean;
  orbiters: Orbiter[];
  dashed?: boolean;
}) {
  const spin = `spin ${duration}s linear infinite${reverse ? " reverse" : ""}`;
  const counter = `spin ${duration}s linear infinite${reverse ? "" : " reverse"}`;
  return (
    <div
      aria-hidden
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${dashed ? "border border-dashed border-primary/25" : "border border-primary/15"}`}
      style={{ width: size, height: size, animation: spin }}
    >
      {orbiters.map(({ icon, angle }, i) => {
        const radians = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={icon.title}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 1 + i * 0.08 }}
            className="absolute"
            style={{ left: `${50 + 50 * Math.cos(radians)}%`, top: `${50 + 50 * Math.sin(radians)}%` }}
          >
            <span
              className="grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgb(15_23_42/0.08),0_10px_24px_-10px_rgb(15_23_42/0.35)] ring-1 ring-line"
              style={{ animation: counter }}
              title={icon.title}
            >
              <svg viewBox="0 0 24 24" className="size-5" style={{ fill: `#${icon.hex === "000000" ? "0b1220" : icon.hex}` }}>
                <path d={icon.path} />
              </svg>
            </span>
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * The portrait composition: a blue disc the portrait rises out of, the stack
 * orbiting around it, a live clock, and a deploy log as proof of work. Layers
 * sit at different depths and drift with the pointer.
 */
export function HeroVisual({
  alt,
  locale,
  place,
  terminal,
}: {
  alt: string;
  locale: string;
  place: string;
  terminal: TerminalLabels;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 20 });
  const sy = useSpring(py, { stiffness: 70, damping: 20 });
  const discX = useTransform(sx, (v) => v * -10);
  const discY = useTransform(sy, (v) => v * -8);
  const ringsX = useTransform(sx, (v) => v * -22);
  const ringsY = useTransform(sy, (v) => v * -16);
  const portraitX = useTransform(sx, (v) => v * 8);
  const portraitY = useTransform(sy, (v) => v * 5);
  const cardX = useTransform(sx, (v) => v * 18);
  const cardY = useTransform(sy, (v) => v * 12);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scrollLift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const scrollSink = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 50]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (event: PointerEvent) => {
      px.set(event.clientX / window.innerWidth - 0.5);
      py.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[32rem]">
      <div className="relative aspect-[1/1.08]">
        {/* Stage: a square around the disc, which the rings are centred on. */}
        <div className="absolute inset-x-[6%] top-[9%] aspect-square">
          <motion.div style={{ x: ringsX, y: ringsY }} className="absolute inset-0">
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            >
              <Ring size="118%" duration={70} dashed orbiters={ORBITERS.filter((o) => o.ring === "outer")} />
              <Ring size="96%" duration={50} reverse orbiters={ORBITERS.filter((o) => o.ring === "inner")} />
            </motion.div>
          </motion.div>

          <motion.div style={{ x: discX, y: discY }} className="absolute inset-[12%]">
            <motion.div
              initial={reduce ? false : { scale: 0.6, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
              className="relative size-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_32%_28%,#93c5fd_0%,#3b82f6_42%,#1d4ed8_78%,#1e3a8a_100%)] shadow-[inset_0_-30px_60px_rgb(30_58_138/0.45),0_40px_90px_-30px_rgb(37_99_235/0.65)]"
            >
              <span aria-hidden className="bg-dots absolute inset-0 opacity-40 mix-blend-soft-light [filter:invert(1)]" />
              <span aria-hidden className="absolute inset-[7%] rounded-full border border-white/20" />
              <span
                aria-hidden
                className="absolute inset-0 animate-[spin_14s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0deg,rgb(255_255_255/0.22)_40deg,transparent_110deg)]"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Portrait: rises out of the disc, head clear above its edge. */}
        <motion.div style={{ x: portraitX, y: portraitY }} className="absolute inset-x-0 bottom-0 top-0">
          <motion.div style={{ y: scrollSink }} className="absolute inset-0">
            <motion.div
              className="absolute inset-x-[8%] bottom-0 top-[2%]"
              initial={reduce ? false : { y: 70, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.45 }}
            >
              <Image
                src="/images/nossair-sedki.png"
                alt={alt}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 30rem, 90vw"
                className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_76%,transparent_99%)]"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Live clock, top right. */}
        <motion.div style={{ x: cardX, y: cardY }} className="absolute right-0 top-[6%] hidden sm:block">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.3 }}
            className="flex items-center gap-2.5 rounded-2xl bg-white/85 py-2 pl-2 pr-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.06),0_16px_36px_-16px_rgb(15_23_42/0.35)] ring-1 ring-line backdrop-blur-md">
            <span className="grid size-8 place-items-center rounded-xl bg-primary-soft text-primary">
              <MapPin aria-hidden className="size-4" />
            </span>
            <span className="leading-tight">
              <LocalTime locale={locale} className="block font-mono text-sm font-semibold tabular-nums text-fg" />
              <span className="block text-[0.6875rem] text-muted">{place}</span>
            </span>
          </motion.span>
        </motion.div>
      </div>

      {/* Deploy log: overlaps the composition on large screens, sits below on small ones. */}
      <motion.div
        style={{ x: cardX, y: scrollLift }}
        className="relative z-10 mx-auto -mt-16 w-[min(21rem,100%)] sm:absolute sm:bottom-[4%] sm:left-[-6%] sm:mt-0 lg:left-[-10%] xl:left-[-14%]"
      >
        {/* Entrance on its own layer: `style` already owns y for parallax. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
        >
          <DeployTerminal labels={terminal} />
        </motion.div>
      </motion.div>
    </div>
  );
}
