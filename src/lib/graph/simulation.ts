"use client";

import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types";

export interface SimulationState {
  start: () => void;
  stop: () => void;
  reheat: () => void;
  updateNodes: (nodes: GraphNode[]) => void;
  getNodes: () => GraphNode[];
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
  // d3 mutates nodes in-place, copy to avoid modifying shared state
  const simNodes = nodes.map((n) => ({ ...n })) as d3.SimulationNodeDatum &
    GraphNode[];

  const nodeById = new Map<string, (typeof simNodes)[number]>();
  (simNodes as unknown as (GraphNode & d3.SimulationNodeDatum)[]).forEach((n) =>
    nodeById.set(n.id, n as unknown as (typeof simNodes)[number])
  );

  // cluster centroids (initialised lazily per tick)
  const clusterCentroids = new Map<string, { x: number; y: number }>();

  const simEdges = edges
    .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
    .map((e) => ({ ...e }));

  const simulation = d3
    .forceSimulation(simNodes as unknown as d3.SimulationNodeDatum[])
    .force(
      "link",
      d3
        .forceLink(simEdges)
        .id((d) => (d as GraphNode).id)
        .distance(60)
    )
    .force("charge", d3.forceManyBody().strength(-120))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collide",
      d3.forceCollide().radius((d) => {
        const node = d as unknown as GraphNode;
        return node.type === "folder" ? 60 : node.type === "file" ? 20 : 10;
      })
    )
    .force("cluster", clusterForce())
    .alphaDecay(0.02)
    .velocityDecay(0.4);

  function clusterForce() {
    return function () {
      // update centroids
      clusterCentroids.clear();
      const counts = new Map<string, number>();

      for (const n of simNodes as unknown as (GraphNode & d3.SimulationNodeDatum)[]) {
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

      // pull each file toward its cluster centroid
      const strength = 0.05;
      for (const n of simNodes as unknown as (GraphNode & d3.SimulationNodeDatum)[]) {
        if (n.type !== "file") continue;
        const centroid = clusterCentroids.get(n.cluster);
        if (!centroid) continue;
        n.vx = (n.vx ?? 0) + (centroid.x - (n.x ?? 0)) * strength;
        n.vy = (n.vy ?? 0) + (centroid.y - (n.y ?? 0)) * strength;
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
    getNodes: () => simNodes as unknown as GraphNode[],
    on: (_event, cb) => {
      tickCb = cb;
    },
  };
}
