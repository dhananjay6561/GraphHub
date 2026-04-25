import type { GraphStatus } from "@/types";

const LABELS: Record<GraphStatus, string> = {
  idle: "",
  loading: "Loading graph...",
  simulating: "Simulating...",
  ready: "Ready",
  error: "Error",
};

export function ProgressBar({ status }: { status: GraphStatus }) {
  if (status === "idle" || status === "ready") return null;
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded z-10">
      {LABELS[status]}
    </div>
  );
}
