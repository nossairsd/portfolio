"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Progress } from "@/lib/use-scroll-progress";
import { SceneBoundary } from "./scene-boundary";
import { damp } from "./shared";
import { makeLabel } from "./textures";

export type ToolGroup = { name: string; items: string[] };

const CLOUD_RADIUS = 2.2;
const FOCUS_Z = 1.2;
const COLUMNS = 3;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Where a tile waits when its family is not the one being read. */
function cloudPosition(index: number, total: number) {
  const y = 1 - (index / Math.max(1, total - 1)) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = GOLDEN * index;
  // Pushed back so the waiting cards never cross the board in front.
  return new THREE.Vector3(Math.cos(angle) * ring * CLOUD_RADIUS, y * CLOUD_RADIUS * 0.82, Math.sin(angle) * ring * CLOUD_RADIUS * 0.6 - 1.9);
}

/** Where a tile goes when its family is read: a neat board facing the camera. */
function focusPosition(index: number, total: number) {
  const rows = Math.ceil(total / COLUMNS);
  const row = Math.floor(index / COLUMNS);
  const inRow = Math.min(COLUMNS, total - row * COLUMNS);
  const column = index % COLUMNS;
  return new THREE.Vector3(
    (column - (inRow - 1) / 2) * 1.12,
    ((rows - 1) / 2 - row) * 1.12,
    FOCUS_Z,
  );
}

/**
 * Draws one tool as a card: its real mark, taken from the very same icon the
 * list beside it renders, and its name under it. The mark is read from the DOM
 * so the 3D and the HTML can never drift apart.
 */
