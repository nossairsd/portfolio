/**
 * The featured project's scroll choreography, shared by the 3D laptop, its 2D
 * fallback and the chapters beside the stage so all three always agree.
 */

export const LAPTOP_SCREENS = ["overview", "alerts", "client", "client-charts", "home", "pricing"] as const;

/** Screens shown during each chapter of the description. */
export const SCREENS_PER_CHAPTER = 2;

export function screenSrc(name: (typeof LAPTOP_SCREENS)[number], compact: boolean) {
  return `/images/projects/screens/meta-ads-${name}${compact ? "-sm" : ""}.jpg`;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const SCREENS_FROM = 0.24;
const SCREENS_TO = 0.93;

export function laptopTimeline(p: number) {
  // The lid opens, the camera flies into the screen, the product plays, then
  // the camera eases back a little as the section ends.
  const open = smoothstep(p, 0.02, 0.14);
  const zoom = smoothstep(p, 0.12, 0.26) * (1 - 0.5 * smoothstep(p, 0.93, 1));
  const screen = clamp01((p - SCREENS_FROM) / (SCREENS_TO - SCREENS_FROM)) * 0.99999 * LAPTOP_SCREENS.length;
  const index = Math.floor(screen);
  const chapter = Math.min(Math.ceil(LAPTOP_SCREENS.length / SCREENS_PER_CHAPTER) - 1, Math.floor(index / SCREENS_PER_CHAPTER));
  const chapterProgress = clamp01((screen - chapter * SCREENS_PER_CHAPTER) / SCREENS_PER_CHAPTER);
  return { open, zoom, screen, index, local: screen - index, chapter, chapterProgress };
}

/** Opacity of screen `i` for a screen position: the next one fades in over the one below, which then leaves. */
export function screenOpacity(i: number, screen: number) {
  const last = LAPTOP_SCREENS.length - 1;
  const fadeIn = i === 0 ? 1 : smoothstep(screen, i - 0.14, i);
  const fadeOut = i === last ? 1 : 1 - smoothstep(screen, i + 1, i + 1.02);
  return fadeIn * fadeOut;
}
