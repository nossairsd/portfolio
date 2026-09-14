"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Tells ScrollTrigger about every Lenis scroll step. Must sit inside ReactLenis. */
function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

/**
 * Lenis smooths the scroll and GSAP's ticker drives it: one clock for smooth
 * scrolling, scroll-linked animations and the 3D scenes reading ScrollTrigger.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    // ReactLenis creates its instance in an effect and exposes it only after a
    // re-render, so it is not there yet when this effect runs. Look it up on
    // every tick instead of capturing it once: capturing `undefined` meant
    // Lenis swallowed wheel events and nothing ever advanced the scroll.
    const tick = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, [reduce]);

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, duration: 1.1, anchors: { offset: -88 } }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
