"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Cloud, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type DemoLabels = {
  request: string;
  response: string;
  healthy: string;
  region: string;
  assistant: string;
  question: string;
  answer: string;
  source: string;
  illustration: string;
};

/** Steps 0 → count-1 on a timer while visible, then starts over. */
function useLoop(count: number, durations: number[]) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % count), durations[step] ?? 1500);
    return () => window.clearTimeout(timer);
  }, [step, inView, reduce, count, durations]);

  return { ref, step: reduce ? count - 1 : step };
}

const API_DURATIONS = [900, 900, 3200];
const JSON_LINES: [string, string][] = [
  ["id", "42"],
  ["status", '"validated"'],
  ["site", '"Tanger"'],
  ["actions", "3"],
];

/** A request going out and a typed response coming back. */
export function ApiDemo({ labels }: { labels: DemoLabels }) {
  const { ref, step } = useLoop(3, API_DURATIONS);
  return (
    <div ref={ref} className="flex h-full flex-col gap-3 font-mono text-[0.625rem]">
      <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-[0_1px_2px_rgb(15_23_42/0.06)] ring-1 ring-line">
        <span className="rounded bg-primary px-1.5 py-0.5 font-semibold text-white">GET</span>
        <span className="truncate text-fg-2">/api/audits/42</span>
        <span className="ml-auto text-subtle">{labels.request}</span>
      </div>
      <div className="flex-1 rounded-lg bg-[#0b1220] p-3 text-white/80">
        <div className="mb-2 flex items-center gap-2">
          {step === 0 ? (
            <span className="flex items-center gap-1.5 text-white/50">
              <Loader2 aria-hidden className="size-3 animate-spin" /> …
            </span>
          ) : (
            <>
              <span className="rounded bg-[#4ade80]/15 px-1.5 text-[#4ade80]">200 OK</span>
              <span className="text-white/40">38 ms</span>
              <span className="ml-auto text-white/30">{labels.response}</span>
            </>
          )}
        </div>
        <p className="text-white/40">{"{"}</p>
        {JSON_LINES.map(([key, value], i) => (
          <motion.p
            key={key}
            className="truncate pl-3"
            initial={false}
            animate={{ opacity: step >= 1 ? 1 : 0.12, x: step >= 1 ? 0 : -4 }}
            transition={{ duration: 0.35, delay: step >= 1 ? i * 0.12 : 0 }}
          >
            <span className="text-[#93c5fd]">&quot;{key}&quot;</span>: <span className="text-[#fcd34d]">{value}</span>
            {i < JSON_LINES.length - 1 ? "," : ""}
          </motion.p>
        ))}
        <p className="text-white/40">{"}"}</p>
      </div>
    </div>
  );
}

const SERVICES = [
  { name: "api", bars: [5, 8, 6, 9, 7, 10, 8, 6] },
  { name: "web", bars: [3, 4, 6, 5, 7, 6, 5, 8] },
  { name: "worker", bars: [7, 5, 8, 4, 6, 9, 5, 7] },
];

/** Three services running, with live load and a health status. */
export function CloudDemo({ labels }: { labels: DemoLabels }) {
  return (
    <div className="flex h-full flex-col gap-2 text-[0.6875rem]">
      <div className="flex items-center gap-2 px-1 text-muted">
        <Cloud aria-hidden className="size-3.5 text-primary" />
        <span className="font-medium">{labels.region}</span>
      </div>
      {SERVICES.map((service, s) => (
        <div key={service.name} className="flex items-center gap-2.5 rounded-lg bg-white p-2.5 shadow-[0_1px_2px_rgb(15_23_42/0.06)] ring-1 ring-line">
          <span className="w-11 shrink-0 font-mono text-fg-2">{service.name}</span>
          <span aria-hidden className="flex h-5 min-w-0 flex-1 items-end gap-[3px]">
            {service.bars.map((height, b) => (
              <span
                key={b}
                className="min-w-0 flex-1 origin-bottom rounded-sm bg-primary/70"
                style={{
                  height: `${height * 10}%`,
                  animation: `bar-pulse ${1.6 + ((b + s) % 3) * 0.4}s ease-in-out ${b * 0.12}s infinite alternate`,
                }}
              />
            ))}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-green-700">
            <span className="size-1.5 rounded-full bg-success" />
            {labels.healthy}
          </span>
        </div>
      ))}
    </div>
  );
}

const CHAT_DURATIONS = [1200, 1300, 1400, 4200];

/** An assistant in a chat answering from the ERP: the Teams + SAP work, in miniature. */
export function ChatDemo({ labels }: { labels: DemoLabels }) {
  const { ref, step } = useLoop(4, CHAT_DURATIONS);
  return (
    <div ref={ref} className="flex h-full flex-col text-[0.75rem]">
      <div className="flex items-center gap-2 border-b border-line pb-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-primary text-white">
          <Sparkles aria-hidden className="size-3.5" />
        </span>
        <span className="font-semibold text-fg">{labels.assistant}</span>
        <span className="ml-auto rounded-full bg-bg-muted px-2 py-0.5 text-[0.625rem] text-muted">{labels.illustration}</span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 pt-3">
        <AnimatePresence initial={false}>
          {step >= 1 ? (
            <motion.p
              key="q"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-white"
            >
              {labels.question}
            </motion.p>
          ) : null}
          {step === 2 ? (
            <motion.span
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 ring-1 ring-line"
            >
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-subtle" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </motion.span>
          ) : null}
          {step === 3 ? (
            <motion.div
              key="a"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[88%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-fg-2 shadow-[0_1px_2px_rgb(15_23_42/0.06)] ring-1 ring-line"
            >
              {labels.answer}
              <span className={cn("mt-1.5 flex w-fit items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-[0.625rem] font-semibold text-primary-strong")}>
                {labels.source}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
