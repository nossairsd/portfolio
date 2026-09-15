"use client";

import { Environment, Lightformer, PerspectiveCamera, RoundedBox, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Progress } from "@/lib/use-scroll-progress";
import { LAPTOP_SCREENS, laptopTimeline, screenOpacity, screenSrc } from "./laptop-timeline";
import { SceneBoundary } from "./scene-boundary";
import { BlobShadow, damp } from "./shared";

const WIDTH = 4.4;
const DEPTH = 3;
const LID_HEIGHT = 2.9;
const SCREEN_W = 4.08;
const SCREEN_H = SCREEN_W / 1.6;
const SCREEN_Y = LID_HEIGHT / 2 + 0.05;

const ALUMINIUM = { color: "#dde1e6", metalness: 0.6, roughness: 0.3 } as const;
const BASE_CAMERA = new THREE.Vector3(0, 3.1, 8.6);
const BASE_LOOK = new THREE.Vector3(0, 0.7, 0);
const HALF_FOV = THREE.MathUtils.degToRad(34 / 2);
/** On wide stages the laptop is framed in the right part, beside the text. */
const WIDE = 900;
const FRAME_FROM = 0.45;

/**
 * Loads the screen images without Suspense and with retries; a screen stays
 * dark until its image is ready. Textures get the renderer's full anisotropy
 * so the product stays sharp when the screen is seen at an angle.
 */
function useScreenTextures(urls: string[], gl: THREE.WebGLRenderer) {
  const anisotropy = gl.capabilities.getMaxAnisotropy();
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(() => urls.map(() => null));

  useEffect(() => {
    let cancelled = false;
    const created: THREE.Texture[] = [];

    const load = (url: string, attempt = 0): Promise<HTMLImageElement> =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`image ${url}`));
        image.src = url;
      }).catch((error) => {
        if (attempt >= 3 || cancelled) throw error;
        return new Promise<void>((r) => setTimeout(r, 400 * (attempt + 1))).then(() => load(url, attempt + 1));
      });

    urls.forEach((url, i) => {
      load(url)
        .then((image) => {
          if (cancelled) return;
          const texture = new THREE.Texture(image);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = anisotropy;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
          created.push(texture);
          // Upload to the GPU now, while the section is still off screen,
          // rather than on the first frame it is seen.
          gl.initTexture(texture);
          setTextures((previous) => previous.map((t, j) => (j === i ? texture : t)));
        })
        .catch(() => {
          // Leave that screen dark rather than break the scene.
        });
    });

    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [urls, anisotropy, gl]);

  return textures;
}

/** Keys laid out as instances: one draw call for the whole keyboard. */
function Keyboard() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const layout = useMemo(() => {
    const keys: { x: number; z: number; w: number }[] = [];
    const pitch = 0.268;
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      const z = -1.0 + r * 0.25;
      if (r < rows - 1) {
        const count = 13;
        for (let c = 0; c < count; c++) keys.push({ x: (c - (count - 1) / 2) * pitch, z, w: 0.228 });
      } else {
        [-6, -5, -4, -3].forEach((c) => keys.push({ x: (c + 0.5) * pitch + 0.13, z, w: 0.228 }));
        keys.push({ x: 0, z, w: pitch * 5 - 0.04 });
        [3, 4, 5, 6].forEach((c) => keys.push({ x: (c - 0.5) * pitch - 0.13, z, w: 0.228 }));
      }
    }
    return keys;
  }, []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const matrix = new THREE.Matrix4();
    layout.forEach((key, i) => {
      matrix.compose(new THREE.Vector3(key.x, 0.172, key.z), new THREE.Quaternion(), new THREE.Vector3(key.w, 1, 1));
      m.setMatrixAt(i, matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [layout]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, layout.length]}>
      <boxGeometry args={[1, 0.018, 0.21]} />
      <meshStandardMaterial color="#24282f" roughness={0.55} metalness={0.1} />
    </instancedMesh>
  );
}

