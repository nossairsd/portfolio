"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ChevronDown, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { EASE_OUT, FadeIn } from "@/components/motion/fade-in";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";

export type Role = {
  id: string;
  role: string;
  company: string;
  place: string;
  period: string;
  duration?: string;
  durationLabel: string;
  scope: string;
  highlights: string[];
  points: string[];
  stack: string[];
};

const MONOGRAMS: Record<string, string> = { kohler: "GK", pfe: "GK", lydec: "LY" };

function RoleCard({ role, labels }: { role: Role; labels: { current: string; scope: string; show: string; hide: string } }) {
  const current = role.id === "kohler";
  const [open, setOpen] = useState(current);

  return (
    <SpotlightCard innerClassName="p-6 md:p-8">
      <div className="flex flex-wrap items-start gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl font-mono text-sm font-semibold",
            current ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgb(37_99_235/0.6)]" : "bg-bg-muted text-fg-2",
          )}
        >
          {MONOGRAMS[role.id] ?? "··"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight md:text-[1.375rem]">{role.role}</h3>
            {current ? (
              <Tag tone="success">
                <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-success" />
                {labels.current}
              </Tag>
            ) : null}
          </div>
          <p className="mt-1 text-fg-2">{role.company}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-mono text-xs uppercase tracking-wide">{role.period}</span>
            <span className="size-1 rounded-full bg-line-strong" />
            <span>{role.durationLabel}</span>
            <span className="size-1 rounded-full bg-line-strong" />
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden className="size-3.5" />
              {role.place}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-6 leading-relaxed text-fg-2">{role.scope}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {role.highlights.map((highlight) => (
          <li key={highlight}>
            <Tag tone="primary" className="py-1.5">
              {highlight}
            </Tag>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        {open ? labels.hide : labels.show}
        <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <ul className="space-y-2.5 pt-4">
              {role.points.map((point) => (
                <li key={point} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-primary/60" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-5">
              {role.stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SpotlightCard>
  );
}

export function ExperienceList({ roles, labels }: { roles: Role[]; labels: { current: string; scope: string; show: string; hide: string } }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 100, damping: 26, restDelta: 0.001 });

  return (
    <ol ref={ref} className="relative space-y-5 pl-8 md:pl-10">
      <span aria-hidden className="absolute bottom-6 left-[11px] top-6 w-px bg-line-strong md:left-[15px]" />
      <motion.span
        aria-hidden
        style={{ scaleY: reduce ? 1 : fill }}
        className="absolute bottom-6 left-[11px] top-6 w-px origin-top bg-primary md:left-[15px]"
      />
      {roles.map((role, i) => (
        <FadeIn as="li" key={role.id} delay={i * 0.05} className="relative">
          <span
            aria-hidden
            className={cn(
              "absolute -left-8 top-9 grid size-6 place-items-center rounded-full bg-white ring-1 md:-left-10 md:size-8",
              role.id === "kohler" ? "ring-primary" : "ring-line-strong",
            )}
          >
            <span className={cn("size-2 rounded-full", role.id === "kohler" ? "bg-primary" : "bg-subtle")} />
          </span>
          <RoleCard role={role} labels={labels} />
        </FadeIn>
      ))}
    </ol>
  );
}
