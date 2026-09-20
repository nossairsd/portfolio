import {
  Boxes,
  Database,
  FlaskConical,
  GitPullRequest,
  ListChecks,
  RefreshCcw,
  Shapes,
  TestTube,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { siExpress, siSpringsecurity } from "simple-icons";
import { cn } from "@/lib/cn";
import { MARKS } from "./marks";

type Brand = { path: string; hex: string };

/**
 * Marks with no colour version in any open icon set: drawn in the brand's own
 * colour from simple-icons.
 */
const BRANDS: Record<string, Brand> = {
  Express: siExpress,
  "Spring Security": siSpringsecurity,
};

/**
 * A meaningful pictogram for practices and for anything that has no logo of
 * its own: a way of working is not a product.
 */
const PICTOGRAMS: Record<string, { icon: LucideIcon; color?: string }> = {
  "Agile / Scrum": { icon: RefreshCcw },
  "Definition of Done": { icon: ListChecks },
  "Clean Architecture": { icon: Boxes },
  SOLID: { icon: Boxes },
  "Design patterns": { icon: Shapes },
  "Revues de code": { icon: GitPullRequest },
  "Code reviews": { icon: GitPullRequest },
  Mockito: { icon: FlaskConical, color: "#78a642" },
  Supertest: { icon: TestTube },
  TDD: { icon: RefreshCcw },
  SQL: { icon: Database },
  Monitoring: { icon: Zap },
  Surveillance: { icon: Zap },
  Caching: { icon: Zap },
  Cache: { icon: Zap },
};

/** Brand colour for a tool, for the few places that tint text or a rule. */
export function toolColor(name: string) {
  const raw = BRANDS[name] ? `#${BRANDS[name].hex}` : PICTOGRAMS[name]?.color;
  if (!raw) return "#2563eb";
  return /^#0{6}$/i.test(raw) ? "#0b1220" : raw;
}

/** The tool's own mark, in its own colours, at whatever size it is given. */
export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const mark = MARKS[name];
  if (mark) {
    return (
      <svg
        viewBox={mark.viewBox}
        aria-hidden
        className={cn("size-3.5 shrink-0", className)}
        dangerouslySetInnerHTML={{ __html: mark.body }}
      />
    );
  }

  const brand = BRANDS[name];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={cn("size-3.5 shrink-0", className)} style={{ fill: toolColor(name) }}>
        <path d={brand.path} />
      </svg>
    );
  }

  const Icon = PICTOGRAMS[name]?.icon ?? ListChecks;
  return <Icon aria-hidden className={cn("size-3.5 shrink-0", className)} style={{ color: toolColor(name) }} strokeWidth={1.9} />;
}