function Laptop({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const anchor = useRef<THREE.Object3D>(null);
  const meshes = useRef<THREE.Mesh[]>([]);
  const materials = useRef<THREE.MeshBasicMaterial[]>([]);
  const smooth = useRef(0);
  const { size, gl, camera } = useThree();
  const wide = size.width >= WIDE;

  const compact = size.width < 640;
  const urls = useMemo(() => LAPTOP_SCREENS.map((name) => screenSrc(name, typeof window !== "undefined" && window.innerWidth < 768)), []);
  const textures = useScreenTextures(urls, gl);

  const center = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, pointer }, delta) => {
    smooth.current = damp(smooth.current, progress.current, 4.5, delta);
    const { open, zoom, screen } = laptopTimeline(smooth.current);
    const settle = 1 - zoom;

    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.02, -0.24, open);

    if (group.current) {
      const turn = THREE.MathUtils.lerp(-0.75, -0.2, open);
      group.current.rotation.y = damp(
        group.current.rotation.y,
        (turn + Math.sin(clock.elapsedTime * 0.4) * 0.03 + pointer.x * 0.06) * settle,
        3,
        delta,
      );
      group.current.rotation.x = (THREE.MathUtils.lerp(0.32, 0.08, open) - pointer.y * 0.03) * settle;
      group.current.scale.setScalar((compact ? 0.78 : 1) * THREE.MathUtils.lerp(0.9, 1, open));
      group.current.position.y = THREE.MathUtils.lerp(-0.2, -0.75, open);
    }

    // Screens: each shows the whole interface, edge to edge; the next one
    // fades in above the current one, which then leaves.
    textures.forEach((_, i) => {
      const material = materials.current[i];
      const mesh = meshes.current[i];
      if (!material || !mesh) return;
      const opacity = screenOpacity(i, screen);
      material.opacity = opacity;
      mesh.visible = opacity > 0.001;
    });

    // Camera: from the product shot to facing the screen, filling the stage.
    if (anchor.current && zoom > 0.0001) {
      anchor.current.getWorldPosition(center);
      anchor.current.getWorldQuaternion(quaternion);
      normal.set(0, 0, 1).applyQuaternion(quaternion);
      const scale = group.current?.scale.x ?? 1;
      const aspect = (wide ? size.width * (1 - FRAME_FROM) : size.width) / size.height;
      const view = 2 * Math.tan(HALF_FOV);
      // Close enough to read the product: the lid fills the frame on the right,
      // the keyboard slides out below, and nothing crosses into the text.
      const distance = Math.max((SCREEN_H * scale) / (view * 0.8), (WIDTH * 1.08 * scale) / (view * aspect * 0.8));
      eye.copy(center).addScaledVector(normal, distance);
      const eased = zoom * zoom * (3 - 2 * zoom);
      camera.position.lerpVectors(BASE_CAMERA, eye, eased);
      look.lerpVectors(BASE_LOOK, center, eased);
    } else {
      camera.position.copy(BASE_CAMERA);
      look.copy(BASE_LOOK);
    }
    // Frame the laptop in the right part of wide stages by sliding the camera
    // sideways: moving it left moves the laptop right on screen. (A projection
    // view offset does the same but stalled the page when the view scrolled out.)
    if (wide) {
      forward.subVectors(look, camera.position);
      const reach = forward.length();
      right.crossVectors(forward, camera.up).normalize();
      const across = 2 * reach * Math.tan(HALF_FOV) * (size.width / size.height);
      const slide = (FRAME_FROM / 2 - 0.025) * across;
      camera.position.addScaledVector(right, -slide);
      look.addScaledVector(right, -slide);
    }
    camera.lookAt(look);
  });

  return (
    <group ref={group}>
      <BlobShadow size={[WIDTH * 1.6, DEPTH * 1.5]} position={[0, -0.02, 0.1]} opacity={0.75} />

      {/* Base */}
      <RoundedBox args={[WIDTH, 0.16, DEPTH]} radius={0.07} smoothness={5} position={[0, 0.08, 0]}>
        <meshStandardMaterial {...ALUMINIUM} />
      </RoundedBox>
      {/* Keyboard well and keys */}
      <mesh position={[0, 0.161, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.72, 1.3]} />
        <meshStandardMaterial color="#b9bfc8" roughness={0.7} metalness={0.2} />
      </mesh>
      <Keyboard />
      {/* Trackpad */}
      <RoundedBox args={[1.55, 0.006, 0.92]} radius={0.003} smoothness={2} position={[0, 0.162, 0.88]}>
        <meshStandardMaterial color="#d0d5dc" roughness={0.35} metalness={0.35} />
      </RoundedBox>
      {/* Hinge */}
      <mesh position={[0, 0.12, -DEPTH / 2 + 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, WIDTH * 0.72, 24]} />
        <meshStandardMaterial color="#9aa1ab" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Lid, hinged along the back edge of the base. */}
      <group ref={lid} position={[0, 0.16, -DEPTH / 2 + 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <RoundedBox args={[WIDTH, LID_HEIGHT, 0.09]} radius={0.06} smoothness={5} position={[0, LID_HEIGHT / 2, 0]}>
          <meshStandardMaterial {...ALUMINIUM} />
        </RoundedBox>
        {/* Bezel */}
        <mesh position={[0, LID_HEIGHT / 2, 0.047]}>
          <planeGeometry args={[WIDTH - 0.08, LID_HEIGHT - 0.08]} />
          <meshStandardMaterial color="#07090d" roughness={0.18} metalness={0.4} />
        </mesh>
        <mesh position={[0, LID_HEIGHT - 0.1, 0.049]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
        <object3D ref={anchor} position={[0, SCREEN_Y, 0.05]} />
        {textures.map((texture, i) => (
          // Keyed on the texture: adding a map to a material needs a new shader.
          <mesh
            key={`${i}-${texture ? "ready" : "empty"}`}
            ref={(m) => {
              if (m) meshes.current[i] = m;
            }}
            position={[0, SCREEN_Y, 0.05 + i * 0.0012]}
            renderOrder={i}
            visible={i === 0}
          >
            <planeGeometry args={[SCREEN_W, SCREEN_H]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) materials.current[i] = m;
              }}
              map={texture}
              color={texture ? "#ffffff" : "#0b0f17"}
              toneMapped={false}
              transparent={i > 0}
              opacity={i === 0 ? 1 : 0}
              depthWrite={i === 0}
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
      <PerspectiveCamera makeDefault position={BASE_CAMERA.toArray()} fov={34} near={0.05} far={60} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} />
      {/* Procedural studio reflections for the aluminium: no HDR file to fetch. */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} color="#dbeafe" position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[5, 1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.6} position={[0, 1, -6]} scale={[10, 4, 1]} />
      </Environment>
      <Laptop progress={progress} />
    </>
  );
}

/** The featured project on a laptop: it opens, the camera flies into the screen, and the product plays. */
export default function LaptopView({ progress, className }: { progress: Progress; className?: string }) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene progress={progress} />
      </SceneBoundary>
    </View>
  );
}
