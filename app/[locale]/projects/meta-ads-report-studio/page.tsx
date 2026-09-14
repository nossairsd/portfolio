import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BellRing, FileText, LayoutDashboard, ShieldCheck, UserRound } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { SplitReveal } from "@/components/motion/split-reveal";
import { GithubIcon } from "@/components/ui/brand-icon";
import { ButtonLink } from "@/components/ui/button";
import { buttonClasses } from "@/components/ui/button-classes";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Tag } from "@/components/ui/tag";
import { site } from "@/lib/site";

type Feature = { title: string; text: string };
type Layer = { name: string; items: string[] };
type Metric = { value: string; label: string };

const FEATURE_ICONS = [LayoutDashboard, BellRing, UserRound, FileText];

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/meta-ads-report-studio">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("caseStudyTitle") },
    description: t("caseStudyDescription"),
    alternates: {
      canonical: `/${locale}/projects/meta-ads-report-studio`,
      languages: { fr: "/fr/projects/meta-ads-report-studio", en: "/en/projects/meta-ads-report-studio" },
    },
    openGraph: { title: t("caseStudyTitle"), description: t("caseStudyDescription"), images: ["/images/projects/meta-ads-overview.png"] },
  };
}

function Block({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 border-t border-line py-14 md:py-20 lg:grid-cols-12 lg:gap-10">
      <FadeIn className="lg:col-span-4">
        <span className="grid h-6 w-fit min-w-6 place-items-center rounded-md bg-primary-soft px-1.5 font-mono text-[0.6875rem] font-medium text-primary">
          {index}
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      </FadeIn>
      <div className="lg:col-span-8">{children}</div>
    </div>
  );
}

