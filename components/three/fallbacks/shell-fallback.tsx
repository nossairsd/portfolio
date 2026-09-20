"use client";

import { cn } from "@/lib/cn";
import type { ShellGroup } from "../shell-scene";

const TILT = [0, 36, -36, 66, -66];
const SPIN = [26, 34, 30, 38, 28];
const ORBIT_RX = 172;
const ORBIT_RY = 58;

/**
 * The same picture as the 3D shell, drawn flat for browsers without WebGL:
 * four plates for the layers, five inclined orbits for the families of tools,
 * the active one in blue.
 */
export default function ShellFallback({
  groups,
  layers,
  active,
  className,
}: {
  groups: ShellGroup[];
  layers: string[];
  active: number;
  className?: string;
}) {
  return (
    <div className={cn("grid place-items-center", className)}>
      <svg viewBox="0 0 460 460" aria-hidden className="size-full max-h-[26rem]">
        {/* Layers */}
        {layers.map((layer, i) => {
          const y = 230 + (i - (layers.length - 1) / 2) * 52;
          return (
            <g key={layer}>
              <ellipse cx={230} cy={y} rx={92} ry={30} fill="#e9f0fd" stroke="rgb(37 99 235 / 0.4)" strokeWidth={1.2} />
            </g>
          );
        })}

        {/* Orbits */}
        {groups.map((group, i) => {
          const on = i === active;
          const color = on ? "#2563eb" : "#9db8e8";
          return (
            <g key={group.name} transform={`rotate(${TILT[i]} 230 230)`} opacity={on ? 1 : 0.55}>
              <ellipse cx={230} cy={230} rx={ORBIT_RX} ry={ORBIT_RY} fill="none" stroke={color} strokeWidth={on ? 2 : 1} />
              <g style={{ animation: `shell-spin ${SPIN[i]}s linear infinite`, transformOrigin: "230px 230px" }}>
                {Array.from({ length: group.count }, (_, j) => {
                  const angle = (j / group.count) * Math.PI * 2;
                  return (
                    <circle
                      key={j}
                      cx={230 + Math.cos(angle) * ORBIT_RX}
                      cy={230 + Math.sin(angle) * ORBIT_RY}
                      r={on ? 6 : 4}
                      fill={color}
                    />
                  );
                })}
              </g>
            </g>
          );
        })}
        <style>{"@keyframes shell-spin { to { transform: rotate(360deg) } }"}</style>
      </svg>
    </div>
  );
}
