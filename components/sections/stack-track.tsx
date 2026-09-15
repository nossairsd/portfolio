"use client";

import { Cloud, Database, Globe, Monitor, Server, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/components/motion/fade-in";
import { cn } from "@/lib/cn";
import { ToolIcon } from "./process/tools";

export type Layer = { name: string; role: string; items: string[] };

export type StackLabels = {
  layerLabel: string;
  client: string;
  production: string;
  live: string;
};

/** The tool the request goes through in each layer: Next.js, Spring Boot, PostgreSQL, Docker. */
const ROUTE = [1, 2, 0, 1];
/** What each layer is, at a glance. */
const LAYER_ICONS: LucideIcon[] = [Monitor, Server, Database, Cloud];

const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Point = { x: number; y: number };

/**
 * The stack as a system map drawn like a blueprint: four layers, each tool
 * with its real mark, and a request that travels down through them as the
 * page scrolls, from the user's browser to production. The layer it crosses
 * is outlined, and the panel beside the map says what that layer is for.
 */
export function StackTrack({ layers, labels }: { layers: Layer[]; labels: StackLabels }) {
  const track = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const client = useRef<HTMLDivElement>(null);
  const exit = useRef<HTMLDivElement>(null);
  const hubs = useRef<(HTMLDivElement | null)[]>([]);
  const trail = useRef<SVGPathElement>(null);
  const packet = useRef<HTMLDivElement>(null);
  const geometry = useRef({ length: 0, stops: [] as number[], path: null as SVGPathElement | null });
  const latest = useRef(0);

  const [shape, setShape] = useState({ d: "", w: 0, h: 0 });
  const [active, setActive] = useState(-1);
  const [arrived, setArrived] = useState(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  const render = useCallback(
    (p: number) => {
      const { length, stops, path } = geometry.current;
      if (!path || !length) return;
      const travel = reduce ? 1 : clamp01((p - 0.04) / 0.86);
      const distance = travel * length;
      const point = path.getPointAtLength(distance);
      if (packet.current) {
        packet.current.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0)`;
        packet.current.style.opacity = travel > 0.001 && travel < 0.999 ? "1" : "0";
      }
      if (trail.current) {
        trail.current.style.strokeDasharray = `${length}`;
        trail.current.style.strokeDashoffset = `${length - distance}`;
      }
      // Stops are the distances at which the request reaches each layer's tool.
      let reached = -1;
      stops.forEach((stop, i) => {
        if (distance >= stop - 2) reached = i;
      });
      setActive((a) => (a === reached ? a : reached));
      setArrived((a) => (a === travel >= 0.999 ? a : travel >= 0.999));
    },
    [reduce],
  );

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    latest.current = p;
    render(p);
  });

  // Geometry: a smooth route through the chosen tile of every layer.
  useEffect(() => {
    const board = map.current;
    if (!board) return;
    const measure = () => {
      const box = board.getBoundingClientRect();
      const at = (node: HTMLElement | null, edge: "top" | "center" | "bottom"): Point => {
        if (!node) return { x: box.width / 2, y: 0 };
        const r = node.getBoundingClientRect();
        const y = edge === "top" ? r.top : edge === "bottom" ? r.bottom : r.top + r.height / 2;
        return { x: r.left - box.left + r.width / 2, y: y - box.top };
      };
      const points = [at(client.current, "bottom"), ...hubs.current.map((hub) => at(hub, "center")), at(exit.current, "top")];
      const segment = (a: Point, b: Point) => {
        const mid = (a.y + b.y) / 2;
        return ` C ${a.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${mid.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      };

      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const stops: number[] = [];
      for (let i = 1; i < points.length; i++) {
        d += segment(points[i - 1], points[i]);
        // Distance along the route at which each tile is reached.
        if (i < points.length - 1) {
          probe.setAttribute("d", d);
          stops.push(probe.getTotalLength());
        }
      }

      setShape({ d, w: box.width, h: box.height });
      geometry.current.stops = stops;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  // Once the route is drawn, read its length and place the request.
  useEffect(() => {
    const path = trail.current;
    if (!path || !shape.d) return;
    geometry.current.path = path;
    geometry.current.length = path.getTotalLength();
    render(latest.current || scrollYProgress.get());
  }, [shape, render, scrollYProgress]);

  const shown = Math.max(0, active);
  const layer = layers[shown];
  const ShownIcon = LAYER_ICONS[shown] ?? Monitor;

  return (
    <div ref={track} className="relative" style={{ height: "320svh" }}>
      <div className="sticky top-0 flex h-svh items-center pb-6 pt-20">
        <div className="container-page grid h-full max-h-[50rem] grid-rows-[auto_minmax(0,1fr)] gap-5 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-12">
          {/* Inspector: what the layer being crossed is for */}
          <div className="min-w-0 lg:col-span-4">
            <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              <span>
                {labels.layerLabel} <span className="text-primary">{pad(shown + 1)}</span> / {pad(layers.length)}
              </span>
              <span aria-hidden className="flex flex-1 gap-1">
                {layers.map((l, i) => (
                  <span key={l.name} className={cn("h-[3px] flex-1 rounded-full transition-colors duration-500", i <= active ? "bg-primary" : "bg-fg/10")} />
                ))}
              </span>
            </p>
            <div className="relative mt-4 min-h-[5.5rem] lg:mt-6 lg:min-h-[18rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={shown}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <span className="hidden size-10 place-items-center rounded-xl bg-primary text-white lg:grid">
                    <ShownIcon aria-hidden className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-[clamp(1.5rem,2.8vw,2.375rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg lg:mt-5">{layer.name}</h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted max-lg:line-clamp-2 lg:mt-3 lg:text-base">{layer.role}</p>
                  <ul className="mt-6 hidden grid-cols-2 gap-2 lg:grid">
                    {layer.items.map((item, i) => (
                      <motion.li
                        key={item}
                        className="flex min-w-0 items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-fg-2 ring-1 ring-inset ring-fg/[0.08]"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.08 + i * 0.05 }}
                      >
                        <ToolIcon name={item} className="size-4" />
                        <span className="truncate">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* System map */}
          <div ref={map} className="relative flex min-h-0 flex-col justify-center lg:col-span-8">
            <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={shape.w} height={shape.h} viewBox={`0 0 ${shape.w || 1} ${shape.h || 1}`}>
              <path d={shape.d} fill="none" stroke="rgb(37 99 235 / 0.25)" strokeWidth={1.5} strokeDasharray="4 6" />
              <path ref={trail} d={shape.d} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />
            </svg>

            <div className="relative z-10 flex justify-center">
              <div ref={client} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-mono text-[0.6875rem] text-fg-2 ring-1 ring-fg/10">
                <Globe aria-hidden className="size-3.5 text-primary" />
                {labels.client}
              </div>
            </div>

            <ol className="relative z-10 mt-7 space-y-3 sm:mt-8 sm:space-y-4">
              {layers.map((l, i) => {
                const lit = i === active;
                const passed = i < active;
                const waiting = active >= 0 && i > active;
                const Icon = LAYER_ICONS[i] ?? Monitor;
                return (
                  <li
                    key={l.name}
                    className={cn(
                      "grid grid-cols-1 items-center gap-2 rounded-2xl bg-white/90 p-2.5 transition-[opacity,box-shadow] duration-500 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3 sm:p-3",
                      lit ? "shadow-[0_0_0_2px_#2563eb,0_12px_28px_-18px_rgb(15_23_42/0.35)]" : "shadow-[0_0_0_1px_rgb(15_23_42/0.08)]",
                      waiting && "opacity-55",
                    )}
                  >
                    <p className="flex items-center gap-2.5 px-1">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-500",
                          lit ? "bg-primary text-white" : passed ? "bg-primary-soft text-primary" : "bg-bg-muted text-muted",
                        )}
                      >
                        <Icon aria-hidden className="size-4" strokeWidth={1.9} />
                      </span>
                      <span className="text-[0.8125rem] font-semibold leading-tight text-fg sm:text-sm">{l.name}</span>
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {l.items.map((item, j) => {
                        const onRoute = ROUTE[i] === j;
                        const marked = onRoute && (lit || passed);
                        return (
                          <div
                            key={item}
                            ref={onRoute ? (el) => { hubs.current[i] = el; } : undefined}
                            className={cn(
                              "flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2.5 transition-[transform,background-color,box-shadow] duration-500 sm:py-3",
                              marked ? "bg-white shadow-[0_0_0_1.5px_#2563eb]" : "bg-[#f6f8fb] shadow-[0_0_0_1px_rgb(15_23_42/0.05)]",
                              lit && "-translate-y-0.5",
                            )}
                          >
                            <ToolIcon name={item} className="size-5 sm:size-6" />
                            <span className="max-w-full truncate px-1 text-[0.625rem] font-medium text-fg-2 sm:text-[0.6875rem]">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="relative z-10 mt-7 flex justify-center sm:mt-8">
              <div
                ref={exit}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6875rem] ring-1 transition-colors duration-500",
                  arrived ? "bg-green-50 text-green-700 ring-green-600/30" : "bg-white text-fg-2 ring-fg/10",
                )}
              >
                <span className="relative flex size-1.5">
                  {arrived ? <span className="absolute inset-0 animate-ping rounded-full bg-success/60" /> : null}
                  <span className={cn("relative size-1.5 rounded-full", arrived ? "bg-success" : "bg-fg/25")} />
                </span>
                {labels.production}
                {arrived ? <span>· {labels.live}</span> : null}
              </div>
            </div>

            {/* The request */}
            <div ref={packet} aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 opacity-0 will-change-transform">
              <span className="-ml-2 -mt-2 block size-4 rounded-full bg-primary ring-4 ring-white shadow-[0_1px_3px_rgb(15_23_42/0.35)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
