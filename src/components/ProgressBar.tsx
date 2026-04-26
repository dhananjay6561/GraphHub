import type { GraphStatus } from "@/types";

interface Props {
  status: GraphStatus;
  stats?: { nodeCount: number; edgeCount: number };
}

const STEP_LABEL: Partial<Record<GraphStatus, string>> = {
  loading: "Building graph...",
  simulating: "Simulating...",
  error: "Failed to load",
};

export function ProgressBar({ status, stats }: Props) {
  return (
    <div aria-live="polite" aria-atomic="true" className="flex items-center">
      {status === "ready" && stats ? (
        <p className="text-[12px] font-mono" style={{ color: "var(--text-tertiary)" }}>
          · {stats.nodeCount.toLocaleString()} nodes · {stats.edgeCount.toLocaleString()} edges
        </p>
      ) : STEP_LABEL[status] ? (
        <p
          className="flex items-center gap-1.5 text-[13px]"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="animate-pulse-dot select-none" aria-hidden="true">·</span>
          {STEP_LABEL[status]}
        </p>
      ) : null}
    </div>
  );
}
