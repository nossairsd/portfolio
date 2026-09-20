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

export type CityId = "tangier" | "paris" | "london" | "berlin" | "dubai" | "montreal" | "remote";

/** Home, then the places the contact globe draws a route to. */
export const CITIES: Record<CityId, { lat: number; lon: number }> = {
  tangier: { lat: 35.7595, lon: -5.834 },
  paris: { lat: 48.8566, lon: 2.3522 },
  london: { lat: 51.5072, lon: -0.1276 },
  berlin: { lat: 52.52, lon: 13.405 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  montreal: { lat: 45.5019, lon: -73.5674 },
  remote: { lat: 1.3521, lon: 103.8198 },
};

/** Whole calendar months elapsed since an ISO date, so the site never goes stale. */
export function monthsSince(isoDate: string, now: Date = new Date()): number {
  const start = new Date(isoDate);
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}
