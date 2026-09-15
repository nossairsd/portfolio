"use client";

import { useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, type ReactNode } from "react";

/**
 * A 3D scene is decoration next to HTML that carries the same content, so if it
 * fails (a texture that does not load, a driver issue) it should disappear
 * quietly rather than take the page down with it.
 */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("3D scene disabled:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Compiles the scene's shaders as soon as it mounts, off the main thread where
 * the browser supports parallel compilation, so the first frame the scene is
 * seen does not stall while programs are built.
 */
function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      gl.compileAsync(scene, camera).catch(() => {});
    });
    return () => window.cancelAnimationFrame(id);
  }, [gl, scene, camera]);
  return null;
}

export function SceneBoundary({ children }: { children: ReactNode }) {
  return (
    <Boundary>
      <Suspense fallback={null}>
        {children}
        <Precompile />
      </Suspense>
    </Boundary>
  );
}
