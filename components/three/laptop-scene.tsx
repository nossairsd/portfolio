"use client";

import { Environment, Lightformer, PerspectiveCamera, RoundedBox, View, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import type { Progress } from "@/lib/use-scroll-progress";
import { BlobShadow, damp } from "./shared";

// 1600 px JPEGs: sharp on the laptop screen at its largest, a fraction of the
// GPU memory of the full-size PNGs, which matters on phones.
const SCREENS = [
  "/images/projects/screens/meta-ads-overview.jpg",
  "/images/projects/screens/meta-ads-client.jpg",
  "/images/projects/screens/meta-ads-home.jpg",
];

const WIDTH = 4.4;
const DEPTH = 3;
const LID_HEIGHT = 2.9;
const SCREEN_W = 4.05;
const SCREEN_H = SCREEN_W / 1.6;

const ALUMINIUM = { color: "#dfe3e8", metalness: 0.55, roughness: 0.32 } as const;

function Laptop({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screens = useRef<THREE.MeshBasicMaterial[]>([]);
  const smooth = useRef(0);
  const { size } = useThree();
  const textures = useTexture(SCREENS, (loaded) => {
    for (const texture of loaded) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 12;
    }
  });

  useFrame(({ clock, pointer }, delta) => {
    smooth.current = damp(smooth.current, progress.current, 4.5, delta);
    const p = smooth.current;

    // 0 → 0.28: the lid opens. Afterwards each third of the rest shows a screen.
    const open = THREE.MathUtils.smoothstep(p, 0, 0.28);
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.02, -0.26, open);

    const chapter = THREE.MathUtils.clamp((p - 0.22) / 0.78, 0, 0.9999) * SCREENS.length;
    screens.current.forEach((material, i) => {
      if (!material) return;
      const visible = THREE.MathUtils.clamp(1 - Math.abs(chapter - (i + 0.5)) * 2 + 0.5, 0, 1);
      material.opacity = i === 0 ? 1 : visible;
    });

    if (group.current) {
      const compact = size.width < 640;
      group.current.rotation.y = damp(
        group.current.rotation.y,
        THREE.MathUtils.lerp(-0.75, -0.18, open) + Math.sin(clock.elapsedTime * 0.4) * 0.03 + pointer.x * 0.06,
        3,
        delta,
      );
      group.current.rotation.x = THREE.MathUtils.lerp(0.32, 0.08, open) - pointer.y * 0.03;
      const scale = (compact ? 0.78 : 1) * THREE.MathUtils.lerp(0.9, 1, open);
      group.current.scale.setScalar(scale);
      group.current.position.y = THREE.MathUtils.lerp(-0.2, -0.75, open);
    }
  });

  return (
    <group ref={group}>
      <BlobShadow size={[WIDTH * 1.6, DEPTH * 1.5]} position={[0, -0.02, 0.1]} opacity={0.75} />

      {/* Base */}
      <RoundedBox args={[WIDTH, 0.16, DEPTH]} radius={0.07} smoothness={4} position={[0, 0.08, 0]}>
        <meshStandardMaterial {...ALUMINIUM} />
      </RoundedBox>
      <mesh position={[0, 0.162, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WIDTH * 0.84, DEPTH * 0.42]} />
        <meshStandardMaterial color="#c9ced6" roughness={0.6} metalness={0.2} />
      </mesh>
      {Array.from({ length: 5 }, (_, row) => (
        <mesh key={row} position={[0, 0.164, -0.93 + row * 0.24]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[WIDTH * 0.8, 0.012]} />
          <meshBasicMaterial color="#b8bec7" />
        </mesh>
      ))}
      <mesh position={[0, 0.162, 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.82]} />
        <meshStandardMaterial color="#d3d8df" roughness={0.45} metalness={0.3} />
      </mesh>

      {/* Lid, hinged along the back edge of the base. */}
      <group ref={lid} position={[0, 0.16, -DEPTH / 2 + 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <RoundedBox args={[WIDTH, LID_HEIGHT, 0.1]} radius={0.06} smoothness={4} position={[0, LID_HEIGHT / 2, 0]}>
          <meshStandardMaterial {...ALUMINIUM} />
        </RoundedBox>
        <mesh position={[0, LID_HEIGHT / 2, 0.052]}>
          <planeGeometry args={[WIDTH - 0.12, LID_HEIGHT - 0.12]} />
          <meshBasicMaterial color="#0b0f17" />
        </mesh>
        {textures.map((texture, i) => (
          <mesh key={i} position={[0, LID_HEIGHT / 2 + 0.04, 0.054 + i * 0.0015]} renderOrder={i}>
            <planeGeometry args={[SCREEN_W, SCREEN_H]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) screens.current[i] = m;
              }}
              map={texture}
              toneMapped={false}
              transparent={i > 0}
              opacity={i === 0 ? 1 : 0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Scene({ progress }: { progress: Progress }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3.1, 8.6]} fov={34} onUpdate={(c) => c.lookAt(0, 0.7, 0)} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      {/* Procedural studio reflections for the aluminium: no HDR file to fetch. */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} color="#dbeafe" position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[5, 1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.6} position={[0, 1, -6]} scale={[10, 4, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Laptop progress={progress} />
      </Suspense>
    </>
  );
}

/** The featured project on a laptop that opens and flips through its screens. */
export default function LaptopView({ progress, className }: { progress: Progress; className?: string }) {
  return (
    <View className={className}>
      <Scene progress={progress} />
    </View>
  );
}
