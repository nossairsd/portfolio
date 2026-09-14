"use client";

import dynamic from "next/dynamic";

// three.js stays out of the first load: the canvas and each scene arrive once
// the page is interactive, and never render on the server.
export const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });
export const PipelineView = dynamic(() => import("./pipeline-scene"), { ssr: false });
export const LaptopView = dynamic(() => import("./laptop-scene"), { ssr: false });
export const ArchitectureView = dynamic(() => import("./architecture-scene"), { ssr: false });
export const GlobeView = dynamic(() => import("./globe-scene"), { ssr: false });
