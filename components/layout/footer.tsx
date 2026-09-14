import { ArrowUp } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { LocalTime } from "@/components/ui/local-time";
import { site } from "@/lib/site";

const SECTIONS = ["about", "process", "experience", "projects", "stack", "contact"] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-subtle">
      <div className="container-page grid gap-12 pb-10 pt-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-lg font-semibold tracking-tight">Nossair Sedki</p>
          <p className="mt-3 max-w-sm leading-relaxed text-muted">{t("tagline")}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-fg-2 ring-1 ring-line">
            <span className="size-1.5 rounded-full bg-success" />
            {t("localTime")} · <LocalTime locale={locale} className="font-mono tabular-nums" />
          </p>
        </div>

        <nav aria-label={t("sections")} className="md:col-span-3">
          <p className="eyebrow">{t("sections")}</p>
          <ul className="mt-4 space-y-2.5">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`/${locale}#${id}`} className="text-fg-2 transition-colors hover:text-primary">
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
              <a href={`mailto:${site.email}`} className="text-fg-2 transition-colors hover:text-primary">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="text-fg-2 transition-colors hover:text-primary">
                GitHub
              </a>
            </li>
            <li>
              <a href={site.metaAds.demo} target="_blank" rel="noopener noreferrer" className="text-fg-2 transition-colors hover:text-primary">
                Meta Ads Report Studio
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col items-start justify-between gap-3 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          © {year} Nossair Sedki. {t("credit")}
        </p>
        <a href="#top" className="group inline-flex items-center gap-1.5 transition-colors hover:text-fg">
          {t("top")}
          <ArrowUp aria-hidden className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
        </a>
      </div>

      {/* Oversized wordmark, cropped by the bottom edge. */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.28em] select-none whitespace-nowrap text-center text-[clamp(4rem,15.5vw,14rem)] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(15_23_42/0.08)]"
      >
        Nossair Sedki
      </p>
    </footer>
  );
}
