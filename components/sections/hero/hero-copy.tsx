"use client";

import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { LetterRise } from "@/components/motion/letter-rise";
import { buttonClasses } from "@/components/ui/button-classes";
import { useIntroReady } from "@/lib/intro";
import { cn } from "@/lib/cn";
import { HeroLinks } from "./hero-links";

const EASE = [0.16, 1, 0.3, 1] as const;

const TYPE_MS = 62;
const ERASE_MS = 26;
const HOLD_MS = 2600;

function Reveal({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
  const ready = useIntroReady();
  return (
    <motion.div
      data-intro
      className={className}
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The specialty as a JSX tag, typed like code: the name is written, held,
 * erased, and the next one is written. Only real characters ever appear, and
 * the tag hugs the word, so the brackets always sit right against it.
 */
function RoleTag({ words, active }: { words: string[]; active: boolean }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!active || reduce) return;
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));

    (async () => {
      await wait(900);
      for (let w = 0; !cancelled; w = (w + 1) % words.length) {
        const word = words[w];
        setTyping(true);
        for (let i = 1; i <= word.length && !cancelled; i++) {
          setText(word.slice(0, i));
          // A touch of irregularity so it reads as typed, not ticked.
          await wait(TYPE_MS + (i % 3) * 14);
        }
        setTyping(false);
        await wait(HOLD_MS);
        setTyping(true);
        for (let i = word.length - 1; i >= 0 && !cancelled; i--) {
          setText(word.slice(0, i));
          await wait(ERASE_MS);
        }
        await wait(260);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [active, reduce, words]);

  const shown = reduce ? words[0] : text;

  return (
    <span className="inline-flex items-baseline whitespace-nowrap font-mono text-[0.8em] font-normal tracking-[-0.03em] max-sm:w-full">
      <span className="sr-only">{words.join(" · ")}</span>
      <span aria-hidden className="text-subtle">&lt;</span>
      <span aria-hidden className="text-primary">{shown}</span>
      <span
        aria-hidden
        className={cn(
          "ml-[0.06em] inline-block h-[0.95em] w-[0.09em] translate-y-[0.12em] bg-primary",
          typing ? "opacity-100" : "animate-[caret_1s_steps(1)_infinite]",
        )}
      />
      <span aria-hidden className="text-subtle">&nbsp;/&gt;</span>
    </span>
  );
}

export function HeroCopy({
  labels,
  cvHref,
}: {
  labels: {
    status: string;
    mobility: string;
    rolePrefix: string;
    roles: string[];
    headlineLead: string;
    headlineQuiet: string;
    intro: string;
    ctaProjects: string;
    ctaCv: string;
    copyEmail: string;
    copied: string;
  };
  cvHref: string;
}) {
  const ready = useIntroReady();

  return (
    <div>
      <Reveal delay={0}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em]">
          <span className="inline-flex h-7 items-center gap-2 rounded-full border border-line-strong bg-white pl-2.5 pr-3 font-medium text-fg">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-success" />
              <span className="relative size-1.5 rounded-full bg-success" />
            </span>
            {labels.status}
          </span>
          <span className="text-muted">{labels.mobility}</span>
        </p>
      </Reveal>

      <h1 className="mt-8">
        <span className="block text-[clamp(3rem,6.6vw,6rem)] font-medium leading-[0.95] tracking-[-0.055em] text-fg">
          <LetterRise text="Nossair" active={ready} delay={0.15} />{" "}
          <LetterRise text="Sedki" active={ready} delay={0.42} />
        </span>
        <Reveal
          delay={0.55}
          className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[clamp(1.375rem,2.5vw,2.125rem)] font-medium tracking-[-0.03em] text-fg"
        >
          <span>{labels.rolePrefix}</span>
          <RoleTag words={labels.roles} active={ready} />
        </Reveal>
      </h1>

      <Reveal delay={0.7}>
        <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
          <span className="font-medium text-fg-2">{labels.headlineLead} </span>
          <span className="relative whitespace-nowrap font-medium text-fg">
            {labels.headlineQuiet}
            <motion.span
              aria-hidden
              className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-primary"
              initial={{ scaleX: 0 }}
              animate={ready ? { scaleX: 1 } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: 1.3 }}
            />
          </span>{" "}
          {labels.intro}
        </p>
      </Reveal>

      <Reveal delay={0.85} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="#projects"
          className="group relative inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-full bg-primary pl-6 pr-1.5 text-[0.9375rem] font-medium text-white shadow-[0_1px_0_rgb(255_255_255/0.2)_inset,0_10px_24px_-10px_rgb(37_99_235/0.6)] transition-colors hover:bg-primary-strong"
        >
          {labels.ctaProjects}
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-full bg-white text-primary">
            <ArrowRight aria-hidden className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-6" />
            <ArrowRight aria-hidden className="absolute size-4 -translate-x-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
          </span>
        </a>
        <a href={cvHref} download className={buttonClasses("secondary", "lg", "bg-white")}>
          <ArrowDownToLine aria-hidden className="size-4" />
          {labels.ctaCv}
        </a>
      </Reveal>

      <Reveal delay={1} className="mt-9 border-t border-line pt-6">
        <HeroLinks copyLabel={labels.copyEmail} copiedLabel={labels.copied} />
      </Reveal>
    </div>
  );
}
