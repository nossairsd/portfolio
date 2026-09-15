import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { SheetBackground } from "@/components/motion/sheet-background";
import { SectionHeading } from "@/components/ui/section-heading";
import { ToolIcon } from "./process/tools";
import { StackTrack, type Layer } from "./stack-track";

type Group = { name: string; items: string[] };

export async function Stack() {
  const t = await getTranslations("stack");
  const layers = t.raw("layers") as Layer[];
  const transversal = t.raw("transversal") as Group[];

  return (
    <section id="stack" className="relative isolate scroll-mt-24 overflow-x-clip">
      {/* A blueprint: pale blue paper with a fine blue grid. */}
      <SheetBackground className="border-y border-primary/10 bg-[#f2f6fd]">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(37_99_235/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(37_99_235/0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      </SheetBackground>

      <div className="container-page relative pt-24 md:pt-32">
        <SectionHeading index="05" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} intro={t("intro")} />
      </div>

      <StackTrack
        layers={layers}
        labels={{
          layerLabel: t("layerLabel"),
          client: t("client"),
          production: t("production"),
          live: t("live"),
        }}
      />

      <div className="container-page relative pb-24 md:pb-32">
        <FadeIn className="mb-6 flex items-center gap-4">
          <h3 className="eyebrow">{t("transversalTitle")}</h3>
          <span className="h-px flex-1 bg-primary/15" />
        </FadeIn>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {transversal.map((group, i) => (
            <FadeIn key={group.name} delay={i * 0.05} className="rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgb(15_23_42/0.07),0_10px_24px_-20px_rgb(15_23_42/0.35)]">
              <dt className="flex items-baseline justify-between gap-2">
                <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-fg">{group.name}</span>
                <span className="font-mono text-[0.6875rem] text-subtle">{String(group.items.length).padStart(2, "0")}</span>
              </dt>
              <dd className="mt-3">
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 rounded-lg p-1 text-sm text-fg-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f6f8fb] shadow-[0_0_0_1px_rgb(15_23_42/0.06)]">
                        <ToolIcon name={item} className="size-[1.125rem]" />
                      </span>
                      <span className="min-w-0 truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  );
}
