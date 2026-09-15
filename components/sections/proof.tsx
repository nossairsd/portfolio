import { getLocale, getTranslations } from "next-intl/server";
import { monthsSince, site } from "@/lib/site";
import { ProofPanel, type ProofStat } from "./proof-panel";

export async function Proof() {
  const t = await getTranslations("proof");
  const locale = await getLocale();
  const tags = t.raw("tags") as string[];
  const percent = locale === "fr" ? " %" : "%";

  const stats: ProofStat[] = [
    { kind: "months", value: monthsSince(site.kohlerStart), label: t("months"), tag: tags[0] },
    { kind: "delay", value: 65, prefix: "−", suffix: percent, label: t("processing"), tag: tags[1] },
    { kind: "errors", value: 80, prefix: "−", suffix: percent, label: t("errors"), tag: tags[2] },
    { kind: "tests", value: 265, label: t("tests"), tag: tags[3] },
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
        orgs: t.raw("orgs") as string[],
      }}
    />
  );
}
