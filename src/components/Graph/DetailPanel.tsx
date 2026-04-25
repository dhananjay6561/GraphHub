import type { GraphNode } from "@/types";
import { NodeBadge } from "./NodeBadge";
import { X } from "lucide-react";

interface Props {
  node: GraphNode | null;
  onClose: () => void;
}

export function DetailPanel({ node, onClose }: Props) {
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
          {/* Panel header */}
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
                <p
                  className="text-[12px] font-mono break-all"
                  style={{ color: "var(--text-tertiary)" }}
                >
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

          {/* Panel body */}
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

            <Section label="CONNECTIONS">
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                {node.connections} connections
              </p>
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
      <p
        className="text-[10px] font-semibold tracking-[0.08em] mb-2"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
