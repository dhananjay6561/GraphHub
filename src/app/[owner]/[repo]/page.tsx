"use client";

import { useState, useRef, useCallback } from "react";
import { GraphCanvas, type GraphCanvasHandle } from "@/components/Graph/GraphCanvas";
import { DetailPanel } from "@/components/Graph/DetailPanel";
import { Sidebar } from "@/components/Graph/Sidebar";
import { Topbar } from "@/components/Graph/Topbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { GraphNode, GraphData, GraphStatus, NodeType, EdgeType } from "@/types";

const DEFAULT_NODE_TYPES = new Set<NodeType>(["folder", "file", "function", "class"]);
const DEFAULT_EDGE_TYPES = new Set<EdgeType>(["import", "contains"]);

export default function GraphPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [status, setStatus] = useState<GraphStatus>("idle");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
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

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
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

        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <GraphCanvas
              ref={canvasRef}
              owner={owner}
              repo={repo}
              onNodeSelect={handleNodeSelect}
              onStatusChange={setStatus}
              onGraphReady={setGraphData}
              searchQuery={searchQuery}
              visibleTypes={visibleTypes}
            />
          </ErrorBoundary>
        </main>

        <DetailPanel node={selectedNode} onClose={handleCloseDetail} />
      </div>
    </div>
  );
}
