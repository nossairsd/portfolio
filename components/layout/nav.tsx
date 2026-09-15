"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type MotionValue,
} from "motion/react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ButtonLink } from "@/components/ui/button";
import { LetterRoll } from "@/components/motion/letter-rise";
import { useIntroReady } from "@/lib/intro";
import { LogoMark } from "@/components/ui/logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { OPEN_COMMAND_EVENT } from "./command-menu";

const SECTIONS = ["about", "process", "experience", "projects", "stack", "contact"] as const;
type SectionId = (typeof SECTIONS)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

const noop = () => () => {};
function useShortcutLabel() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );
}

/**
 * Which section sits under the middle of the viewport, and how far through it
 * the reader is. Progress lives in a motion value so the bar under the active
 * link moves every frame without re-rendering the navbar.
 */
function useSectionProgress(enabled: boolean) {
  const [active, setActive] = useState<SectionId | null>(null);
  const progress = useMotionValue(0);
  const { scrollY } = useScroll();
  // Section positions in page coordinates, measured when the layout changes
  // rather than on every scroll event, which would force a layout each frame.
  const bounds = useRef<{ id: SectionId; top: number; height: number }[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      bounds.current = SECTIONS.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const rect = el.getBoundingClientRect();
        return [{ id, top: rect.top + window.scrollY, height: rect.height }];
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [enabled]);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!enabled) return;
    const middle = y + window.innerHeight * 0.5;
    let current: SectionId | null = null;
    for (const section of bounds.current) {
      if (section.top <= middle && section.top + section.height >= middle) {
        current = section.id;
        progress.set(Math.min(1, Math.max(0, (middle - section.top) / section.height)));
        break;
      }
    }
    setActive((previous) => (previous === current ? previous : current));
  });

  return { active, progress };
}

