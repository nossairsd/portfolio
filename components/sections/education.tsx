import { Award, GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Tag } from "@/components/ui/tag";

type Degree = { title: string; detail: string; school: string; period: string; honours: string };
type Certification = { title: string; issuer: string; status?: string };

export async function Education() {
  const t = await getTranslations("education");
  const degrees = t.raw("degrees") as Degree[];
  const certifications = t.raw("certifications") as Certification[];

  return (
    // Rides over the blueprint sheet of the stack as that one closes.
    <section id="education" className="section-y relative z-10 -mt-[7svh] scroll-mt-24 rounded-t-[2.5rem] bg-bg pt-[calc(6rem+7svh)]">
      <div className="container-page">
        <SectionHeading index="06" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} />

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            {degrees.map((degree, i) => (
              <FadeIn key={degree.title} delay={i * 0.08}>
                <SpotlightCard innerClassName="flex gap-5 p-6 md:p-7">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary-100">
                    <GraduationCap aria-hidden className="size-5" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted">{degree.period}</p>
                    <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight md:text-xl">{degree.title}</h3>
                    <p className="mt-1 text-sm text-muted">{degree.detail}</p>
                    <p className="mt-3 text-fg-2">{degree.school}</p>
                    <Tag tone="primary" className="mt-4">
                      {degree.honours}
                    </Tag>
                  </div>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.1} className="lg:col-span-5">
            <SpotlightCard className="h-full" innerClassName="p-6 md:p-7">
              <p className="flex items-center gap-2 text-sm font-medium text-muted">
                <Award aria-hidden className="size-4 text-primary" strokeWidth={1.8} />
                {t("certificationsTitle")}
              </p>
              <ul className="mt-5 divide-y divide-line">
                {certifications.map((cert) => (
                  <li key={cert.title} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium leading-snug">{cert.title}</p>
                      <p className="mt-1 text-sm text-muted">{cert.issuer}</p>
                    </div>
                    {cert.status ? <Tag className="shrink-0">{cert.status}</Tag> : null}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
