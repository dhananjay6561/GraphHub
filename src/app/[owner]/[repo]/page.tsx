"use client";

import { useState } from "react";
import { GraphCanvas } from "@/components/Graph/GraphCanvas";
import { DetailPanel } from "@/components/Graph/DetailPanel";
import type { GraphNode } from "@/types";

const NODE_COLORS: Record<string, string> = {
  folder: "#6366f1",
  file: "#22d3ee",
  function: "#10b981",
  class: "#f59e0b",
};

export default function GraphPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Legend sidebar */}
      <aside className="w-40 shrink-0 p-4 border-r border-slate-800 flex flex-col gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">
            {owner}/{repo}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Legend</p>
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {type}
            </div>
          ))}
        </div>
        <div className="mt-auto text-[10px] text-slate-600 space-y-1">
          <p>scroll to zoom</p>
          <p>drag to pan</p>
          <p>click node for details</p>
        </div>
      </aside>

      {/* Canvas */}
      <main className="flex-1 relative">
        <GraphCanvas
          owner={owner}
          repo={repo}
          onNodeSelect={setSelectedNode}
        />
      </main>

      {/* Detail panel */}
      <aside
        className="shrink-0 transition-all duration-200"
        style={{ width: selectedNode ? "240px" : "0px", overflow: "hidden" }}
      >
        <DetailPanel node={selectedNode} />
      </aside>
    </div>
  );
}
