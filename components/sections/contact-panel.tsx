"use client";

import { ArrowDownToLine, ArrowUpRight, Copy, MapPin } from "lucide-react";
import { useRef } from "react";
import { copyEmail } from "@/components/layout/command-menu";
import { FadeIn } from "@/components/motion/fade-in";
import { GlobeView } from "@/components/three/lazy";
import { GithubIcon } from "@/components/ui/brand-icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { site, type CityId } from "@/lib/site";
import { useScrollProgress } from "@/lib/use-scroll-progress";

type Labels = {
  caption: string;
  email: string;
  write: string;
  copy: string;
  copied: string;
  github: string;
  cvFr: string;
  cvEn: string;
  location: string;
};

export function ContactPanel({ cities, labels }: { cities: Record<CityId, string>; labels: Labels }) {
  const globe = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(globe, { start: "top bottom", end: "center center" });

  return (
    <div className="mt-12 grid items-center gap-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <FadeIn className="card-surface p-2">
          <div className="rounded-2xl bg-bg-subtle p-5">
            <p className="text-sm text-muted">{labels.email}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <a href={`mailto:${site.email}`} className="min-w-0 truncate text-lg font-semibold tracking-tight hover:text-primary md:text-xl">
                {site.email}
              </a>
              <Button variant="secondary" size="sm" onClick={() => copyEmail(labels.copied)} aria-label={labels.copy}>
                <Copy aria-hidden className="size-3.5" />
                <span className="hidden sm:inline">{labels.copy}</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-2 pt-3">
            <ButtonLink href={`mailto:${site.email}`} className="col-span-2" size="lg">
              {labels.write}
              <ArrowUpRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href={site.cv.fr} download variant="secondary">
              <ArrowDownToLine aria-hidden className="size-4" />
              {labels.cvFr}
            </ButtonLink>
            <ButtonLink href={site.cv.en} download variant="secondary">
              <ArrowDownToLine aria-hidden className="size-4" />
              {labels.cvEn}
            </ButtonLink>
            <ButtonLink href={site.github} target="_blank" rel="noopener noreferrer" variant="ghost" className="col-span-2">
              <GithubIcon />
              {labels.github}
            </ButtonLink>
          </div>
        </FadeIn>
        <FadeIn delay={0.1} className="mt-5 flex items-center gap-2 text-sm text-muted">
          <MapPin aria-hidden className="size-4 text-primary" />
          {labels.location}
        </FadeIn>
      </div>

      <div className="lg:col-span-7">
        <div ref={globe} className="relative mx-auto aspect-square w-full max-w-[36rem]">
          <GlobeView progress={progress} home={cities.tangier} className="absolute inset-0" />
        </div>
        <p className="text-center text-sm font-medium text-fg-2">{labels.caption}</p>
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
