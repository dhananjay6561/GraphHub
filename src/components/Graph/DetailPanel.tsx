import type { GraphNode, GraphEdge } from "@/types";
import { NodeBadge } from "./NodeBadge";
import { X } from "lucide-react";

interface Props {
  node: GraphNode | null;
  edges: GraphEdge[];
  nodeById: Map<string, GraphNode>;
  onClose: () => void;
  onNodeSelect: (node: GraphNode) => void;
}

export function DetailPanel({ node, edges, nodeById, onClose, onNodeSelect }: Props) {
  const neighbors = node ? getNeighbors(node.id, edges, nodeById) : [];

  return (
    <aside
      className="shrink-0 border-l overflow-hidden transition-[width] duration-200"
      style={{
        width: node ? "320px" : "0px",
        background: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      {node && (
        <div className="w-[320px] h-full overflow-y-auto flex flex-col">
          {/* Header */}
          <div
            className="p-4 flex items-start justify-between gap-3 border-b shrink-0"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex flex-col gap-1.5 min-w-0">
              <NodeBadge type={node.type} />
              <p
                className="text-[16px] font-medium font-mono break-all leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {node.label}
              </p>
              {node.path !== node.label && (
                <p className="text-[12px] font-mono break-all" style={{ color: "var(--text-tertiary)" }}>
                  {node.path}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 flex items-center justify-center w-6 h-6 rounded transition-colors duration-150 hover:bg-[var(--bg-tertiary)]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col">
            {node.language && (
              <Section label="LANGUAGE">
                <p className="text-[13px] font-mono" style={{ color: "var(--text-secondary)" }}>
                  {node.language}
                </p>
              </Section>
            )}

            {node.cluster && (
              <Section label="CLUSTER">
                <p className="text-[12px] font-mono break-all" style={{ color: "var(--text-secondary)" }}>
                  {node.cluster}
                </p>
              </Section>
            )}

            <Section label={`CONNECTIONS · ${neighbors.length}`}>
              {neighbors.length === 0 ? (
                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>none</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {neighbors.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onNodeSelect(n)}
                      className="flex items-center gap-2 text-left px-2 py-1 rounded-md transition-colors duration-150 hover:bg-[var(--bg-tertiary)] w-full"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: NODE_COLOR[n.type] ?? "var(--text-tertiary)" }}
                      />
                      <span className="text-[12px] font-mono truncate" style={{ color: "var(--text-secondary)" }}>
                        {n.label}
                      </span>
                      <span className="text-[11px] ml-auto shrink-0" style={{ color: "var(--text-tertiary)" }}>
                        {n.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      )}
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
      <p className="text-[10px] font-semibold tracking-[0.08em] mb-2" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

const NODE_COLOR: Record<string, string> = {
  folder:   "var(--node-folder)",
  file:     "var(--node-file)",
  function: "var(--node-function)",
  class:    "var(--node-class)",
};

function getNeighbors(
  id: string,
  edges: GraphEdge[],
  nodeById: Map<string, GraphNode>
): GraphNode[] {
  const seen = new Set<string>();
  const result: GraphNode[] = [];
  for (const e of edges) {
    const otherId = e.source === id ? e.target : e.target === id ? e.source : null;
    if (otherId && !seen.has(otherId)) {
      const n = nodeById.get(otherId);
      if (n) { result.push(n); seen.add(otherId); }
    }
  }
  return result;
}
