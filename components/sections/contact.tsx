import { getTranslations } from "next-intl/server";
import type { CityId } from "@/lib/site";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactPanel } from "./contact-panel";

export async function Contact() {
  const t = await getTranslations("contact");

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_70%_70%,#eff6ff,transparent_70%)]" />
      <div className="container-page relative section-y">
        <SectionHeading index="07" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} intro={t("text")} />
        <ContactPanel
          cities={t.raw("cities") as Record<CityId, string>}
          labels={{
            caption: t("globeCaption"),
            email: t("emailLabel"),
            write: t("write"),
            copy: t("copy"),
            copied: t("copied"),
            github: t("github"),
            cvFr: t("cvFr"),
            cvEn: t("cvEn"),
            location: t("location"),
          }}
        />
      </div>
    </section>
  );
}
