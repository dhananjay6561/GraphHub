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
  if (status === "idle") return null;

  if (status === "ready" && stats) {
    return (
      <p className="text-[12px] font-mono" style={{ color: "var(--text-tertiary)" }}>
        · {stats.nodeCount.toLocaleString()} nodes · {stats.edgeCount.toLocaleString()} edges
      </p>
    );
  }

  const label = STEP_LABEL[status];
  if (!label) return null;

  return (
    <p
      className="flex items-center gap-1.5 text-[13px]"
      style={{ color: "var(--text-secondary)" }}
    >
      <span className="animate-pulse-dot select-none">·</span>
      {label}
    </p>
  );
}
