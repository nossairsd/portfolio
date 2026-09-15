"use client";

import { useLenis } from "lenis/react";
import { ArrowRight, Check, GitBranch, GitPullRequest } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { EASE_OUT } from "@/components/motion/fade-in";
import { PipelineView } from "@/components/three/lazy";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { ToolIcon } from "./process/tools";

export type Step = { title: string; text: string; tools: string[] };

const pad = (n: number) => String(n).padStart(2, "0");

/** The ticket's workflow state at each step, as a tracker would show it. */
const STATUSES = ["Refinement", "Design", "In progress", "Testing", "CI running", "Deployed"];

/**
 * A tall track with a sticky stage: scrolling moves a feature ticket through
 * the six stations of the 3D pipeline. Beside it, the current step is set in
 * a block of fixed height, so nothing reflows while scrolling, and the full
 * list below shows what is done, in progress and still to come. Any step can
 * be reached with a click.
 */
export function ProcessTrack({ steps, stepLabel }: { steps: Step[]; stepLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();
  const progress = useScrollProgress(track, {
    onChange: (p) => setActive(Math.min(steps.length - 1, Math.floor(p * steps.length))),
  });

  const goTo = (index: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((index + 0.5) / steps.length) * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const step = steps[active];

  return (
    <div ref={track} className="relative" style={{ height: `${steps.length * 65 + 60}svh` }}>
      <div className="sticky top-0 flex h-svh items-center pb-5 pt-20">
        <div className="container-page grid h-full max-h-[46rem] grid-rows-[minmax(0,1fr)_auto] gap-5 lg:grid-cols-12 lg:grid-rows-1 lg:gap-10">
          {/* Stage */}
          <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-[#f3f5f8] ring-1 ring-fg/[0.07] lg:order-2 lg:col-span-7">
            {/* The feature as it would appear in a pull request: ticket, branch, live status. */}
            <div className="relative z-10 shrink-0 border-b border-fg/[0.06] bg-white">
              <div className="flex h-[3.75rem] items-center justify-between gap-3 px-3 sm:px-4">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[0.6rem] bg-fg text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]">
                    <GitPullRequest aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="flex min-w-0 items-baseline gap-1.5">
                      <span className="shrink-0 text-[0.8125rem] font-semibold text-fg">FEAT-128</span>
                      <span className="truncate text-[0.8125rem] text-muted max-sm:hidden">Audit report · PDF export</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 font-mono text-[0.625rem] text-subtle">
                      <GitBranch aria-hidden className="size-3" />
                      <span className="truncate">feature/FEAT-128</span>
                      <ArrowRight aria-hidden className="size-2.5 shrink-0" />
                      <span>main</span>
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={active}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-wider",
                        active === steps.length - 1 ? "bg-success/10 text-success" : "bg-primary-soft text-primary-strong",
                      )}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="relative flex size-1.5">
                        {active === steps.length - 1 ? null : <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />}
                        <span className={cn("relative size-1.5 rounded-full", active === steps.length - 1 ? "bg-success" : "bg-primary")} />
                      </span>
                      {STATUSES[active] ?? ""}
                    </motion.span>
                  </AnimatePresence>
                  <span className="rounded-md bg-bg-muted px-1.5 py-1 font-mono text-[0.625rem] tabular-nums text-fg-2 max-sm:hidden">
                    {pad(active + 1)}/{pad(steps.length)}
                  </span>
                </span>
              </div>
              {/* Overall progress along the bottom edge */}
              <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] bg-transparent">
                <span
                  className="absolute inset-0 origin-left bg-primary transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: `scaleX(${(active + 1) / steps.length})` }}
                />
              </span>
            </div>
            <div className="relative min-h-0 flex-1">
              <div aria-hidden className="bg-grid-fine absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_60%,black,transparent_75%)]" />
              <PipelineView progress={progress} className="absolute inset-0" />
            </div>
          </div>

          {/* Steps */}
          <div className="flex min-w-0 flex-col justify-center lg:order-1 lg:col-span-5">
            <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
              <span>
                {stepLabel} <span className="text-primary">{pad(active + 1)}</span> / {pad(steps.length)}
              </span>
              <span aria-hidden className="relative h-px flex-1 bg-line-strong">
                <span
                  className="absolute inset-0 origin-left bg-primary transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: `scaleX(${(active + 1) / steps.length})` }}
                />
              </span>
            </p>

            {/* Current step: fixed height, cross-faded, so the page never jumps. */}
            <div className="relative mt-4 min-h-[9.5rem] sm:min-h-[11rem] lg:mt-6 lg:min-h-[15.5rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <h3 className="text-[clamp(1.375rem,2.6vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg">{step.title}</h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted max-lg:line-clamp-2 lg:mt-3 lg:text-base">{step.text}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5 lg:mt-5">
                    {step.tools.map((tool, i) => (
                      <motion.li
                        key={tool}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[0.8125rem] font-medium text-fg-2 ring-1 ring-fg/[0.08] shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.1 + i * 0.05 }}
                      >
                        <ToolIcon name={tool} />
                        {tool}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* All steps, with their state */}
            <ol className="mt-6 hidden border-t border-line lg:block">
              {steps.map((s, i) => {
                const done = i < active;
                const current = i === active;
                return (
                  <li key={s.title} className="relative border-b border-line">
                    {current ? (
                      <motion.span
                        layoutId="process-current"
                        className="absolute inset-y-0 -left-3 right-0 rounded-lg bg-white ring-1 ring-fg/[0.06]"
                        transition={{ type: "spring", stiffness: 380, damping: 36 }}
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={current ? "step" : undefined}
                      className="relative grid w-full grid-cols-[2rem_minmax(0,1fr)_1.25rem] items-center gap-2 py-2.5 text-left"
                    >
                      <span className={cn("font-mono text-[0.6875rem]", current ? "text-primary" : "text-subtle")}>{pad(i + 1)}</span>
                      <span
                        className={cn(
                          "truncate text-[0.9375rem] tracking-[-0.01em] transition-colors duration-300",
                          current ? "font-semibold text-fg" : done ? "text-fg-2" : "text-subtle hover:text-fg-2",
                        )}
                      >
                        {s.title}
                      </span>
                      <span aria-hidden className="grid place-items-center">
                        {done ? (
                          <span className="grid size-4 place-items-center rounded-full bg-primary text-white">
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                        ) : current ? (
                          <span className="relative flex size-2">
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
                            <span className="relative size-2 rounded-full bg-primary" />
                          </span>
                        ) : (
                          <span className="size-2 rounded-full ring-1 ring-inset ring-fg/20" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
