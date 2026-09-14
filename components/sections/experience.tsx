import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { monthsSince, site } from "@/lib/site";
import { ExperienceList, type Role } from "./experience-list";

export async function Experience() {
  const t = await getTranslations("experience");
  const items = t.raw("items") as Omit<Role, "durationLabel">[];
  const kohlerMonths = monthsSince(site.kohlerStart);

  const roles: Role[] = items.map((item) => ({
    ...item,
    durationLabel: item.id === "kohler" ? t("monthsUnit", { count: kohlerMonths }) : (item.duration ?? ""),
  }));

  return (
    <section id="experience" className="section-y relative scroll-mt-24">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading compact index="03" eyebrow={t("eyebrow")} lead={t("titleLead")} quiet={t("titleQuiet")} intro={t("intro")} />
          </div>
        </div>
        <div className="lg:col-span-7">
          <ExperienceList
            roles={roles}
            labels={{ current: t("current"), scope: t("scope"), show: t("show"), hide: t("hide") }}
          />
        </div>
      </div>
    </section>
  );
}
