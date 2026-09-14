import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { ArchDiagram, PROJECT_ARCHITECTURES } from "@/components/ui/arch-diagram";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Tag } from "@/components/ui/tag";
import { FeaturedProject, type Chapter } from "./featured-project";

type OtherProject = {
  id: string;
  name: string;
  context: string;
  summary: string;
  result: string;
  stack: string[];
  confidential: boolean;
};

export async function Projects() {
  const t = await getTranslations("projects");
  const others = t.raw("others") as OtherProject[];

  return (
    <section id="projects" className="relative scroll-mt-24 pt-24 md:pt-32">
      <div className="container-page">
        <SectionHeading index="04" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} />
      </div>

      <FeaturedProject
        chapters={t.raw("metaAds.chapters") as Chapter[]}
        stack={t.raw("metaAds.stack") as string[]}
        labels={{
          featured: t("featured"),
          name: t("metaAds.name"),
          tagline: t("metaAds.tagline"),
          year: t("metaAds.year"),
          summary: t("metaAds.summary"),
          demo: t("metaAds.demo"),
          code: t("metaAds.code"),
          caseStudy: t("metaAds.caseStudy"),
        }}
      />

      <div className="container-page pb-24 md:pb-32">
        <FadeIn className="mb-8 flex items-center gap-4">
          <h3 className="eyebrow">{t("othersTitle")}</h3>
          <span className="h-px flex-1 bg-line" />
        </FadeIn>
        <ul className="grid gap-4 md:grid-cols-3">
          {others.map((project, i) => (
            <FadeIn as="li" key={project.id} delay={i * 0.08}>
              <SpotlightCard as="article" className="h-full" innerClassName="flex h-full flex-col p-5 md:p-6">
                <ArchDiagram columns={PROJECT_ARCHITECTURES[project.id] ?? []} />
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted">{project.context}</span>
                  {project.confidential ? (
                    <span className="inline-flex items-center gap-1 text-xs text-subtle">
                      <Lock aria-hidden className="size-3" />
                      {t("confidential")}
                    </span>
                  ) : null}
                </div>
                <h4 className="mt-2 text-lg font-semibold tracking-tight">{project.name}</h4>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{project.summary}</p>
                <div className="mt-5 rounded-xl bg-primary-soft px-4 py-3">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-primary/70">{t("result")}</p>
                  <p className="mt-0.5 font-semibold text-primary-strong">{project.result}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
