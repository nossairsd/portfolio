"use client";

import { View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { WebGLRenderer } from "three";
import { clipViewsToCanvas } from "./clip-views";
import { useViewsState } from "./visibility";
import { hasWebGL } from "./webgl";

/**
 * Wipes the whole canvas to fully transparent. The clear colour is set every
 * time: a new renderer starts with opaque black, and a clear before the first
 * real render would otherwise paint the fixed canvas black over the page until
 * a 3D section comes into view.
 */
function clearToTransparent(gl: WebGLRenderer) {
  gl.setClearColor(0x000000, 0);
  gl.setScissorTest(false);
  gl.clear(true, true, true);
}

/**
 * Views render with priority 1, which switches R3F to manual rendering: nothing
 * clears the canvas between frames any more. On a fixed canvas under scrolling
 * content that leaves trails where a view used to be, so clear it first.
 */
function ClearEachFrame() {
  useFrame(({ gl }) => {
    clearToTransparent(gl);
  }, 0);
  return null;
}

/**
 * When the loop stops, the canvas would keep showing its last frame, fixed over
 * the page while it scrolls: wipe it once instead.
 */
function ClearWhenIdle({ idle }: { idle: boolean }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    if (idle) clearToTransparent(gl);
  }, [idle, gl]);
  return null;
}

/**
 * The single WebGL context of the site. Every 3D scene is a drei <View> that
 * tracks a DOM element and draws into this canvas inside that element's
 * rectangle, and views that are off screen are skipped. Without WebGL there is
 * no canvas, and each view renders its 2D fallback instead (see lazy.tsx).
 */
export default function SceneCanvas() {
  // Bumped to build a brand new canvas after the GPU dropped the context.
  const [generation, setGeneration] = useState(0);
  if (!hasWebGL()) return null;
  return <WebGLCanvas key={generation} onReset={() => setGeneration((g) => g + 1)} />;
}

function WebGLCanvas({ onReset }: { onReset: () => void }) {
  const [lost, setLost] = useState(false);
  const { anyVisible } = useViewsState();
  const compact = window.matchMedia("(max-width: 767px)").matches;

  // A context the browser gave back has lost every texture and program, and
  // three.js cannot rebuild all of it (reflections, precompiled shaders): start
  // again with a fresh canvas. If it is never given back, do the same shortly.
  useEffect(() => {
    if (!lost) return;
    const timer = window.setTimeout(onReset, 2500);
    return () => window.clearTimeout(timer);
  }, [lost, onReset]);

  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      // Nothing to draw when no view is on screen: the loop stops entirely.
      frameloop={anyVisible && !lost ? "always" : "never"}
      // The canvas covers the whole viewport: 1.5 keeps text on screens sharp
      // while painting well under half the pixels of a 2x retina buffer.
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: !compact, alpha: true, powerPreference: "high-performance" }}
      // A lost context paints the fixed canvas solid over the whole page. Hide
      // it instead: the page stays fully readable until the canvas is rebuilt.
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5, visibility: lost ? "hidden" : "visible" }}
      onCreated={({ gl }) => {
        // Checking every shader for errors reads the compile log synchronously,
        // which blocks the main thread while programs compile.
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        // Views scrolling out must never draw past the canvas edge (GPU hangs).
        clipViewsToCanvas(gl);
        gl.setClearColor(0x000000, 0);
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          setLost(true);
        });
        canvas.addEventListener("webglcontextrestored", onReset);
      }}
    >
      <ClearEachFrame />
      <ClearWhenIdle idle={!anyVisible} />
      <View.Port />
    </Canvas>
  );
}
