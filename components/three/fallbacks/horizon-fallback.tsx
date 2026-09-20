"use client";

import { cn } from "@/lib/cn";

/**
 * The same horizon without WebGL: a grid laid flat in CSS perspective,
 * scrolling towards the visitor, fading out into the paper.
 */
export default function HorizonFallback({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("overflow-hidden [perspective:220px]", className)}>
      <div
        className="absolute inset-x-[-50%] bottom-[-40%] top-[30%] [background-image:linear-gradient(to_right,rgb(37_99_235/0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgb(37_99_235/0.3)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,transparent,black_45%)] [transform:rotateX(68deg)] [transform-origin:50%_0%]"
        style={{ animation: "horizon-travel 2.6s linear infinite" }}
      />
      <style>{"@keyframes horizon-travel { to { background-position: 0 44px } }"}</style>
    </div>
  );
}
