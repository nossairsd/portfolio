import { ArrowUpRight, ArrowUp } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { HorizonView } from "@/components/three/lazy";
import { GithubIcon } from "@/components/ui/brand-icon";
import { LocalTime } from "@/components/ui/local-time";
import { LogoMark } from "@/components/ui/logo";
import { site } from "@/lib/site";

const SECTIONS = ["about", "process", "experience", "projects", "stack", "contact"] as const;

/**
 * The end of the page, built like the last screen of a console: the address to
 * write to, the state of the station (available, local time), the way back to
 * every section, and the name standing on a horizon that keeps running.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const contact = await getTranslations("contact");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-bg-subtle">
      <div className="container-page relative pt-16 md:pt-20">
        {/* Write to me: the one thing this page is for. */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 border-b border-line pb-10">
          <div className="min-w-0">
            <p className="eyebrow">{t("cta")}</p>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(contact("subject"))}`}
              className="group mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[clamp(1.5rem,3.6vw,2.6rem)] font-semibold tracking-[-0.04em] text-fg"
            >
              <span className="break-all decoration-primary/30 underline-offset-[6px] transition-colors group-hover:text-primary group-hover:underline">
                {site.email}
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-fg text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight aria-hidden className="size-5" />
              </span>
            </a>
          </div>

          <div className="flex flex-col items-start gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-fg-2 ring-1 ring-line">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                <span className="relative size-1.5 rounded-full bg-success" />
              </span>
              {nav("menuStatus")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-fg-2 ring-1 ring-line">
              <span className="size-1.5 rounded-full bg-primary" />
              {t("localTime")} · <LocalTime locale={locale} className="font-mono tabular-nums" />
            </span>
          </div>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <LogoMark className="size-10 rounded-xl text-sm" />
              <span className="leading-tight">
                <span className="block font-semibold tracking-tight">Nossair Sedki</span>
                <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">Software Engineer</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm leading-relaxed text-muted">{t("tagline")}</p>
          </div>

          <nav aria-label={t("sections")} className="md:col-span-3">
            <p className="eyebrow">{t("sections")}</p>
            <ul className="mt-4 space-y-2.5">
              {SECTIONS.map((id, i) => (
                <li key={id}>
                  <a href={`/${locale}#${id}`} className="group inline-flex items-baseline gap-2.5 text-fg-2 transition-colors hover:text-primary">
                    <span className="font-mono text-[0.6875rem] text-subtle transition-colors group-hover:text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {nav(id)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="eyebrow">{t("elsewhere")}</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-fg-2 transition-colors hover:text-primary"
                >
                  <GithubIcon className="size-4" />
                  GitHub
                  <ArrowUpRight aria-hidden className="size-3.5 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
              <li>
                <a
                  href={site.metaAds.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-fg-2 transition-colors hover:text-primary"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  Meta Ads Report Studio
                  <ArrowUpRight aria-hidden className="size-3.5 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
              <li className="flex flex-wrap gap-2 pt-1.5">
                <a
                  href={site.cv.fr}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-fg-2 ring-1 ring-line transition-colors hover:text-primary hover:ring-primary/40"
                >
                  {contact("cvFr")}
                </a>
                <a
                  href={site.cv.en}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-fg-2 ring-1 ring-line transition-colors hover:text-primary hover:ring-primary/40"
                >
                  {contact("cvEn")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col items-start justify-between gap-3 border-t border-line py-5 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          © {year} · {t("credit")}
        </p>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-subtle">v2026.09</span>
          <a href="#top" className="group inline-flex items-center gap-2 transition-colors hover:text-fg">
            {t("top")}
            <span className="grid size-7 place-items-center rounded-full ring-1 ring-line transition-colors group-hover:bg-white group-hover:ring-primary/40">
              <ArrowUp aria-hidden className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>

      {/* The name, standing on a floor that keeps running towards the horizon. */}
      <div className="relative h-[clamp(9rem,17vw,15rem)]">
        <HorizonView className="absolute inset-0" />
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -mb-[0.26em] select-none whitespace-nowrap text-center text-[clamp(4rem,15.5vw,14rem)] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(37_99_235/0.28)]"
        >
          Nossair Sedki
        </p>
      </div>
    </footer>
  );
}
