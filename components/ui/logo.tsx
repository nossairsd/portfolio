import { cn } from "@/lib/cn";

/**
 * The monogram: lowercase initials followed by a blinking terminal caret, on a
 * blue tile with a top highlight. Reads as "engineer" at a glance without a
 * single stock icon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[0.7rem] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_6px_16px_-6px_rgb(37_99_235/0.7)]",
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      <span className="relative flex items-baseline font-mono text-[0.9375rem] font-semibold leading-none tracking-[-0.06em] text-white">
        ns
        <span className="ml-px inline-block h-[0.14em] w-[0.42em] translate-y-[0.02em] animate-[caret_1.1s_steps(1)_infinite] rounded-[1px] bg-white/90" />
      </span>
    </span>
  );
}
