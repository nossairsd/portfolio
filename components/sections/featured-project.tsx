"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LaptopView } from "@/components/three/lazy";
import { LAPTOP_SCREENS, laptopTimeline } from "@/components/three/laptop-timeline";
import { EASE_OUT } from "@/components/motion/fade-in";
import { GithubIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { ToolIcon } from "./process/tools";

export type Chapter = { title: string; text: string };

type Labels = {
  featured: string;
  name: string;
  tagline: string;
  year: string;
  live: string;
  summary: string;
  stackLabel: string;
  demo: string;
  code: string;
  caseStudy: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** One chapter's segment: it fills while that chapter's screens play. */
function Segment({ fill, index, title, active, done }: { fill: MotionValue<number>; index: number; title: string; active: boolean; done: boolean }) {
  return (
    <div className="min-w-0">
      <span aria-hidden className="relative block h-[3px] overflow-hidden rounded-full bg-fg/[0.08]">
        <motion.span className="absolute inset-0 origin-left rounded-full bg-primary" style={{ scaleX: done ? 1 : active ? fill : 0 }} />
      </span>
      <p className="mt-3 flex items-baseline gap-2">
        <span className={cn("font-mono text-[0.6875rem] transition-colors duration-300", active || done ? "text-primary" : "text-subtle")}>{pad(index + 1)}</span>
        <span
          className={cn(
            "truncate text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors duration-300",
            active ? "text-fg" : done ? "text-fg-2" : "text-subtle",
          )}
        >
          {title}
        </span>
      </p>
    </div>
  );
}

/**
 * The featured project. The laptop opens, the camera flies into its screen
 * and the product plays screen by screen with the scroll. Beside it, the
 * chapter that those screens illustrate is set in a block of fixed height,
 * above segments that fill as its screens go by, so nothing reflows.
 */
export function FeaturedProject({
  chapters,
  screens,
  stack,
  labels,
}: {
  chapters: Chapter[];
  screens: string[];
  stack: string[];
  labels: Labels;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [screen, setScreen] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const fill = useMotionValue(0);

  const progress = useScrollProgress(track, {
    onChange: (p) => {
      const t = laptopTimeline(p);
      fill.set(t.chapterProgress);
      setChapter((c) => (c === t.chapter ? c : t.chapter));
      setScreen((s) => (s === t.index ? s : t.index));
      setZoomed((z) => (z === t.zoom > 0.6 ? z : t.zoom > 0.6));
    },
  });

  const current = chapters[chapter];

  return (
    <div ref={track} className="relative mt-10" style={{ height: `${160 + LAPTOP_SCREENS.length * 55}svh` }}>
      <div className="sticky top-0 z-[6] flex h-svh items-center overflow-hidden pt-16">
        <div className="container-page relative grid h-full max-h-[48rem] content-start pt-2 lg:grid-cols-12 lg:content-center lg:gap-10 lg:pt-0">
          <div className="relative z-10 lg:col-span-5">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              <span className="h-px w-6 bg-primary" />
              {labels.featured}
              <span className="text-subtle">/</span>
              {labels.year}
              <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-success">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                  <span className="relative size-1.5 rounded-full bg-success" />
                </span>
                {labels.live}
              </span>
            </p>
            <h3 className="mt-4 text-[clamp(1.875rem,3.4vw,2.875rem)] font-semibold leading-[1.04] tracking-[-0.04em]">{labels.name}</h3>
            <p className="mt-1.5 text-lg text-fg-2">{labels.tagline}</p>
            <p className="mt-4 hidden leading-relaxed text-muted sm:block">{labels.summary}</p>

            {/* Chapters */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              {chapters.map((c, i) => (
                <Segment key={c.title} fill={fill} index={i} title={c.title} active={i === chapter} done={i < chapter} />
              ))}
            </div>
            <div className="relative mt-4 min-h-[5.5rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <p className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-fg">{current.title}</p>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted max-sm:line-clamp-2">{current.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-5 hidden md:block">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">{labels.stackLabel}</p>
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
                {stack.map((tech) => (
                  <li key={tech} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-fg-2">
                    <ToolIcon name={tech} />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <ButtonLink href={site.metaAds.demo} target="_blank" rel="noopener noreferrer">
                {labels.demo}
                <ArrowUpRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href={site.metaAds.repo} target="_blank" rel="noopener noreferrer" variant="secondary">
                <GithubIcon />
                {labels.code}
              </ButtonLink>
              <Link
                href="/projects/meta-ads-report-studio"
                className="group inline-flex h-11 items-center gap-1.5 px-2 text-sm font-medium text-fg-2 hover:text-primary"
              >
                {labels.caseStudy}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

      {/* The 3D stage covers the screen below the navigation: the camera frames
          the laptop on the right, and nothing can be cut at the edges of a
          narrower box. Starting it under the bar (not at the very top) also
          avoids a GPU stall when the stage scrolls out of the viewport. */}
      <div className="absolute inset-x-0 bottom-0 h-[44%] lg:inset-0 lg:top-16 lg:h-auto">
        <LaptopView progress={progress} className="absolute inset-0" />

        {/* What the screen is showing, once the camera is inside. Always mounted
            and faded with a CSS transition: no mount and unmount over the canvas. */}
        <div
          aria-hidden={!zoomed}
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:bottom-8 lg:left-[45%]",
            zoomed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <span className="inline-flex items-center gap-3 rounded-full bg-fg py-1.5 pl-1.5 pr-4 text-[0.8125rem] font-medium text-white shadow-[0_12px_30px_-12px_rgb(15_23_42/0.6)]">
            <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[0.6875rem] tabular-nums">
              {pad(screen + 1)}/{pad(LAPTOP_SCREENS.length)}
            </span>
            {screens[screen] ?? ""}
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
