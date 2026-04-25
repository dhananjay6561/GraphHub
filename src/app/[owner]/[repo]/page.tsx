"use client";

import { useState, useRef, useCallback } from "react";
import { GraphCanvas, type GraphCanvasHandle } from "@/components/Graph/GraphCanvas";
import { DetailPanel } from "@/components/Graph/DetailPanel";
import { Sidebar } from "@/components/Graph/Sidebar";
import { Topbar } from "@/components/Graph/Topbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { GraphNode, GraphData, GraphStatus, NodeType, EdgeType, ApiError } from "@/types";

const DEFAULT_NODE_TYPES = new Set<NodeType>(["folder", "file", "function", "class"]);
const DEFAULT_EDGE_TYPES = new Set<EdgeType>(["import", "contains"]);

const ERROR_MESSAGES: Partial<Record<string, string>> = {
  rate_limited: "GitHub API rate limit hit. Try again in a few minutes.",
  not_found: "Repository not found. Check the URL and try again.",
  unreachable: "Could not reach GitHub. Check your connection.",
};

export default function GraphPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [status, setStatus] = useState<GraphStatus>("idle");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(DEFAULT_NODE_TYPES);
  const [visibleEdges, setVisibleEdges] = useState<Set<EdgeType>>(DEFAULT_EDGE_TYPES);

  const canvasRef = useRef<GraphCanvasHandle>(null);

  const handleToggleType = useCallback((type: NodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleToggleEdge = useCallback((type: EdgeType) => {
    setVisibleEdges((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Topbar
        owner={owner}
        repo={repo}
        status={status}
        graphData={graphData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          graphData={graphData}
          visibleTypes={visibleTypes}
          onToggleType={handleToggleType}
          visibleEdges={visibleEdges}
          onToggleEdge={handleToggleEdge}
          onZoomIn={() => canvasRef.current?.zoomIn()}
          onZoomOut={() => canvasRef.current?.zoomOut()}
          onResetZoom={() => canvasRef.current?.resetZoom()}
        />

        <main className="flex-1 overflow-hidden relative">
          <ErrorBoundary>
            <GraphCanvas
              ref={canvasRef}
              owner={owner}
              repo={repo}
              onNodeSelect={setSelectedNode}
              onStatusChange={setStatus}
              onGraphReady={setGraphData}
              onError={setApiError}
              searchQuery={searchQuery}
              visibleTypes={visibleTypes}
              visibleEdges={visibleEdges}
            />
          </ErrorBoundary>

          {/* Error overlay */}
          {apiError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex flex-col items-center gap-3 text-center p-8 rounded-xl border max-w-sm"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {ERROR_MESSAGES[apiError.error] ?? "Something went wrong."}
                </p>
                {apiError.retryAfter && (
                  <p className="text-[12px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                    retry in ~{Math.ceil(apiError.retryAfter / 60)} min
                  </p>
                )}
                <button
                  onClick={() => {
                    setApiError(null);
                    setStatus("idle");
                    window.location.reload();
                  }}
                  className="text-[12px] px-4 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors duration-150"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </main>

        <DetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
