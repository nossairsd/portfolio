"use client";

import NumberFlow from "@number-flow/react";
import { CalendarRange, FlaskConical, ShieldCheck, Timer, type LucideIcon } from "lucide-react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { easeOut, segment, useHeroSequence } from "./hero-sequence";

export type ProofStat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  tag: string;
  kind: "months" | "delay" | "errors" | "tests";
};

export type ProofLabels = {
  label: string;
  eyebrow: string;
  titleLead: string;
  titleQuiet: string;
  before: string;
  after: string;
  since: string;
  delayCaption: string;
  orgs: string[];
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const ICONS: Record<ProofStat["kind"], LucideIcon> = {
  months: CalendarRange,
  delay: Timer,
  errors: ShieldCheck,
  tests: FlaskConical,
};

/* -------------------------------------------------------------------------- */
/*  Visuals                                                                   */
/* -------------------------------------------------------------------------- */

const MONTHS = ["O", "N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S"];
const RAMP = [34, 42, 47, 55, 52, 61, 66, 64, 73, 80, 86, 94];

/** One bar per month since October 2025, rising as the role grew. */
function MonthsViz({ value, active }: { value: number; active: boolean }) {
  return (
    <div aria-hidden className="flex h-full min-h-14 items-end gap-1 sm:gap-1.5">
      {RAMP.map((height, i) => {
        const done = i < value;
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="relative w-full flex-1">
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 origin-bottom rounded-[4px]",
                  done ? (i === value - 1 ? "bg-primary" : "bg-[#c9dafc]") : "bg-fg/[0.05]",
                )}
                style={{
                  height: `${height}%`,
                  transform: `scaleY(${active || !done ? 1 : 0.08})`,
                  transition: `transform 700ms ${EASE} ${active ? 100 + i * 55 : 0}ms`,
                }}
              />
            </span>
            <span className="font-mono text-[0.5625rem] text-subtle max-sm:hidden">{MONTHS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Before and after: the processing time shrinks to what is left. */
function DelayViz({
  value,
  active,
  before,
  after,
  caption,
}: {
  value: number;
  active: boolean;
  before: string;
  after: string;
  caption: string;
}) {
  const rest = 100 - value;
  return (
    <div aria-hidden className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-3 font-mono text-[0.6875rem] text-muted">
      <span className="col-span-3 text-[0.625rem] uppercase tracking-wider text-subtle max-sm:hidden">{caption}</span>
      <span>{before}</span>
      <span className="h-3 rounded-full bg-fg/[0.07]" />
      <span className="w-7 text-right tabular-nums">100</span>
      <span className="text-primary">{after}</span>
      <span className="relative h-3">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: active ? `${rest}%` : "100%", transition: `width 1300ms ${EASE} 250ms` }}
        />
        <span
          className="absolute inset-y-[-3px] right-0 border-l border-dashed border-primary/40"
          style={{ left: `${rest}%`, opacity: active ? 1 : 0, transition: "opacity 400ms 1300ms" }}
        />
      </span>
      <span className="w-7 text-right tabular-nums text-fg">{active ? rest : 100}</span>
    </div>
  );
}

/** Ten incidents before; most of them are gone. */
function ErrorsViz({ value, active }: { value: number; active: boolean }) {
  const removed = Math.round(value / 10);
  return (
    <div aria-hidden className="flex items-center justify-between gap-3">
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => {
          const gone = active && i >= 10 - removed;
          return (
            <span
              key={i}
              className={cn(
                "size-3.5 rounded-[4px] border transition-[background-color,border-color,transform] duration-500",
                gone ? "scale-[0.7] border-fg/10 bg-transparent" : "border-[#ef4444]/30 bg-[#ef4444]",
              )}
              style={{ transitionDelay: active ? `${250 + (9 - i) * 90}ms` : "0ms" }}
            />
          );
        })}
      </div>
      <span className="font-mono text-[0.6875rem] tabular-nums text-muted max-sm:hidden">
        10 → <span className="text-fg">{active ? 10 - removed : 10}</span>
      </span>
    </div>
  );
}

/** A wall of test cells turning green in a wave. */
function TestsViz({ active, total }: { active: boolean; total: number }) {
  return (
    <div aria-hidden className="flex flex-wrap items-end justify-between gap-2">
      <div className="grid grid-cols-12 gap-[3px]">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            className="size-2.5 rounded-[3px] sm:size-3 transition-colors duration-300"
            style={{
              backgroundColor: active ? (i % 7 === 3 ? "#16a34a" : "#22c55e") : "rgb(15 23 42 / 0.07)",
              transitionDelay: active ? `${150 + ((i % 12) + Math.floor(i / 12) * 2) * 40}ms` : "0ms",
            }}
          />
        ))}
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-[0.625rem] tabular-nums transition-colors duration-500",
          active ? "bg-success/10 text-success" : "bg-fg/[0.05] text-muted",
        )}
        style={{ transitionDelay: active ? "900ms" : "0ms" }}
      >
        {total}/{total} ✓
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

