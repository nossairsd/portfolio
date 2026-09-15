/** Number of stations in the process pipeline, shared by the 3D scene and its 2D fallback. */
export const PIPELINE_STEPS = 6;

const smoothstep = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Where the feature is along the row (0 → 5) for a scroll progress. It rests
 * at each station for most of that step's scroll and travels around the
 * boundaries, crossing half-way exactly when the step beside the stage changes.
 */
export function stationPosition(progress: number) {
  const u = progress * PIPELINE_STEPS;
  let s = 0;
  for (let n = 1; n < PIPELINE_STEPS; n++) s += smoothstep(u, n - 0.32, n + 0.32);
  return s;
}
