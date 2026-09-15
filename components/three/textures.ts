import * as THREE from "three";

/** The page's own font stack, so text drawn in WebGL matches the HTML. */
function pageFont() {
  return getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * A pill label: optional mono prefix, then text. Returns the texture and its
 * aspect ratio so the plane or sprite showing it keeps proportions.
 */
export function makeLabel(
  text: string,
  {
    prefix,
    color = "#0b1220",
    background = "#ffffff",
    border = "rgba(15,23,42,0.10)",
    accent = "#2563eb",
    size = 44,
    weight = 600,
  }: {
    prefix?: string;
    color?: string;
    background?: string | null;
    border?: string | null;
    accent?: string;
    size?: number;
    weight?: number;
  } = {},
) {
  const scale = 2;
  const font = pageFont();
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `${weight} ${size}px ${font}`;
  const textWidth = measure.measureText(text).width;
  measure.font = `600 ${size * 0.72}px ui-monospace, monospace`;
  const prefixWidth = prefix ? measure.measureText(prefix).width + size * 0.45 : 0;

  const padX = size * 0.7;
  const width = Math.ceil(textWidth + prefixWidth + padX * 2);
  const height = Math.ceil(size * 1.9);

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  if (background) {
    roundedRect(ctx, 1, 1, width - 2, height - 2, (height - 2) / 2);
    ctx.fillStyle = background;
    ctx.fill();
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  ctx.textBaseline = "middle";
  let x = padX;
  if (prefix) {
    ctx.font = `600 ${size * 0.72}px ui-monospace, monospace`;
    ctx.fillStyle = accent;
    ctx.fillText(prefix, x, height / 2 + 1);
    x += prefixWidth;
  }
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, height / 2 + 1);

  return { texture: toTexture(canvas), aspect: width / height };
}

/** A texture drawn once on a canvas of the given size. */
export function drawTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, helpers: { font: string; roundedRect: typeof roundedRect }) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, { font: pageFont(), roundedRect });
  return toTexture(canvas);
}

type Mark = { path: string; hex: string };

/** Brand colours too pale to read on white are darkened. */
function readable(hex: string) {
  return hex === "00FF74" ? "#16a34a" : `#${hex === "000000" ? "0b1220" : hex}`;
}

/** A round white badge with a brand mark, or a wordmark when there is none. */
export function makeBadge(mark: Mark | string) {
  return drawTexture(256, 256, (ctx, { font }) => {
    ctx.beginPath();
    ctx.arc(128, 128, 122, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(15,23,42,0.12)";
    ctx.stroke();
    if (typeof mark === "string") {
      ctx.fillStyle = "#0078d4";
      ctx.font = `700 ${mark.length > 5 ? 52 : 64}px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mark, 128, 132);
      return;
    }
    const icon = 124;
    ctx.save();
    ctx.translate((256 - icon) / 2, (256 - icon) / 2);
    ctx.scale(icon / 24, icon / 24);
    ctx.fillStyle = readable(mark.hex);
    ctx.fill(new Path2D(mark.path));
    ctx.restore();
  });
}

/** A brand mark alone, in one colour, on a transparent square. */
export function makeMark(path: string, color: string, size = 256) {
  return drawTexture(size, size, (ctx) => {
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = color;
    ctx.fill(new Path2D(path));
  });
}
