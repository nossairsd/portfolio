"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type TerminalLabels = {
  title: string;
  command: string;
  lint: string;
  tests: string;
  build: string;
  deploy: string;
  passed: string;
  live: string;
  running: string;
  deployed: string;
  role: string;
  company: string;
  months: string;
};

type Step = { label: string; result: string; time: string; tone: "ok" | "live" };

const TYPE_MS = 45;
const STEP_MS = 700;
const HOLD_MS = 6500;

function Check() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A deploy pipeline that replays itself: the command types out, each stage
 * resolves in turn while the progress rail fills, and the status flips from
 * running to deployed. "Tested, containerised, running on Azure", said in the
 * language engineers read.
 */
export function DeployTerminal({ labels }: { labels: TerminalLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  const steps: Step[] = [
    { label: labels.lint, result: "", time: "2.1s", tone: "ok" },
    { label: labels.tests, result: labels.passed, time: "18.4s", tone: "ok" },
    { label: labels.build, result: "", time: "41s", tone: "ok" },
    { label: labels.deploy, result: labels.live, time: "prod", tone: "live" },
  ];

  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(0);
  const [cycle, setCycle] = useState(0);
  const full = reduce ? { typed: labels.command.length, done: steps.length } : { typed, done };

  useEffect(() => {
    if (reduce || !inView) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    at(0, () => {
      setTyped(0);
      setDone(0);
    });
    for (let i = 1; i <= labels.command.length; i++) at(300 + i * TYPE_MS, () => setTyped(i));
    const afterTyping = 300 + labels.command.length * TYPE_MS + 350;
    steps.forEach((_, i) => at(afterTyping + (i + 1) * STEP_MS, () => setDone(i + 1)));
    at(afterTyping + steps.length * STEP_MS + HOLD_MS, () => setCycle((c) => c + 1));

    return () => timers.forEach(window.clearTimeout);
    // Restart on each cycle, and when coming back into view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle, inView, reduce, labels.command]);

  const commandDone = full.typed >= labels.command.length;
  const finished = full.done >= steps.length;
  const progress = commandDone ? full.done / steps.length : 0;

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded-[18px] bg-[#0b1220] text-[0.72rem] text-white shadow-[0_0_0_1px_rgb(15_23_42/0.9),0_1px_0_rgb(255_255_255/0.08)_inset,0_36px_70px_-28px_rgb(15_23_42/0.6)]"
      role="img"
      aria-label={`${labels.command}: ${steps.map((s) => `${s.label} ${s.result || "ok"}`).join(", ")}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[0.6875rem] text-white/45">{labels.title}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider transition-colors duration-500",
            finished ? "bg-[#22c55e]/15 text-[#4ade80]" : "bg-white/[0.06] text-white/60",
          )}
        >
          <span className={cn("size-1.5 rounded-full", finished ? "bg-[#4ade80]" : "animate-pulse bg-[#fbbf24]")} />
          {finished ? labels.deployed : labels.running}
        </span>
      </div>

      {/* Progress rail */}
      <div className="h-px bg-white/[0.07]">
        <div
          className="h-full origin-left bg-[#3b82f6] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div aria-hidden className="space-y-2 px-4 pb-4 pt-3.5 font-mono leading-none">
        <p className="pb-1 text-white/90">
          <span className="text-[#60a5fa]">~</span> <span className="text-white/35">$</span> {labels.command.slice(0, full.typed)}
          {!commandDone ? <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-[caret_1s_steps(1)_infinite] bg-white/80" /> : null}
        </p>
        {/* Every row is always laid out, so the card never changes height:
            queued stages wait dimmed, the current one spins, done ones tick. */}
        {steps.map((step, i) => {
          const resolved = full.done > i;
          const current = commandDone && full.done === i;
          return (
            <p key={step.label} className="flex h-5 items-center gap-2.5">
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-300",
                  resolved ? "bg-[#22c55e]/15 text-[#4ade80]" : "text-white/40",
                )}
              >
                {resolved ? (
                  <Check />
                ) : current ? (
                  <span className="size-3 animate-spin rounded-full border border-white/15 border-t-white/70" />
                ) : (
                  <span className="size-1.5 rounded-full bg-white/20" />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap transition-colors duration-300",
                  resolved ? "text-white/80" : current ? "text-white/60" : "text-white/25",
                )}
              >
                {step.label}
              </span>
              <span className="h-px min-w-3 flex-1 border-b border-dotted border-white/10" />
              <AnimatePresence initial={false}>
                {resolved ? (
                  <motion.span
                    key={`${cycle}-result`}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2"
                  >
                    {step.result ? (
                      <span
                        className={cn(
                          "whitespace-nowrap rounded px-1.5 py-0.5",
                          step.tone === "live" ? "bg-[#22c55e]/15 text-[#4ade80]" : "text-[#4ade80]",
                        )}
                      >
                        {step.result}
                      </span>
                    ) : null}
                    <span className="w-9 text-right tabular-nums text-white/30">{step.time}</span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </p>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.07] px-4 py-3">
        <span className="grid size-8 place-items-center rounded-lg bg-primary font-mono text-[0.625rem] font-semibold text-white">GK</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.8125rem] font-medium text-white">{labels.role}</span>
          <span className="block truncate text-[0.6875rem] text-white/50">{labels.company}</span>
        </span>
        <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[0.6875rem] font-medium text-white/80">{labels.months}</span>
      </div>
    </div>
  );
}
