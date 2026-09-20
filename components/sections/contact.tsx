import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import type { CityId } from "@/lib/site";
import { ContactPanel } from "./contact-panel";

/**
 * The end of the visit: the address to write to, sitting beside the globe.
 * Everything a recruiter needs is in the first screen of the section, so the
 * "Contact" link in the navigation lands straight on the card.
 */
export async function Contact() {
  const t = await getTranslations("contact");
  const locale = await getLocale();

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-x-clip">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_70%_70%,#eff6ff,transparent_70%)]" />
      <div className="container-page relative flex min-h-[min(92svh,56rem)] flex-col justify-center py-16 md:py-20">
        <ContactPanel
          locale={locale}
          cities={t.raw("cities") as Record<CityId, string>}
          labels={{
            index: "07",
            eyebrow: t("eyebrow"),
            titleLead: t("titleLead"),
            titleQuiet: t("titleQuiet"),
            text: t("text"),
            caption: t("globeCaption"),
            email: t("emailLabel"),
            write: t("write"),
            copy: t("copy"),
            copied: t("copied"),
            github: t("github"),
            cvFr: t("cvFr"),
            cvEn: t("cvEn"),
            location: t("location"),
            mode: t("mode"),
            compose: {
              write: t("write"),
              subject: t("subject"),
              gmail: t("gmail"),
              outlook: t("outlook"),
              app: t("app"),
              copy: t("copyAddress"),
              copied: t("copied"),
            },
          }}
        />
      </div>
    </section>
  );
}
