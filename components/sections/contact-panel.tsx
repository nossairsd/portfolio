"use client";

import { ArrowDownToLine, Clock, Copy, Globe2, MapPin } from "lucide-react";
import { useRef } from "react";
import { copyEmail } from "@/components/layout/command-menu";
import { FadeIn } from "@/components/motion/fade-in";
import { SplitReveal } from "@/components/motion/split-reveal";
import { GlobeView } from "@/components/three/lazy";
import { GithubIcon } from "@/components/ui/brand-icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { LocalTime } from "@/components/ui/local-time";
import { site, type CityId } from "@/lib/site";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { ComposeMenu, type ComposeLabels } from "./compose-menu";

type Labels = {
  index: string;
  eyebrow: string;
  titleLead: string;
  titleQuiet: string;
  text: string;
  caption: string;
  email: string;
  write: string;
  copy: string;
  copied: string;
  github: string;
  cvFr: string;
  cvEn: string;
  location: string;
  mode: string;
  compose: ComposeLabels;
};

/**
 * Left: who to write to and how. Right: where from, and where to. The two are
 * side by side so the card is on screen the moment the section is.
 */
export function ContactPanel({ locale, cities, labels }: { locale: string; cities: Record<CityId, string>; labels: Labels }) {
  const globe = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(globe, { start: "top bottom", end: "center center" });

  return (
    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-6">
        <FadeIn className="flex items-center gap-2.5">
          <span className="grid h-6 min-w-6 place-items-center rounded-md bg-primary-soft px-1.5 font-mono text-[0.6875rem] font-medium text-primary">
            {labels.index}
          </span>
          <span className="eyebrow">{labels.eyebrow}</span>
        </FadeIn>

        <SplitReveal className="mt-5 text-[clamp(2.25rem,4.2vw,3.5rem)] font-medium leading-[1.04] tracking-[-0.035em] text-balance">
          <span className="text-fg">{labels.titleLead}</span> <span className="text-quiet">{labels.titleQuiet}</span>
        </SplitReveal>

        <FadeIn delay={0.12}>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">{labels.text}</p>
        </FadeIn>

        {/* The card: the address, then every way to use it. */}
        <FadeIn delay={0.2} className="mt-8 rounded-[1.75rem] bg-white p-2 shadow-[0_0_0_1px_rgb(15_23_42/0.07),0_28px_60px_-40px_rgb(15_23_42/0.5)]">
          <div className="rounded-[1.35rem] bg-bg-subtle p-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">{labels.email}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <a
                href={`mailto:${site.email}`}
                className="min-w-0 truncate text-[1.0625rem] font-semibold tracking-tight transition-colors hover:text-primary md:text-xl"
              >
                {site.email}
              </a>
              <Button variant="secondary" size="sm" onClick={() => copyEmail(labels.copied)} aria-label={labels.copy}>
                <Copy aria-hidden className="size-3.5" />
                <span className="hidden sm:inline">{labels.copy}</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-2 p-2 pt-3 sm:grid-cols-2">
            <ComposeMenu className="sm:col-span-2" labels={labels.compose} />
            <ButtonLink href={site.cv.fr} download variant="secondary">
              <ArrowDownToLine aria-hidden className="size-4" />
              {labels.cvFr}
            </ButtonLink>
            <ButtonLink href={site.cv.en} download variant="secondary">
              <ArrowDownToLine aria-hidden className="size-4" />
              {labels.cvEn}
            </ButtonLink>
            <ButtonLink href={site.github} target="_blank" rel="noopener noreferrer" variant="ghost" className="sm:col-span-2">
              <GithubIcon />
              {labels.github}
            </ButtonLink>
          </div>
        </FadeIn>

        {/* Where I am, how I work, what time it is here. */}
        <FadeIn delay={0.28} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-fg-2">
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden className="size-4 text-primary" />
            {labels.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <Globe2 aria-hidden className="size-4 text-primary" />
            {labels.mode}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock aria-hidden className="size-4 text-primary" />
            <LocalTime locale={locale} className="font-mono tabular-nums" />
          </span>
        </FadeIn>
      </div>

      <div className="lg:col-span-6">
        <div ref={globe} className="relative mx-auto aspect-square w-full max-w-[30rem]">
          <GlobeView progress={progress} home={cities.tangier} className="absolute inset-0" />
        </div>
        <p className="mt-1 text-center text-sm font-medium text-fg-2">{labels.caption}</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {(Object.keys(cities) as CityId[])
            .filter((id) => id !== "tangier")
            .map((id) => (
              <li key={id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-fg-2 ring-1 ring-line">
                <span className="size-1.5 rounded-full bg-primary" />
                {cities[id]}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
