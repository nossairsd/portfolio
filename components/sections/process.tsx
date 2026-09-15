import { getTranslations } from "next-intl/server";
import { SheetBackground } from "@/components/motion/sheet-background";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProcessTrack, type Step } from "./process-track";

export async function Process() {
  const t = await getTranslations("process");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="process" className="relative isolate -mt-[18svh] scroll-mt-24">
      <SheetBackground className="border-y border-line bg-bg-subtle shadow-[0_-30px_80px_-40px_rgb(15_23_42/0.35)]">
        <div className="bg-dots absolute inset-x-0 top-0 h-96 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </SheetBackground>
      <div className="container-page relative pt-24 md:pt-32">
        <SectionHeading index="02" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} intro={t("intro")} />
      </div>
      <ProcessTrack steps={steps} stepLabel={t("stepLabel")} />
    </section>
  );
}
