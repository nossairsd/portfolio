import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { monthsSince, site } from "@/lib/site";
import { HeroBackground } from "./hero/hero-background";
import { HeroCopy } from "./hero/hero-copy";
import { HeroPortal } from "./hero/hero-portal";

export async function Hero() {
  const t = await getTranslations("hero");
  const locale = (await getLocale()) as Locale;
  const months = monthsSince(site.kohlerStart);

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />

      <div className="container-page grid items-center gap-12 pb-24 pt-28 md:pt-32 lg:min-h-[min(100svh,60rem)] lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-28">
        <div className="relative z-10 lg:col-span-7">
          <HeroCopy
            cvHref={site.cv[locale]}
            labels={{
              status: t("status"),
              mobility: t("mobility"),
              rolePrefix: t("rolePrefix"),
              roles: t.raw("roles") as string[],
              headlineLead: t("headlineLead"),
              headlineQuiet: t("headlineQuiet"),
              intro: t("intro"),
              ctaProjects: t("ctaProjects"),
              ctaCv: t("ctaCv"),
              copyEmail: t("copyEmail"),
              copied: t("copied"),
            }}
          />
        </div>

        <div className="relative lg:col-span-5">
          <HeroPortal
            alt={t("portraitAlt")}
            locale={locale}
            hud={{ online: t("hud.online") }}
            terminal={{
              title: t("terminal.title"),
              command: t("terminal.command"),
              lint: t("terminal.lint"),
              tests: t("terminal.tests"),
              build: t("terminal.build"),
              deploy: t("terminal.deploy"),
              passed: t("terminal.passed"),
              live: t("terminal.live"),
              running: t("terminal.running"),
              deployed: t("terminal.deployed"),
              role: t("terminal.role"),
              company: t("terminal.company"),
              months: t("terminal.months", { count: months }),
            }}
          />
        </div>
      </div>

      {/* HUD strip along the bottom edge */}
      <div className="container-page pointer-events-none absolute inset-x-0 bottom-6 hidden items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.2em] text-subtle lg:flex">
        <span className="flex items-center gap-3">
          <span className="relative h-8 w-px overflow-hidden bg-line-strong">
            <span className="absolute inset-x-0 top-0 h-3 animate-[scan_1.8s_ease-in-out_infinite] bg-primary" />
          </span>
          {t("scroll")}
        </span>
      </div>
    </section>
  );
}
