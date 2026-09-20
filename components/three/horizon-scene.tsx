"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SceneBoundary } from "./scene-boundary";
import { BLUE } from "./shared";

/** The ground the page ends on: one line every metre, out to the horizon. */
const STEP = 1;
const DEPTH = 34;
const WIDTH = 30;
const SPEED = 0.9;

function gridGeometry() {
  const points: number[] = [];
  for (let z = -DEPTH; z <= STEP; z += STEP) {
    points.push(-WIDTH, 0, z, WIDTH, 0, z);
  }
  for (let x = -WIDTH; x <= WIDTH; x += STEP * 2) {
    points.push(x, 0, -DEPTH, x, 0, STEP);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

/**
 * A grid running to the horizon, travelling slowly towards the visitor: the
 * floor the name stands on at the end of the page. Lines fade into the paper
 * with distance, so nothing needs a gradient.
 */
function Scene() {
  const grid = useRef<THREE.LineSegments>(null);
  const sweep = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => gridGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // The grid slides forward by one cell, then starts again: an endless floor.
    if (grid.current) grid.current.position.z = ((t * SPEED) % STEP) - STEP;
    // A brighter line leaves for the horizon every few seconds.
    if (sweep.current) {
      const cycle = (t * 0.22) % 1;
      sweep.current.position.z = -cycle * DEPTH;
      (sweep.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * Math.sin(Math.PI * cycle) ** 0.8;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 3.2]} rotation={[-0.34, 0, 0]} fov={52} near={0.1} far={60} />
      {/* The paper the lines dissolve into. */}
      <fog attach="fog" args={["#f7f9fc", 6, 22]} />
      <lineSegments ref={grid} geometry={geometry}>
        <lineBasicMaterial color={BLUE} transparent opacity={0.34} toneMapped={false} />
      </lineSegments>
      <mesh ref={sweep} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[WIDTH * 2, 0.06]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

/** The horizon under the closing wordmark. */
export default function HorizonView({ className }: { className?: string }) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene />
      </SceneBoundary>
    </View>
  );
}
