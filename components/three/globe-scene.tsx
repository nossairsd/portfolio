"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SceneBoundary } from "./scene-boundary";
import { CITIES, type CityId } from "@/lib/site";
import type { Progress } from "@/lib/use-scroll-progress";
import dots from "./globe-dots.json";
import { BLUE, damp } from "./shared";
import { makeLabel } from "./textures";

const RADIUS = 2;
const DEG = Math.PI / 180;
const DESTINATIONS: CityId[] = ["paris", "lyon", "brussels", "geneva", "luxembourg", "amsterdam"];

function toVector(lat: number, lon: number, radius = RADIUS) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Rotation that brings (lat, lon) to face a camera looking down -Z. */
function facing(lat: number, lon: number) {
  return { x: lat * DEG, y: -Math.PI / 2 - lon * DEG };
}

const dotVertex = /* glsl */ `
  uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 normalView = normalize(normalMatrix * normalize(position));
    vFacing = normalView.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = 3.4 * uPixelRatio * (7.0 / -mv.z);
  }
`;

const dotFragment = /* glsl */ `
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;
    float front = smoothstep(-0.1, 0.45, vFacing);
    vec3 color = mix(vec3(0.80, 0.84, 0.90), vec3(0.39, 0.45, 0.55), front);
    gl_FragColor = vec4(color, mix(0.18, 1.0, front));
  }
`;

function LandDots() {
  const geometry = useMemo(() => {
    const list = dots as number[];
    const positions = new Float32Array((list.length / 2) * 3);
    for (let i = 0; i < list.length; i += 2) {
      const v = toVector(list[i], list[i + 1], RADIUS * 1.002);
      positions.set([v.x, v.y, v.z], (i / 2) * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  const uniforms = useMemo(() => ({ uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry}>
      <shaderMaterial vertexShader={dotVertex} fragmentShader={dotFragment} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}

function Arc({ to, index, drawn }: { to: CityId; index: number; drawn: { current: number } }) {
  const line = useRef<THREE.Line>(null);
  const traveller = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const start = toVector(CITIES.tangier.lat, CITIES.tangier.lon);
    const end = toVector(CITIES[to].lat, CITIES[to].lon);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const lift = 1 + start.distanceTo(end) * 0.55;
    mid.normalize().multiplyScalar(RADIUS * lift);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [to]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)), [curve]);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.85 }), []);
  const object = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    // Arcs are drawn one after another as the section scrolls in.
    const own = THREE.MathUtils.clamp(drawn.current * DESTINATIONS.length - index * 0.6, 0, 1);
    geometry.setDrawRange(0, Math.floor(own * 65));
    if (traveller.current) {
      const t = (clock.elapsedTime * 0.25 + index * 0.17) % 1;
      traveller.current.position.copy(curve.getPoint(t * own));
      traveller.current.visible = own > 0.98;
    }
  });

  return (
    <>
      <primitive ref={line} object={object} />
      <mesh ref={traveller}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshBasicMaterial color={BLUE} />
      </mesh>
    </>
  );
}

/** A city marker. Only home carries a label: the European cities sit too close
 *  together to label legibly, so the page lists them under the globe. */
function City({ id, label }: { id: CityId; label?: string }) {
  const home = Boolean(label);
  const ring = useRef<THREE.Mesh>(null);
  const position = useMemo(() => toVector(CITIES[id].lat, CITIES[id].lon, RADIUS * 1.01), [id]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()),
    [position],
  );
  const tag = useMemo(
    () => (label ? makeLabel(label, { size: 40, weight: 700, color: "#ffffff", background: "#2563eb", border: null }) : null),
    [label],
  );
  const center = useMemo(() => new THREE.Vector2(1.1, 0.5), []);
  useEffect(() => () => tag?.texture.dispose(), [tag]);

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime * 0.8 + (home ? 0 : position.x * 3)) % 1;
    ring.current.scale.setScalar(1 + t * (home ? 2.4 : 1.4));
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.7;
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[home ? 0.05 : 0.028, 24]} />
        <meshBasicMaterial color={home ? BLUE : "#0b1220"} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.045, 0.058, 32]} />
        <meshBasicMaterial color={BLUE} transparent depthWrite={false} />
      </mesh>
      {tag ? (
        <sprite position={[0, 0, 0.02]} center={center} scale={[0.2 * tag.aspect, 0.2, 1]} renderOrder={10}>
          <spriteMaterial map={tag.texture} depthTest={false} toneMapped={false} />
        </sprite>
      ) : null}
    </group>
  );
}

function Scene({ progress, home }: { progress: Progress; home: string }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const drawn = useRef(0);
  const end = facing(42, 1);

  useFrame(({ pointer }, delta) => {
    const p = progress.current;
    drawn.current = damp(drawn.current, THREE.MathUtils.smoothstep(p, 0.3, 0.85), 4, delta);
    // Approach Europe from the Atlantic as the section scrolls in.
    const lon = THREE.MathUtils.lerp(-55, 1, THREE.MathUtils.smoothstep(p, 0, 0.7));
    const target = facing(42, lon);
    if (spin.current) spin.current.rotation.y = damp(spin.current.rotation.y, target.y + pointer.x * 0.1, 4, delta);
    if (tilt.current) tilt.current.rotation.x = damp(tilt.current.rotation.x, end.x - pointer.y * 0.05, 4, delta);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8.4]} fov={30} />
      <group ref={tilt}>
        <group ref={spin}>
          {/* Occluder with a faint blue rim, so the far side reads as depth. */}
          <mesh>
            <sphereGeometry args={[RADIUS * 0.995, 64, 64]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <LandDots />
          {DESTINATIONS.map((id, i) => (
            <Arc key={id} to={id} index={i} drawn={drawn} />
          ))}
          {DESTINATIONS.map((id) => (
            <City key={id} id={id} />
          ))}
          <City id="tangier" label={home} />
        </group>
      </group>
      {/* Atmosphere halo, drawn behind the globe. */}
      <mesh position={[0, 0, -0.5]}>
        <ringGeometry args={[RADIUS * 0.98, RADIUS * 1.16, 128]} />
        <meshBasicMaterial color="#dbeafe" transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </>
  );
}

/** Where I am, and where I can go: Tangier with routes to French-speaking Europe. */
export default function GlobeView({ progress, home, className }: { progress: Progress; home: string; className?: string }) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene progress={progress} home={home} />
      </SceneBoundary>
    </View>
  );
}
