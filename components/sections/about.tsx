import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { site } from "@/lib/site";
import type { DemoLabels } from "./about/demos";
import { Domains, type Focus } from "./about/domains";
import { Manifesto, type ManifestoNote } from "./about/manifesto";
import { RecedeOnExit } from "@/components/motion/recede-on-exit";
import { Principles } from "./about/principles";
import { ProfileSheet } from "./about/profile-sheet";

type Principle = { title: string; text: string };
type Language = { name: string; level: string; value: number };

export async function About() {
  const t = await getTranslations("about");
  const hero = await getTranslations("hero");
  const locale = (await getLocale()) as Locale;

  return (
    <section id="about" className="relative scroll-mt-24 pb-[calc(6rem+18svh)] md:pb-[calc(8rem+18svh)]">
      {/* The sheet's grab handle: this section arrives sliding over the one before. */}
      <span aria-hidden className="mx-auto block h-1 w-10 translate-y-4 rounded-full bg-fg/10" />

      <div className="container-page relative">
        <header className="pt-20 md:pt-28">
          <h2 className="sr-only">
            {t("titleLead")} {t("titleQuiet")}
          </h2>
          <Manifesto
            text={t("manifesto")}
            notes={t.raw("notes") as ManifestoNote[]}
            eyebrow={`01 — ${t("eyebrow")}`}
            byline={{ name: "Nossair Sedki", role: `${t("currentRole")} · ${t("currentCompany")}`, alt: hero("portraitAlt") }}
          />
        </header>

        {/* Steps back as the Process sheet slides over it. */}
        <RecedeOnExit>
          {/* Who, at a glance, next to what I build. */}
          <div className="mt-20 grid grid-cols-1 items-stretch gap-4 md:mt-28 lg:grid-cols-12 lg:gap-5">
            <div className="min-w-0 lg:col-span-5">
              <ProfileSheet
                locale={locale}
                cvHref={site.cv[locale]}
                languages={t.raw("languages") as Language[]}
                labels={{
                  name: "Nossair Sedki",
                  role: t("sheetRole"),
                  available: t("available"),
                  portraitAlt: hero("portraitAlt"),
                  currentLabel: t("currentLabel"),
                  currentRole: t("currentRole"),
                  currentCompany: t("currentCompany"),
                  currentSince: t("currentSince"),
                  locationLabel: t("locationLabel"),
                  city: t("city"),
                  localTime: t("localTime"),
                  mobilityLabel: t("mobilityLabel"),
                  mobility: t("mobilityValue"),
                  degreeLabel: t("degreeLabel"),
                  degreeTitle: t("degreeTitle"),
                  degreeDetail: t("degreeDetail"),
                  languagesLabel: t("languagesLabel"),
                  cv: t("downloadCv"),
                  contact: t("contact"),
                }}
              />
            </div>

            <div className="min-w-0 lg:col-span-7">
              <Domains
                label={t("focusLabel")}
                title={t("focusTitle")}
                stackLabel={t("stackLabel")}
                usedAtLabel={t("usedAtLabel")}
                items={t.raw("focus") as Focus[]}
                demo={t.raw("demo") as DemoLabels}
              />
            </div>
          </div>

          <div className="mt-16 md:mt-20">
            <Principles label={t("strengthsLabel")} items={t.raw("strengths") as Principle[]} />
          </div>
        </RecedeOnExit>
      </div>
    </section>
  );
}
