import { getLocale, getTranslations } from "next-intl/server";
import { monthsSince, site } from "@/lib/site";
import { ProofPanel, type ProofStat } from "./proof-panel";

/**
 * Impact: one figure per place the work was done — the current role, the audit
 * platform, the product shipped on the side, and the mobile app before that —
 * so the record reads as a track record, not as one project.
 */
export async function Proof() {
  const t = await getTranslations("proof");
  const locale = await getLocale();
  const tags = t.raw("tags") as string[];
  const percent = locale === "fr" ? " %" : "%";

  const stats: ProofStat[] = [
    { kind: "months", value: monthsSince(site.kohlerStart), label: t("months"), tag: tags[0] },
    { kind: "audit", value: 65, prefix: "−", suffix: percent, label: t("auditDelay"), tag: tags[1] },
    { kind: "tests", value: 265, label: t("tests"), tag: tags[2] },
    { kind: "mobile", value: 3, suffix: ` ${t("monthsUnit")}`, label: t("mobile"), tag: tags[3] },
  ];

  return (
    <ProofPanel
      locale={locale}
      stats={stats}
      labels={{
        label: t("label"),
        eyebrow: t("eyebrow"),
        titleLead: t("titleLead"),
        titleQuiet: t("titleQuiet"),
        before: t("before"),
        after: t("after"),
        since: t("since"),
        delayCaption: t("delayCaption"),
        auditTitle: t("auditTitle"),
        auditLead: t("auditLead"),
        auditDelay: t("auditDelay"),
        auditErrors: t("auditErrors"),
        realtime: t("realtime"),
        orgs: t.raw("orgs") as string[],
      }}
    />
  );
}
