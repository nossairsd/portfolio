"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Progress } from "@/lib/use-scroll-progress";
import { SceneBoundary } from "./scene-boundary";
import { BLUE, damp } from "./shared";
import { makeLabel } from "./textures";

export type ShellGroup = { name: string; count: number };

/** The four layers of the system map, drawn again here as a stack of plates. */
const PLATE_RADIUS = 1.12;
const PLATE_GAP = 0.62;
const PALE = new THREE.Color("#9db8e8");
const PLATE_FACE = new THREE.Color("#eaf2fe");

/** One orbit per family of tools: same radius, five different inclinations. */
const ORBIT = 2.15;
const TILT = [0.0, 0.62, -0.62, 1.16, -1.16];
const YAW = [0, 0.62, -0.5, 1.15, -1.1];
const SPEED = [0.2, -0.16, 0.18, -0.13, 0.15];

/**
 * A family of tools as an orbit around the stack: its tools are beads
 * travelling on the ring, and the ring lights up when its family is the one
 * being read. Rings are inclined differently so together they wrap the four
 * layers from every side, which is exactly what these tools do.
 */
function Orbit({ index, count, active }: { index: number; count: number; active: boolean }) {
  const spin = useRef<THREE.Group>(null);
  const paints = useRef<THREE.MeshBasicMaterial[]>([]);
  const glow = useRef(0);

  const beadGeometry = useMemo(() => new THREE.SphereGeometry(0.052, 16, 12), []);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(ORBIT, 0.008, 8, 160), []);
  useEffect(() => () => [beadGeometry, ringGeometry].forEach((o) => o.dispose()), [beadGeometry, ringGeometry]);

  const beads = useMemo(() => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2), [count]);
  const paint = (material: THREE.MeshBasicMaterial | null, i: number) => {
    if (material) paints.current[i] = material;
  };

  useFrame((_, delta) => {
    glow.current = damp(glow.current, active ? 1 : 0, 7, delta);
    const g = glow.current;
    paints.current.forEach((material, i) => {
      material.color.lerpColors(PALE, BLUE, g);
      // The ring stays a hairline; the beads carry the light.
      material.opacity = (i === 0 ? 0.42 : 0.55) + 0.5 * g;
    });
    if (spin.current) {
      spin.current.rotation.z += delta * SPEED[index] * (1 + g * 0.8);
      spin.current.scale.setScalar(1 + 0.045 * g);
    }
  });

  return (
    <group rotation={[0, YAW[index], TILT[index]]}>
      <group ref={spin}>
        <mesh geometry={ringGeometry}>
          <meshBasicMaterial ref={(m) => paint(m, 0)} color={PALE} transparent opacity={0.42} depthWrite={false} />
        </mesh>
        {beads.map((angle, i) => (
          <mesh
            key={i}
            geometry={beadGeometry}
            position={[Math.cos(angle) * ORBIT, Math.sin(angle) * ORBIT, 0]}
            scale={active ? 1.5 : 1}
          >
            <meshBasicMaterial ref={(m) => paint(m, i + 1)} color={PALE} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** One layer of the stack, as a plate the orbits pass through. */
function Plate({ index, total }: { index: number; total: number }) {
  const y = (total - 1) / 2 - index;

  return (
    <group position={[0, y * PLATE_GAP, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PLATE_RADIUS, 64]} />
        <meshBasicMaterial color={PLATE_FACE} transparent opacity={1} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PLATE_RADIUS - 0.018, PLATE_RADIUS, 96]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene({ groups, layers, active, progress }: { groups: ShellGroup[]; layers: string[]; active: number; progress: Progress }) {
  const shell = useRef<THREE.Group>(null);
  const name = useRef<THREE.Mesh>(null);

  const labels = useMemo(() => groups.map((group) => makeLabel(group.name, { size: 40, weight: 600, color: "#0b1220", background: "#ffffff", border: "rgba(37,99,235,0.22)" })), [groups]);
  useEffect(() => () => labels.forEach((l) => l.texture.dispose()), [labels]);
  const current = labels[active] ?? labels[0];

  useFrame(({ clock, pointer }, delta) => {
    if (!shell.current) return;
    // A slow breathing tilt, plus a little parallax under the pointer.
    const p = progress.current;
    shell.current.rotation.y = damp(shell.current.rotation.y, pointer.x * 0.22 + Math.sin(clock.elapsedTime * 0.18) * 0.12, 3, delta);
    shell.current.rotation.x = damp(shell.current.rotation.x, -0.06 + pointer.y * -0.1 + (p - 0.5) * 0.12, 3, delta);
    if (name.current) {
      const material = name.current.material as THREE.MeshBasicMaterial;
      material.opacity = damp(material.opacity, 1, 8, delta);
    }
  });

  // The floating name of the family being read, above the shell.
  useEffect(() => {
    const mesh = name.current;
    if (mesh) (mesh.material as THREE.MeshBasicMaterial).opacity = 0;
  }, [active]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2.15, 9.9]} rotation={[-0.21, 0, 0]} fov={32} near={0.1} far={40} />
      <group ref={shell}>
        {/* The axis the layers are threaded on. */}
        <mesh>
          <cylinderGeometry args={[0.012, 0.012, PLATE_GAP * layers.length + 0.5, 8]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
        {layers.map((layer, i) => (
          <Plate key={layer} index={i} total={layers.length} />
        ))}
        {groups.map((group, i) => (
          <Orbit key={group.name} index={i} count={group.count} active={i === active} />
        ))}
      </group>
      <mesh ref={name} key={active} position={[0, 2.62, 0]}>
        <planeGeometry args={[0.42 * (current?.aspect ?? 3), 0.42]} />
        <meshBasicMaterial map={current?.texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

/**
 * The tools that are not tied to one layer: five orbits wrapping the whole
 * stack, the active one lit.
 */
export default function ShellView({
  groups,
  layers,
  active,
  progress,
  className,
}: {
  groups: ShellGroup[];
  layers: string[];
  active: number;
  progress: Progress;
  className?: string;
}) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene groups={groups} layers={layers} active={active} progress={progress} />
      </SceneBoundary>
    </View>
  );
}