function NavLink({
  id,
  index,
  label,
  href,
  active,
  hovered,
  progress,
  onHover,
}: {
  id: SectionId;
  index: number;
  label: string;
  href: string;
  active: boolean;
  hovered: boolean;
  progress: MotionValue<number>;
  onHover: (id: SectionId) => void;
}) {
  const smooth = useSpring(progress, { stiffness: 200, damping: 30 });
  return (
    <li className="relative" onMouseEnter={() => onHover(id)}>
      {hovered ? (
        <motion.span
          layoutId="nav-hover"
          className="absolute inset-0 rounded-full bg-fg/[0.045]"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      ) : null}
      <a
        href={href}
        aria-current={active ? "location" : undefined}
        className={cn(
          "relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium transition-colors duration-300",
          active ? "text-fg" : "text-fg/55 hover:text-fg",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "font-mono text-[0.5625rem] tabular-nums transition-colors duration-300",
            active ? "text-primary" : "text-fg/30",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {label}
        {active ? (
          <motion.span
            layoutId="nav-active-track"
            className="absolute inset-x-3 bottom-1 h-[2px] overflow-hidden rounded-full bg-primary/15"
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <motion.span style={{ scaleX: smooth }} className="block h-full origin-left rounded-full bg-primary" />
          </motion.span>
        ) : null}
      </a>
    </li>
  );
}

function MenuToggle({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      className="relative grid size-10 place-items-center rounded-full bg-fg text-white lg:hidden"
    >
      <span className="relative block h-3 w-4">
        <motion.span
          className="absolute left-0 top-0 block h-[1.5px] w-full rounded-full bg-current"
          animate={open ? { top: "50%", rotate: 45, y: "-50%" } : { top: "0%", rotate: 0, y: "0%" }}
          transition={{ duration: 0.35, ease: EASE }}
        />
        <motion.span
          className="absolute bottom-0 left-0 block h-[1.5px] rounded-full bg-current"
          animate={open ? { bottom: "50%", rotate: -45, y: "50%", width: "100%" } : { bottom: "0%", rotate: 0, y: "0%", width: "65%" }}
          transition={{ duration: 0.35, ease: EASE }}
        />
      </span>
    </button>
  );
}

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const shortcut = useShortcutLabel();
  const onHome = pathname === "/";

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { active, progress } = useSectionProgress(onHome);
  const introReady = useIntroReady();
  const { scrollYProgress } = useScroll();
  const pageProgress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Always on screen; it only compacts once the page moves.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/${locale}#${id}`);
  const openCommand = () => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => router.replace(pathname, { locale: next, scroll: false }));
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("skip")}
      </a>

      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={introReady ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-[60] px-3 pt-3 sm:px-5 sm:pt-4"
      >
        {/* Capsule: a hairline edge, compacting and lifting once the page moves. */}
        <div
          className={cn(
            "relative mx-auto rounded-full border transition-[max-width,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled || open
              ? "max-w-[66rem] border-fg/[0.1] shadow-[0_1px_2px_rgb(15_23_42/0.05),0_16px_40px_-18px_rgb(15_23_42/0.28)]"
              : "max-w-[72rem] border-fg/[0.07] shadow-[0_1px_2px_rgb(15_23_42/0.03)]",
          )}
        >
          <nav
            aria-label="Primary"
            className={cn(
              "relative flex h-14 items-center justify-between gap-2 overflow-hidden rounded-full pl-2 pr-2 transition-colors duration-500",
              // Opaque rather than blurred: a backdrop blur over scrolling content is re-rendered on every frame.
              scrolled || open ? "bg-white" : "bg-white/95",
            )}
          >
            <Link
              href="/"
              aria-label={t("home")}
              className="group flex items-center gap-2.5 rounded-full pr-2"
            >
              <span className="relative">
                <LogoMark />
                <span aria-hidden className="absolute -right-0.5 -top-0.5 grid size-3 place-items-center rounded-full bg-white">
                  <span className="size-1.5 rounded-full bg-success" />
                </span>
              </span>
              <span className="hidden flex-col leading-none sm:flex lg:hidden xl:flex">
                <LetterRoll text="Nossair Sedki" className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-fg" />
                <span className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-subtle">Software Engineer</span>
              </span>
            </Link>

            <ul className="hidden items-center lg:flex" onMouseLeave={() => setHovered(null)}>
              {SECTIONS.map((id, index) => (
                <NavLink
                  key={id}
                  id={id}
                  index={index}
                  label={t(id)}
                  href={href(id)}
                  active={active === id}
                  hovered={hovered === id}
                  progress={progress}
                  onHover={setHovered}
                />
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openCommand}
                aria-label={t("search")}
                className="hidden h-9 items-center gap-2 rounded-full pl-2.5 pr-1.5 text-fg/50 ring-1 ring-inset ring-fg/[0.08] transition-colors hover:bg-fg/[0.04] hover:text-fg md:flex"
              >
                <Search aria-hidden className="size-3.5" />
                <kbd className="rounded-full bg-fg/[0.05] px-2 py-0.5 font-mono text-[0.625rem] font-medium text-fg/60">{shortcut}</kbd>
              </button>

              <div role="group" aria-label={t("language")} className="hidden h-9 items-center rounded-full p-1 ring-1 ring-inset ring-fg/[0.08] sm:flex">
                {routing.locales.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => switchLocale(code)}
                    aria-pressed={code === locale}
                    className="relative h-full rounded-full px-2.5 font-mono text-[0.625rem] font-semibold uppercase tracking-wider"
                  >
                    {code === locale ? (
                      <motion.span
                        layoutId="locale-pill"
                        className="absolute inset-0 rounded-full bg-fg"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <span className={cn("relative transition-colors", code === locale ? "text-white" : "text-fg/45")}>{code}</span>
                  </button>
                ))}
              </div>

              <a
                href={href("contact")}
                className="group hidden h-10 items-center gap-2 rounded-full bg-fg pl-4 pr-1 text-[0.8125rem] font-medium text-white transition-colors hover:bg-primary lg:inline-flex"
              >
                {t("contactCta")}
                <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-white text-fg transition-colors group-hover:text-primary">
                  <ArrowRight aria-hidden className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-5" />
                  <ArrowRight aria-hidden className="absolute size-3.5 -translate-x-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                </span>
              </a>

              <MenuToggle open={open} onClick={() => setOpen((value) => !value)} label={open ? t("close") : t("menu")} />
            </div>

            {/* Reading progress along the bottom of the capsule. */}
            <motion.span
              aria-hidden
              style={{ scaleX: pageProgress }}
              className={cn(
                "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-primary transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0",
              )}
            />
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
            className="fixed inset-0 z-[55] bg-white/85 backdrop-blur-2xl lg:hidden"
          >
            <div aria-hidden className="bg-grid-fine absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
            <div className="relative flex h-full flex-col px-5 pb-8 pt-24">
              <nav aria-label="Mobile" className="flex-1">
                <ul>
                  {SECTIONS.map((id, i) => (
                    <motion.li
                      key={id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.55, ease: EASE, delay: 0.05 + i * 0.05 }}
                      className="border-b border-line"
                    >
                      <a
                        href={href(id)}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between py-4 text-[2rem] font-medium tracking-[-0.03em] text-fg"
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="font-mono text-xs text-primary">0{i + 1}</span>
                          {t(id)}
                        </span>
                        <ArrowUpRight aria-hidden className="size-5 text-subtle transition-transform group-active:translate-x-1" />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
                className="space-y-4"
              >
                <p className="flex items-center gap-2 text-sm text-muted">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-success" />
                    <span className="relative size-2 rounded-full bg-success" />
                  </span>
                  {t("menuStatus")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <ButtonLink href={site.cv[locale]} download variant="secondary" size="lg">
                    <ArrowDownToLine aria-hidden className="size-4" />
                    {t("cv")}
                  </ButtonLink>
                  <ButtonLink href={href("contact")} size="lg" onClick={() => setOpen(false)}>
                    {t("contactCta")}
                  </ButtonLink>
                </div>
                <div role="group" aria-label={t("language")} className="flex justify-center gap-6 text-sm font-semibold uppercase">
                  {routing.locales.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => switchLocale(code)}
                      aria-pressed={code === locale}
                      className={code === locale ? "text-fg" : "text-fg/40"}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
