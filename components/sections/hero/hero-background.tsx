/**
 * The hero's space, drawn only with lines: a fine ceiling grid and a grid
 * floor travelling towards the viewer. No colour washes; masks only fade the
 * lines out. Pure CSS and cheap for the GPU.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-white">
      {/* Ceiling grid, fading down. */}
      <div className="bg-grid-fine absolute inset-x-0 top-0 h-[55%] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      {/* Floor grid in perspective, moving towards the viewer. */}
      <div className="absolute inset-x-0 bottom-0 top-[62%] overflow-hidden [perspective:600px] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]">
        <div className="absolute inset-x-[-25%] top-0 h-[170%] origin-top overflow-hidden" style={{ transform: "rotateX(70deg)" }}>
          {/* Moved with a transform, not background-position, so the travel
              runs on the compositor instead of repainting the floor each frame. */}
          <div
            className="absolute inset-x-0 -top-16 bottom-0 animate-[floor-travel_2.4s_linear_infinite] will-change-transform motion-reduce:animate-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(15 23 42 / 0.09) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.09) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
