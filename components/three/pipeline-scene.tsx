"use client";

import { Billboard, OrthographicCamera, RoundedBox, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  siDocker,
  siGithubactions,
  siJira,
  siJunit5,
  siPostgresql,
  siReact,
  siSpringboot,
  siTypescript,
  siVitest,
} from "simple-icons";
import * as THREE from "three";
import type { Progress } from "@/lib/use-scroll-progress";
import { PIPELINE_STEPS as STEPS, stationPosition } from "./pipeline-steps";
import { SceneBoundary } from "./scene-boundary";
import { BLUE, BLUE_SOFT, BlobShadow, GREEN, SLATE, StudioLights, WHITE, damp } from "./shared";
import { drawTexture, makeBadge, makeLabel, makeMark } from "./textures";

const SPACING = 4.2;
const TOP = 0.3;
const ISO = new THREE.Vector3(9, 8.5, 9);
const DOCKER = new THREE.Color("#2496ED");
const SKY = new THREE.Color("#dbeafe");

const stationX = (i: number) => (i - (STEPS - 1) / 2) * SPACING;
const clamp01 = (v: number) => THREE.MathUtils.clamp(v, 0, 1);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

/** Activation (0 → 1) of a station, shared by the parts that react to it. */
type Activation = { current: number };

function useActivation(index: number, progress: Progress): Activation {
  const value = useRef(0);
  useFrame((_, delta) => {
    value.current = damp(value.current, clamp01(stationPosition(progress.current) - index + 0.6), 6, delta);
  });
  return value;
}

/** Disposes textures created in a memo when the component leaves. */
function useDispose(textures: THREE.Texture[]) {
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
}

/* -------------------------------------------------------------------------- */
/*  01 · Understand the need — a Jira board, the story moves to Done          */
/* -------------------------------------------------------------------------- */

