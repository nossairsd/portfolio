"use client";

import Image from "next/image";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion/fade-in";
import { buttonClasses } from "@/components/ui/button-classes";
import { LocalTime } from "@/components/ui/local-time";
import { cn } from "@/lib/cn";

type Language = { name: string; level: string; value: number };

export type ProfileSheetLabels = {
  name: string;
  role: string;
  available: string;
  portraitAlt: string;
  currentLabel: string;
  currentRole: string;
  currentCompany: string;
  currentSince: string;
  locationLabel: string;
  city: string;
  localTime: string;
  mobilityLabel: string;
  mobility: string;
  degreeLabel: string;
  degreeTitle: string;
  degreeDetail: string;
  languagesLabel: string;
  cv: string;
  contact: string;
};

function Level({ value }: { value: number }) {
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={cn("h-1.5 w-3 rounded-full", i < value ? "bg-fg" : "bg-fg/10")} />
      ))}
    </span>
  );
}

/**
 * The profile as one sheet that can be read at a glance: who, where, since
 * when, trained where, which languages. Set like a document, with hairline
 * rows and a fixed label column, rather than a stack of widgets.
 */
export function ProfileSheet({
  labels,
  languages,
  locale,
  cvHref,
}: {
  labels: ProfileSheetLabels;
  languages: Language[];
  locale: string;
  cvHref: string;
}) {
  const reduce = useReducedMotion();

  const rows: { term: string; content: React.ReactNode }[] = [
    {
      term: labels.currentLabel,
      content: (
        <>
          <span className="block font-medium text-fg">
            {labels.currentRole} <span className="text-subtle">·</span> {labels.currentCompany}
          </span>
          <span className="mt-0.5 block text-[0.8125rem] text-muted">{labels.currentSince}</span>
        </>
      ),
    },
    {
      term: labels.locationLabel,
      content: (
        <>
          <span className="block font-medium text-fg">{labels.city}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-muted">
            <LocalTime locale={locale} className="font-mono tabular-nums text-fg-2" /> {labels.localTime}
          </span>
        </>
      ),
    },
    { term: labels.mobilityLabel, content: <span className="block font-medium text-fg">{labels.mobility}</span> },
    {
      term: labels.degreeLabel,
      content: (
        <>
          <span className="block font-medium text-fg">{labels.degreeTitle}</span>
          <span className="mt-0.5 block text-[0.8125rem] text-muted">{labels.degreeDetail}</span>
        </>
      ),
    },
    {
      term: labels.languagesLabel,
      content: (
        <ul className="space-y-2">
          {languages.map((language) => (
            <li key={language.name} className="flex items-center justify-between gap-3">
              <span className="font-medium text-fg">
                {language.name} <span className="text-[0.8125rem] font-normal text-muted">· {language.level}</span>
              </span>
              <Level value={language.value} />
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <motion.article
      className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-fg/[0.08] shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_48px_-36px_rgb(15_23_42/0.3)]"
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT }}
    >
      <header className="flex items-center gap-4 p-5 md:p-6">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[#e8f0fe] ring-1 ring-fg/[0.06]">
          <Image
            src="/images/nossair-sedki.png"
            alt={labels.portraitAlt}
            fill
            sizes="64px"
            className="object-cover object-[50%_10%] [transform:scale(1.7)] [transform-origin:58%_6%]"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-semibold leading-tight tracking-[-0.02em] text-fg">{labels.name}</span>
          <span className="block truncate text-sm text-muted">{labels.role}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:inline-flex">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
            <span className="relative size-1.5 rounded-full bg-success" />
          </span>
          {labels.available}
        </span>
      </header>

      <dl className="flex-1 border-t border-line">
        {rows.map((row, i) => (
          <motion.div
            key={row.term}
            className="grid grid-cols-1 gap-1.5 border-b border-line px-5 py-4 text-[0.9375rem] last:border-b-0 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4 md:grid-cols-[7.5rem_minmax(0,1fr)] md:px-6"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 + i * 0.07 }}
          >
            <dt className="pt-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-subtle">{row.term}</dt>
            <dd className="min-w-0">{row.content}</dd>
          </motion.div>
        ))}
      </dl>

      <footer className="grid gap-2 border-t border-line bg-bg-subtle p-3 min-[420px]:grid-cols-2">
        <a href={cvHref} download className={buttonClasses("secondary", "md", "bg-white")}>
          <ArrowDownToLine aria-hidden className="size-4" />
          {labels.cv}
        </a>
        <a href="#contact" className={buttonClasses("primary", "md")}>
          {labels.contact}
          <ArrowRight aria-hidden className="size-4" />
        </a>
      </footer>
    </motion.article>
  );
}
