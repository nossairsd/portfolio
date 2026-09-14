"use client";

import { useRef, useState } from "react";
import { ArchitectureView } from "@/components/three/lazy";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "@/lib/use-scroll-progress";

export type Layer = { name: string; items: string[] };

/** Mirrors the architecture scene: layers part by 45%, then the highlight walks down. */
function layerAt(progress: number, count: number) {
  if (progress < 0.42) return -1;
  return Math.round(Math.min(1, Math.max(0, (progress - 0.45) / 0.5)) * (count - 1));
}

export function StackTrack({ layers }: { layers: Layer[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const progress = useScrollProgress(track, { onChange: (p) => setActive(layerAt(p, layers.length)) });

  return (
    <div ref={track} className="relative" style={{ height: "260svh" }}>
      <div className="sticky top-0 flex h-svh items-center pt-16">
        <div className="container-page grid h-full max-h-[46rem] grid-rows-[1fr_auto] gap-4 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10">
          <div className="relative h-full min-h-0 lg:order-2 lg:col-span-8">
            <ArchitectureView progress={progress} layers={layers} className="absolute inset-0" />
          </div>

          <ol className="grid grid-cols-2 gap-2 lg:order-1 lg:col-span-4 lg:grid-cols-1 lg:gap-3">
            {layers.map((layer, i) => (
              <li
                key={layer.name}
                className={cn(
                  "rounded-2xl px-4 py-3 transition-all duration-500 lg:px-5 lg:py-4",
                  i === active
                    ? "bg-white shadow-[0_1px_2px_rgb(15_23_42/0.05),0_16px_32px_-18px_rgb(15_23_42/0.3)] ring-1 ring-primary/30"
                    : "ring-1 ring-transparent",
                )}
              >
                <p className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid h-6 min-w-7 place-items-center rounded-md font-mono text-[0.6875rem] font-semibold transition-colors duration-500",
                      i === active ? "bg-primary text-white" : "bg-white text-muted ring-1 ring-line",
                    )}
                  >
                    L{i + 1}
                  </span>
                  <span className="font-semibold tracking-tight">{layer.name}</span>
                </p>
                <p className="mt-2 hidden text-sm text-muted lg:block">{layer.items.join(" · ")}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
