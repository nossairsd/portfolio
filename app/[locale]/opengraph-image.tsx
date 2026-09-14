import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Nossair Sedki, Software Engineer Full-Stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const portrait = await readFile(join(process.cwd(), "public/images/nossair-sedki.png"));
  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 70%)",
          color: "#0b1220",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 60,
            width: 470,
            height: 570,
            borderRadius: 40,
            background: "linear-gradient(180deg, #dbeafe 0%, #ffffff 90%)",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "58%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: "#334155",
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.1)",
              borderRadius: 999,
              padding: "10px 20px",
              alignSelf: "flex-start",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#16a34a" }} />
            {t("status")} · {t("mobility")}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, letterSpacing: 3, color: "#64748b", textTransform: "uppercase" }}>{t("role")}</div>
            <div style={{ fontSize: 100, fontWeight: 600, letterSpacing: -4, lineHeight: 1, marginTop: 16 }}>Nossair Sedki</div>
            <div style={{ display: "flex", fontSize: 34, marginTop: 20, color: "#94a3b8" }}>{t("headlineQuiet")}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#334155" }}>
            <div style={{ width: 44, height: 8, borderRadius: 999, background: "#2563eb" }} />
            {t("currentValue")}
          </div>
        </div>
        {/* next/og renders plain elements only: next/image does not apply here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={portraitSrc} alt="" width={440} height={541} style={{ position: "absolute", right: 55, bottom: 0 }} />
      </div>
    ),
    size,
  );
}
