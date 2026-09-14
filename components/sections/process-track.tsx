"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { EASE_OUT } from "@/components/motion/fade-in";
import { PipelineView } from "@/components/three/lazy";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "@/lib/use-scroll-progress";

export type Step = { title: string; text: string; tools: string[] };

/**
 * A tall track with a sticky stage: scrolling through the track moves the
 * feature through the 3D pipeline and advances the active step alongside it.
 */
export function ProcessTrack({ steps, stepLabel }: { steps: Step[]; stepLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const progress = useScrollProgress(track, {
    onChange: (p) => setActive(Math.min(steps.length - 1, Math.floor(p * steps.length))),
  });

  return (
    <div ref={track} className="relative" style={{ height: `${steps.length * 65 + 60}svh` }}>
      <div className="sticky top-0 flex h-svh items-center pb-6 pt-20">
        <div className="container-page grid h-full max-h-[46rem] grid-rows-[1fr_auto] gap-5 lg:grid-cols-12 lg:grid-rows-1 lg:gap-10">
          {/* Stage */}
          <div className="relative min-h-0 overflow-hidden rounded-[1.75rem] bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04),0_30px_60px_-30px_rgb(15_23_42/0.18)] ring-1 ring-line lg:order-2 lg:col-span-7">
            <div aria-hidden className="bg-dots absolute inset-0 opacity-60" />
            <PipelineView progress={progress} className="absolute inset-0" />
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-mono text-xs text-muted ring-1 ring-line backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              {stepLabel} {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </div>
          </div>

          {/* Steps */}
          <ol className="flex flex-col justify-center lg:order-1 lg:col-span-5">
            {steps.map((step, i) => {
              const isActive = i === active;
              const done = i < active;
              return (
                <li key={step.title} className={cn("relative border-l py-2.5 pl-5 lg:py-3", isActive ? "border-primary" : "border-line-strong", !isActive && "hidden lg:block")}>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[5px] top-4 size-[9px] rounded-full border-2 bg-white transition-colors duration-500 lg:top-[1.15rem]",
                      isActive ? "border-primary bg-primary" : done ? "border-primary" : "border-line-strong",
                    )}
                  />
                  <p className={cn("flex items-baseline gap-3 transition-colors duration-500", isActive ? "text-fg" : done ? "text-fg-2" : "text-subtle")}>
                    <span className="font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("font-semibold tracking-tight", isActive ? "text-xl lg:text-2xl" : "text-base")}>{step.title}</span>
                  </p>
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 leading-relaxed text-muted">{step.text}</p>
                        <div className="flex flex-wrap gap-1.5 pb-1 pt-4">
                          {step.tools.map((tool) => (
                            <Tag key={tool} tone="primary">
                              {tool}
                            </Tag>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
