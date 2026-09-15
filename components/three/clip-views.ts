import * as THREE from "three";

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Keeps every viewport and scissor rectangle inside the canvas.
 *
 * A drei <View> draws into the rectangle of the element it tracks. When that
 * element is partly scrolled out (a sticky stage leaving the screen), the
 * rectangle reaches past the edge of the canvas. On integrated GPUs under
 * Direct3D, drawing with such a viewport can hang the GPU until the browser
 * resets it: the page freezes for seconds, and the browser then refuses to give
 * the page WebGL again, so the 3D is gone for good.
 *
 * Here the viewport is cut down to the part that is on the canvas, and the
 * camera renders only that part of its view (a view offset), so the picture is
 * exactly the same, just never drawn outside the canvas.
 */
export function clipViewsToCanvas(gl: THREE.WebGLRenderer) {
  const setViewport = gl.setViewport.bind(gl);
  const setScissor = gl.setScissor.bind(gl);
  const render = gl.render.bind(gl);
  const size = new THREE.Vector2();
  let requested: Rect | null = null;

  const clip = (x: number, y: number, width: number, height: number): Rect => {
    gl.getSize(size);
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(size.x, x + width);
    const y1 = Math.min(size.y, y + height);
    return { x: x0, y: y0, width: Math.max(0, x1 - x0), height: Math.max(0, y1 - y0) };
  };

  gl.setViewport = ((x: number | THREE.Vector4, y?: number, width?: number, height?: number) => {
    if (typeof x !== "number") {
      requested = null;
      return setViewport(x);
    }
    requested = { x, y: y!, width: width!, height: height! };
    const r = clip(x, y!, width!, height!);
    return setViewport(r.x, r.y, r.width, r.height);
  }) as THREE.WebGLRenderer["setViewport"];

  gl.setScissor = ((x: number | THREE.Vector4, y?: number, width?: number, height?: number) => {
    if (typeof x !== "number") return setScissor(x);
    const r = clip(x, y!, width!, height!);
    return setScissor(r.x, r.y, r.width, r.height);
  }) as THREE.WebGLRenderer["setScissor"];

  gl.render = (scene, camera) => {
    const full = requested;
    const onScreen = gl.getRenderTarget() === null;
    const projected = camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera;
    if (!full || !onScreen || !projected) return render(scene, camera);

    const r = clip(full.x, full.y, full.width, full.height);
    if (r.width === full.width && r.height === full.height) return render(scene, camera);
    if (r.width <= 0 || r.height <= 0) return;

    // Viewports count from the bottom left; view offsets from the top left.
    const offsetX = r.x - full.x;
    const offsetY = full.y + full.height - (r.y + r.height);
    camera.setViewOffset(full.width, full.height, offsetX, offsetY, r.width, r.height);
    render(scene, camera);
    camera.clearViewOffset();
  };
}
