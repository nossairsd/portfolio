"use client";

import { useEffect, useRef } from "react";
import type { Progress } from "@/lib/use-scroll-progress";
import { ToolIcon } from "@/components/sections/process/tools";
import { cn } from "@/lib/cn";
import { stationPosition } from "../pipeline-steps";
import { clamp01, useProgressFrame } from "../webgl";

const STEPS = 6;
/** The main tool of each station, shown with its real mark. */
const TOOLS = ["Jira", "PostgreSQL", "TypeScript", "Vitest", "GitHub Actions", "Azure"];
/** The feature ticket's state at each station, as in the 3D scene. */
const STAGES = ["User story", "Data model", "API + UI", "265 tests", "Docker image", "Production"];

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * The pipeline without WebGL: six stations on a tilted track and the feature,
 * a blue block, hopping from one to the next with the scroll. The track
 * follows the block like the 3D camera does, and each station lights up as it
 * is reached. Everything moves with transforms written once per frame.
 */
export default function PipelineFallback({ progress, className }: { progress: Progress; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);
  const stations = useRef<(HTMLDivElement | null)[]>([]);
  const stageText = useRef<HTMLSpanElement>(null);
  const stage = useRef(-1);
  const pitch = useRef(200);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      pitch.current = Math.max(150, Math.min(300, width / 2.2));
      world.current?.style.setProperty("--pitch", `${pitch.current}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useProgressFrame(root, progress, (p, time) => {
    const width = root.current?.clientWidth ?? 0;
    const s = stationPosition(p);
    const from = Math.floor(Math.min(s, STEPS - 1.0001));
    const f = s - from;
    const x = (from + easeInOut(f)) * pitch.current;
    const last = (STEPS - 1) * pitch.current;

    // The view follows the block, staying clear of both ends.
    const margin = Math.min(width * 0.36, last / 2);
    const focus = Math.min(Math.max(x, margin), last - margin);
    if (world.current) world.current.style.transform = `translate3d(${(width / 2 - focus).toFixed(1)}px, 0, 0)`;
    if (marker.current) {
      const hop = Math.sin(f * Math.PI) * 46 + Math.sin(time * 2) * 3;
      marker.current.style.transform = `translate3d(${x.toFixed(1)}px, ${(-hop).toFixed(1)}px, 0)`;
    }
    const current = Math.min(STEPS - 1, Math.floor(p * STEPS));
    if (current !== stage.current && stageText.current) {
      stage.current = current;
      stageText.current.textContent = STAGES[current];
    }
    if (trail.current) trail.current.style.transform = `scaleX(${(x / last).toFixed(4)})`;
    stations.current.forEach((station, i) => {
      station?.style.setProperty("--on", clamp01(s - i + 0.6).toFixed(3));
    });
  });

  return (
    <div ref={root} aria-hidden className={cn("overflow-hidden [perspective:1400px]", className)}>
      <div className="absolute inset-0 flex items-center [transform:rotateX(22deg)] [transform-style:preserve-3d]">
        <div ref={world} className="relative h-[calc(7rem+var(--pitch)*0.585)] w-0 will-change-transform [--pitch:200px]">
          {/* Track and the part already travelled */}
          <div
            className="absolute left-0 h-1 w-[calc(var(--pitch)*5)] -translate-y-1/2 rounded-full bg-fg/[0.07]"
            style={{ top: "calc(4rem + var(--pitch) * 0.585 + 1.25rem)" }}
          >
            <div ref={trail} className="h-full origin-left rounded-full bg-primary" style={{ transform: "scaleX(0)" }} />
          </div>

          {Array.from({ length: STEPS }, (_, i) => {
            return (
              <div
                key={i}
                ref={(el) => {
                  stations.current[i] = el;
                }}
                className="absolute top-0 flex w-[calc(var(--pitch)*0.78)] -translate-x-1/2 flex-col items-center [--on:0]"
                style={{ left: `calc(var(--pitch) * ${i})` }}
              >
                <div className="relative mt-16 w-full [transform:translateY(calc(var(--on)*-10px))]">
                  <span className="absolute inset-x-[8%] -bottom-4 h-5 rounded-[50%] bg-fg/10 blur-md" />
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.06),0_18px_30px_-18px_rgb(15_23_42/0.35)] ring-1 ring-fg/[0.08]">
                    <span className="absolute inset-0 rounded-2xl bg-primary-soft ring-2 ring-inset ring-primary/60" style={{ opacity: "var(--on)" }} />
                    <div className="relative flex h-full flex-col">
                      <span className="grid size-9 place-items-center rounded-xl bg-white ring-1 ring-fg/[0.08]">
                        <ToolIcon name={TOOLS[i]} className="size-[1.125rem]" />
                      </span>
                      <span className="mt-auto space-y-1.5">
                        <span className="block h-1.5 w-4/5 rounded-full bg-fg/[0.08]" />
                        <span className="block h-1.5 w-3/5 rounded-full bg-fg/[0.06]" />
                      </span>
                      <span className="relative mt-2.5 block h-1 w-1/2 self-center overflow-hidden rounded-full bg-fg/[0.08]">
                        <span className="absolute inset-0 bg-primary" style={{ opacity: "var(--on)" }} />
                      </span>
                    </div>
                  </div>
                </div>
                <span className="mt-10 font-mono text-[0.6875rem] font-semibold text-subtle">{String(i + 1).padStart(2, "0")}</span>
              </div>
            );
          })}

          {/* The feature travelling through the stations */}
          <div ref={marker} className="absolute left-0 top-0 -ml-[4.5rem] w-36 will-change-transform">
            <div className="rounded-xl bg-white px-3 py-2 shadow-[0_12px_28px_-10px_rgb(15_23_42/0.35)] ring-1 ring-fg/[0.08]">
              <span className="block font-mono text-[0.5625rem] font-semibold text-primary">FEAT-128</span>
              <span ref={stageText} className="mt-0.5 block truncate text-[0.8125rem] font-semibold text-fg">
                {STAGES[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
