/**
 * Facts that do not change with the language: links, dates, file paths,
 * coordinates. Everything a visitor reads lives in messages/{fr,en}.json.
 */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nossair-sedki.vercel.app",
  name: "Nossair Sedki",
  email: "nossair.sedki.eng@gmail.com",
  github: "https://github.com/nossairsd",
  timeZone: "Africa/Casablanca",
  /** First day at Groupe Kohler as a Software Engineer. */
  kohlerStart: "2025-10-01",
  cv: {
    fr: "/cv/Nossair-Sedki-CV-FR.pdf",
    en: "/cv/Nossair-Sedki-CV-EN.pdf",
  },
  metaAds: {
    demo: "https://meta-ads-report-studio.vercel.app/",
    repo: "https://github.com/nossairsd/meta-ads-report-studio",
  },
} as const;

export type CityId = "tangier" | "paris" | "lyon" | "brussels" | "geneva" | "luxembourg" | "amsterdam";

/** Home, then the places the contact globe draws a route to. */
export const CITIES: Record<CityId, { lat: number; lon: number }> = {
  tangier: { lat: 35.7595, lon: -5.834 },
  paris: { lat: 48.8566, lon: 2.3522 },
  lyon: { lat: 45.764, lon: 4.8357 },
  brussels: { lat: 50.8503, lon: 4.3517 },
  geneva: { lat: 46.2044, lon: 6.1432 },
  luxembourg: { lat: 49.6116, lon: 6.1319 },
  amsterdam: { lat: 52.3676, lon: 4.9041 },
};

/** Whole calendar months elapsed since an ISO date, so the site never goes stale. */
export function monthsSince(isoDate: string, now: Date = new Date()): number {
  const start = new Date(isoDate);
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}
