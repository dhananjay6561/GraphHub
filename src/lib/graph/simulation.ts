"use client";

import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types";

export interface SimulationState {
  start: () => void;
  stop: () => void;
  reheat: () => void;
  updateNodes: (nodes: GraphNode[]) => void;
  getNodes: () => GraphNode[];
  getAlpha: () => number;
  on: (event: "tick", cb: () => void) => void;
}

interface Options {
  width: number;
  height: number;
}

export function createSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Record<string, string[]>,
  { width, height }: Options
): SimulationState {
  type SimNode = GraphNode & d3.SimulationNodeDatum;
  const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
  const nodeById = new Map<string, SimNode>(simNodes.map((n) => [n.id, n]));

  const clusterCentroids = new Map<string, { x: number; y: number }>();

  const simEdges = edges
    .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
    .map((e) => ({ ...e }));

  // Per-type charge: folders push hard, functions/classes barely repel each other
  const charge = d3.forceManyBody<SimNode>().strength((d) => {
    if (d.type === "folder") return -1200;
    if (d.type === "file")   return -500;
    return -200;
  });

  const link = d3
    .forceLink<SimNode, (typeof simEdges)[number]>(simEdges)
    .id((d) => d.id)
    .distance((e) => {
      const t = (e as { type?: string }).type;
      if (t === "contains") return 80;
      if (t === "import")   return 140;
      return 100;
    })
    .strength((e) => {
      const t = (e as { type?: string }).type;
      return t === "contains" ? 0.6 : 0.3;
    });

  const simulation = d3
    .forceSimulation<SimNode>(simNodes)
    .force("link", link)
    .force("charge", charge)
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.03))
    .force(
      "collide",
      d3.forceCollide<SimNode>().radius((d) => {
        if (d.type === "folder")   return 120;
        if (d.type === "file")     return 28;
        return 18;
      }).strength(0.9)
    )
    .force("cluster", clusterForce())
    .alphaDecay(0.022)
    .velocityDecay(0.6);

  function clusterForce() {
    return function () {
      clusterCentroids.clear();
      const counts = new Map<string, number>();

      for (const n of simNodes) {
        if (n.type !== "file") continue;
        const c = n.cluster;
        const cx = clusterCentroids.get(c) ?? { x: 0, y: 0 };
        cx.x += n.x ?? 0;
        cx.y += n.y ?? 0;
        clusterCentroids.set(c, cx);
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }

      clusterCentroids.forEach((c, k) => {
        const count = counts.get(k) ?? 1;
        c.x /= count;
        c.y /= count;
      });

      for (const n of simNodes) {
        if (n.type !== "file") continue;
        const centroid = clusterCentroids.get(n.cluster);
        if (!centroid) continue;
        n.vx = (n.vx ?? 0) + (centroid.x - (n.x ?? 0)) * 0.08;
        n.vy = (n.vy ?? 0) + (centroid.y - (n.y ?? 0)) * 0.08;
      }
    };
  }

  let tickCb: (() => void) | null = null;

  simulation.on("tick", () => {
    if (simulation.alpha() < 0.001) simulation.stop();
    tickCb?.();
  });

  return {
    start: () => simulation.alpha(1).restart(),
    stop: () => simulation.stop(),
    reheat: () => simulation.alpha(0.3).restart(),
    updateNodes: (updated) => {
      updated.forEach((u) => {
        const n = nodeById.get(u.id);
        if (n) Object.assign(n, u);
      });
    },
    getNodes: () => simNodes,
    getAlpha: () => simulation.alpha(),
    on: (_event, cb) => { tickCb = cb; },
  };
}