function BrowserShot({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(15_23_42/0.05),0_40px_90px_-40px_rgb(37_99_235/0.45)] ring-1 ring-line">
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-bg-subtle px-4" aria-hidden>
        <span className="size-2.5 rounded-full bg-slate-300" />
        <span className="size-2.5 rounded-full bg-slate-300" />
        <span className="size-2.5 rounded-full bg-slate-300" />
        <span className="mx-auto rounded-md bg-white px-3 py-0.5 font-mono text-[0.625rem] text-muted ring-1 ring-line">
          meta-ads-report-studio.vercel.app
        </span>
      </div>
      <Image src={src} alt={alt} width={2880} height={1800} quality={90} priority={priority} sizes="(min-width: 1152px) 1088px, 100vw" className="h-auto w-full" />
    </figure>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/projects/meta-ads-report-studio">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("caseStudy");
  const p = await getTranslations("projects.metaAds");
  const features = t.raw("features") as Feature[];
  const layers = t.raw("layers") as Layer[];
  const security = t.raw("security") as string[];
  const metrics = t.raw("metrics") as Metric[];
  const stack = p.raw("stack") as string[];

  return (
    <article className="relative">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(60%_60%_at_50%_0%,#dbeafe,transparent_70%)]" />
      <div aria-hidden className="bg-dots absolute inset-x-0 top-0 -z-10 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <header className="container-page pb-14 pt-32 md:pt-40">
        <FadeIn>
          <Link href={{ pathname: "/", hash: "projects" }} className="group inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {t("back")}
          </Link>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-10 flex items-center gap-2">
          <Tag tone="primary">{t("eyebrow")}</Tag>
          <span className="font-mono text-xs text-muted">{p("year")}</span>
        </FadeIn>

        <SplitReveal as="h1" immediate delay={0.1} className="mt-5 text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.045em]">
          <span className="text-ink">{p("name")}</span>
        </SplitReveal>
        <SplitReveal as="p" immediate delay={0.3} className="mt-5 max-w-3xl text-[clamp(1.375rem,2.5vw,2rem)] font-medium leading-[1.15] tracking-[-0.025em] text-balance">
          <span className="text-fg">{t("leadLead")}</span> <span className="text-quiet">{t("leadQuiet")}</span>
        </SplitReveal>

        <FadeIn delay={0.45} className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href={site.metaAds.demo} target="_blank" rel="noopener noreferrer" size="lg">
            {p("demo")}
            <ArrowUpRight aria-hidden className="size-4" />
          </ButtonLink>
          <ButtonLink href={site.metaAds.repo} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
            <GithubIcon />
            {p("code")}
          </ButtonLink>
        </FadeIn>

        <FadeIn delay={0.55}>
          <dl className="card-surface mt-14 grid overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("facts.year"), p("year")],
              [t("facts.role"), t("facts.roleValue")],
              [t("facts.type"), t("facts.typeValue")],
              [t("facts.stack"), stack.join(" · ")],
            ].map(([term, value]) => (
              <div key={term} className="border-b border-line p-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                <dt className="text-sm text-muted">{term}</dt>
                <dd className="mt-1.5 font-medium leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </header>

      <FadeIn className="container-page">
        <BrowserShot src="/images/projects/meta-ads-overview.png" alt={p("shotOverview")} priority />
      </FadeIn>

      <div className="container-page mt-16">
        <Block index="01" title={t("problemTitle")}>
          <FadeIn>
            <p className="text-xl leading-relaxed text-fg-2 md:text-2xl md:leading-relaxed">{t("problem")}</p>
          </FadeIn>
        </Block>

        <Block index="02" title={t("solutionTitle")}>
          <FadeIn>
            <p className="text-xl leading-relaxed text-fg-2 md:text-2xl md:leading-relaxed">{t("solution")}</p>
          </FadeIn>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? LayoutDashboard;
              return (
                <FadeIn as="li" key={feature.title} delay={i * 0.06}>
                  <SpotlightCard className="h-full" innerClassName="p-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary-100">
                      <Icon aria-hidden className="size-5" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{feature.text}</p>
                  </SpotlightCard>
                </FadeIn>
              );
            })}
          </ul>
          <FadeIn className="mt-10">
            <BrowserShot src="/images/projects/meta-ads-client.png" alt={p("shotClient")} />
          </FadeIn>
        </Block>

        <Block index="03" title={t("architectureTitle")}>
          <FadeIn>
            <p className="text-lg leading-relaxed text-muted">{t("architecture")}</p>
          </FadeIn>
          <ol className="mt-8 space-y-2">
            {layers.map((layer, i) => (
              <FadeIn as="li" key={layer.name} delay={i * 0.06} className="card-surface grid items-center gap-3 p-4 sm:grid-cols-[10rem_1fr]">
                <span className="flex items-center gap-3">
                  <span className="grid h-6 min-w-7 place-items-center rounded-md bg-primary text-[0.6875rem] font-semibold text-white">L{i + 1}</span>
                  <span className="font-semibold">{layer.name}</span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {layer.items.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </span>
              </FadeIn>
            ))}
          </ol>
        </Block>

        <Block index="04" title={t("securityTitle")}>
          <ul className="space-y-4">
            {security.map((item, i) => (
              <FadeIn as="li" key={item} delay={i * 0.05} className="flex gap-4">
                <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={1.8} />
                <p className="leading-relaxed text-fg-2">{item}</p>
              </FadeIn>
            ))}
          </ul>
        </Block>

        <Block index="05" title={t("qualityTitle")}>
          <FadeIn>
            <p className="text-lg leading-relaxed text-muted">{t("quality")}</p>
          </FadeIn>
          <dl className="card-surface mt-8 grid grid-cols-2 overflow-hidden md:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-line p-6 odd:border-r md:border-r md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0">
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <span className="block text-3xl font-medium tracking-[-0.03em] md:text-4xl">{metric.value}</span>
                  <span className="mt-2 block text-sm text-muted">{metric.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Block>
      </div>

      <section className="container-page pb-24 pt-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-white md:px-14 md:py-20">
            <div aria-hidden className="bg-dots absolute inset-0 opacity-20 [filter:invert(1)]" />
            <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.035em]">{t("ctaTitle")}</h2>
            <p className="relative mt-3 max-w-md text-lg text-white/80">{t("ctaText")}</p>
            <div className="relative mt-9 flex flex-wrap gap-3">
              <ButtonLink href={site.metaAds.demo} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
                {p("demo")}
                <ArrowUpRight aria-hidden className="size-4" />
              </ButtonLink>
              <Link href="/" className={buttonClasses("ghost", "lg", "text-white hover:bg-white/10 hover:text-white")}>
                <ArrowLeft aria-hidden className="size-4" />
                {t("next")}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </article>
  );
}
