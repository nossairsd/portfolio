"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/lib/site";

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 15_000);
  return () => window.clearInterval(timer);
}

function snapshot(locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: site.timeZone,
  }).format(new Date());
}

/** The current time in Tangier, empty on the server so it never mismatches. */
export function LocalTime({ locale, className }: { locale: string; className?: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => snapshot(locale),
    () => "",
  );

  return (
    <time className={className} suppressHydrationWarning>
      {time || "--:--"}
    </time>
  );
}
