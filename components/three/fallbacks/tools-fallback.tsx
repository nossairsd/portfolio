"use client";

import { ToolIcon } from "@/components/sections/process/tools";
import { cn } from "@/lib/cn";
import type { ToolGroup } from "../tools-scene";

/**
 * The same idea without WebGL: every tool of every family as a card, the
 * family being read in front, the rest faded into the background.
 */
export default function ToolsFallback({ groups, active, className }: { groups: ToolGroup[]; active: number; className?: string }) {
  return (
    <div className={cn("grid place-items-center overflow-hidden p-2", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        {groups.flatMap((group, g) =>
          group.items.map((item) => (
            <li
              key={item}
              className={cn(
                "flex w-[4.25rem] flex-col items-center gap-1.5 rounded-xl bg-white p-2 text-center ring-1 ring-line transition-all duration-500",
                g === active ? "scale-100 opacity-100" : "scale-90 opacity-35",
              )}
            >
              <ToolIcon name={item} className="size-5" />
              <span className="text-[0.625rem] font-medium leading-tight text-fg-2">{item}</span>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
