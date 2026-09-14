"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LaptopView } from "@/components/three/lazy";
import { GithubIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { useScrollProgress } from "@/lib/use-scroll-progress";

export type Chapter = { title: string; text: string };

type Labels = {
  featured: string;
  name: string;
  tagline: string;
  year: string;
  summary: string;
  demo: string;
  code: string;
  caseStudy: string;
};

/** Mirrors the laptop scene: the lid opens over the first 22%, then a third per screen. */
function chapterAt(progress: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor(((progress - 0.22) / 0.78) * count)));
}

export function FeaturedProject({ chapters, stack, labels }: { chapters: Chapter[]; stack: string[]; labels: Labels }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const progress = useScrollProgress(track, { onChange: (p) => setActive(chapterAt(p, chapters.length)) });

  return (
    <div ref={track} className="relative mt-10" style={{ height: "340svh" }}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden pt-16">
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_65%_50%,#eff6ff,transparent_70%)]" />
        <div className="container-page relative grid h-full max-h-[48rem] grid-rows-[auto_1fr] items-center gap-4 lg:grid-cols-12 lg:grid-rows-1 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <Tag tone="primary">{labels.featured}</Tag>
              <span className="font-mono text-xs text-muted">{labels.year}</span>
            </div>
            <h3 className="mt-4 text-[clamp(1.875rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{labels.name}</h3>
            <p className="mt-1 text-lg text-primary">{labels.tagline}</p>
            <p className="mt-4 hidden leading-relaxed text-muted sm:block">{labels.summary}</p>

            <ol className="mt-6 space-y-1">
              {chapters.map((chapter, i) => (
                <li
                  key={chapter.title}
                  className={cn(
                    "relative rounded-xl px-4 py-3 transition-all duration-500",
                    i === active ? "bg-white shadow-[0_1px_2px_rgb(15_23_42/0.05),0_12px_28px_-16px_rgb(15_23_42/0.25)] ring-1 ring-line" : "opacity-50",
                    i !== active && "hidden sm:block",
                  )}
                >
                  <p className="flex items-center gap-3 font-semibold tracking-tight">
                    <span className={cn("font-mono text-xs", i === active ? "text-primary" : "text-subtle")}>0{i + 1}</span>
                    {chapter.title}
                  </p>
                  <div className={cn("grid transition-[grid-template-rows] duration-500", i === active ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <p className="overflow-hidden pl-7 text-sm leading-relaxed text-muted">
                      <span className="block pt-1.5">{chapter.text}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 hidden flex-wrap gap-1.5 md:flex">
              {stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
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

          <div className="relative h-full min-h-0 lg:col-span-7">
            <LaptopView progress={progress} className="absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
