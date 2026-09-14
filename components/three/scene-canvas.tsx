"use client";

import { View } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useState } from "react";

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
 * The single WebGL context of the site. Every 3D scene is a drei <View> that
 * tracks a DOM element and draws into this canvas inside that element's
 * rectangle, and views that are off screen are skipped.
 */
export default function SceneCanvas() {
  const [lost, setLost] = useState(false);
  const compact = window.matchMedia("(max-width: 767px)").matches;

  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      dpr={compact ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !compact, alpha: true, powerPreference: "high-performance" }}
      // A lost context paints the fixed canvas solid over the whole page. Hide
      // it instead: the page stays fully readable, and the browser may restore it.
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5, visibility: lost ? "hidden" : "visible" }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          setLost(true);
        });
        canvas.addEventListener("webglcontextrestored", () => setLost(false));
      }}
    >
      <ClearEachFrame />
      <View.Port />
    </Canvas>
  );
}
