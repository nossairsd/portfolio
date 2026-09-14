"use client";

import { Edges, OrthographicCamera, RoundedBox, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SceneBoundary } from "./scene-boundary";
import type { Progress } from "@/lib/use-scroll-progress";
import { BLUE, BLUE_SOFT, BlobShadow, GREEN, SLATE, StudioLights, WHITE, damp } from "./shared";
import { makeLabel } from "./textures";

const STEPS = 6;
const SPACING = 3.4;
const TOP = 0.36;
const ISO = new THREE.Vector3(9, 8.5, 9);

const stationX = (i: number) => (i - (STEPS - 1) / 2) * SPACING;

/** Activation (0 → 1) of a station, shared by the children that react to it. */
type Activation = { current: number };

function useActivation(index: number, progress: Progress): Activation {
  const value = useRef(0);
  useFrame((_, delta) => {
    const position = progress.current * (STEPS - 1);
    const target = THREE.MathUtils.clamp(position - index + 0.6, 0, 1);
    value.current = damp(value.current, target, 6, delta);
  });
  return value;
}

/* ------------------------------ station props ----------------------------- */

function Documents({ on }: { on: Activation }) {
  const header = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => header.current?.color.lerpColors(SLATE, BLUE, on.current));
  return (
    <group position={[0, TOP, 0]}>
      {[0, 1, 2].map((i) => (
        <RoundedBox key={i} args={[1.2, 0.06, 1.55]} radius={0.02} position={[i * 0.08 - 0.08, 0.04 + i * 0.08, -i * 0.06]} rotation={[0, 0.12 - i * 0.08, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </RoundedBox>
      ))}
      <group position={[0.08, 0.25, -0.12]} rotation={[0, -0.04, 0]}>
        <mesh position={[0, 0, -0.5]}>
          <boxGeometry args={[0.8, 0.02, 0.14]} />
          <meshStandardMaterial ref={header} color={SLATE} />
        </mesh>
        {[-0.18, 0.02, 0.22, 0.42].map((z, i) => (
          <mesh key={z} position={[i === 3 ? -0.2 : 0, 0, z]}>
            <boxGeometry args={[i === 3 ? 0.45 : 0.85, 0.015, 0.06]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Blueprint({ on }: { on: Activation }) {
  const group = useRef<THREE.Group>(null);
  const edges = useRef<THREE.LineBasicMaterial[]>([]);
  useFrame(() => {
    edges.current.forEach((material) => material?.color.lerpColors(SLATE, BLUE, on.current));
    group.current?.children.forEach((child, i) => {
      child.position.y = 0.22 + Math.max(0, on.current - i * 0.06) * (i % 3) * 0.14;
    });
  });
  return (
    <group ref={group} position={[0, TOP, 0]}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[((i % 3) - 1) * 0.52, 0.22, (Math.floor(i / 3) - 1) * 0.52]}>
          <boxGeometry args={[0.36, 0.36, 0.36]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
          <Edges>
            <lineBasicMaterial ref={(m) => { if (m) edges.current[i] = m; }} color={SLATE} />
          </Edges>
        </mesh>
      ))}
    </group>
  );
}

function ApiLink({ on }: { on: Activation }) {
  const packet = useRef<THREE.Mesh>(null);
  const left = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    left.current?.color.lerpColors(WHITE, BLUE, on.current);
    if (packet.current) {
      packet.current.position.x = Math.sin(clock.elapsedTime * 2.4) * 0.5;
      packet.current.scale.setScalar(0.4 + on.current * 0.6);
    }
  });
  return (
    <group position={[0, TOP, 0]}>
      <RoundedBox args={[0.62, 0.62, 0.62]} radius={0.1} position={[-0.72, 0.31, 0]}>
        <meshStandardMaterial ref={left} color="#ffffff" roughness={0.45} />
      </RoundedBox>
      <RoundedBox args={[0.62, 0.62, 0.62]} radius={0.1} position={[0.72, 0.31, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0.31, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 16]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh ref={packet} position={[0, 0.31, 0]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function TestPills({ on }: { on: Activation }) {
  const materials = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame(() => {
    materials.current.forEach((material, i) => {
      const t = THREE.MathUtils.clamp(on.current * 3 - i, 0, 1);
      material?.color.lerpColors(SLATE, GREEN, t);
    });
  });
  return (
    <group position={[0, TOP, 0]}>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={x} position={[x, 0.38, i === 1 ? -0.1 : 0.1]}>
          <capsuleGeometry args={[0.16, 0.42, 8, 20]} />
          <meshStandardMaterial ref={(m) => { if (m) materials.current[i] = m; }} color={SLATE} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Pipeline({ on }: { on: Activation }) {
  const ring = useRef<THREE.Mesh>(null);
  const cube = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (ring.current) ring.current.rotation.z += delta * (0.4 + on.current * 1.6);
    material.current?.color.lerpColors(SLATE, BLUE, on.current);
    if (cube.current) {
      const angle = t * (0.8 + on.current * 1.8);
      cube.current.position.set(Math.cos(angle) * 0.62, 0.72 + Math.sin(angle) * 0.62, 0);
      cube.current.rotation.set(t, t * 0.7, 0);
    }
  });
  return (
    <group position={[0, TOP, 0]}>
      <mesh ref={ring} position={[0, 0.72, 0]}>
        <torusGeometry args={[0.62, 0.09, 20, 64]} />
        <meshStandardMaterial ref={material} color={SLATE} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh ref={cube}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
    </group>
  );
}

function ServerRack({ on }: { on: Activation }) {
  const leds = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame(({ clock }) => {
    leds.current.forEach((material, i) => {
      const blink = 0.55 + 0.45 * Math.sin(clock.elapsedTime * 3 + i * 1.7);
      material?.color.lerpColors(SLATE, GREEN, on.current);
      if (material) material.emissiveIntensity = on.current * blink * 0.9;
    });
  });
  return (
    <group position={[0, TOP, 0]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.17 + i * 0.36, 0]}>
          <RoundedBox args={[1.25, 0.3, 0.95]} radius={0.05}>
            <meshStandardMaterial color={i === 2 ? "#f8fafc" : "#ffffff"} roughness={0.55} />
          </RoundedBox>
          {[0, 1].map((j) => (
            <mesh key={j} position={[-0.42 + j * 0.16, 0, 0.48]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial
                ref={(m) => { if (m) leds.current[i * 2 + j] = m; }}
                color={SLATE}
                emissive={GREEN}
                emissiveIntensity={0}
              />
            </mesh>
          ))}
          <mesh position={[0.25, 0, 0.476]}>
            <boxGeometry args={[0.5, 0.04, 0.01]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const PROPS = [Documents, Blueprint, ApiLink, TestPills, Pipeline, ServerRack];

/* --------------------------------- station -------------------------------- */

function Station({ index, progress }: { index: number; progress: Progress }) {
  const on = useActivation(index, progress);
  const group = useRef<THREE.Group>(null);
  const top = useRef<THREE.MeshStandardMaterial>(null);
  const bar = useRef<THREE.MeshStandardMaterial>(null);
  const Prop = PROPS[index];

  const label = useMemo(() => makeLabel(String(index + 1).padStart(2, "0"), { size: 40, weight: 600, color: "#2563eb" }), [index]);
  useEffect(() => () => label.texture.dispose(), [label]);

  useFrame(() => {
    if (group.current) group.current.position.y = on.current * 0.14;
    top.current?.color.lerpColors(WHITE, BLUE_SOFT, on.current);
    bar.current?.color.lerpColors(SLATE, BLUE, on.current);
    if (bar.current) bar.current.emissiveIntensity = on.current * 0.4;
  });

  return (
    <group position={[stationX(index), 0, 0]}>
      <BlobShadow size={3.6} opacity={0.9} />
      <group ref={group}>
        <RoundedBox args={[2.4, 0.36, 2.4]} radius={0.12} smoothness={4} position={[0, 0.18, 0]}>
          <meshStandardMaterial ref={top} color="#ffffff" roughness={0.6} />
        </RoundedBox>
        {/* Status light along the front edge. */}
        <mesh position={[0, 0.2, 1.205]}>
          <boxGeometry args={[1.2, 0.05, 0.01]} />
          <meshStandardMaterial ref={bar} color={SLATE} emissive={BLUE} emissiveIntensity={0} />
        </mesh>
        <Prop on={on} />
      </group>
      <mesh position={[-0.75, 0.005, 1.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36 * label.aspect, 0.36]} />
        <meshBasicMaterial map={label.texture} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- scene --------------------------------- */

function Scene({ progress }: { progress: Progress }) {
  const camera = useRef<THREE.OrthographicCamera>(null);
  const marker = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Mesh>(null);
  const smooth = useRef(0);
  const focus = useRef(stationX(0));
  const { size } = useThree();

  const first = stationX(0);
  const last = stationX(STEPS - 1);

  useFrame(({ clock }, delta) => {
    smooth.current = damp(smooth.current, progress.current, 5, delta);
    const s = smooth.current * (STEPS - 1);
    const from = Math.floor(Math.min(s, STEPS - 1.0001));
    const f = s - from;
    const eased = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    const x = THREE.MathUtils.lerp(stationX(from), stationX(Math.min(from + 1, STEPS - 1)), eased);

    if (marker.current) {
      marker.current.position.set(x, 1.55 + Math.sin(f * Math.PI) * 0.9 + Math.sin(clock.elapsedTime * 2) * 0.05, 0.9);
      marker.current.rotation.y += delta * 0.8;
    }
    if (trail.current) {
      const length = Math.max(0.001, x - first);
      trail.current.scale.x = length;
      trail.current.position.x = first + length / 2;
    }

    // The camera travels with the feature, staying clear of the ends.
    const visible = size.width / (camera.current?.zoom ?? 1);
    const margin = Math.min(visible * 0.32, (last - first) / 2);
    focus.current = damp(focus.current, THREE.MathUtils.clamp(x, first + margin, last - margin), 4, delta);
    if (camera.current) {
      // About two and a half stations across; the camera follows the feature.
      const zoom = Math.min(size.width / 8.2, size.height / 5.2);
      camera.current.zoom = zoom;
      const target = new THREE.Vector3(focus.current * 0.72, 1.25, -focus.current * 0.72);
      camera.current.position.copy(target).add(ISO);
      camera.current.lookAt(target);
      camera.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera ref={camera} makeDefault near={0.1} far={100} position={ISO.toArray()} />
      <StudioLights />
      {/* +45° lays the row of stations across the screen for the isometric camera. */}
      <group rotation={[0, Math.PI / 4, 0]}>
        {/* Track under the stations, and the part already travelled. */}
        <mesh position={[0, 0.02, 1.75]}>
          <boxGeometry args={[last - first, 0.03, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={trail} position={[first, 0.035, 1.75]}>
          <boxGeometry args={[1, 0.035, 0.09]} />
          <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.25} />
        </mesh>

        {Array.from({ length: STEPS }, (_, i) => (
          <Station key={i} index={i} progress={progress} />
        ))}

        <group ref={marker} position={[first, 1.55, 0.9]}>
          <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color={BLUE} roughness={0.25} metalness={0.1} emissive={BLUE} emissiveIntensity={0.18} />
          </RoundedBox>
        </group>
      </group>
    </>
  );
}

/** "From requirement to production": a feature travelling through six stations. */
export default function PipelineView({ progress, className }: { progress: Progress; className?: string }) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene progress={progress} />
      </SceneBoundary>
    </View>
  );
}
