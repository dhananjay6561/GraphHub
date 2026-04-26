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
  pinNode: (id: string, x: number, y: number) => void;
  unpinNode: (id: string) => void;
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

  // Per-type charge: push nodes far enough apart that they don't overlap
  const charge = d3.forceManyBody<SimNode>().strength((d) => {
    if (d.type === "folder") return -1400;
    if (d.type === "file")   return -800;
    return -500;
  });

  const link = d3
    .forceLink<SimNode, (typeof simEdges)[number]>(simEdges)
    .id((d) => d.id)
    .distance((e) => {
      const t = (e as { type?: string }).type;
      if (t === "contains") return 120;
      if (t === "import")   return 180;
      return 140;
    })
    .strength((e) => {
      const t = (e as { type?: string }).type;
      return t === "contains" ? 0.45 : 0.2;
    });

  const simulation = d3
    .forceSimulation<SimNode>(simNodes)
    .force("link", link)
    .force("charge", charge)
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.03))
    .force(
      "collide",
      d3.forceCollide<SimNode>().radius((d) => {
        if (d.type === "folder")   return 130;
        if (d.type === "file")     return 42;
        return 32;
      }).strength(1)
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
    pinNode: (id, x, y) => {
      const n = nodeById.get(id);
      if (n) { n.fx = x; n.fy = y; }
    },
    unpinNode: (id) => {
      const n = nodeById.get(id);
      if (n) { n.fx = null; n.fy = null; }
    },
  };
}
