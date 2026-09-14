import { cn } from "@/lib/cn";

/** Columns of components, left to right, joined by a flowing connector. */
export type ArchColumns = string[][];

export const PROJECT_ARCHITECTURES: Record<string, ArchColumns> = {
  audit: [["React"], ["Gateway"], ["Audits", "Plans", "Users"], ["RabbitMQ"]],
  hse: [["Mobile"], ["REST API"], ["Incidents", "Alerts"], ["Async"]],
  urban: [["Web"], ["REST API"], ["Bookings", "Claims"], ["Postgres"]],
};

export function ArchDiagram({ columns, className }: { columns: ArchColumns; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-dots relative flex h-36 items-center justify-between gap-1 overflow-hidden rounded-xl bg-bg-subtle px-4 [container-type:inline-size]",
        className,
      )}
    >
      {columns.map((column, i) => (
        <div key={i} className="contents">
          <div className="relative z-10 flex flex-col gap-1.5">
            {column.map((node) => (
              <span
                key={node}
                className={cn(
                  "whitespace-nowrap rounded-md px-2 py-1 text-center font-mono text-[clamp(0.5rem,2.6cqi,0.6875rem)] leading-none shadow-[0_1px_2px_rgb(15_23_42/0.06)]",
                  i === 0 ? "bg-primary text-white" : "bg-white text-fg-2 ring-1 ring-line",
                )}
              >
                {node}
              </span>
            ))}
          </div>
          {i < columns.length - 1 ? (
            <span className="relative h-px min-w-1.5 flex-1 overflow-hidden bg-line-strong">
              <span
                className="absolute inset-y-0 left-0 w-1/2 animate-[flow_2.2s_linear_infinite] bg-gradient-to-r from-transparent via-primary to-transparent motion-reduce:hidden"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
