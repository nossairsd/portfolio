import { FadeIn } from "@/components/motion/fade-in";
import { SplitReveal } from "@/components/motion/split-reveal";
import { cn } from "@/lib/cn";

export function Eyebrow({ index, children, className }: { index: string; children: React.ReactNode; className?: string }) {
  return (
    <FadeIn className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-6 min-w-6 place-items-center rounded-md bg-primary-soft px-1.5 font-mono text-[0.6875rem] font-medium text-primary">
        {index}
      </span>
      <span className="eyebrow">{children}</span>
    </FadeIn>
  );
}

/** Eyebrow, then a two-tone headline: the statement in ink, its second half quiet. */
export function SectionHeading({
  index,
  eyebrow,
  lead,
  quiet,
  intro,
  className,
  align = "left",
  compact = false,
}: {
  index: string;
  eyebrow: string;
  lead: string;
  quiet: string;
  intro?: string;
  className?: string;
  align?: "left" | "center";
  /** For headings in a narrow column, where a long word would overflow its line mask. */
  compact?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow index={index} className={cn(align === "center" && "justify-center")}>
        {eyebrow}
      </Eyebrow>
      <SplitReveal
        className={cn(
          "mt-5 font-medium leading-[1.04] tracking-[-0.035em] text-balance",
          compact ? "text-[clamp(2.25rem,3.6vw,3rem)]" : "text-[clamp(2.25rem,4.6vw,3.75rem)]",
        )}
      >
        <span className="text-fg">{lead}</span> <span className="text-quiet">{quiet}</span>
      </SplitReveal>
      {intro ? (
        <FadeIn delay={0.15}>
          <p className={cn("mt-5 max-w-xl text-lg leading-relaxed text-muted", align === "center" && "mx-auto")}>{intro}</p>
        </FadeIn>
      ) : null}
    </div>
  );
}
