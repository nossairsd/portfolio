"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/logo";
import { INTRO_KEY, markIntroDone } from "@/lib/intro";

const EASE = [0.76, 0, 0.24, 1] as const;
const LOAD_MS = 1100;

/**
 * First-visit boot screen: a counter to 100, a build log resolving line by
 * line, then the panel lifts off the page. Shown once per session; an inline
 * script in the layout hides it before paint on later visits.
 */
export function Preloader({ title, status, lines }: { title: string; status: string; lines: string[] }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const count = useMotionValue(0);
  const label = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const bar = useTransform(count, (v) => v / 100);
  const [step, setStep] = useState(0);

  // No "already started" guard: React's development double-mount runs this
  // effect twice, and a guard would leave the second mount with a stopped
  // animation stuck at 000. The cleanup stops the first run instead.
  useEffect(() => {
    if (document.documentElement.classList.contains("intro-skip")) {
      markIntroDone();
      window.setTimeout(() => setPhase("gone"), 0);
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const controls = animate(count, 100, {
      duration: LOAD_MS / 1000,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setStep(Math.min(lines.length, Math.floor((v / 100) * lines.length + 0.15))),
      onComplete: () => {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}
        setPhase("leaving");
        markIntroDone();
        document.documentElement.style.overflow = "";
      },
    });
    // Failsafe: whatever happens to the animation, never hold the page.
    const failsafe = window.setTimeout(() => {
      markIntroDone();
      document.documentElement.style.overflow = "";
      setPhase((current) => (current === "loading" ? "leaving" : current));
    }, 4500);

    return () => {
      controls.stop();
      window.clearTimeout(failsafe);
      document.documentElement.style.overflow = "";
    };
  }, [count, lines.length]);

  if (phase === "gone") return null;

  return (
    <motion.div
      id="preloader"
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col bg-white text-fg [animation:preloader-failsafe_0.5s_ease_7s_forwards]"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={phase === "leaving" ? { clipPath: "inset(0% 0% 100% 0%)" } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      onAnimationComplete={() => phase === "leaving" && setPhase("gone")}
    >
      <span className="bg-grid-fine absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative flex items-center justify-between px-6 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted md:px-10">
        <span>{title}</span>
        <span>v2026.09</span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <LogoMark className="size-14 rounded-2xl text-xl" />
        </motion.div>

        <motion.p className="mt-8 font-mono text-[clamp(3.5rem,9vw,6rem)] font-medium leading-none tracking-[-0.06em] tabular-nums">
          {label}
        </motion.p>

        <div className="relative mt-6 h-px w-[min(22rem,70vw)] bg-line-strong">
          <motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-primary" />
        </div>

        <ul className="mt-8 h-24 w-[min(22rem,70vw)] space-y-1.5 font-mono text-[0.75rem]">
          {lines.map((line, i) => (
            <motion.li
              key={line}
              initial={{ opacity: 0, x: -8 }}
              animate={i < step || (i === step && step < lines.length) ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <span className={i < step ? "text-fg-2" : "text-subtle"}>
                <span className="mr-2 text-primary">›</span>
                {line}
              </span>
              <span className={i < step ? "text-success" : "animate-pulse text-subtle"}>{i < step ? "ok" : "…"}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center justify-between px-6 pb-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted md:px-10">
        <span>35.76° N · 5.83° W</span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          {status}
        </span>
      </div>
    </motion.div>
  );
}
