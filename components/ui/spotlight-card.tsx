"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * The shared card surface, with a border that lights up blue near the pointer
 * and a faint wash inside. The border is a 1px padding over a gradient layer,
 * so it follows the card's radius exactly.
 */
export function SpotlightCard({
  className,
  innerClassName,
  children,
  as: Tag = "div",
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      onPointerMove={onPointerMove}
      className={cn(
        "group/card relative rounded-[1.25rem] bg-line p-px shadow-[0_1px_2px_rgb(15_23_42/0.04),0_12px_32px_-18px_rgb(15_23_42/0.14)] transition-shadow duration-500 hover:shadow-[0_1px_2px_rgb(15_23_42/0.05),0_24px_48px_-22px_rgb(15_23_42/0.22)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgb(37 99 235 / 0.55), transparent 60%)",
        }}
      />
      <div className={cn("relative h-full overflow-hidden rounded-[calc(1.25rem-1px)] bg-white", innerClassName)}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgb(37 99 235 / 0.05), transparent 65%)",
          }}
        />
        <div className="relative h-full">{children}</div>
      </div>
    </Tag>
  );
}
