"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooths the scroll, GSAP's ticker drives it, and ScrollTrigger is told
 * about every scroll step: one clock for smooth scrolling, scroll-linked
 * animations and the 3D scenes that read ScrollTrigger progress.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = lenisRef.current?.lenis;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const onScroll = () => ScrollTrigger.update();

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis?.on("scroll", onScroll);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.off("scroll", onScroll);
    };
  }, [reduce]);

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, duration: 1.1, anchors: { offset: -88 } }}>
      {children}
    </ReactLenis>
  );
}
