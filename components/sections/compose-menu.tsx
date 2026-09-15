"use client";

import { ArrowUpRight, ChevronDown, Copy, Mail } from "lucide-react";
import { siGmail } from "simple-icons";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { copyEmail } from "@/components/layout/command-menu";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export type ComposeLabels = {
  write: string;
  subject: string;
  gmail: string;
  outlook: string;
  app: string;
  copy: string;
  copied: string;
};

function OutlookMark() {
  return (
    <span aria-hidden className="grid size-4 place-items-center rounded-[4px] bg-[#0078D4] text-[0.5625rem] font-bold leading-none text-white">
      O
    </span>
  );
}

/**
 * "Write to me" that works for everyone. A plain mailto link does nothing when
 * no mail app is set up (common on work machines and in embedded browsers),
 * so the button offers the webmails recruiters actually use, the default app,
 * and copying the address, with the subject already filled in.
 */
export function ComposeMenu({ labels, className }: { labels: ComposeLabels; className?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const to = encodeURIComponent(site.email);
  const subject = encodeURIComponent(labels.subject);
  const options = [
    { key: "gmail", label: labels.gmail, href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}`, external: true },
    { key: "outlook", label: labels.outlook, href: `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${subject}`, external: true },
    { key: "app", label: labels.app, href: `mailto:${site.email}?subject=${subject}`, external: false },
  ];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative ${className ?? ""}`}>
      <Button size="lg" className="w-full" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((v) => !v)}>
        <Mail aria-hidden className="size-4" />
        {labels.write}
        <ChevronDown aria-hidden className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_0_0_1px_rgb(15_23_42/0.08),0_20px_40px_-16px_rgb(15_23_42/0.35)]"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center" }}
          >
            {options.map((option) => (
              <a
                key={option.key}
                role="menuitem"
                href={option.href}
                target={option.external ? "_blank" : undefined}
                rel={option.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fg-2 transition-colors hover:bg-bg-subtle hover:text-fg"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-white shadow-[0_0_0_1px_rgb(15_23_42/0.08)]">
                  {option.key === "gmail" ? (
                    <svg viewBox="0 0 24 24" aria-hidden className="size-4" style={{ fill: `#${siGmail.hex}` }}>
                      <path d={siGmail.path} />
                    </svg>
                  ) : option.key === "outlook" ? (
                    <OutlookMark />
                  ) : (
                    <Mail aria-hidden className="size-4 text-muted" />
                  )}
                </span>
                {option.label}
                {option.external ? <ArrowUpRight aria-hidden className="ml-auto size-4 text-subtle" /> : null}
              </a>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void copyEmail(labels.copied);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-fg-2 transition-colors hover:bg-bg-subtle hover:text-fg"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-white shadow-[0_0_0_1px_rgb(15_23_42/0.08)]">
                <Copy aria-hidden className="size-4 text-muted" />
              </span>
              {labels.copy}
              <span className="ml-auto truncate font-mono text-[0.6875rem] text-subtle max-sm:hidden">{site.email}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
