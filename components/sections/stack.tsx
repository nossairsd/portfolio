import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";
import { StackTrack, type Layer } from "./stack-track";

export async function Stack() {
  const t = await getTranslations("stack");
  const layers = t.raw("layers") as Layer[];
  const transversal = t.raw("transversal") as Layer[];

  return (
    <section id="stack" className="relative scroll-mt-24 border-y border-line bg-bg-subtle">
      <div className="container-page pt-24 md:pt-32">
        <SectionHeading index="05" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} intro={t("intro")} />
      </div>

      <StackTrack layers={layers} />

      <div className="container-page pb-24 md:pb-32">
        <FadeIn className="mb-6 flex items-center gap-4">
          <h3 className="eyebrow">{t("transversalTitle")}</h3>
          <span className="h-px flex-1 bg-line" />
        </FadeIn>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {transversal.map((group, i) => (
            <FadeIn key={group.name} delay={i * 0.05} className="card-surface p-5">
              <dt className="text-sm font-semibold tracking-tight">{group.name}</dt>
              <dd className="mt-3 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span key={item} className="rounded-md bg-bg-muted px-2 py-1 text-xs text-fg-2">
                    {item}
                  </span>
                ))}
              </dd>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  );
}
