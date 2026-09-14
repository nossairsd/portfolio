import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProcessTrack, type Step } from "./process-track";

export async function Process() {
  const t = await getTranslations("process");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="process" className="relative scroll-mt-24 border-y border-line bg-bg-subtle">
      <div aria-hidden className="bg-dots absolute inset-x-0 top-0 h-96 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-page relative pt-24 md:pt-32">
        <SectionHeading index="02" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} intro={t("intro")} />
      </div>
      <ProcessTrack steps={steps} stepLabel={t("stepLabel")} />
    </section>
  );
}
