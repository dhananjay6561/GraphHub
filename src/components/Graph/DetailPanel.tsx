import type { GraphNode } from "@/types";

export function DetailPanel({ node }: { node: GraphNode | null }) {
  if (!node) return null;

  return (
    <div className="h-full overflow-y-auto p-4 text-slate-300 text-xs space-y-3 bg-slate-900 border-l border-slate-700">
      <div>
        <p className="text-slate-500 uppercase tracking-wide text-[10px]">name</p>
        <p className="font-mono break-all">{node.label}</p>
      </div>
      <div>
        <p className="text-slate-500 uppercase tracking-wide text-[10px]">type</p>
        <p>{node.type}</p>
      </div>
      <div>
        <p className="text-slate-500 uppercase tracking-wide text-[10px]">path</p>
        <p className="font-mono break-all">{node.path}</p>
      </div>
      {node.language && (
        <div>
          <p className="text-slate-500 uppercase tracking-wide text-[10px]">language</p>
          <p>{node.language}</p>
        </div>
      )}
      <div>
        <p className="text-slate-500 uppercase tracking-wide text-[10px]">connections</p>
        <p>{node.connections}</p>
      </div>
      {node.cluster && (
        <div>
          <p className="text-slate-500 uppercase tracking-wide text-[10px]">cluster</p>
          <p>{node.cluster}</p>
        </div>
      )}
    </div>
  );
}
