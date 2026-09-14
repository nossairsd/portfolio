"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowDownToLine, Menu, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";
import { OPEN_COMMAND_EVENT } from "./command-menu";

const SECTIONS = ["about", "process", "experience", "projects", "stack", "contact"] as const;

const itemIn = {
  hidden: { opacity: 0, y: -8 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const onHome = pathname === "/";

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Scroll-spy: the section crossing the middle of the viewport is active.
  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [onHome]);

  function switchLocale(next: Locale) {
    if (next === locale) return;
    startTransition(() => router.replace(pathname, { locale: next, scroll: false }));
  }

  const href = (id: string) => (onHome ? `#${id}` : `/${locale}#${id}`);
  const openCommand = () => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("skip")}
      </a>

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <motion.nav
          aria-label="Primary"
          initial={false}
          animate={scrolled ? "scrolled" : "top"}
          variants={{
            top: {
              maxWidth: 1152,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0)",
              borderColor: "rgba(15,23,42,0)",
              boxShadow: "0 0 0 rgba(15,23,42,0)",
              paddingLeft: 8,
              paddingRight: 8,
            },
            scrolled: {
              maxWidth: 1000,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.78)",
              borderColor: "rgba(15,23,42,0.07)",
              boxShadow: "0 12px 36px -12px rgba(15,23,42,0.18)",
              paddingLeft: 10,
              paddingRight: 8,
            },
          }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className={cn(
            "relative mx-auto flex h-14 w-full items-center justify-between gap-3 overflow-hidden border",
            scrolled && "backdrop-blur-xl backdrop-saturate-150",
          )}
        >
          <motion.div custom={0} variants={itemIn} initial="hidden" animate="show" className="shrink-0">
            <Link href="/" aria-label={t("home")} className="group flex items-center gap-2.5 rounded-full">
              <span className="relative grid size-9 place-items-center rounded-full bg-fg font-mono text-[0.6875rem] font-semibold tracking-tight text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]">
                NS
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-success" />
              </span>
              <span className="hidden flex-col leading-none sm:flex">
                <span className="text-[0.9375rem] font-semibold tracking-tight">Nossair Sedki</span>
                <span className="mt-1 text-[0.6875rem] text-muted">{t("available")}</span>
              </span>
            </Link>
          </motion.div>

          <ul className="hidden items-center gap-0.5 lg:flex" onMouseLeave={() => setHovered(null)}>
            {SECTIONS.map((id, i) => (
              <motion.li
                key={id}
                custom={i + 1}
                variants={itemIn}
                initial="hidden"
                animate="show"
                onMouseEnter={() => setHovered(id)}
                className="relative"
              >
                {hovered === id ? (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-full bg-fg/[0.05]"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                ) : null}
                <a
                  href={href(id)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors",
                    active === id ? "text-fg" : "text-fg/60 hover:text-fg",
                  )}
                >
                  {active === id ? (
                    <motion.span layoutId="nav-active" className="size-1.5 rounded-full bg-primary" />
                  ) : null}
                  {t(id)}
                </a>
              </motion.li>
            ))}
          </ul>

          <motion.div custom={8} variants={itemIn} initial="hidden" animate="show" className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openCommand}
              aria-label={t("search")}
              className="flex h-9 items-center gap-2 rounded-full px-2.5 text-fg/60 transition-colors hover:bg-fg/[0.05] hover:text-fg"
            >
              <Search aria-hidden className="size-4" />
              <kbd className="hidden rounded-md border border-line bg-white px-1.5 py-0.5 font-mono text-[0.625rem] text-muted md:inline">
                Ctrl K
              </kbd>
            </button>

            <div role="group" aria-label={t("language")} className="flex h-9 items-center rounded-full bg-fg/[0.05] p-1">
              {routing.locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLocale(code)}
                  aria-pressed={code === locale}
                  className="relative h-full rounded-full px-2.5 text-[0.6875rem] font-semibold uppercase"
                >
                  {code === locale ? (
                    <motion.span
                      layoutId="locale-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgb(15_23_42/0.14)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className={cn("relative", code === locale ? "text-fg" : "text-fg/45")}>{code}</span>
                </button>
              ))}
            </div>

            <ButtonLink href={site.cv[locale]} download size="sm" className="hidden sm:inline-flex">
              <ArrowDownToLine aria-hidden className="size-3.5" />
              {t("cv")}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? t("close") : t("menu")}
              aria-expanded={open}
              className="grid size-9 place-items-center rounded-full text-fg hover:bg-fg/[0.05] lg:hidden"
            >
              {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </motion.div>

          {/* Reading progress along the bottom edge of the island. */}
          <motion.span
            aria-hidden
            style={{ scaleX: progress }}
            className={cn(
              "absolute inset-x-6 bottom-0 h-px origin-left bg-gradient-to-r from-primary/0 via-primary to-primary/0 transition-opacity duration-500",
              scrolled ? "opacity-100" : "opacity-0",
            )}
          />
        </motion.nav>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="card-surface mx-auto mt-2 max-w-[1000px] origin-top p-3 lg:hidden"
            >
              <nav aria-label="Mobile" className="grid grid-cols-2 gap-1">
                {SECTIONS.map((id, i) => (
                  <a
                    key={id}
                    href={href(id)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[0.9375rem] font-medium text-fg-2 hover:bg-bg-muted"
                  >
                    <span className="font-mono text-[0.6875rem] text-primary">0{i + 1}</span>
                    {t(id)}
                  </a>
                ))}
              </nav>
              <ButtonLink href={site.cv[locale]} download size="lg" className="mt-3 w-full">
                <ArrowDownToLine aria-hidden className="size-4" />
                {t("cv")}
              </ButtonLink>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
