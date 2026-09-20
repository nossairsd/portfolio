"use client";

import { useEffect, useRef } from "react";
import { CITIES, type CityId } from "@/lib/site";
import type { Progress } from "@/lib/use-scroll-progress";
import { cn } from "@/lib/cn";
import dots from "../globe-dots.json";
import { clamp01, smoothstep, useProgressFrame } from "../webgl";

const DEG = Math.PI / 180;
const DESTINATIONS: CityId[] = ["paris", "london", "berlin", "dubai", "montreal", "remote"];
const LIST = dots as number[];
const BLUE = "#2563eb";

type Point = { x: number; y: number; z: number };

/** Orthographic projection of (lat, lon) for a globe centred on (lat0, lon0). */
function project(lat: number, lon: number, lat0: number, lon0: number, lift = 1): Point {
  const phi = lat * DEG;
  const lambda = (lon - lon0) * DEG;
  const phi0 = lat0 * DEG;
  const cosPhi = Math.cos(phi);
  return {
    x: cosPhi * Math.sin(lambda) * lift,
    y: (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosPhi * Math.cos(lambda)) * lift,
    z: Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosPhi * Math.cos(lambda),
  };
}

/**
 * The contact globe without WebGL, drawn on a 2D canvas: the same land dots,
 * turning from the Atlantic to Europe as the section scrolls in, with routes
 * drawn from Tangier to each city and a pulse on home. Redrawn only while on
 * screen, with the dots batched into a few paths per frame.
 */
export default function GlobeFallback({ progress, home, className }: { progress: Progress; home: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const observer = new ResizeObserver(([entry]) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = entry.contentRect;
      size.current = { w: width, h: height, dpr };
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useProgressFrame(root, progress, (p, time) => {
    const ctx = canvas.current?.getContext("2d");
    const { w, h, dpr } = size.current;
    if (!ctx || !w) return;

    const lon0 = -55 + 56 * smoothstep(p, 0, 0.7);
    const lat0 = 42;
    const drawn = smoothstep(p, 0.3, 0.85);
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.4;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Atmosphere and the sphere itself
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(219, 234, 254, 0.55)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "rgba(15, 23, 42, 0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Land dots, batched by depth into a few fills
    const buckets: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    const dot = Math.max(1.1, r / 160);
    for (let i = 0; i < LIST.length; i += 2) {
      const pt = project(LIST[i], LIST[i + 1], lat0, lon0);
      if (pt.z < 0.02) continue;
      const bucket = Math.min(3, Math.floor(pt.z * 4));
      const size = dot * (0.7 + pt.z * 0.45);
      buckets[bucket].rect(cx + pt.x * r - size / 2, cy - pt.y * r - size / 2, size, size);
    }
    const shades = ["rgba(148,163,184,0.35)", "rgba(120,135,158,0.6)", "rgba(100,116,139,0.85)", "rgba(71,85,105,0.95)"];
    buckets.forEach((path, i) => {
      ctx.fillStyle = shades[i];
      ctx.fill(path);
    });

    const homeCity = CITIES.tangier;
    const start = project(homeCity.lat, homeCity.lon, lat0, lon0);

    // Routes, drawn one after the other, each with a traveller once complete
    DESTINATIONS.forEach((id, index) => {
      const own = clamp01(drawn * DESTINATIONS.length - index * 0.6);
      if (own <= 0) return;
      const city = CITIES[id];
      const steps = 40;
      ctx.beginPath();
      let traveller: { x: number; y: number } | null = null;
      const tTravel = (time * 0.25 + index * 0.17) % 1;
      for (let s = 0; s <= steps * own; s++) {
        const t = s / steps;
        const lat = homeCity.lat + (city.lat - homeCity.lat) * t;
        const lon = homeCity.lon + (city.lon - homeCity.lon) * t;
        const lift = 1 + Math.sin(t * Math.PI) * 0.16;
        const pt = project(lat, lon, lat0, lon0, lift);
        const x = cx + pt.x * r;
        const y = cy - pt.y * r;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        if (own > 0.98 && Math.abs(t - tTravel) < 0.5 / steps) traveller = { x, y };
      }
      ctx.strokeStyle = "rgba(37, 99, 235, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (traveller) {
        ctx.beginPath();
        ctx.arc(traveller.x, traveller.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = BLUE;
        ctx.fill();
      }
      const end = project(city.lat, city.lon, lat0, lon0);
      if (end.z > 0) {
        ctx.beginPath();
        ctx.arc(cx + end.x * r, cy - end.y * r, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "#0b1220";
        ctx.fill();
      }
    });

    // Home: pulse, dot and label
    if (start.z > 0) {
      const hx = cx + start.x * r;
      const hy = cy - start.y * r;
      const pulse = (time * 0.8) % 1;
      ctx.beginPath();
      ctx.arc(hx, hy, 5 + pulse * 14, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(37, 99, 235, ${((1 - pulse) * 0.6).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = BLUE;
      ctx.fill();

      // Canvas text cannot read CSS variables: take the page's resolved font.
      ctx.font = `600 13px ${getComputedStyle(root.current ?? document.body).fontFamily}`;
      const label = home;
      const tw = ctx.measureText(label).width;
      const bw = tw + 18;
      const bx = hx - bw - 10;
      const by = hy - 12;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 24, 12);
      ctx.fillStyle = BLUE;
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(label, bx + 9, by + 12.5);
    }
  });

  return (
    <div ref={root} aria-hidden className={cn(className)}>
      <canvas ref={canvas} className="size-full" />
    </div>
  );
}
