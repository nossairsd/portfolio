"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { copyEmail } from "@/components/layout/command-menu";
import { GithubIcon } from "@/components/ui/brand-icon";
import { site } from "@/lib/site";

/** The two things a recruiter reaches for next: my email, and my code. */
export function HeroLinks({ copyLabel, copiedLabel }: { copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyEmail(copiedLabel);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <button
        type="button"
        onClick={onCopy}
        aria-label={copyLabel}
        className="group inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-3 text-fg-2 transition-colors hover:text-fg"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white text-muted ring-1 ring-line transition-colors group-hover:text-primary">
          {copied ? <Check aria-hidden className="size-3.5 text-success" /> : <Copy aria-hidden className="size-3.5" />}
        </span>
        <span className="font-mono text-[0.8125rem]">{site.email}</span>
      </button>
      <span aria-hidden className="hidden h-4 w-px bg-line-strong sm:block" />
      <a
        href={site.github}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-3 text-fg-2 transition-colors hover:text-fg"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white text-muted ring-1 ring-line transition-colors group-hover:text-fg">
          <GithubIcon className="size-3.5" />
        </span>
        <span className="font-mono text-[0.8125rem]">nossairsd</span>
      </a>
    </div>
  );
}
