import {
  Boxes,
  Cloud,
  Database,
  FlaskConical,
  Gauge,
  GitPullRequest,
  KeyRound,
  Layers,
  ListChecks,
  RefreshCcw,
  Shapes,
  Share2,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  siDocker,
  siExpress,
  siGithubactions,
  siJavascript,
  siJira,
  siJsonwebtokens,
  siJunit5,
  siLinux,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siPrisma,
  siPython,
  siRabbitmq,
  siReact,
  siSap,
  siSpring,
  siSpringboot,
  siSpringsecurity,
  siTailwindcss,
  siTypescript,
  siVitest,
} from "simple-icons";
import { cn } from "@/lib/cn";

type Brand = { path: string; hex: string };

/** Real marks where one exists. */
const BRANDS: Record<string, Brand> = {
  Jira: siJira,
  PostgreSQL: siPostgresql,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  Java: siOpenjdk,
  Python: siPython,
  "Spring Boot": siSpringboot,
  "Spring Cloud": siSpring,
  "Spring Security": siSpringsecurity,
  React: siReact,
  "React Native": siReact,
  "Next.js": siNextdotjs,
  "Tailwind CSS": siTailwindcss,
  "Node.js": siNodedotjs,
  Express: siExpress,
  Prisma: siPrisma,
  RabbitMQ: siRabbitmq,
  SAP: siSap,
  "JUnit 5": siJunit5,
  Vitest: siVitest,
  "GitHub Actions": siGithubactions,
  Docker: siDocker,
  Linux: siLinux,
  JWT: siJsonwebtokens,
};

/**
 * A meaningful pictogram for practices, and for products without a
 * distributable mark (Microsoft's), in a colour close to the product's own.
 */
const PICTOGRAMS: Record<string, { icon: LucideIcon; color?: string }> = {
  "Agile / Scrum": { icon: RefreshCcw },
  "Definition of Done": { icon: ListChecks },
  "Clean Architecture": { icon: Layers },
  SOLID: { icon: Boxes },
  "Design patterns": { icon: Shapes },
  "Revues de code": { icon: GitPullRequest },
  "Code reviews": { icon: GitPullRequest },
  Playwright: { icon: Gauge, color: "#2EAD33" },
  Mockito: { icon: FlaskConical, color: "#8BC34A" },
  Supertest: { icon: FlaskConical },
  TDD: { icon: RefreshCcw },
  "OAuth 2.0": { icon: KeyRound },
  Azure: { icon: Cloud, color: "#0078D4" },
  "SQL Server": { icon: Database, color: "#CC2927" },
  SQL: { icon: Database },
  "Microsoft Graph": { icon: Share2, color: "#0078D4" },
  "Copilot Studio": { icon: Sparkles, color: "#7B61FF" },
  Monitoring: { icon: Gauge },
  Surveillance: { icon: Gauge },
  Caching: { icon: Zap },
  Cache: { icon: Zap },
};

/** Brand colour for a tool, readable on the given background. */
export function toolColor(name: string, onDark = false) {
  const brand = BRANDS[name];
  const raw = brand ? `#${brand.hex}` : PICTOGRAMS[name]?.color;
  if (!raw) return onDark ? "#7dd3fc" : "#2563eb";
  const dark = /^#(0{6}|0a0a0a)$/i.test(raw);
  if (dark) return onDark ? "#ffffff" : "#0b1220";
  if (raw.toUpperCase() === "#00FF74" && !onDark) return "#16a34a";
  return raw;
}

export function ToolIcon({ name, className, onDark = false }: { name: string; className?: string; onDark?: boolean }) {
  const brand = BRANDS[name];
  const color = toolColor(name, onDark);
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={cn("size-3.5 shrink-0", className)} style={{ fill: color }}>
        <path d={brand.path} />
      </svg>
    );
  }
  const Icon = PICTOGRAMS[name]?.icon ?? ListChecks;
  return <Icon aria-hidden className={cn("size-3.5 shrink-0", className)} style={{ color }} strokeWidth={2} />;
}
