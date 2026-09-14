import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg" | "sm";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_2px_rgb(15_23_42/0.12),0_10px_28px_-10px_rgb(37_99_235/0.55)] hover:bg-primary-strong",
  secondary:
    "bg-white text-fg ring-1 ring-line-strong shadow-[0_1px_2px_rgb(15_23_42/0.05)] hover:ring-fg/25",
  ghost: "text-fg-2 hover:bg-bg-muted hover:text-fg",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8125rem] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[0.9375rem] gap-2",
};

/** Shared by client buttons and by server-rendered links styled as buttons. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "group/button relative isolate inline-flex select-none items-center justify-center overflow-hidden rounded-full font-medium transition-[background-color,box-shadow,color,transform] duration-300 active:scale-[0.97]",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
