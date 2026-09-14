"use client";

import { useMemo } from "react";
import * as THREE from "three";

export const BLUE = new THREE.Color("#2563eb");
export const BLUE_SOFT = new THREE.Color("#eff6ff");
export const WHITE = new THREE.Color("#ffffff");
export const SLATE = new THREE.Color("#cbd5e1");
export const GREEN = new THREE.Color("#16a34a");

/** Frame-rate independent easing towards a target. */
export const damp = THREE.MathUtils.damp;

let shadowTexture: THREE.Texture | null = null;

/** A soft round shadow drawn once and shared, far cheaper than shadow maps. */
function getShadowTexture() {
  if (shadowTexture) return shadowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(15,23,42,0.28)");
  gradient.addColorStop(0.55, "rgba(15,23,42,0.10)");
  gradient.addColorStop(1, "rgba(15,23,42,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  shadowTexture = new THREE.CanvasTexture(canvas);
  return shadowTexture;
}

export function BlobShadow({
  size = 3,
  position = [0, 0.001, 0],
  opacity = 1,
}: {
  size?: number | [number, number];
  position?: [number, number, number];
  opacity?: number;
}) {
  const texture = useMemo(() => getShadowTexture(), []);
  const [w, h] = Array.isArray(size) ? size : [size, size];
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/** Soft studio light for a white, product-shot look. */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#dbeafe", 1.35 * intensity]} />
      <directionalLight position={[6, 12, 8]} intensity={1.9 * intensity} />
      <directionalLight position={[-8, 4, -6]} intensity={0.45 * intensity} color="#bfdbfe" />
    </>
  );
}
