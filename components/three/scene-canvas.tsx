"use client";

import { View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useViewsState } from "./visibility";
import { hasWebGL } from "./webgl";

/**
 * Views render with priority 1, which switches R3F to manual rendering: nothing
 * clears the canvas between frames any more. On a fixed canvas under scrolling
 * content that leaves trails where a view used to be, so clear it first.
 */
function ClearEachFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
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
    if (!idle) return;
    gl.setScissorTest(false);
    gl.clear(true, true, true);
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
  if (!hasWebGL()) return null;
  return <WebGLCanvas />;
}

function WebGLCanvas() {
  const [lost, setLost] = useState(false);
  const { anyVisible } = useViewsState();
  const compact = window.matchMedia("(max-width: 767px)").matches;

  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      // Nothing to draw when no view is on screen: the loop stops entirely.
      frameloop={anyVisible ? "always" : "never"}
      // The canvas covers the whole viewport: 1.5 keeps text on screens sharp
      // while painting well under half the pixels of a 2x retina buffer.
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: !compact, alpha: true, powerPreference: "high-performance" }}
      // A lost context paints the fixed canvas solid over the whole page. Hide
      // it instead: the page stays fully readable, and the browser may restore it.
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5, visibility: lost ? "hidden" : "visible" }}
      onCreated={({ gl }) => {
        // Checking every shader for errors reads the compile log synchronously,
        // which blocks the main thread while programs compile.
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          setLost(true);
        });
        canvas.addEventListener("webglcontextrestored", () => setLost(false));
      }}
    >
      <ClearEachFrame />
      <ClearWhenIdle idle={!anyVisible} />
      <View.Port />
    </Canvas>
  );
}
