import { Blocks, CloudCog, GraduationCap, Languages, MapPin, Sparkles } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { FadeIn } from "@/components/motion/fade-in";
import { LocalTime } from "@/components/ui/local-time";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Tag } from "@/components/ui/tag";
import { monthsSince, site } from "@/lib/site";

type Focus = { title: string; text: string };
type Language = { name: string; level: string; value: number };

const FOCUS_ICONS = [Blocks, CloudCog, Sparkles];

function CardLabel({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-muted">
      <Icon aria-hidden className="size-4 text-primary" strokeWidth={1.8} />
      {children}
    </p>
  );
}

export async function About() {
  const t = await getTranslations("about");
  const exp = await getTranslations("experience");
  const locale = await getLocale();
  const focus = t.raw("focus") as Focus[];
  const languages = t.raw("languages") as Language[];
  const strengths = t.raw("strengths") as Focus[];
  const months = monthsSince(site.kohlerStart);

  return (
    <section id="about" className="section-y relative scroll-mt-24">
      <div className="container-page">
        <SectionHeading index="01" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} />

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {/* Bio and focus */}
          <FadeIn className="md:col-span-6 lg:col-span-4">
            <SpotlightCard className="h-full" innerClassName="p-7 md:p-9">
              <p className="max-w-2xl text-[clamp(1.25rem,2vw,1.625rem)] font-medium leading-snug tracking-[-0.02em] text-fg">
                {t("bio")}
              </p>
              <p className="eyebrow mt-10">{t("focusLabel")}</p>
              <ul className="mt-4 grid gap-5 sm:grid-cols-3">
                {focus.map((item, i) => {
                  const Icon = FOCUS_ICONS[i] ?? Blocks;
                  return (
                    <li key={item.title}>
                      <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary-100">
                        <Icon aria-hidden className="size-5" strokeWidth={1.7} />
                      </span>
                      <p className="mt-4 font-semibold tracking-tight">{item.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.text}</p>
                    </li>
                  );
                })}
              </ul>
            </SpotlightCard>
          </FadeIn>

          {/* Current role */}
          <FadeIn delay={0.08} className="md:col-span-3 lg:col-span-2">
            <SpotlightCard className="h-full" innerClassName="flex flex-col p-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{t("currentLabel")}</p>
                <Tag tone="success">
                  <span className="mr-1.5 size-1.5 rounded-full bg-success" />
                  {exp("current")}
                </Tag>
              </div>
              <div className="mt-8 flex items-baseline gap-2">
                <AnimatedNumber value={months} locale={locale} className="text-6xl font-medium tracking-[-0.05em] tabular-nums" />
                <span className="text-muted">{exp("monthsUnit", { count: months }).replace(/^\d+\s*/, "")}</span>
              </div>
              <div className="mt-auto pt-8">
                <p className="text-lg font-semibold tracking-tight">{t("currentRole")}</p>
                <p className="text-fg-2">{t("currentCompany")}</p>
                <p className="mt-1 text-sm text-muted">{t("currentSince")}</p>
              </div>
            </SpotlightCard>
          </FadeIn>

          {/* Location with live clock */}
          <FadeIn delay={0.05} className="md:col-span-3 lg:col-span-2">
            <SpotlightCard className="h-full" innerClassName="relative flex flex-col p-7">
              <div aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_bottom_right,black,transparent_70%)]" />
              <CardLabel icon={MapPin}>{t("locationLabel")}</CardLabel>
              <p className="mt-6 text-2xl font-semibold tracking-tight">{t("city")}</p>
              <p className="mt-1 text-sm text-primary">{t("mobility")}</p>
              <div className="relative mt-auto flex items-end justify-between pt-10">
                <span className="text-sm text-muted">{t("localTime")}</span>
                <LocalTime locale={locale} className="font-mono text-3xl font-medium tabular-nums tracking-tight" />
              </div>
            </SpotlightCard>
          </FadeIn>

          {/* Languages */}
          <FadeIn delay={0.1} className="md:col-span-3 lg:col-span-2">
            <SpotlightCard className="h-full" innerClassName="p-7">
              <CardLabel icon={Languages}>{t("languagesLabel")}</CardLabel>
              <ul className="mt-6 space-y-4">
                {languages.map((language) => (
                  <li key={language.name} className="flex items-center justify-between gap-4">
                    <span>
                      <span className="block font-semibold tracking-tight">{language.name}</span>
                      <span className="block text-xs text-muted">{language.level}</span>
                    </span>
                    <span className="flex gap-1" aria-hidden>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`h-1.5 w-4 rounded-full ${i < language.value ? "bg-primary" : "bg-bg-muted"}`} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </FadeIn>

          {/* Degree */}
          <FadeIn delay={0.15} className="md:col-span-3 lg:col-span-2">
            <SpotlightCard className="h-full" innerClassName="flex flex-col p-7">
              <CardLabel icon={GraduationCap}>{t("degreeLabel")}</CardLabel>
              <p className="mt-6 text-xl font-semibold leading-snug tracking-tight">{t("degreeTitle")}</p>
              <p className="mt-auto pt-6 text-sm text-muted">{t("degreeDetail")}</p>
            </SpotlightCard>
          </FadeIn>

          {/* How I work */}
          <FadeIn delay={0.05} className="md:col-span-6">
            <SpotlightCard innerClassName="p-7 md:p-9">
              <p className="eyebrow">{t("strengthsLabel")}</p>
              <ol className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {strengths.map((strength, i) => (
                  <li key={strength.title} className="relative pl-5">
                    <span aria-hidden className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-primary to-transparent" />
                    <span className="font-mono text-xs text-primary">0{i + 1}</span>
                    <p className="mt-2 font-semibold tracking-tight">{strength.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{strength.text}</p>
                  </li>
                ))}
              </ol>
            </SpotlightCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
