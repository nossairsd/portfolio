"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the intro loader has lifted. The hero waits for it, so its entrance
 * plays in view instead of behind the loader. Visits that skip the loader
 * (already seen this session, reduced motion) mark it done straight away.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIntroReady() {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}

export const INTRO_KEY = "ns-intro-seen";
