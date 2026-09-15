"use client";

import Image from "next/image";
import { motion, useAnimationFrame, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import {
  siDocker,
  siGithubactions,
  siJunit5,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siReact,
  siSap,
  siSpringboot,
  siTypescript,
} from "simple-icons";
import { LocalTime } from "@/components/ui/local-time";
import { useIntroReady } from "@/lib/intro";
import { useHeroSequence } from "../hero-sequence";
import { DeployTerminal, type TerminalLabels } from "./deploy-terminal";

const EASE = [0.16, 1, 0.3, 1] as const;

// Stage geometry, in viewBox units: the stage is 100 wide and 116 tall.
const VB_W = 100;
const VB_H = 116;

/** Every orbit shares this centre, on the portrait's chest: one system. */
const CENTER = { x: 50, y: 57 };

type Icon = { title: string; path: string; hex: string };
type Tech = { icon: Icon; label: string };

type Orbit = {
  id: string;
  rx: number;
  ry: number;
  /** Resting tilt of the orbit plane on screen, in degrees. */
  tilt: number;
  /** How far the plane sways around its resting tilt, in degrees. */
  sway: number;
  /** Radians per second; the sign alternates from one orbit to the next. */
  speed: number;
  phase: number;
  node: string;
  glyph: string;
  techs: Tech[];
};

/**
 * Three nested orbits around the same centre, like a small planetary system
 * seen at an angle: each has its own radius, tilt, pace and direction, and
 * each plane sways slowly, so the whole system feels alive without chaos.
 * The near half of every orbit passes in front of the portrait, the far half
 * behind it; the front halves only ever cross the chest, never the face.
 */
const ORBITS: Orbit[] = [
  {
    id: "inner",
    rx: 30,
    ry: 9,
    tilt: 12,
    sway: 3,
    speed: -0.26,
    phase: 0.4,
    node: "size-9",
    glyph: "size-4",
    techs: [
      { icon: siGithubactions, label: "GitHub Actions" },
      { icon: siSap, label: "SAP" },
      { icon: siJunit5, label: "JUnit" },
    ],
  },
  {
    id: "middle",
    rx: 42,
    ry: 12.5,
    tilt: -11,
    sway: 4,
    speed: 0.17,
    phase: 1.3,
    node: "size-10",
    glyph: "size-[18px]",
    techs: [
      { icon: siTypescript, label: "TypeScript" },
      { icon: siSpringboot, label: "Spring Boot" },
      { icon: siPostgresql, label: "PostgreSQL" },
      { icon: siOpenjdk, label: "Java" },
    ],
  },
  {
    id: "outer",
    rx: 54,
    ry: 16,
    tilt: 3,
    sway: 2.5,
    speed: -0.11,
    phase: 0,
    node: "size-11",
    glyph: "size-5",
    techs: [
      { icon: siReact, label: "React" },
      { icon: siNextdotjs, label: "Next.js" },
      { icon: siNodedotjs, label: "Node.js" },
      { icon: siDocker, label: "Docker" },
    ],
  },
];

const NODES = ORBITS.flatMap((orbit, ring) => orbit.techs.map((tech, index) => ({ orbit, ring, tech, index })));

const INTRO_MS = 1600;

function fill(hex: string) {
  return `#${hex === "000000" ? "0b1220" : hex}`;
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 4);

/**
 * The orbit lines: one SVG per orbit and layer, far halves behind the portrait
 * and near halves in front. Each SVG is turned and scaled with a CSS transform,
 * so the sway runs on the compositor instead of repainting the lines every frame.
 */
function OrbitLines({
  layer,
  layers,
}: {
  layer: "back" | "front";
  layers: React.RefObject<(SVGSVGElement | null)[]>;
}) {
  const near = layer === "front";
  return (
    <>
      {ORBITS.map((o, ring) => {
        const clipId = `orbit-${o.id}-${layer}`;
        return (
          <svg
            key={o.id}
            ref={(el) => {
              layers.current[ring * 2 + (near ? 1 : 0)] = el;
            }}
            aria-hidden
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full overflow-visible will-change-transform"
            style={{
              zIndex: near ? 30 : 1,
              opacity: 0,
              transformOrigin: `${CENTER.x}% ${(CENTER.y / VB_H) * 100}%`,
              transform: `rotate(${o.tilt}deg)`,
            }}
          >
            <defs>
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                <rect
                  x={CENTER.x - o.rx - 4}
                  y={near ? CENTER.y : CENTER.y - o.ry - 4}
                  width={o.rx * 2 + 8}
                  height={o.ry + 4}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <ellipse
                cx={CENTER.x}
                cy={CENTER.y}
                rx={o.rx}
                ry={o.ry}
                fill="none"
                stroke="#2563eb"
                strokeOpacity={near ? 0.45 : 0.16}
                strokeWidth={near ? 1.25 : 1}
                vectorEffect="non-scaling-stroke"
              />
              {near ? (
                <ellipse
                  cx={CENTER.x}
                  cy={CENTER.y}
                  rx={o.rx}
                  ry={o.ry}
                  fill="none"
                  stroke="#2563eb"
                  strokeOpacity={0.8}
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeDasharray="0.5 14"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </g>
          </svg>
        );
      })}
    </>
  );
}

/**
 * The portrait at the centre of its own small system: a flat glass arch with a
 * scanline and HUD brackets, and the stack on three nested 3D orbits that open
 * out when the page arrives. Technologies grow and name themselves as they
 * pass in front.
 */
export function HeroPortal({
  alt,
  locale,
  hud,
  terminal,
}: {
  alt: string;
  locale: string;
  hud: { online: string };
  terminal: TerminalLabels;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const size = useRef({ w: 0, h: 0 });
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const layers = useRef<(SVGSVGElement | null)[]>([]);
  const readyAt = useRef<number | null>(null);

  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const inView = useInView(ref);
  const sequence = useHeroSequence();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const sink = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      size.current = { w: entry.contentRect.width, h: entry.contentRect.height };
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // One loop drives the whole system. Nodes move with transforms only (no
  // layout, no filters), and nothing runs while the hero is off screen.
  useAnimationFrame((time) => {
    if (!ready || !inView) return;
    // Hidden under the impact panel: nothing to draw.
    if (sequence?.pinned && sequence.progress.get() > 0.6) return;
    if (readyAt.current === null) readyAt.current = time;
    const since = time - readyAt.current;
    const t = reduce ? 0 : time / 1000;
    const { w, h } = size.current;
    if (!w) return;
    // On narrow screens the outer orbit would leave the viewport: tighten the system.
    const fit = w < 420 ? 0.86 : 1;

    ORBITS.forEach((o, ring) => {
      const local = Math.min(1, Math.max(0, (since - 500 - ring * 180) / INTRO_MS));
      const grow = (0.55 + 0.45 * easeOut(local)) * fit;
      const tilt = o.tilt + (reduce ? 0 : o.sway * Math.sin(t * 0.35 + ring * 2.1));
      const transform = `rotate(${tilt.toFixed(2)}deg) scale(${grow.toFixed(4)})`;
      const opacity = easeOut(local).toFixed(3);
      for (const layer of [0, 1]) {
        const svg = layers.current[ring * 2 + layer];
        if (!svg) continue;
        svg.style.transform = transform;
        if (svg.style.opacity !== opacity) svg.style.opacity = opacity;
      }
    });

    NODES.forEach(({ orbit, ring, index }, i) => {
      const el = nodes.current[i];
      if (!el) return;
      const local = Math.min(1, Math.max(0, (since - 700 - ring * 180) / INTRO_MS));
      const grow = (0.55 + 0.45 * easeOut(local)) * fit;
      const tilt = orbit.tilt + (reduce ? 0 : orbit.sway * Math.sin(t * 0.35 + ring * 2.1));
      const angle = (index / orbit.techs.length) * Math.PI * 2 + orbit.phase + t * orbit.speed;

      const r = (tilt * Math.PI) / 180;
      const px = orbit.rx * grow * Math.cos(angle);
      const py = orbit.ry * grow * Math.sin(angle);
      const x = CENTER.x + px * Math.cos(r) - py * Math.sin(r);
      const y = CENTER.y + px * Math.sin(r) + py * Math.cos(r);
      const depth = Math.sin(angle); // 1 = nearest the viewer
      const near = (depth + 1) / 2;

      el.style.transform = `translate3d(${((x / VB_W) * w).toFixed(1)}px, ${((y / VB_H) * h).toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.62 + near * 0.46).toFixed(3)})`;
      // Only touch stacking and label visibility when they change: rewriting
      // them every frame forces the browser to rebuild layers.
      const z = depth > 0 ? "40" : "2";
      if (el.style.zIndex !== z) el.style.zIndex = z;
      el.style.opacity = (easeOut(local) * (0.35 + near * 0.65)).toFixed(3);
      const label = labels.current[i];
      const shown = depth > 0.9 && local === 1 ? "1" : "0";
      if (label && label.style.opacity !== shown) label.style.opacity = shown;
    });
  });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[34rem]">
      <motion.div style={{ y: drift }} className="relative">
        <div ref={stage} className="relative aspect-[100/116]">
          <OrbitLines layer="back" layers={layers} />

          {/* Glass arch: flat tint, a fine grid and a travelling scanline. */}
          <motion.div
            className="absolute inset-x-[19%] bottom-[9%] top-[8%] overflow-hidden rounded-b-[28px] rounded-t-[999px] bg-[#e8f0fe] shadow-[0_40px_80px_-40px_rgb(15_23_42/0.35)] ring-1 ring-primary/20"
            style={{ zIndex: 3 }}
            initial={{ clipPath: "inset(100% 0% 0% 0% round 999px 999px 28px 28px)" }}
            animate={ready ? { clipPath: "inset(0% 0% 0% 0% round 999px 999px 28px 28px)" } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}
          >
            <span className="bg-grid-fine absolute inset-0" />
            <span className="absolute inset-x-0 top-0 h-1/4 animate-[scan_6s_ease-in-out_infinite] motion-reduce:hidden">
              <span className="absolute inset-x-0 bottom-0 h-px bg-primary/40" />
            </span>
            <span className="absolute inset-[6%] rounded-b-[20px] rounded-t-[999px] border border-white" />
          </motion.div>

          {/* HUD brackets around the arch */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-[14%] bottom-[5%] top-[4%]"
            style={{ zIndex: 4 }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={ready ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
          >
            <span className="absolute left-0 top-0 size-5 border-l border-t border-fg/40" />
            <span className="absolute right-0 top-0 size-5 border-r border-t border-fg/40" />
            <span className="absolute bottom-0 left-0 size-5 border-b border-l border-fg/40" />
            <span className="absolute bottom-0 right-0 size-5 border-b border-r border-fg/40" />
          </motion.div>

          {/* Portrait */}
          <motion.div style={{ y: sink, zIndex: 10 }} className="absolute inset-x-[4%] bottom-[9%] top-0">
            <motion.div
              className="relative size-full"
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
              transition={{ duration: 1.3, ease: EASE, delay: 0.35 }}
            >
              <Image
                src="/images/nossair-sedki.png"
                alt={alt}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 32rem, 90vw"
                className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
              />
            </motion.div>
          </motion.div>

          <OrbitLines layer="front" layers={layers} />

          {/* Orbiting stack. Deliberately not wrapped: a wrapper would form its
              own stacking context and put every node in front of the portrait. */}
          {NODES.map(({ orbit, tech }, i) => (
            <span
              key={`${orbit.id}-${tech.label}`}
              ref={(el) => {
                nodes.current[i] = el;
              }}
              className="pointer-events-none absolute left-0 top-0 flex flex-col items-center opacity-0 will-change-transform"
            >
              <span
                className={`grid ${orbit.node} place-items-center rounded-full bg-white shadow-[0_1px_2px_rgb(15_23_42/0.08),0_10px_24px_-10px_rgb(15_23_42/0.3)] ring-1 ring-fg/[0.06]`}
              >
                <svg viewBox="0 0 24 24" className={orbit.glyph} style={{ fill: fill(tech.icon.hex) }} aria-hidden>
                  <path d={tech.icon.path} />
                </svg>
              </span>
              <span
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className="absolute top-full mt-1.5 whitespace-nowrap rounded-full bg-fg px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider text-white opacity-0 transition-opacity duration-300"
              >
                {tech.label}
              </span>
            </span>
          ))}

          {/* Local time */}
          <motion.div
            className="absolute right-0 top-[16%] text-right font-mono text-[0.625rem] uppercase tracking-[0.16em]"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0, x: 10 }}
            animate={ready ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.7, ease: EASE, delay: 1.2 }}
          >
            <LocalTime locale={locale} className="block text-[1.125rem] font-medium tracking-tight text-fg tabular-nums" />
            <span className="mt-1 flex items-center justify-end gap-1.5 text-success">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                <span className="relative size-1.5 rounded-full bg-success" />
              </span>
              {hud.online}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Deploy log */}
      <motion.div
        data-intro
        className="relative z-50 mx-auto -mt-4 w-[min(20.5rem,100%)] sm:absolute sm:bottom-[-15%] sm:right-[-4%] sm:mt-0 lg:right-[-13%]"
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 1, ease: EASE, delay: 1 }}
      >
        <DeployTerminal labels={terminal} />
      </motion.div>
    </div>
  );
}