function BigNumber({ stat, active, locale }: { stat: ProofStat; active: boolean; locale: string }) {
  return (
    <p className="flex items-baseline text-[clamp(2.125rem,4.6vw,4.5rem)] font-medium leading-none tracking-[-0.05em] text-fg">
      {stat.prefix ? <span className="text-subtle">{stat.prefix}</span> : null}
      <NumberFlow
        value={active ? stat.value : 0}
        locales={locale}
        className="tabular-nums"
        transformTiming={{ duration: 1200, easing: EASE }}
        spinTiming={{ duration: 1200, easing: EASE }}
      />
      {stat.suffix ? <span className="ml-1 text-[0.5em] tracking-[-0.02em] text-primary">{stat.suffix.trim()}</span> : null}
    </p>
  );
}

function Card({
  stat,
  index,
  active,
  progress,
  pinned,
  compact = false,
  className,
  children,
}: {
  stat: ProofStat;
  index: number;
  active: boolean;
  progress: MotionValue<number>;
  pinned: boolean;
  /** Half-width on phones: the tag is dropped to leave room. */
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon = ICONS[stat.kind];
  // While the card is a miniature, its tiles sit slightly apart and settle as
  // it zooms in: depth without hiding anything.
  const y = useTransform(progress, (p) => (1 - easeOut(segment(p, 0.25, 0.8))) * (14 + index * 10));

  return (
    <motion.li
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.25rem] bg-white p-4 ring-1 ring-fg/[0.06] shadow-[0_1px_2px_rgb(15_23_42/0.04),0_12px_32px_-16px_rgb(15_23_42/0.18)] sm:p-5 lg:p-6",
        className,
      )}
      style={pinned ? { y } : undefined}
      initial={pinned ? undefined : { opacity: 0, y: 20 }}
      whileInView={pinned ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
    >
      {/* Locks in: a line of light draws along the top edge, once. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary"
        style={{ transform: `scaleX(${active ? 1 : 0})`, transition: `transform 900ms ${EASE} ${index * 120}ms` }}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="grid size-7 place-items-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/10">
          <Icon aria-hidden className="size-3.5" />
        </span>
        <span
          className={cn(
            "truncate rounded-full bg-bg-muted px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-muted",
            compact && "max-sm:hidden",
          )}
        >
          {stat.tag}
        </span>
      </div>
      {children}
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Impact, as a bento of four cards on a quiet surface. In the hero sequence it
 * is the card the hero transforms into; each figure counts up and its visual
 * plays once the panel has filled the screen.
 */
export function ProofPanel({ labels, stats, locale }: { labels: ProofLabels; stats: ProofStat[]; locale: string }) {
  const sequence = useHeroSequence();
  const fallback = useMotionValue(1);
  const pinned = sequence?.pinned ?? false;
  const progress = sequence?.progress ?? fallback;

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [reached, setReached] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    if (p > 0.34) setReached(true);
  });
  const active = pinned ? reached : inView;

  const [months, delay, errors, tests] = stats;
  // Cards are keyed on the mode: the server renders the in-flow version, and
  // switching to the scroll sequence must not inherit its hidden entrance state.

  return (
    <section
      id="stats"
      ref={ref}
      aria-label={labels.label}
      className={cn("relative isolate overflow-hidden bg-[#f4f6f9]", pinned ? "h-full" : "py-20 md:py-28")}
    >
      <div aria-hidden className="bg-dots absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className={cn("mx-auto flex w-full max-w-[84rem] flex-col px-3 sm:px-8", pinned ? "h-full pb-4 pt-[4.75rem] sm:pb-8 lg:pt-24" : "")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              <span className="h-px w-6 bg-primary" />
              {labels.eyebrow}
              <span className="text-subtle">/</span>
              {labels.label}
            </p>
            <h2 className="mt-3 text-[clamp(1.5rem,3.4vw,3rem)] font-medium leading-[1.04] tracking-[-0.04em] text-fg sm:mt-4">
              {labels.titleLead} <span className="text-subtle">{labels.titleQuiet}</span>
            </h2>
          </div>
          <ul className="flex flex-wrap gap-1.5 max-sm:hidden">
            {labels.orgs.map((org) => (
              <li key={org} className="rounded-full bg-white px-3 py-1.5 text-[0.75rem] font-medium text-fg-2 ring-1 ring-fg/[0.07]">
                {org}
              </li>
            ))}
          </ul>
        </div>

        <ul
          className={cn(
            "mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3 lg:grid-cols-12 lg:grid-rows-2",
            pinned ? "min-h-0 flex-1 lg:max-h-[38rem]" : "lg:h-[34rem]",
          )}
        >
          {/* Months: tall card with the bar chart */}
          <Card key={`months-${pinned}`} stat={months} index={0} active={active} progress={progress} pinned={pinned} className="col-span-2 lg:col-span-4 lg:row-span-2">
            <div className="mt-3 flex items-end justify-between gap-4 sm:mt-5 lg:block">
              <div>
                <BigNumber stat={months} active={active} locale={locale} />
                <p className="mt-2 max-w-[15rem] text-[0.8125rem] leading-snug text-muted sm:text-sm lg:mt-3">{months.label}</p>
              </div>
              <p className="shrink-0 font-mono text-[0.625rem] uppercase tracking-wider text-subtle lg:mt-3">{labels.since}</p>
            </div>
            <div className="mt-3 h-14 sm:mt-4 lg:mt-auto lg:h-auto lg:min-h-0 lg:flex-1 lg:pt-6">
              <MonthsViz value={months.value} active={active} />
            </div>
          </Card>

          {/* Delay: wide card, figure and chart side by side */}
          <Card key={`delay-${pinned}`} stat={delay} index={1} active={active} progress={progress} pinned={pinned} className="col-span-2 lg:col-span-8">
            <div className="mt-2 grid flex-1 grid-cols-[auto_1fr] items-center gap-4 sm:mt-4 sm:gap-12">
              <div>
                <BigNumber stat={delay} active={active} locale={locale} />
                <p className="mt-2 max-w-[8.5rem] text-[0.75rem] leading-snug text-muted sm:max-w-[16rem] sm:text-sm">{delay.label}</p>
              </div>
              <DelayViz value={delay.value} active={active} before={labels.before} after={labels.after} caption={labels.delayCaption} />
            </div>
          </Card>

          <Card key={`errors-${pinned}`} stat={errors} index={2} active={active} progress={progress} pinned={pinned} compact className="lg:col-span-4">
            <div className="mt-3 sm:mt-4">
              <BigNumber stat={errors} active={active} locale={locale} />
              <p className="mt-2 text-[0.8125rem] leading-snug text-muted sm:text-sm">{errors.label}</p>
            </div>
            <div className="mt-auto pt-3 sm:pt-4">
              <ErrorsViz value={errors.value} active={active} />
            </div>
          </Card>

          <Card key={`tests-${pinned}`} stat={tests} index={3} active={active} progress={progress} pinned={pinned} compact className="lg:col-span-4">
            <div className="mt-3 sm:mt-4">
              <BigNumber stat={tests} active={active} locale={locale} />
              <p className="mt-2 text-[0.8125rem] leading-snug text-muted sm:text-sm">{tests.label}</p>
            </div>
            <div className="mt-auto pt-3 sm:pt-4">
              <TestsViz active={active} total={tests.value} />
            </div>
          </Card>
        </ul>
      </div>
    </section>
  );
}
