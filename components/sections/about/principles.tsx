"use client";

import { Microscope, Rocket, Target, Users, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion/fade-in";

type Principle = { title: string; text: string };

const ICONS: LucideIcon[] = [Target, Microscope, Users, Rocket];

/**
 * How I work, as a quiet strip under the profile: four short statements in
 * columns separated by hairlines. A short accent is drawn over each column as
 * the strip comes into view, left to right.
 */
export function Principles({ label, items }: { label: string; items: Principle[] }) {
  const reduce = useReducedMotion();

  return (
    <div>
      <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
        <span className="h-px w-6 bg-primary" />
        {label}
      </p>
      <ol className="mt-5 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i] ?? Target;
          return (
            <motion.li
              key={item.title}
              className="relative border-b border-line py-6 last:border-b-0 sm:odd:pr-6 sm:even:border-l sm:even:pl-6 sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.09 }}
            >
              <div className="relative">
                {/* Sits on the column's top rule, aligned with its text. */}
                <motion.span
                  aria-hidden
                  className="absolute -top-[calc(1.5rem+1px)] left-0 h-[2px] w-10 origin-left bg-primary"
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 + i * 0.12 }}
                />
                <p className="flex items-center gap-2 text-fg">
                  <Icon aria-hidden className="size-4 text-primary" strokeWidth={1.9} />
                  <span className="font-semibold tracking-[-0.01em]">{item.title}</span>
                </p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
