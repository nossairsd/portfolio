import { cn } from "@/lib/cn";

export function Tag({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "primary" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        tone === "neutral" && "bg-bg-muted text-fg-2",
        tone === "primary" && "bg-primary-soft text-primary-strong ring-1 ring-primary-100",
        tone === "success" && "bg-green-50 text-green-700 ring-1 ring-green-100",
        className,
      )}
    >
      {children}
    </span>
  );
}
