import { siGithub } from "simple-icons";
import { cn } from "@/lib/cn";

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4 fill-current", className)}>
      <path d={siGithub.path} />
    </svg>
  );
}
