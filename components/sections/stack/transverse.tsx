"use client";

import { Blocks, Braces, FlaskConical, ShieldCheck, Workflow, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/components/motion/fade-in";
import { ToolsView } from "@/components/three/lazy";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { ToolIcon } from "../process/tools";

export type TransverseGroup = { name: string; role: string; items: string[] };

/** What each family does, in one sign. */
const ICONS: LucideIcon[] = [Braces, FlaskConical, ShieldCheck, Workflow, Blocks];
/** How long a family stays lit before the next one takes over. */
const DWELL = 6200;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The tools that belong to no single layer. Each family is read one at a time:
 * the list opens on the left with its tools and their real marks, while on the
 * right the whole toolbox floats as cards, and the family being read steps
 * forward. It plays on its own and stops as soon as a visitor takes over.
 */
export function Transverse({
  groups,
  labels,
}: {
  groups: TransverseGroup[];
  labels: { title: string; intro: string; caption: string };
}) {
  const block = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const inView = useInView(block, { amount: 0.3 });
  const progress = useScrollProgress(block);

  const playing = inView && !held;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % groups.length), DWELL);
    return () => window.clearTimeout(timer);
  }, [playing, active, groups.length]);

  return (
    <div ref={block} className="relative">
      {/* The marks the 3D cards are drawn from: the same icons as the list.
          Kept rendered but invisible, not hidden: a mark whose colours come
          from a gradient only paints when its definition is in a live tree. */}
      <span aria-hidden className="pointer-events-none absolute size-0 overflow-hidden opacity-0">
        {groups.flatMap((group) =>
          group.items.map((item) => (
            <span key={item} data-tool-icon={item}>
              <ToolIcon name={item} />
            </span>
          )),
        )}
      </span>
      <div className="flex items-center gap-4">
        <h3 className="eyebrow">{labels.title}</h3>
        <span className="h-px flex-1 bg-primary/15" />
      </div>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">{labels.intro}</p>

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* The families, one open at a time. */}
        <ul
          className="lg:col-span-7"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
        >
          {groups.map((group, i) => {
            const Icon = ICONS[i] ?? Blocks;
            const open = i === active;
            return (
              <li key={group.name} className={cn("border-b border-line/70", i === 0 && "border-t")}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className="group flex w-full items-center gap-4 py-4 text-left"
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition-colors duration-300",
                      open ? "bg-primary text-white ring-primary" : "bg-white text-primary ring-line group-hover:ring-primary/40",
                    )}
                  >
                    <Icon aria-hidden className="size-[1.15rem]" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[0.6875rem] text-subtle">{pad(i + 1)}</span>
                      <span className={cn("text-[1.0625rem] font-semibold tracking-[-0.02em] transition-colors", open ? "text-fg" : "text-fg-2")}>
                        {group.name}
                      </span>
                    </span>
                  </span>
                  {/* Closed rows still show what is inside. */}
                  <span
                    aria-hidden
                    className={cn(
                      "hidden shrink-0 items-center gap-2 transition-opacity duration-300 sm:flex",
                      open ? "opacity-0" : "opacity-100",
                    )}
                  >
                    {group.items.slice(0, 5).map((item) => (
                      <ToolIcon key={item} name={item} className="size-[1.0625rem]" />
                    ))}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-subtle">{pad(group.items.length)}</span>
                </button>

                {/* The open family: what it is for, then its tools. */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 pl-15">
                        <p className="max-w-lg text-[0.9375rem] leading-relaxed text-muted">{group.role}</p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {group.items.map((item, j) => (
                            <motion.li
                              key={item}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: 0.06 + j * 0.045, ease: EASE_OUT }}
                            >
                              <span className="inline-flex items-center gap-2.5 rounded-xl bg-white py-2 pl-2 pr-3.5 text-[0.875rem] font-medium text-fg-2 shadow-[0_0_0_1px_rgb(15_23_42/0.07),0_10px_22px_-18px_rgb(15_23_42/0.45)]">
                                <span className="grid size-8 place-items-center rounded-lg bg-[#f4f7fc]">
                                  <ToolIcon name={item} className="size-[1.25rem]" />
                                </span>
                                {item}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* How long this family stays open. */}
                <span aria-hidden className="block h-px w-full overflow-hidden">
                  {open && playing && (
                    <motion.span
                      key={active}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: DWELL / 1000, ease: "linear" }}
                      className="block h-px origin-left bg-primary"
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {/* The same families, wrapped around the stack. */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[27rem]">
            <ToolsView
              groups={groups.map((group) => ({ name: group.name, items: group.items }))}
              active={active}
              progress={progress}
              className="absolute inset-0"
            />
          </div>
          <p className="-mt-1 text-center font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">{labels.caption}</p>
        </div>
      </div>
    </div>
  );
}
