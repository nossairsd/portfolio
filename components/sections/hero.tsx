import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BlurText } from "@/components/motion/blur-text";
import { FadeIn } from "@/components/motion/fade-in";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { monthsSince, site } from "@/lib/site";
import { HeroBackdrop } from "./hero-backdrop";
import { HeroLinks } from "./hero/hero-links";
import { HeroVisual } from "./hero/hero-visual";
import { RotatingWord } from "./hero/rotating-word";
import { StatusBadge } from "./hero/status-badge";

export async function Hero() {
  const t = await getTranslations("hero");
  const locale = (await getLocale()) as Locale;
  const months = monthsSince(site.kohlerStart);

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop />

      <div className="container-page grid items-center gap-12 pb-20 pt-28 md:pt-32 lg:min-h-[min(100svh,58rem)] lg:grid-cols-12 lg:gap-6 lg:pb-16 lg:pt-28">
        <div className="relative z-10 lg:col-span-7">
          <FadeIn y={-8}>
            <StatusBadge status={t("status")} detail={t("mobility")} />
          </FadeIn>

          <h1 className="mt-8">
            <BlurText
              text="Nossair Sedki"
              delay={0.1}
              charClassName="text-ink pb-[0.08em]"
              className="block text-[clamp(3rem,6.3vw,5.75rem)] font-medium leading-[0.95] tracking-[-0.05em]"
            />
            <FadeIn as="span" delay={0.55} y={12} className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[clamp(1.25rem,2.3vw,2rem)] font-medium leading-tight tracking-[-0.03em] text-fg">
              <span>{t("rolePrefix")}</span>
              <RotatingWord words={t.raw("roles") as string[]} />
            </FadeIn>
          </h1>

          <FadeIn delay={0.7}>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
              <span className="font-medium text-fg-2">
                {t("headlineLead")} {t("headlineQuiet")}
              </span>{" "}
              {t("intro")}
            </p>
          </FadeIn>

          <FadeIn delay={0.82} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="#projects" size="lg" className="pr-2">
              {t("ctaProjects")}
              <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover/button:translate-x-0.5">
                <ArrowRight aria-hidden className="size-4" />
              </span>
            </ButtonLink>
            <ButtonLink href={site.cv[locale]} download variant="secondary" size="lg">
              <ArrowDownToLine aria-hidden className="size-4" />
              {t("ctaCv")}
            </ButtonLink>
          </FadeIn>

          <FadeIn delay={0.95} className="mt-8 border-t border-line pt-6">
            <HeroLinks copyLabel={t("copyEmail")} copiedLabel={t("copied")} />
          </FadeIn>
        </div>

        <div className="relative lg:col-span-5">
          <HeroVisual
            alt={t("portraitAlt")}
            locale={locale}
            place={t("localTime")}
            terminal={{
              title: t("terminal.title"),
              command: t("terminal.command"),
              lint: t("terminal.lint"),
              tests: t("terminal.tests"),
              build: t("terminal.build"),
              deploy: t("terminal.deploy"),
              passed: t("terminal.passed"),
              live: t("terminal.live"),
              role: t("terminal.role"),
              company: t("terminal.company"),
              months: t("terminal.months", { count: months }),
            }}
          />
        </div>
      </div>
    </section>
  );
}
