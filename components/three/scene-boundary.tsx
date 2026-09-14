"use client";

import { Component, Suspense, type ReactNode } from "react";

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

export function SceneBoundary({ children }: { children: ReactNode }) {
  return (
    <Boundary>
      <Suspense fallback={null}>{children}</Suspense>
    </Boundary>
  );
}
