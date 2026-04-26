"use client";
import { X } from "lucide-react";
import type { GraphData, NodeType, EdgeType } from "@/types";

const NODE_TYPES: { type: NodeType; label: string; colorVar: string }[] = [
  { type: "folder", label: "Folders", colorVar: "var(--node-folder)" },
  { type: "file", label: "Files", colorVar: "var(--node-file)" },
  { type: "function", label: "Functions", colorVar: "var(--node-function)" },
  { type: "class", label: "Classes", colorVar: "var(--node-class)" },
];

const EDGE_TYPES: { type: EdgeType; label: string }[] = [
  { type: "import", label: "Imports" },
  { type: "contains", label: "Contains" },
];

interface Props {
  graphData: GraphData | null;
  visibleTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
  visibleEdges: Set<EdgeType>;
  onToggleEdge: (type: EdgeType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  graphData,
  visibleTypes,
  onToggleType,
  visibleEdges,
  onToggleEdge,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const stats = graphData
    ? {
        files: graphData.nodes.filter((n) => n.type === "file").length,
        functions: graphData.nodes.filter((n) => n.type === "function").length,
        classes: graphData.nodes.filter((n) => n.type === "class").length,
        edges: graphData.edges.length,
      }
    : null;

  return (
    <aside
      className={[
        "flex flex-col overflow-y-auto border-r",
        // Desktop: static in the flex row
        "md:relative md:w-[220px] md:shrink-0 md:translate-x-0",
        // Mobile: fixed drawer sliding in from the left
        "fixed inset-y-0 left-0 z-40 w-[280px]",
        "transition-transform duration-200 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Mobile close button */}
      {onMobileClose && (
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <span className="text-[12px] font-semibold tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>CONTROLS</span>
          <button
            onClick={onMobileClose}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors duration-150 cursor-pointer"
            style={{ color: "var(--text-tertiary)" }}
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Zoom controls */}
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          <button
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex-1 h-10 rounded-md text-[13px] border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors duration-150 cursor-pointer"
          >
            +
          </button>
          <button
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex-1 h-10 rounded-md text-[13px] border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors duration-150 cursor-pointer"
          >
            −
          </button>
        </div>
        <button
          onClick={onResetZoom}
          aria-label="Reset zoom"
          className="w-full h-9 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150 cursor-pointer"
        >
          Reset view
        </button>
      </div>

      <Divider />

      {/* Node types */}
      <div className="p-3 flex flex-col gap-2.5">
        <SectionLabel>NODE TYPES</SectionLabel>
        {NODE_TYPES.map(({ type, label, colorVar }) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: colorVar }}
              />
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                {label}
              </span>
            </div>
            <Toggle on={visibleTypes.has(type)} onToggle={() => onToggleType(type)} label={label} />
          </div>
        ))}
      </div>

      <Divider />

      {/* Edge types */}
      <div className="p-3 flex flex-col gap-2.5">
        <SectionLabel>EDGE TYPES</SectionLabel>
        {EDGE_TYPES.map(({ type, label }) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {label}
            </span>
            <Toggle on={visibleEdges.has(type)} onToggle={() => onToggleEdge(type)} label={label} />
          </div>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <>
          <Divider />
          <div className="p-3 flex flex-col gap-2">
            <SectionLabel>STATS</SectionLabel>
            {[
              { key: "Files", val: stats.files },
              { key: "Functions", val: stats.functions },
              { key: "Classes", val: stats.classes },
              { key: "Edges", val: stats.edges },
            ].map(({ key, val }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {key}
                </span>
                <span className="text-[12px] font-mono" style={{ color: "var(--text-secondary)" }}>
                  {val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-semibold tracking-[0.08em]"
      style={{ color: "var(--text-tertiary)" }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px shrink-0" style={{ background: "var(--border)" }} />;
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={`Toggle ${label}`}
      onClick={onToggle}
      className="relative shrink-0 flex items-center justify-center cursor-pointer"
      style={{ width: "44px", height: "36px" }}
    >
      <span
        className="relative transition-colors duration-150"
        style={{
          width: "28px",
          height: "16px",
          borderRadius: "9999px",
          background: on ? "var(--accent)" : "var(--border-strong)",
          display: "block",
        }}
      >
        <span
          className="absolute top-[2px] transition-transform duration-150"
          style={{
            left: "2px",
            width: "12px",
            height: "12px",
            borderRadius: "9999px",
            background: "var(--bg-primary)",
            transform: on ? "translateX(12px)" : "translateX(0)",
          }}
        />
      </span>
    </button>
  );
}
