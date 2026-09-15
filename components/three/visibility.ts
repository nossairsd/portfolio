"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Which 3D views are close to the screen and which are actually on it, and a
 * warm-up that prepares them ahead of time.
 *
 * Creating a scene (geometry, textures, shader programs) blocks the main thread
 * for a noticeable moment. Doing it when a section scrolls in makes the page
 * stutter exactly while it is being read, so the canvas and then each scene
 * are created one at a time in idle moments shortly after load, never while
 * the visitor is scrolling. A view that comes near before its turn is mounted
 * right away. The canvas renders frames only while a view is on screen.
 */
const near = new Set<string>();
const visible = new Set<string>();
const listeners = new Set<() => void>();
let snapshot = { anyNear: false, anyVisible: false, warm: false };

function publish(patch: Partial<typeof snapshot> = {}) {
  const anyNear = near.size > 0;
  // Once a view has needed the canvas, it stays: destroying the WebGL context
  // when the visitor scrolls past and building it again on the way back costs
  // seconds of GPU work, and the scene would blink out in between.
  const warm = snapshot.warm || patch.warm === true || anyNear;
  const next = { ...snapshot, ...patch, warm, anyNear, anyVisible: visible.size > 0 };
  if (next.anyNear === snapshot.anyNear && next.anyVisible === snapshot.anyVisible && next.warm === snapshot.warm) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const server = { anyNear: false, anyVisible: false, warm: false };

export function useViewsState() {
  return useSyncExternalStore(subscribe, () => snapshot, () => server);
}

/* ------------------------------ idle warm-up ------------------------------ */

type Mounter = { id: string; mount: () => void; done: boolean };
const queue: Mounter[] = [];
let lastScroll = 0;
let started = false;

function whenIdle(task: () => void) {
  const run = () => {
    // Wait for a quiet moment: not while scrolling, and with room in the frame.
    if (performance.now() - lastScroll < 600) {
      window.setTimeout(() => whenIdle(task), 400);
      return;
    }
    task();
  };
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 200);
}

function warmNext() {
  const next = queue.find((m) => !m.done);
  if (!next) return;
  whenIdle(() => {
    if (!next.done) {
      next.done = true;
      next.mount();
    }
    // Leave a few frames between two heavy steps.
    window.setTimeout(warmNext, 700);
  });
}

/** Starts preparing 3D a little after the page has loaded. */
export function startWarmup() {
  if (started) return;
  started = true;
  window.addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true });
  const begin = () =>
    window.setTimeout(() => {
      whenIdle(() => {
        publish({ warm: true });
        window.setTimeout(warmNext, 900);
      });
    }, 1800);
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
}

/**
 * Tracks one view's container. Returns whether its scene should exist: once
 * the warm-up reaches it, or as soon as it comes within about a screen.
 */
export function useViewPresence(id: string, element: React.RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const entry: Mounter = { id, mount: () => setMounted(true), done: false };
    queue.push(entry);
    return () => {
      const index = queue.indexOf(entry);
      if (index >= 0) queue.splice(index, 1);
    };
  }, [id]);

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          near.add(id);
          setMounted(true);
        } else near.delete(id);
        publish();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    const visibleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
        publish();
      },
      { rootMargin: "10% 0px 10% 0px" },
    );
    nearObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
      near.delete(id);
      visible.delete(id);
      publish();
    };
  }, [id, element]);

  return mounted;
}
