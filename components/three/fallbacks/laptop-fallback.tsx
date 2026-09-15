"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Progress } from "@/lib/use-scroll-progress";
import { cn } from "@/lib/cn";
import { LAPTOP_SCREENS, laptopTimeline, screenOpacity, screenSrc } from "../laptop-timeline";
import { useProgressFrame } from "../webgl";

const SCREENS = LAPTOP_SCREENS.map((name) => screenSrc(name, false));

/**
 * The featured project without WebGL: a laptop built in CSS 3D. Its lid opens,
 * the view zooms into the screen, and the product's screens play in step with
 * the chapters beside it, on the same timeline as the 3D scene.
 */
export default function LaptopFallback({ progress, className }: { progress: Progress; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLSpanElement>(null);
  const screens = useRef<(HTMLDivElement | null)[]>([]);

  useProgressFrame(root, progress, (p, time) => {
    const { open, zoom, screen } = laptopTimeline(p);
    const settle = 1 - zoom;

    if (lid.current) lid.current.style.transform = `rotateX(${((1 - open) * -92).toFixed(2)}deg)`;
    if (body.current) {
      const turn = ((1 - open) * 16 + Math.sin(time * 0.5) * 1.2) * settle;
      const tilt = (14 + (1 - open) * 18) * settle;
      body.current.style.transform = `translateY(${(zoom * 14).toFixed(1)}%) scale(${(1 + zoom * 0.32).toFixed(3)}) rotateX(${tilt.toFixed(2)}deg) rotateY(${(-turn).toFixed(2)}deg)`;
    }
    if (glare.current) glare.current.style.opacity = (open * 0.9 * settle).toFixed(3);
    screens.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = screenOpacity(i, screen).toFixed(3);
    });
  });

  return (
    <div ref={root} aria-hidden className={cn("grid place-items-center overflow-hidden [perspective:1800px] [perspective-origin:50%_30%] lg:pl-[45%]", className)}>
      <div ref={body} className="relative aspect-[16/10.4] w-[min(88%,36rem)] [transform-style:preserve-3d] will-change-transform">
        {/* Base, lying flat in front of the hinge */}
        <div className="absolute inset-x-[-3%] top-full h-[64%] origin-top [transform:rotateX(90deg)] [transform-style:preserve-3d]">
          <div className="absolute inset-0 rounded-b-[1.4rem] rounded-t-md bg-[#dfe3e8] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]">
            <div className="absolute inset-x-[7%] top-[9%] grid h-[46%] grid-cols-12 gap-[3px] rounded-md bg-[#cfd5dc] p-[5px]">
              {Array.from({ length: 48 }, (_, i) => (
                <span key={i} className="rounded-[2px] bg-[#e9edf1]" />
              ))}
            </div>
            <div className="absolute bottom-[9%] left-1/2 h-[28%] w-[36%] -translate-x-1/2 rounded-md bg-[#d5dbe1] ring-1 ring-black/[0.04]" />
          </div>
          {/* Soft shadow under the machine */}
          <div className="absolute inset-x-[4%] -bottom-[6%] h-[30%] rounded-[50%] bg-fg/20 blur-2xl [transform:translateZ(-2px)]" />
        </div>

        {/* Lid: screen on the front, aluminium on the back */}
        <div ref={lid} className="absolute inset-0 origin-bottom [transform-style:preserve-3d] will-change-transform">
          <div className="absolute inset-0 overflow-hidden rounded-t-[1.1rem] bg-[#0b0f17] p-[2.2%] [backface-visibility:hidden]">
            <div className="relative h-full overflow-hidden rounded-[0.4rem] bg-[#0b0f17]">
              {SCREENS.map((src, i) => (
                <div
                  key={src}
                  ref={(el) => {
                    screens.current[i] = el;
                  }}
                  className="absolute inset-0 will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <Image src={src} alt="" fill sizes="(min-width: 1024px) 36rem, 88vw" className="object-contain" />
                </div>
              ))}
              <span ref={glare} className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.14)_0%,transparent_38%)] opacity-0" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-t-[1.1rem] bg-[#d9dee4] [backface-visibility:hidden] [transform:rotateX(180deg)]">
            <span className="absolute left-1/2 top-1/2 size-[12%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cdd3da]" />
          </div>
        </div>
      </div>
    </div>
  );
}
