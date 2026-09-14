import { Globe2 } from "lucide-react";

/**
 * Availability, as a status indicator rather than a sentence: a live dot, the
 * state in bold, then where. The border carries a slow light sweep.
 */
export function StatusBadge({ status, detail }: { status: string; detail: string }) {
  return (
    <span className="group relative inline-flex overflow-hidden rounded-full p-px shadow-[0_1px_2px_rgb(15_23_42/0.06),0_8px_24px_-12px_rgb(37_99_235/0.35)]">
      <span aria-hidden className="absolute inset-0 rounded-full bg-line-strong" />
      {/* Rotating conic light behind a 1px gap: reads as a moving border. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgb(37_99_235/0.9)_60deg,rgb(147_197_253/0.8)_90deg,transparent_150deg,transparent_360deg)]"
      />
      <span className="relative flex items-center gap-2.5 rounded-full bg-white/95 py-1.5 pl-2 pr-3.5 text-[0.8125rem] backdrop-blur">
        <span className="flex items-center gap-2 rounded-full bg-green-50 py-0.5 pl-1.5 pr-2 ring-1 ring-inset ring-green-100">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-success" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          <span className="font-semibold text-green-700">{status}</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium text-fg-2">
          <Globe2 aria-hidden className="size-3.5 text-primary" strokeWidth={2} />
          {detail}
        </span>
      </span>
    </span>
  );
}
