"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { startWarmup, useViewPresence, useViewsState } from "./visibility";
import { useWebGL } from "./webgl";

// three.js stays out of the first load. The shared canvas and the scenes are
// prepared one by one in idle moments after load (see visibility.ts), or as
// soon as a section approaches, and the canvas only renders while a view is
// on screen. Where WebGL is not available, each scene is replaced by a 2D
// version driven by the same scroll progress, so no section is left empty.
const Canvas = dynamic(() => import("./scene-canvas"), { ssr: false });

export function SceneCanvas() {
  const { anyNear, warm } = useViewsState();
  const webgl = useWebGL();
  useEffect(() => {
    if (webgl) startWarmup();
  }, [webgl]);
  return webgl && (anyNear || warm) ? <Canvas /> : null;
}

const PipelineScene = dynamic(() => import("./pipeline-scene"), { ssr: false });
const LaptopScene = dynamic(() => import("./laptop-scene"), { ssr: false });
const GlobeScene = dynamic(() => import("./globe-scene"), { ssr: false });

const PipelineFallback = dynamic(() => import("./fallbacks/pipeline-fallback"), { ssr: false });
const LaptopFallback = dynamic(() => import("./fallbacks/laptop-fallback"), { ssr: false });
const GlobeFallback = dynamic(() => import("./fallbacks/globe-fallback"), { ssr: false });

/** The view's box is always in the page; what draws inside it arrives when needed. */
function Deferred({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const mounted = useViewPresence(id, box);
  return (
    <div ref={box} className={cn(className)}>
      {mounted ? children : null}
    </div>
  );
}

export function PipelineView({ className, ...props }: ComponentProps<typeof PipelineScene>) {
  const webgl = useWebGL();
  return (
    <Deferred id="pipeline" className={className}>
      {webgl === null ? null : webgl ? <PipelineScene {...props} className="absolute inset-0" /> : <PipelineFallback {...props} className="absolute inset-0" />}
    </Deferred>
  );
}

export function LaptopView({ className, ...props }: ComponentProps<typeof LaptopScene>) {
  const webgl = useWebGL();
  return (
    <Deferred id="laptop" className={className}>
      {webgl === null ? null : webgl ? <LaptopScene {...props} className="absolute inset-0" /> : <LaptopFallback {...props} className="absolute inset-0" />}
    </Deferred>
  );
}

export function GlobeView({ className, ...props }: ComponentProps<typeof GlobeScene>) {
  const webgl = useWebGL();
  return (
    <Deferred id="globe" className={className}>
      {webgl === null ? null : webgl ? <GlobeScene {...props} className="absolute inset-0" /> : <GlobeFallback {...props} className="absolute inset-0" />}
    </Deferred>
  );
}
