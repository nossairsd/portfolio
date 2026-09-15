"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import {
  siDocker,
  siGithubactions,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siSap,
  siSpringboot,
} from "simple-icons";
import { EASE_OUT } from "@/components/motion/fade-in";
import { cn } from "@/lib/cn";
import { ApiDemo, ChatDemo, CloudDemo, type DemoLabels } from "./demos";

export type Focus = { title: string; text: string; usedAt: string };
type Tech = { label: string; icon?: { path: string; hex: string }; mark?: string };

const TECH: Tech[][] = [
  [
    { label: "React", icon: siReact },
    { label: "Next.js", icon: siNextdotjs },
    { label: "Node.js", icon: siNodedotjs },
    { label: "Spring Boot", icon: siSpringboot },
    { label: "PostgreSQL", icon: siPostgresql },
  ],
  [
    { label: "Docker", icon: siDocker },
    { label: "GitHub Actions", icon: siGithubactions },
    { label: "Azure", mark: "Az" },
    { label: "Playwright", mark: "Pw" },
  ],
  [
    { label: "SAP", icon: siSap },
    { label: "Microsoft Graph", mark: "Gr" },
    { label: "Copilot Studio", mark: "Cs" },
    { label: "Teams", mark: "Tm" },
  ],
];

const DEMOS = [ApiDemo, CloudDemo, ChatDemo];
const WINDOWS = ["rest-api · audits", "azure · monitoring", "teams · assistant"];

/** Time each domain stays on screen before the next one, while nobody interacts. */
const DURATION = 7000;

const pad = (n: number) => String(n).padStart(2, "0");
const fill = (hex: string) => `#${hex === "000000" ? "0b1220" : hex}`;

function TechList({ items }: { items: Tech[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
      {items.map((tech, i) => (
        <motion.li
          key={tech.label}
          className="flex min-w-0 items-center gap-2.5 text-sm text-fg-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.12 + i * 0.05 }}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white ring-1 ring-fg/[0.08]">
            {tech.icon ? (
              <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" style={{ fill: fill(tech.icon.hex) }}>
                <path d={tech.icon.path} />
              </svg>
            ) : (
              <span aria-hidden className="font-mono text-[0.5625rem] font-semibold text-primary-strong">
                {tech.mark}
              </span>
            )}
          </span>
          <span className="truncate">{tech.label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

/**
 * The three areas of work in one panel. Tabs across the top advance on their
 * own, each with a progress bar, until the reader picks one; the panel below
 * says what the domain covers, with which tools, where it was applied, and
 * shows the work happening in a small window.
 */
export function Domains({
  label,
  title,
  usedAtLabel,
  stackLabel,
  items,
  demo,
}: {
  label: string;
  title: string;
  usedAtLabel: string;
  stackLabel: string;
  items: Focus[];
  demo: DemoLabels;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovered, setHovered] = useState(false);
  const running = auto && !reduce;

  const select = (index: number) => {
    setAuto(false);
    setActive((index + items.length) % items.length);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") select(active + 1);
    if (event.key === "ArrowLeft") select(active - 1);
  };

  const item = items[active];
  const Demo = DEMOS[active] ?? ApiDemo;

  return (
    <motion.div
      ref={ref}
      className="flex h-full flex-col rounded-[1.5rem] bg-white p-5 ring-1 ring-fg/[0.08] shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_48px_-36px_rgb(15_23_42/0.3)] md:p-6"
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-fg">{title}</h3>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">
          {label} · {pad(items.length)}
        </p>
      </div>

      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="mt-5 grid grid-cols-3 gap-3 border-b border-line">
        {items.map((domain, i) => {
          const selected = i === active;
          return (
            <button
              key={domain.title}
              type="button"
              role="tab"
              id={`domain-tab-${i}`}
              aria-selected={selected}
              aria-controls="domain-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={cn(
                "group relative pb-3.5 text-left outline-offset-4 transition-colors duration-300",
                selected ? "text-fg" : "text-muted hover:text-fg-2",
              )}
            >
              <span className={cn("block font-mono text-[0.6875rem]", selected ? "text-primary" : "text-subtle")}>{pad(i + 1)}</span>
              <span className="mt-1 block text-[0.8125rem] font-semibold leading-snug tracking-[-0.01em] sm:text-[0.9375rem]">{domain.title}</span>
              {/* Progress: fills while the tab is on screen, then hands over to the next one. */}
              <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
                {selected ? (
                  running ? (
                    <span
                      key={`progress-${active}`}
                      className="absolute inset-0 origin-left bg-primary"
                      style={{
                        animation: `stack-progress ${DURATION}ms linear forwards`,
                        animationPlayState: inView && !hovered ? "running" : "paused",
                      }}
                      onAnimationEnd={() => setActive((a) => (a + 1) % items.length)}
                    />
                  ) : (
                    <motion.span layoutId="domain-tab-line" className="absolute inset-0 bg-primary" transition={{ duration: 0.4, ease: EASE_OUT }} />
                  )
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div id="domain-panel" role="tabpanel" aria-labelledby={`domain-tab-${active}`} className="relative mt-5 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="grid h-full gap-5 md:grid-cols-[minmax(0,1fr)_16rem]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <div className="flex min-w-0 flex-col">
              <p className="text-[1.0625rem] leading-relaxed text-fg-2">{item.text}</p>

              <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-subtle">{stackLabel}</p>
              <div className="mt-3">
                <TechList items={TECH[active] ?? []} />
              </div>

              <p className="mt-auto flex flex-wrap items-baseline gap-x-2 border-t border-line pt-4 text-sm">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-subtle">{usedAtLabel}</span>
                <span className="font-medium text-fg">{item.usedAt}</span>
              </p>
            </div>

            {/* The domain at work, in a small window. */}
            <div aria-hidden className="flex h-[16.5rem] flex-col self-start overflow-hidden rounded-2xl bg-[#f4f6f9] ring-1 ring-fg/[0.07]">
              <div className="flex items-center gap-2 border-b border-fg/[0.06] bg-white/70 px-3 py-2">
                <span className="flex gap-1">
                  <span className="size-2 rounded-full bg-fg/15" />
                  <span className="size-2 rounded-full bg-fg/15" />
                  <span className="size-2 rounded-full bg-fg/15" />
                </span>
                <span className="truncate font-mono text-[0.625rem] text-muted">{WINDOWS[active]}</span>
              </div>
              <div className="relative flex-1 p-3">
                <Demo labels={demo} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
