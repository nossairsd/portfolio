"use client";

import { Edges, OrthographicCamera, RoundedBox, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  siDocker,
  siExpress,
  siGithubactions,
  siLinux,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siRabbitmq,
  siReact,
  siSpring,
  siSpringboot,
  siTailwindcss,
} from "simple-icons";
import * as THREE from "three";
import type { Progress } from "@/lib/use-scroll-progress";
import { BLUE, BlobShadow, StudioLights, damp } from "./shared";
import { makeLabel, makeLogoTile } from "./textures";

type Icon = { path: string; hex: string } | undefined;

/** Brand marks per layer item, in the order of the messages. */
const ICONS: Icon[][] = [
  [siReact, siNextdotjs, siTailwindcss, siReact],
  [siNodedotjs, siExpress, siSpringboot, siSpring],
  [siPostgresql, undefined, siPrisma, siRabbitmq],
  [undefined, siDocker, siGithubactions, siLinux],
];

const LAYER_W = 5.6;
const LAYER_D = 3.6;
const COLLAPSED = 0.5;
const EXPANDED = 1.85;
const ISO = new THREE.Vector3(10, 9, 10);

function Layer({
  index,
  name,
  items,
  spread,
  highlight,
}: {
  index: number;
  name: string;
  items: string[];
  spread: { current: number };
  highlight: { current: number };
}) {
  const group = useRef<THREE.Group>(null);
  const slab = useRef<THREE.MeshStandardMaterial>(null);
  const edge = useRef<THREE.LineBasicMaterial>(null);

  const tiles = useMemo(
    () => items.map((item, i) => makeLogoTile(item, ICONS[index]?.[i]?.path, ICONS[index]?.[i]?.hex)),
    [items, index],
  );
  const label = useMemo(
    () => makeLabel(name, { prefix: `L${index + 1}`, size: 42, weight: 600 }),
    [name, index],
  );
  useEffect(
    () => () => {
      tiles.forEach((t) => t.dispose());
      label.texture.dispose();
    },
    [tiles, label],
  );

  const baseTint = useMemo(() => new THREE.Color(index === 0 ? "#ffffff" : index === 3 ? "#eef4ff" : "#f8fafc"), [index]);
  const litTint = useMemo(() => new THREE.Color("#bfdbfe"), []);
  const edgeTint = useMemo(() => new THREE.Color("#cbd5e1"), []);

  useFrame((_, delta) => {
    const lit = THREE.MathUtils.clamp(1 - Math.abs(highlight.current - index), 0, 1);
    if (group.current) {
      // Layer 0 is on top; the stack spreads around its middle. The lit layer lifts.
      const y = (1.5 - index) * spread.current + lit * 0.18;
      group.current.position.y = damp(group.current.position.y, y, 8, delta);
    }
    slab.current?.color.lerpColors(baseTint, litTint, lit);
    edge.current?.color.lerpColors(edgeTint, BLUE, lit);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[LAYER_W, 0.22, LAYER_D]} radius={0.1} smoothness={4}>
        <meshStandardMaterial ref={slab} color={baseTint} roughness={0.5} transparent opacity={0.96} />
        <Edges threshold={30}>
          <lineBasicMaterial ref={edge} color="#cbd5e1" />
        </Edges>
      </RoundedBox>

      {items.map((item, i) => (
        <group key={item} position={[-2.1 + i * 1.4, 0.2, -0.25]}>
          <RoundedBox args={[1.05, 0.14, 1.05]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color="#ffffff" roughness={0.45} />
          </RoundedBox>
          <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.92, 0.92]} />
            <meshBasicMaterial map={tiles[i]} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[-LAYER_W / 2 + 0.2 + (0.42 * label.aspect) / 2, 0.115, LAYER_D / 2 - 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42 * label.aspect, 0.42]} />
        <meshBasicMaterial map={label.texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Requests going down through the layers and responses coming back up. */
function Packets({ spread }: { spread: { current: number } }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const lanes = [
    { x: 2.35, z: 1.1, speed: 0.35, offset: 0, down: true },
    { x: 2.35, z: 1.1, speed: 0.35, offset: 0.5, down: true },
    { x: 2.65, z: 0.6, speed: 0.3, offset: 0.25, down: false },
  ];

  useFrame(({ clock }) => {
    const height = 3 * spread.current;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const lane = lanes[i];
      const t = (clock.elapsedTime * lane.speed + lane.offset) % 1;
      const y = lane.down ? height / 2 - t * height : -height / 2 + t * height;
      mesh.position.set(lane.x, y + 0.2, lane.z);
      const fade = Math.sin(t * Math.PI);
      mesh.scale.setScalar(0.35 + fade * 0.65);
    });
  });

  return (
    <>
      {[2.35, 2.65].map((x, i) => (
        <mesh key={x} position={[x, 0.2, i === 0 ? 1.1 : 0.6]}>
          <cylinderGeometry args={[0.018, 0.018, 7, 8]} />
          <meshBasicMaterial color="#bfdbfe" />
        </mesh>
      ))}
      {lanes.map((lane, i) => (
        <mesh key={i} ref={(m) => { if (m) refs.current[i] = m; }}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial
            color={lane.down ? BLUE : "#16a34a"}
            emissive={lane.down ? BLUE : "#16a34a"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </>
  );
}

function Scene({ progress, layers }: { progress: Progress; layers: { name: string; items: string[] }[] }) {
  const camera = useRef<THREE.OrthographicCamera>(null);
  const root = useRef<THREE.Group>(null);
  const spread = useRef(COLLAPSED);
  const highlight = useRef(-1);
  const { size } = useThree();

  useFrame(({ clock, pointer }, delta) => {
    const p = progress.current;
    const open = THREE.MathUtils.smoothstep(p, 0.05, 0.45);
    spread.current = damp(spread.current, THREE.MathUtils.lerp(COLLAPSED, EXPANDED, open), 5, delta);
    // Once apart, the highlight walks down the stack, layer by layer.
    const walk = THREE.MathUtils.clamp((p - 0.45) / 0.5, 0, 1) * (layers.length - 1);
    highlight.current = damp(highlight.current, p < 0.42 ? -1 : walk, 6, delta);

    if (root.current) {
      root.current.rotation.y = damp(root.current.rotation.y, THREE.MathUtils.lerp(0.25, -0.05, open) + pointer.x * 0.08, 3, delta);
      root.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.04;
    }
    if (camera.current) {
      camera.current.zoom = Math.min(size.width / 9, size.height / (5.2 + spread.current * 3));
      camera.current.lookAt(0, 0, 0);
      camera.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera ref={camera} makeDefault position={ISO.toArray()} near={0.1} far={100} />
      <StudioLights />
      <group ref={root}>
        {layers.map((layer, i) => (
          <Layer key={layer.name} index={i} name={layer.name} items={layer.items} spread={spread} highlight={highlight} />
        ))}
        <Packets spread={spread} />
        <BlobShadow size={[9, 7]} position={[0, -3.6, 0]} opacity={0.5} />
      </group>
    </>
  );
}

/** The stack as the layers of a system, pulled apart by scrolling. */
export default function ArchitectureView({
  progress,
  layers,
  className,
}: {
  progress: Progress;
  layers: { name: string; items: string[] }[];
  className?: string;
}) {
  return (
    <View className={className}>
      <Scene progress={progress} layers={layers} />
    </View>
  );
}
