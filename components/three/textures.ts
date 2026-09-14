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

/** A square tile: brand mark (simple-icons path) or a wordmark, with a caption. */
export function makeLogoTile(label: string, path?: string, hex?: string) {
  // Drawn at 512 for crisp paths, uploaded at 256: sixteen tiles stay light.
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const font = pageFont();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const color = hex ? `#${hex}` : "#2563eb";
  if (path) {
    const icon = 210;
    ctx.save();
    ctx.translate((size - icon) / 2, 92);
    ctx.scale(icon / 24, icon / 24);
    ctx.fillStyle = color;
    ctx.fill(new Path2D(path));
    ctx.restore();
  } else {
    // No distributable mark (Microsoft products): the name is the logo.
    ctx.fillStyle = color;
    ctx.font = `700 ${label.length > 8 ? 78 : 104}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, size / 2, size / 2);
    return toTexture(downscale(canvas, 256));
  }

  ctx.fillStyle = "#334155";
  ctx.font = `600 46px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, size / 2, 410);

  return toTexture(downscale(canvas, 256));
}

function downscale(source: HTMLCanvasElement, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, size, size);
  return canvas;
}
