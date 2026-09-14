import { getLocale, getTranslations } from "next-intl/server";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { FadeIn } from "@/components/motion/fade-in";
import { monthsSince, site } from "@/lib/site";

export async function Proof() {
  const t = await getTranslations("proof");
  const locale = await getLocale();
  const orgs = t.raw("orgs") as string[];
  const percent = locale === "fr" ? " %" : "%";

  const stats = [
    { value: monthsSince(site.kohlerStart), prefix: undefined, suffix: undefined, label: t("months") },
    { value: 65, prefix: "−", suffix: percent, label: t("processing") },
    { value: 80, prefix: "−", suffix: percent, label: t("errors") },
    { value: 265, prefix: undefined, suffix: undefined, label: t("tests") },
  ];

  return (
    <section id="stats" aria-label={t("label")} className="relative pb-8">
      <div className="container-page">
        <FadeIn className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <p className="eyebrow">{t("label")}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {orgs.map((org) => (
              <li key={org} className="text-lg font-semibold tracking-tight text-fg/35 transition-colors hover:text-fg/70">
                {org}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.1} className="card-surface mt-8 grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="border-line p-6 md:p-8 [&:nth-child(-n+2)]:border-b odd:border-r lg:border-r lg:last:border-r-0 lg:[&:nth-child(-n+2)]:border-b-0"
            >
              <p className="text-[clamp(2.25rem,4.4vw,3.25rem)] font-medium leading-none tracking-[-0.04em] text-fg">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} locale={locale} className="tabular-nums" />
              </p>
              <p className="mt-3 max-w-[15rem] text-sm leading-snug text-muted">{stat.label}</p>
              <span aria-hidden className="mt-5 block h-1 w-10 rounded-full bg-gradient-to-r from-primary to-primary-300" style={{ opacity: 1 - i * 0.18 }} />
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
