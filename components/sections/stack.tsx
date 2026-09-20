import { getTranslations } from "next-intl/server";
import { SheetBackground } from "@/components/motion/sheet-background";
import { SectionHeading } from "@/components/ui/section-heading";
import { StackTrack, type Layer } from "./stack-track";
import { Transverse, type TransverseGroup } from "./stack/transverse";

export async function Stack() {
  const t = await getTranslations("stack");
  const layers = t.raw("layers") as Layer[];
  const transversal = t.raw("transversal") as TransverseGroup[];

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
        <Transverse
          groups={transversal}
          layers={layers.map((layer) => layer.name)}
          labels={{ title: t("transversalTitle"), intro: t("transversalIntro"), caption: t("transversalCaption") }}
        />
      </div>
    </section>
  );
}