async function drawTool(name: string, svg: SVGElement | null) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

  // The card.
  const pad = 10;
  const radius = 46;
  ctx.beginPath();
  ctx.moveTo(pad + radius, pad);
  ctx.arcTo(size - pad, pad, size - pad, size - pad, radius);
  ctx.arcTo(size - pad, size - pad, pad, size - pad, radius);
  ctx.arcTo(pad, size - pad, pad, pad, radius);
  ctx.arcTo(pad, pad, size - pad, pad, radius);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(15,23,42,0.12)";
  ctx.stroke();

  // The mark.
  if (svg) {
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "112");
    clone.setAttribute("height", "112");
    clone.removeAttribute("class");
    const markup = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    await image.decode().catch(() => {});
    if (image.width) ctx.drawImage(image, (size - 112) / 2, 44, 112, 112);
  }

  // The name, on one or two lines.
  ctx.fillStyle = "#0b1220";
  ctx.font = `600 25px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = name.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > size - 48 && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  lines.push(line);
  const shown = lines.slice(0, 2);
  shown.forEach((text, i) => ctx.fillText(text, size / 2, 186 + i * 28 - (shown.length - 1) * 14));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Builds one card per tool, once the icons are in the page. */
function useToolTextures(names: string[]) {
  const [textures, setTextures] = useState<Map<string, THREE.Texture>>(new Map());

  useEffect(() => {
    let cancelled = false;
    const made: THREE.Texture[] = [];
    (async () => {
      const drawn: (readonly [string, THREE.Texture])[] = [];
      // A few cards per frame: drawing twenty at once would hold the page.
      for (let i = 0; i < names.length; i += 4) {
        const batch = await Promise.all(
          names.slice(i, i + 4).map(async (name) => {
            const host = document.querySelector<HTMLElement>(`[data-tool-icon="${CSS.escape(name)}"]`);
            return [name, await drawTool(name, host?.querySelector("svg") ?? null)] as const;
          }),
        );
        batch.forEach(([, texture]) => made.push(texture));
        if (cancelled) return;
        drawn.push(...batch);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (cancelled) return;
      }
      setTextures(new Map(drawn));
    })();
    return () => {
      cancelled = true;
      made.forEach((texture) => texture.dispose());
    };
  }, [names]);

  return textures;
}

type Tile = { name: string; group: number; indexInGroup: number; groupSize: number; cloud: THREE.Vector3 };

/**
 * One tool card, travelling between the cloud and the board.
 *
 * Both ends of that journey are ordinary points in the scene: the place the
 * card holds in the turning cloud, and its seat on the board. The card simply
 * walks from one to the other, so it never spins or swerves on the way. Cards
 * leave and arrive one after another, which reads as a deliberate move rather
 * than a crowd changing places at once.
 */
function ToolCard({ tile, texture, active, spin }: { tile: Tile; texture?: THREE.Texture; active: boolean; spin: React.RefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const shown = useRef(0);
  const waited = useRef(0);
  const was = useRef(active);
  const focus = useMemo(() => focusPosition(tile.indexInGroup, tile.groupSize), [tile]);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;

    // Each card waits its turn: the first leaves at once, the next just after.
    if (was.current !== active) {
      was.current = active;
      waited.current = 0;
    }
    waited.current += delta;
    const turn = tile.indexInGroup * 0.07;
    const wanted = active ? (waited.current >= turn ? 1 : 0) : waited.current >= turn ? 0 : shown.current;
    shown.current = damp(shown.current, wanted, 5.5, delta);
    const t = shown.current;

    // The cloud keeps turning at its own pace, whatever the card is doing.
    const angle = spin.current;
    const { x, y, z } = tile.cloud;
    target.set(x * Math.cos(angle) + z * Math.sin(angle), y, -x * Math.sin(angle) + z * Math.cos(angle));
    node.position.lerpVectors(target, focus, t);
    node.scale.setScalar(0.46 + 0.54 * t);

    const material = node.material as THREE.MeshBasicMaterial;
    material.opacity = 0.34 + 0.66 * t;
  });

  // Nothing is drawn until the card exists: adding a map to a material that
  // was built without one needs a new shader, so the mesh waits for it.
  if (!texture) return null;

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={0.34} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Scene({ groups, active, progress }: { groups: ToolGroup[]; active: number; progress: Progress }) {
  const spin = useRef(0);
  const stage = useRef<THREE.Group>(null);
  const title = useRef<THREE.Mesh>(null);

  const labels = useMemo(
    () => groups.map((group) => makeLabel(group.name, { size: 40, weight: 600, color: "#0b1220", background: "#ffffff", border: "rgba(37,99,235,0.22)" })),
    [groups],
  );
  useEffect(() => () => labels.forEach((label) => label.texture.dispose()), [labels]);
  const current = labels[active] ?? labels[0];

  const names = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const textures = useToolTextures(names);

  const tiles = useMemo<Tile[]>(() => {
    const total = names.length;
    let index = 0;
    return groups.flatMap((group, g) =>
      group.items.map((name, i) => ({
        name,
        group: g,
        indexInGroup: i,
        groupSize: group.items.length,
        cloud: cloudPosition(index++, total),
      })),
    );
  }, [groups, names.length]);

  useEffect(() => {
    const mesh = title.current;
    if (mesh) (mesh.material as THREE.MeshBasicMaterial).opacity = 0;
  }, [active]);

  useFrame(({ pointer }, delta) => {
    spin.current += delta * 0.12;
    if (title.current) {
      const material = title.current.material as THREE.MeshBasicMaterial;
      material.opacity = damp(material.opacity, 1, 7, delta);
    }
    if (stage.current) {
      stage.current.rotation.y = damp(stage.current.rotation.y, pointer.x * 0.16, 3, delta);
      stage.current.rotation.x = damp(stage.current.rotation.x, pointer.y * -0.1 + (progress.current - 0.5) * 0.1, 3, delta);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8.2]} fov={34} near={0.1} far={40} />
      <mesh ref={title} key={active} position={[0, 1.78, FOCUS_Z + 0.4]}>
        <planeGeometry args={[0.42 * (current?.aspect ?? 3), 0.42]} />
        <meshBasicMaterial map={current?.texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={stage}>
        {tiles.map((tile) => (
          <ToolCard
            key={`${tile.name}-${textures.has(tile.name) ? "ready" : "wait"}`}
            tile={tile}
            texture={textures.get(tile.name)}
            active={tile.group === active}
            spin={spin}
          />
        ))}
      </group>
    </>
  );
}

/**
 * The whole toolbox in space: every tool is a card with its own mark, drifting
 * as a cloud, and the family being read steps forward and lines up in front.
 */
export default function ToolsView({
  groups,
  active,
  progress,
  className,
}: {
  groups: ToolGroup[];
  active: number;
  progress: Progress;
  className?: string;
}) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene groups={groups} active={active} progress={progress} />
      </SceneBoundary>
    </View>
  );
}
