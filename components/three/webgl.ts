"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Progress } from "@/lib/use-scroll-progress";

let cached: boolean | null = null;

/**
 * Whether this browser can create a WebGL context at all: a disabled GPU, a
 * blocklisted driver, hardware acceleration switched off on a managed machine
 * or an embedded browser all say no. Probed once; the probe context is
 * released straight away.
 */
export function hasWebGL() {
  if (cached !== null) return cached;
  // `?no-webgl` forces the 2D versions, to check them on any machine.
  if (new URLSearchParams(window.location.search).has("no-webgl")) return (cached = false);
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    cached = Boolean(context);
  } catch {
    cached = false;
  }
  return cached;
}

const noop = () => () => {};

/** `null` on the server and during hydration, then the real answer. */
export function useWebGL(): boolean | null {
  return useSyncExternalStore(noop, hasWebGL, () => null);
}

/**
 * Runs `onFrame` with the smoothed scroll progress on every animation frame,
 * but only while `target` is on screen: the 2D fallbacks cost nothing when
 * they are out of view.
 */
export function useProgressFrame(
  target: React.RefObject<HTMLElement | null>,
  progress: Progress,
  onFrame: (smooth: number, time: number) => void,
  smoothing = 6,
) {
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let frame = 0;
    let last = 0;
    let smooth = progress.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (time: number) => {
      const delta = last ? Math.min(0.1, (time - last) / 1000) : 0;
      last = time;
      smooth = reduce ? progress.current : smooth + (progress.current - smooth) * (1 - Math.exp(-smoothing * delta));
      callback.current(smooth, time / 1000);
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      last = 0;
      if (entry.isIntersecting) frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, progress, smoothing]);
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
