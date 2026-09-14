import { ArrowDown, ArrowDownToLine } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BlurText } from "@/components/motion/blur-text";
import { FadeIn } from "@/components/motion/fade-in";
import { SplitReveal } from "@/components/motion/split-reveal";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { monthsSince, site } from "@/lib/site";
import { HeroBackdrop } from "./hero-backdrop";
import { HeroPortrait } from "./hero-portrait";

export async function Hero() {
  const t = await getTranslations("hero");
  const locale = (await getLocale()) as Locale;

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />

      <div className="container-page grid items-center gap-14 pb-16 pt-32 md:pt-36 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-40">
        <div className="lg:col-span-7">
          <FadeIn y={-6}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-2 pr-3.5 text-[0.8125rem] font-medium text-fg-2 shadow-[0_1px_2px_rgb(15_23_42/0.06)] ring-1 ring-line backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-success" />
                <span className="relative size-2 rounded-full bg-success" />
              </span>
              {t("availability")}
            </span>
          </FadeIn>

          <h1 className="mt-7">
            <span className="eyebrow block">{t("role")}</span>
            <BlurText
              text="Nossair Sedki"
              delay={0.1}
              charClassName="text-ink pb-[0.08em]"
              className="mt-3 block text-[clamp(3.25rem,8.2vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.045em]"
            />
          </h1>

          <SplitReveal
            as="p"
            immediate
            delay={0.55}
            className="mt-5 max-w-2xl text-[clamp(1.5rem,2.7vw,2.25rem)] font-medium leading-[1.14] tracking-[-0.03em] text-balance"
          >
            <span className="text-fg">{t("headlineLead")}</span> <span className="text-quiet">{t("headlineQuiet")}</span>
          </SplitReveal>

          <FadeIn delay={0.75}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-[1.0625rem]">{t("intro")}</p>
          </FadeIn>

          <FadeIn delay={0.85} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="#projects" size="lg">
              {t("ctaProjects")}
              <ArrowDown aria-hidden className="size-4 transition-transform duration-300 group-hover/button:translate-y-0.5" />
            </ButtonLink>
            <ButtonLink href={site.cv[locale]} download variant="secondary" size="lg">
              <ArrowDownToLine aria-hidden className="size-4" />
              {t("ctaCv")}
            </ButtonLink>
          </FadeIn>

          <FadeIn delay={0.95} className="mt-10 flex items-center gap-3 text-sm text-muted">
            <span className="grid size-8 place-items-center rounded-lg bg-white font-mono text-[0.625rem] font-semibold text-fg ring-1 ring-line">
              JD
            </span>
            <span>
              <span className="text-subtle">{t("currentLabel")} · </span>
              <span className="font-medium text-fg-2">{t("currentValue")}</span>
            </span>
          </FadeIn>
        </div>

        <div className="lg:col-span-5">
          <HeroPortrait
            alt={t("portraitAlt")}
            locale={locale}
            months={monthsSince(site.kohlerStart)}
            labels={{ months: t("chipMonths"), tests: t("chipTests"), cloud: t("chipCloud") }}
          />
        </div>
      </div>
    </section>
  );
}
