import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  // The primary market is France and French-speaking Europe.
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];