function StoryCard({ accent, tint = "#ffffff" }: { accent: string; tint?: string }) {
  return (
    <group>
      <RoundedBox args={[0.56, 0.04, 0.3]} radius={0.015} smoothness={2}>
        <meshStandardMaterial color={tint} roughness={0.5} />
      </RoundedBox>
      <mesh position={[-0.255, 0.022, 0]}>
        <boxGeometry args={[0.03, 0.008, 0.26]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh position={[0.02, 0.022, -0.05]}>
        <boxGeometry args={[0.36, 0.004, 0.04]} />
        <meshBasicMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-0.04, 0.022, 0.05]}>
        <boxGeometry args={[0.24, 0.004, 0.04]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

const LANES = [-0.74, 0, 0.74];
const LANE_HEADERS = ["#94a3b8", "#2563eb", "#16a34a"];

function Board({ on }: { on: Activation }) {
  const story = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = THREE.MathUtils.smoothstep(on.current, 0.15, 1);
    if (!story.current) return;
    story.current.position.x = THREE.MathUtils.lerp(LANES[0], LANES[2], t);
    story.current.position.y = 0.13 + Math.sin(t * Math.PI) * 0.3;
  });

  return (
    <group position={[0, TOP, 0]}>
      <RoundedBox args={[2.36, 0.08, 1.9]} radius={0.04} smoothness={2} position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </RoundedBox>
      {LANES.map((x, i) => (
        <group key={x} position={[x, 0.083, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
            <planeGeometry args={[0.68, 1.5]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, 0.008, -0.71]}>
            <boxGeometry args={[0.68, 0.016, 0.1]} />
            <meshBasicMaterial color={LANE_HEADERS[i]} />
          </mesh>
        </group>
      ))}
      <group position={[LANES[0], 0.11, -0.4]}>
        <StoryCard accent="#94a3b8" />
      </group>
      <group position={[LANES[0], 0.11, 0]}>
        <StoryCard accent="#94a3b8" />
      </group>
      <group position={[LANES[1], 0.11, -0.4]}>
        <StoryCard accent="#2563eb" />
      </group>
      <group position={[LANES[2], 0.11, -0.4]}>
        <StoryCard accent="#16a34a" />
      </group>
      <group ref={story} position={[LANES[0], 0.13, 0.42]}>
        <StoryCard accent="#2563eb" tint="#eff6ff" />
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  02 · Design the solution — a data model around a PostgreSQL database      */
/* -------------------------------------------------------------------------- */

const TABLES: [number, number][] = [
  [-0.5, -0.45],
  [0.66, -0.4],
  [0.55, 0.52],
];

function DataModel({ on }: { on: Activation }) {
  const tables = useRef<THREE.Group[]>([]);
  const headers = useRef<THREE.MeshStandardMaterial[]>([]);
  const links = useRef<THREE.Group>(null);
  const bands = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(() => {
    tables.current.forEach((table, i) => {
      if (table) table.position.y = 0.05 + easeOut(clamp01(on.current * 1.6 - i * 0.25)) * 0.24;
    });
    headers.current.forEach((m) => m?.color.lerpColors(SLATE, BLUE, on.current));
    bands.current.forEach((m) => m?.color.lerpColors(SLATE, BLUE, on.current));
    if (links.current) {
      links.current.position.y = 0.1 + on.current * 0.24;
      links.current.scale.set(1, 1, 1).multiplyScalar(Math.max(0.001, clamp01(on.current * 1.4 - 0.3)));
    }
  });

  return (
    <group position={[0, TOP, 0]}>
      {/* Relations, drawn once the tables have risen. */}
      <group ref={links}>
        <mesh position={[0.08, 0, -0.42]}>
          <boxGeometry args={[1.16, 0.025, 0.025]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
        <mesh position={[0.6, 0, 0.06]}>
          <boxGeometry args={[0.025, 0.025, 0.92]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
      </group>

      {TABLES.map(([x, z], i) => (
        <group key={i} ref={(g) => { if (g) tables.current[i] = g; }} position={[x, 0.05, z]}>
          <RoundedBox args={[0.86, 0.06, 0.64]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.034, -0.24]}>
            <boxGeometry args={[0.86, 0.012, 0.16]} />
            <meshStandardMaterial ref={(m) => { if (m) headers.current[i] = m; }} color={SLATE} />
          </mesh>
          {[-0.06, 0.07, 0.2].map((rz, r) => (
            <group key={rz} position={[0, 0.034, rz]}>
              <mesh position={[-0.33, 0, 0]}>
                <boxGeometry args={[0.05, 0.006, 0.05]} />
                <meshBasicMaterial color={r === 0 ? "#f59e0b" : "#cbd5e1"} />
              </mesh>
              <mesh position={[0.02, 0, 0]}>
                <boxGeometry args={[0.56, 0.005, 0.035]} />
                <meshBasicMaterial color="#e2e8f0" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* The database itself */}
      <group position={[-0.62, 0, 0.5]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 40]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} />
        </mesh>
        {[0.2, 0.4].map((y, i) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.305, 0.305, 0.03, 40]} />
            <meshStandardMaterial ref={(m) => { if (m) bands.current[i] = m; }} color={SLATE} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  03 · Build the API and the interface — code being written, an API answer  */
/* -------------------------------------------------------------------------- */

type Token = [string, string];
const CODE: Token[][] = [
  [["@Get", "#c084fc"], ['("/audits/:id")', "#fbbf24"]],
  [["async ", "#60a5fa"], ["findOne", "#e2e8f0"], ["(id: ", "#94a3b8"], ["string", "#34d399"], [") {", "#94a3b8"]],
  [["  const ", "#60a5fa"], ["audit ", "#e2e8f0"], ["= await ", "#94a3b8"], ["this.audits", "#e2e8f0"], [".find(id);", "#94a3b8"]],
  [["  if ", "#60a5fa"], ["(!audit) ", "#94a3b8"], ["throw ", "#60a5fa"], ["new NotFound();", "#f87171"]],
  [["  return ", "#60a5fa"], ["toDto", "#fbbf24"], ["(audit);", "#94a3b8"]],
  [["}", "#94a3b8"]],
];

const SCREEN_W = 1.9;
const SCREEN_H = 1.12;
const BAR = 0.12;

function Editor({ on }: { on: Activation }) {
  const mask = useRef<THREE.Mesh>(null);
  const response = useRef<THREE.Group>(null);

  const [code, pill] = useMemo(
    () => [
      drawTexture(960, 566, (ctx) => {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 960, 566);
        ctx.fillStyle = "#16213a";
        ctx.fillRect(0, 0, 960, 60);
        ctx.fillStyle = "#1e2b47";
        ctx.fillRect(24, 12, 300, 48);
        ctx.font = "500 24px ui-monospace, monospace";
        ctx.fillStyle = "#cbd5e1";
        ctx.textBaseline = "middle";
        ctx.fillText("audits.controller.ts", 46, 37);
        CODE.forEach((line, i) => {
          const y = 118 + i * 66;
          ctx.fillStyle = "#475569";
          ctx.fillText(String(i + 1), 32, y);
          let x = 90;
          ctx.font = "500 32px ui-monospace, monospace";
          line.forEach(([text, color]) => {
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            x += ctx.measureText(text).width;
          });
          ctx.font = "500 24px ui-monospace, monospace";
        });
      }),
      drawTexture(640, 180, (ctx, { font, roundedRect }) => {
        roundedRect(ctx, 0, 0, 640, 180, 36);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        roundedRect(ctx, 28, 52, 110, 76, 18);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 34px ${font}`;
        ctx.textBaseline = "middle";
        ctx.fillText("GET", 46, 92);
        ctx.fillStyle = "#0b1220";
        ctx.font = "500 34px ui-monospace, monospace";
        ctx.fillText("/api/audits/42", 160, 92);
        roundedRect(ctx, 488, 52, 124, 76, 18);
        ctx.fillStyle = "#dcfce7";
        ctx.fill();
        ctx.fillStyle = "#15803d";
        ctx.font = `700 34px ${font}`;
        ctx.fillText("200", 516, 92);
      }),
    ],
    [],
  );
  useDispose([code, pill]);

  useFrame(({ clock }) => {
    // Lines appear top to bottom as the station activates.
    const reveal = THREE.MathUtils.smoothstep(on.current, 0.1, 0.95);
    const content = SCREEN_H - BAR;
    const hidden = Math.max(0.0001, (1 - reveal) * content);
    if (mask.current) {
      mask.current.scale.y = hidden;
      mask.current.position.y = -SCREEN_H / 2 + hidden / 2;
    }
    if (response.current) {
      const ready = THREE.MathUtils.smoothstep(on.current, 0.7, 1);
      response.current.scale.setScalar(Math.max(0.001, easeOutBack(ready)));
      response.current.position.y = 0.1 + Math.sin(clock.elapsedTime * 2) * 0.02 * ready;
    }
  });

  return (
    <group position={[0, TOP, 0]}>
      {/* Monitor */}
      <group position={[-0.1, 0, -0.35]}>
        <RoundedBox args={[0.74, 0.05, 0.44]} radius={0.02} smoothness={2} position={[0, 0.025, 0.05]}>
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.2} />
        </RoundedBox>
        <mesh position={[0, 0.3, -0.04]}>
          <boxGeometry args={[0.14, 0.5, 0.06]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.35} />
        </mesh>
        <group position={[0, 1.08, 0]}>
          <RoundedBox args={[SCREEN_W + 0.12, SCREEN_H + 0.12, 0.08]} radius={0.04} smoothness={2}>
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0, 0.041]}>
            <planeGeometry args={[SCREEN_W, SCREEN_H]} />
            <meshBasicMaterial map={code} toneMapped={false} />
          </mesh>
          <mesh ref={mask} position={[0, 0, 0.042]}>
            <planeGeometry args={[SCREEN_W, 1]} />
            <meshBasicMaterial color="#0f172a" toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* The API answering */}
      <group ref={response} position={[0.55, 0.1, 0.72]}>
        <RoundedBox args={[1.2, 0.08, 0.34]} radius={0.03} smoothness={2}>
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 0.34]} />
          <meshBasicMaterial map={pill} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  04 · Test — a report whose suites turn green one by one                   */
/* -------------------------------------------------------------------------- */

const SUITES = ["auth.spec.ts", "audits.api.test.ts", "report.e2e.ts", "pdf-export.test.ts", "alerts.spec.ts"];
const PANEL_W = 1.9;
const PANEL_H = 1.34;
const ROW_TOP = 140;
const ROW_H = 84;
const TEX_H = 600;

function TestReport({ on }: { on: Activation }) {
  const dots = useRef<THREE.MeshStandardMaterial[]>([]);
  const badge = useRef<THREE.Group>(null);

  const [report, check] = useMemo(
    () => [
      drawTexture(850, TEX_H, (ctx, { font }) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 850, TEX_H);
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#0b1220";
        ctx.font = `700 40px ${font}`;
        ctx.fillText("Test suites", 40, 66);
        ctx.fillStyle = "#64748b";
        ctx.font = "500 28px ui-monospace, monospace";
        ctx.fillText("265 tests", 640, 66);
        SUITES.forEach((name, i) => {
          const y = ROW_TOP + i * ROW_H;
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(40, y, 770, 2);
          ctx.fillStyle = "#334155";
          ctx.font = "500 32px ui-monospace, monospace";
          ctx.fillText(name, 40, y + ROW_H / 2);
        });
      }),
      drawTexture(256, 256, (ctx) => {
        ctx.beginPath();
        ctx.arc(128, 128, 124, 0, Math.PI * 2);
        ctx.fillStyle = "#16a34a";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 26;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(78, 132);
        ctx.lineTo(112, 166);
        ctx.lineTo(180, 94);
        ctx.stroke();
      }),
    ],
    [],
  );
  useDispose([report, check]);

  useFrame(() => {
    dots.current.forEach((m, i) => {
      if (!m) return;
      const t = clamp01(on.current * 6.5 - i * 1.05 - 0.3);
      m.color.lerpColors(SLATE, GREEN, t);
      m.emissiveIntensity = t * 0.35;
    });
    if (badge.current) badge.current.scale.setScalar(Math.max(0.001, easeOutBack(THREE.MathUtils.smoothstep(on.current, 0.82, 1))));
  });

  const rowY = (i: number) => PANEL_H * (0.5 - (ROW_TOP + i * ROW_H + ROW_H / 2) / TEX_H);

  return (
    <group position={[0, TOP, 0]}>
      <group position={[-0.1, 0.9, -0.35]}>
        <RoundedBox args={[PANEL_W + 0.08, PANEL_H + 0.08, 0.07]} radius={0.04} smoothness={2}>
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.036]}>
          <planeGeometry args={[PANEL_W, PANEL_H]} />
          <meshBasicMaterial map={report} toneMapped={false} />
        </mesh>
        {SUITES.map((name, i) => (
          <mesh key={name} position={[0.76, rowY(i), 0.05]}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshStandardMaterial ref={(m) => { if (m) dots.current[i] = m; }} color={SLATE} emissive={GREEN} emissiveIntensity={0} />
          </mesh>
        ))}
        <mesh position={[0, -PANEL_H / 2 - 0.47, 0.1]}>
          <boxGeometry args={[0.1, 0.9, 0.06]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      <group ref={badge} position={[0.72, 0.42, 0.6]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 40]} />
          <meshStandardMaterial color="#16a34a" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 40]} />
          <meshBasicMaterial map={check} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  05 · Integrate continuously — a pipeline feeding a Docker image            */
/* -------------------------------------------------------------------------- */

const JOBS = ["lint", "test", "build"];

function Pipeline({ on }: { on: Activation }) {
  const nodes = useRef<THREE.MeshStandardMaterial[]>([]);
  const leds = useRef<THREE.MeshStandardMaterial[]>([]);
  const container = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);

  const [labels, whale] = useMemo(
    () => [
      JOBS.map((job) =>
        drawTexture(256, 128, (ctx) => {
          ctx.fillStyle = "#334155";
          ctx.font = "600 56px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(job, 128, 66);
        }),
      ),
      makeMark(siDocker.path, "#ffffff"),
    ],
    [],
  );
  useDispose(useMemo(() => [...labels, whale], [labels, whale]));

  useFrame(({ clock }) => {
    const running = on.current > 0.3;
    const phase = (clock.elapsedTime * 0.7) % 1.3;
    nodes.current.forEach((m, i) => {
      if (!m) return;
      const lit = running && phase * 3 > i ? 1 : on.current > 0.95 ? 1 : 0;
      m.color.lerp(lit ? SKY : WHITE, 0.15);
      const led = leds.current[i];
      if (led) {
        led.color.lerp(lit ? GREEN : SLATE, 0.15);
        led.emissiveIntensity = lit ? 0.5 : 0;
      }
    });
    const drop = THREE.MathUtils.smoothstep(on.current, 0.45, 1);
    if (container.current) container.current.position.y = 0.3 + (1 - easeOut(drop)) * 0.7;
    body.current?.color.lerpColors(SLATE, DOCKER, drop);
  });

  return (
    <group position={[0, TOP, 0]}>
      {JOBS.map((job, i) => (
        <group key={job} position={[-0.9, 0.16, -0.66 + i * 0.62]}>
          <RoundedBox args={[0.46, 0.3, 0.46]} radius={0.06} smoothness={2}>
            <meshStandardMaterial ref={(m) => { if (m) nodes.current[i] = m; }} color="#ffffff" roughness={0.45} />
          </RoundedBox>
          <mesh position={[0, 0.151, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.42, 0.21]} />
            <meshBasicMaterial map={labels[i]} transparent toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.235]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial ref={(m) => { if (m) leds.current[i] = m; }} color={SLATE} emissive={GREEN} emissiveIntensity={0} />
          </mesh>
          {i < JOBS.length - 1 ? (
            <mesh position={[0, 0, 0.31]}>
              <boxGeometry args={[0.03, 0.03, 0.16]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>
          ) : null}
        </group>
      ))}

      {/* The image the pipeline produces */}
      <group ref={container} position={[0.45, 0.3, 0.1]}>
        <RoundedBox args={[1.4, 0.6, 0.74]} radius={0.04} smoothness={2}>
          <meshStandardMaterial ref={body} color={SLATE} roughness={0.5} />
        </RoundedBox>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-0.56 + i * 0.14, 0, 0.373]}>
            <boxGeometry args={[0.04, 0.48, 0.02]} />
            <meshStandardMaterial color="#1b7fcf" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 0.301, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.46, 0.46]} />
          <meshBasicMaterial map={whale} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  06 · Ship to production — servers under the cloud, live                   */
/* -------------------------------------------------------------------------- */

const PUFFS: [number, number, number, number][] = [
  [0, 0, 0, 0.36],
  [-0.38, -0.1, 0.04, 0.27],
  [0.38, -0.12, 0, 0.26],
  [0.1, 0.22, -0.05, 0.26],
  [-0.14, -0.14, 0.2, 0.22],
];

function Production({ on }: { on: Activation }) {
  const leds = useRef<THREE.MeshStandardMaterial[]>([]);
  const cloud = useRef<THREE.Group>(null);
  const puff = useRef<THREE.MeshStandardMaterial>(null);
  const packet = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    leds.current.forEach((m, i) => {
      if (!m) return;
      m.color.lerpColors(SLATE, GREEN, on.current);
      m.emissiveIntensity = on.current * (0.55 + 0.45 * Math.sin(t * 3 + i * 1.7)) * 0.9;
    });
    if (cloud.current) cloud.current.position.y = 1.5 + Math.sin(t * 1.2) * 0.05 + (1 - on.current) * 0.25;
    puff.current?.color.lerpColors(WHITE, SKY, on.current);
    if (packet.current) {
      const k = (t * 0.6) % 1;
      packet.current.visible = on.current > 0.5;
      packet.current.position.set(THREE.MathUtils.lerp(-0.45, 0.35, k), THREE.MathUtils.lerp(1.15, 1.35, k), -0.1);
    }
    if (ring.current) {
      const k = (t * 0.5) % 1;
      ring.current.scale.setScalar(0.8 + k * 0.6);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = on.current > 0.9 ? (1 - k) * 0.5 : 0;
    }
  });

  return (
    <group position={[0, TOP, 0]}>
      <group position={[-0.5, 0, -0.1]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, 0.17 + i * 0.36, 0]}>
            <RoundedBox args={[1.2, 0.3, 0.95]} radius={0.05} smoothness={2}>
              <meshStandardMaterial color={i === 2 ? "#f8fafc" : "#ffffff"} roughness={0.55} />
            </RoundedBox>
            {[0, 1].map((j) => (
              <mesh key={j} position={[-0.42 + j * 0.16, 0, 0.476]}>
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

      <group ref={cloud} position={[0.45, 1.5, -0.2]}>
        {PUFFS.map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r, 28, 28]} />
            <meshStandardMaterial ref={i === 0 ? puff : undefined} color="#ffffff" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <mesh ref={packet}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.12, 64]} />
        <meshBasicMaterial color="#16a34a" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

const PROPS = [Board, DataModel, Editor, TestReport, Pipeline, Production];

/** The tools of each step, as round badges that pop up when the step is reached. */
const BADGES: ({ path: string; hex: string } | string)[][] = [
  [siJira],
  [siPostgresql],
  [siTypescript, siSpringboot, siReact],
  [siVitest, siJunit5],
  [siGithubactions, siDocker],
  ["Azure"],
];

function Badges({ index, on }: { index: number; on: Activation }) {
  const textures = useMemo(() => BADGES[index].map((mark) => makeBadge(mark)), [index]);
  useDispose(textures);
  const groups = useRef<THREE.Group[]>([]);

  useFrame(({ clock }) => {
    groups.current.forEach((group, i) => {
      if (!group) return;
      const local = clamp01(on.current * 1.8 - i * 0.3 - 0.2);
      group.scale.setScalar(Math.max(0.001, easeOutBack(local)));
      group.position.y = Math.sin(clock.elapsedTime * 1.6 + i + index) * 0.04;
    });
  });

  const count = textures.length;
  return (
    <group position={[0.7, TOP + 0.55, 1.1]}>
      {textures.map((texture, i) => (
        <group key={i} position={[i * 0.58 - (count - 1) * 0.29, 0, 0]}>
          <group ref={(g) => { if (g) groups.current[i] = g; }}>
            <Billboard>
              <mesh>
                <circleGeometry args={[0.25, 40]} />
                <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
              </mesh>
            </Billboard>
          </group>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Station and the feature travelling through them                           */
/* -------------------------------------------------------------------------- */

function Station({ index, progress }: { index: number; progress: Progress }) {
  const on = useActivation(index, progress);
  const group = useRef<THREE.Group>(null);
  const top = useRef<THREE.MeshStandardMaterial>(null);
  const bar = useRef<THREE.MeshStandardMaterial>(null);
  const Prop = PROPS[index];

  const label = useMemo(() => makeLabel(String(index + 1).padStart(2, "0"), { size: 40, weight: 600, color: "#2563eb" }), [index]);
  useEffect(() => () => label.texture.dispose(), [label]);

  useFrame(() => {
    if (group.current) group.current.position.y = on.current * 0.12;
    top.current?.color.lerpColors(WHITE, BLUE_SOFT, on.current);
    bar.current?.color.lerpColors(SLATE, BLUE, on.current);
    if (bar.current) bar.current.emissiveIntensity = on.current * 0.4;
  });

  return (
    <group position={[stationX(index), 0, 0]}>
      <BlobShadow size={4.2} opacity={0.85} />
      <group ref={group}>
        <RoundedBox args={[3, TOP, 2.6]} radius={0.12} smoothness={3} position={[0, TOP / 2, 0]}>
          <meshStandardMaterial ref={top} color="#ffffff" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, TOP / 2 + 0.02, 1.305]}>
          <boxGeometry args={[1.4, 0.05, 0.01]} />
          <meshStandardMaterial ref={bar} color={SLATE} emissive={BLUE} emissiveIntensity={0} />
        </mesh>
        <Prop on={on} />
        <Badges index={index} on={on} />
      </group>
      <mesh position={[0, 0.005, 2.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36 * label.aspect, 0.36]} />
        <meshBasicMaterial map={label.texture} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

const STAGES = [
  { title: "User story", status: "To do", tone: "#64748b", soft: "#f1f5f9" },
  { title: "Data model", status: "Design", tone: "#2563eb", soft: "#eff6ff" },
  { title: "API + UI", status: "In progress", tone: "#2563eb", soft: "#eff6ff" },
  { title: "265 tests", status: "Passed", tone: "#15803d", soft: "#dcfce7" },
  { title: "Docker image", status: "Built", tone: "#1b7fcf", soft: "#e0f2fe" },
  { title: "Production", status: "Live", tone: "#15803d", soft: "#dcfce7" },
];

/** The feature itself: a ticket whose state changes at every station. */
function useTicketTextures() {
  const textures = useMemo(
    () =>
      STAGES.map((stage, s) =>
        drawTexture(600, 380, (ctx, { font, roundedRect }) => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 600, 380);
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#2563eb";
          ctx.font = "600 30px ui-monospace, monospace";
          ctx.fillText("FEAT-128", 40, 64);

          ctx.font = `600 26px ${font}`;
          const chip = ctx.measureText(stage.status).width + 40;
          roundedRect(ctx, 560 - chip, 40, chip, 48, 24);
          ctx.fillStyle = stage.soft;
          ctx.fill();
          ctx.fillStyle = stage.tone;
          ctx.fillText(stage.status, 580 - chip, 65);

          ctx.fillStyle = "#0b1220";
          ctx.font = `700 64px ${font}`;
          ctx.fillText(stage.title, 40, 180);
          ctx.fillStyle = "#64748b";
          ctx.font = `500 28px ${font}`;
          ctx.fillText("Audit report · PDF export", 40, 240);

          const gap = 12;
          const width = (520 - gap * 5) / 6;
          for (let i = 0; i < 6; i++) {
            roundedRect(ctx, 40 + i * (width + gap), 306, width, 14, 7);
            ctx.fillStyle = i <= s ? "#2563eb" : "#e2e8f0";
            ctx.fill();
          }
        }),
      ),
    [],
  );
  useDispose(textures);
  return textures;
}

function Scene({ progress }: { progress: Progress }) {
  const camera = useRef<THREE.OrthographicCamera>(null);
  const marker = useRef<THREE.Group>(null);
  const card = useRef<THREE.MeshBasicMaterial>(null);
  const shell = useRef<THREE.Mesh>(null);
  const shellMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const shadow = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Mesh>(null);
  const smooth = useRef(0);
  const focus = useRef(stationX(0));
  const stage = useRef(-1);
  const tickets = useTicketTextures();
  const { size } = useThree();

  const first = stationX(0);
  const last = stationX(STEPS - 1);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    smooth.current = damp(smooth.current, progress.current, 5, delta);
    const s = stationPosition(smooth.current);
    const from = Math.floor(Math.min(s, STEPS - 1.0001));
    const f = s - from;
    const eased = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    const x = THREE.MathUtils.lerp(stationX(from), stationX(Math.min(from + 1, STEPS - 1)), eased);

    // The ticket's state is the step shown beside the stage.
    const current = Math.min(STEPS - 1, Math.floor(smooth.current * STEPS));
    if (current !== stage.current && card.current) {
      stage.current = current;
      card.current.map = tickets[current];
      card.current.needsUpdate = true;
    }

    const hop = Math.sin(f * Math.PI) * 0.8;
    if (marker.current) marker.current.position.set(x, 3.3 + hop + Math.sin(clock.elapsedTime * 2) * 0.04, 0.35);
    if (shadow.current) {
      shadow.current.position.x = x;
      shadow.current.scale.setScalar(1 - hop * 0.35);
    }
    // From the CI station on, the feature ships inside its container.
    const packed = THREE.MathUtils.smoothstep(s, 3.55, 4);
    if (shell.current) shell.current.scale.setScalar(Math.max(0.001, 0.85 + packed * 0.15));
    if (shellMaterial.current) shellMaterial.current.opacity = packed * 0.22;
    if (trail.current) {
      const length = Math.max(0.001, x - first);
      trail.current.scale.x = length;
      trail.current.position.x = first + length / 2;
    }

    // The camera travels with the feature, staying clear of the ends.
    // About one and a half stations across: the active one reads clearly.
    const zoom = Math.min(size.width / 5.8, size.height / 4.9);
    const visible = size.width / zoom;
    const margin = Math.min(visible * 0.26, (last - first) / 2);
    focus.current = damp(focus.current, THREE.MathUtils.clamp(x, first + margin, last - margin), 4, delta);
    if (camera.current) {
      camera.current.zoom = zoom;
      target.set(focus.current * 0.72, 2.05, -focus.current * 0.72);
      camera.current.position.copy(target).add(ISO);
      camera.current.lookAt(target);
      camera.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <OrthographicCamera ref={camera} makeDefault near={0.1} far={100} position={ISO.toArray()} />
      <StudioLights intensity={1.2} />
      {/* +45° lays the row of stations across the screen for the isometric camera. */}
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.02, 1.9]}>
          <boxGeometry args={[last - first, 0.03, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={trail} position={[first, 0.035, 1.9]}>
          <boxGeometry args={[1, 0.035, 0.09]} />
          <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.25} />
        </mesh>

        {Array.from({ length: STEPS }, (_, i) => (
          <Station key={i} index={i} progress={progress} />
        ))}

        <group ref={shadow} position={[first, TOP + 0.13, 0.35]}>
          <BlobShadow size={1.3} opacity={0.45} position={[0, 0, 0]} />
        </group>

        <group ref={marker} position={[first, 3.3, 0.35]}>
          <Billboard>
            <mesh ref={shell} position={[0, 0, -0.14]}>
              <boxGeometry args={[1.5, 1.04, 0.2]} />
              <meshStandardMaterial ref={shellMaterial} color={DOCKER} transparent opacity={0} depthWrite={false} />
            </mesh>
            <RoundedBox args={[1.3, 0.84, 0.06]} radius={0.05} smoothness={3}>
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </RoundedBox>
            <mesh position={[0, 0, 0.031]}>
              <planeGeometry args={[1.22, 0.772]} />
              <meshBasicMaterial ref={card} map={tickets[0]} toneMapped={false} />
            </mesh>
          </Billboard>
        </group>
      </group>
    </>
  );
}

/** "From requirement to production": a feature ticket travelling through six real stations. */
export default function PipelineView({ progress, className }: { progress: Progress; className?: string }) {
  return (
    <View className={className}>
      <SceneBoundary>
        <Scene progress={progress} />
      </SceneBoundary>
    </View>
  );
}
