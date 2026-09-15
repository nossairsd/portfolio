"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

/** The sequence needs a real screen of height to play in, and consent to motion. */
const QUERY = "(min-height: 700px) and (prefers-reduced-motion: no-preference)";
/** Scroll distance of the hero → impact transformation, in viewport heights. */
const ENTER = 1.25;
/** Scroll distance over which the next section slides over the panel. */
const EXIT = 1;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Local 0→1 progress of `p` between `a` and `b`. */
export const segment = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type SequenceState = { pinned: boolean; progress: MotionValue<number> };
const SequenceContext = createContext<SequenceState | null>(null);

/** Progress of the hero → impact transformation, for choreography inside it. */
export function useHeroSequence() {
  return useContext(SequenceContext);
}

function usePinnable() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(QUERY);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/**
 * The hero, the impact panel and the hand-off to the next section, scrubbed
 * by scroll in one continuous shot.
 *
 * 1. Once the hero has been read to its bottom, the stage sticks. The hero
 *    recedes and dims while the impact panel rises from below as a complete
 *    miniature card: never an empty shape.
 * 2. The card zooms up to fill the screen, its figures lock in and count up.
 * 3. The next section slides over it like a sheet while the panel sinks back.
 *
 * Everything moves with transforms and opacity only, so the compositor does
 * the work. Scrolling back plays it all in reverse. Without enough height, or
 * with reduced motion, the sections simply follow each other.
 */
export function HeroSequence({
  hero,
  next,
  children,
}: {
  hero: React.ReactNode;
  next: React.ReactNode;
  children: React.ReactNode;
}) {
  const pinned = usePinnable();
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heroBox = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const nextBox = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const metrics = useRef({ top: 0, h: 0, vh: 1 });
  const enter = useMotionValue(0);
  const exit = useMotionValue(0);
  const { scrollY } = useScroll();

  const update = (y: number) => {
    const { top, h, vh } = metrics.current;
    const base = y - top - (h - vh);
    enter.set(clamp01(base / (ENTER * vh)));
    exit.set(clamp01((base - ENTER * vh) / (EXIT * vh)));
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    if (pinned) update(y);
  });

  // Geometry lives on the DOM, not in state: measuring never re-renders.
  useEffect(() => {
    const trackEl = track.current;
    const stageEl = stage.current;
    const heroEl = heroBox.current;
    const panelEl = panel.current;
    const nextEl = nextBox.current;
    if (!trackEl || !stageEl || !heroEl || !panelEl || !nextEl) return;

    if (!pinned) {
      for (const el of [trackEl, stageEl, panelEl]) {
        el.style.height = "";
      }
      stageEl.style.top = "";
      nextEl.style.marginTop = "";
      enter.set(1);
      exit.set(0);
      return;
    }

    const measure = () => {
      // The small viewport height, stable while mobile browser bars move.
      const vh = probe.current?.offsetHeight || window.innerHeight;
      const h = Math.max(heroEl.offsetHeight, vh);
      stageEl.style.height = `${h}px`;
      stageEl.style.top = `${vh - h}px`;
      panelEl.style.height = `${vh}px`;
      trackEl.style.height = `${h + (ENTER + EXIT) * vh}px`;
      // The next section overlaps the last screen of the track: it reaches the
      // top of the viewport exactly when the stage lets go.
      nextEl.style.marginTop = `${-EXIT * vh}px`;
      metrics.current = { top: trackEl.getBoundingClientRect().top + window.scrollY, h, vh };
      update(window.scrollY);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heroEl);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // `update` only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned, enter, exit]);

  // Hero: recedes into a dimmed card.
  const heroScale = useTransform(enter, (p) => 1 - 0.08 * easeInOut(segment(p, 0, 0.6)));
  // The dark stage behind the hero fades in with the first movement, so the
  // hero's fixed rounded corners are invisible while it sits at rest.
  const stageShade = useTransform(enter, (p) => segment(p, 0, 0.04));
  const heroScrim = useTransform(enter, (p) => 0.5 * easeOut(segment(p, 0.02, 0.5)));
  const heroVisibility = useTransform(enter, (p) => (p >= 0.99 ? "hidden" : "visible"));

  // Panel: rises as a whole card, zooms to full screen, then sinks under the next section.
  const panelY = useTransform(enter, (p) => `${(1 - easeOut(segment(p, 0, 0.48))) * 105}%`);
  const panelScale = useTransform([enter, exit], ([p, q]: number[]) => {
    const zoom = 0.8 + 0.2 * easeInOut(segment(p, 0.2, 0.84));
    return zoom * (1 - 0.06 * easeInOut(q));
  });
  const panelScrim = useTransform(exit, (q) => 0.4 * q);

  return (
    <SequenceContext.Provider value={{ pinned, progress: enter }}>
      <div ref={probe} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 h-svh w-px" />
      <div ref={track} className="relative">
        {/* Corner radii are fixed, never animated: the hero and the panel fill the
            screen, and animating a radius would repaint all of it every frame. */}
        <div ref={stage} className={pinned ? "sticky overflow-hidden bg-white" : "relative"}>
          {pinned ? <motion.div aria-hidden className="absolute inset-0 bg-[#0b1220]" style={{ opacity: stageShade }} /> : null}
          <motion.div
            ref={heroBox}
            className={cn(
              "relative min-h-svh overflow-hidden bg-white [transform-origin:50%_calc(100%-50svh)]",
              pinned && "rounded-[2rem] will-change-transform",
            )}
            style={pinned ? { scale: heroScale, visibility: heroVisibility } : undefined}
          >
            {hero}
            {pinned ? (
              <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[70] bg-[#0b1220]" style={{ opacity: heroScrim }} />
            ) : null}
          </motion.div>

          <motion.div
            ref={panel}
            className={cn(
              pinned &&
                "absolute inset-x-0 bottom-0 z-[80] overflow-hidden rounded-[1.75rem] shadow-[0_40px_120px_-20px_rgb(2_6_23/0.55)] will-change-transform",
            )}
            style={pinned ? { y: panelY, scale: panelScale } : undefined}
          >
            {children}
            {pinned ? (
              <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-[#0b1220]" style={{ opacity: panelScrim }} />
            ) : null}
          </motion.div>
        </div>
      </div>

      <div
        ref={nextBox}
        className={cn(
          "relative bg-white",
          pinned && "rounded-t-[2.5rem] shadow-[0_-30px_80px_-30px_rgb(2_6_23/0.45)]",
        )}
      >
        {next}
      </div>
    </SequenceContext.Provider>
  );
}
