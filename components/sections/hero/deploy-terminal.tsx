"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type TerminalLabels = {
  title: string;
  command: string;
  lint: string;
  tests: string;
  build: string;
  deploy: string;
  passed: string;
  live: string;
  role: string;
  company: string;
  months: string;
};

type Step = { label: string; result: string; time: string; tone: "ok" | "live" };

const TYPE_MS = 45;
const STEP_MS = 650;
const HOLD_MS = 6500;

/**
 * A deploy log that replays itself: the command types out, then each stage of
 * the pipeline resolves. It says "tested, containerised, running on Azure" in
 * the language engineers read, instead of three generic stat chips.
 */
export function DeployTerminal({ labels }: { labels: TerminalLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  const steps: Step[] = [
    { label: labels.lint, result: "✓", time: "2.1s", tone: "ok" },
    { label: labels.tests, result: labels.passed, time: "18.4s", tone: "ok" },
    { label: labels.build, result: "✓", time: "41s", tone: "ok" },
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

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded-2xl bg-[#0b1220]/95 text-[0.75rem] shadow-[0_0_0_1px_rgb(255_255_255/0.06)_inset,0_30px_60px_-20px_rgb(15_23_42/0.55)] backdrop-blur-xl"
      role="img"
      aria-label={`${labels.command}: ${steps.map((s) => `${s.label} ${s.result}`).join(", ")}`}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[0.6875rem] text-white/45">{labels.title}</span>
      </div>

      <div aria-hidden className="space-y-1.5 px-4 py-3.5 font-mono leading-relaxed">
        <p className="text-white/90">
          <span className="text-[#60a5fa]">~</span> <span className="text-white/40">$</span> {labels.command.slice(0, full.typed)}
          {!commandDone ? <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-[caret_1s_steps(1)_infinite] bg-white/80" /> : null}
        </p>
        {steps.map((step, i) => {
          const visible = commandDone && full.done >= i;
          const resolved = full.done > i;
          return (
            <AnimatePresence key={`${cycle}-${step.label}`}>
              {visible ? (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className={resolved ? "inline-block text-[#4ade80]" : "inline-block animate-spin text-white/50"}>{resolved ? "●" : "◌"}</span>
                  <span className="text-white/70">{step.label}</span>
                  <span className="mx-1 h-px flex-1 border-b border-dashed border-white/10" />
                  {resolved ? (
                    <span className={step.tone === "live" ? "rounded bg-[#4ade80]/15 px-1.5 text-[#4ade80]" : "text-[#4ade80]"}>
                      {step.result}
                    </span>
                  ) : null}
                  <span className="w-9 text-right text-white/30">{resolved ? step.time : ""}</span>
                </motion.p>
              ) : null}
            </AnimatePresence>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] font-mono text-[0.625rem] font-semibold text-white">
          JD
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.8125rem] font-medium text-white">{labels.role}</span>
          <span className="block truncate text-[0.6875rem] text-white/50">{labels.company}</span>
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.6875rem] font-medium text-white/80">{labels.months}</span>
      </div>
    </div>
  );
}
