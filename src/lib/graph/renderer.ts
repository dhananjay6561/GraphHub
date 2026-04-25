"use client";

import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types";

const COLORS = {
  folder: "#6366f1",
  file: "#22d3ee",
  function: "#10b981",
  class: "#f59e0b",
  edge: "#334155",
  edgeFaded: "#1e293b",
  dimOpacity: 0.2,
};

export interface RenderState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  hoveredNode: GraphNode | null;
  matchingIds: Set<string> | null; // non-null when search active
}

export interface RendererHandle {
  draw: (state: RenderState) => void;
  hitTest: (x: number, y: number) => GraphNode | null;
  updateQuadtree: (nodes: GraphNode[]) => void;
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  getTransform: () => d3.ZoomTransform
): RendererHandle {
  const ctx = canvas.getContext("2d")!;
  let quadtree = d3.quadtree<GraphNode>();

  function updateQuadtree(nodes: GraphNode[]) {
    quadtree = d3
      .quadtree<GraphNode>()
      .x((n) => n.x ?? 0)
      .y((n) => n.y ?? 0)
      .addAll(nodes);
  }

  function hitTest(screenX: number, screenY: number): GraphNode | null {
    const t = getTransform();
    const wx = (screenX - t.x) / t.k;
    const wy = (screenY - t.y) / t.k;
    const radius = 20 / t.k;
    return quadtree.find(wx, wy, radius) ?? null;
  }

  function nodeRadius(node: GraphNode, k: number): number {
    if (node.type === "folder") return Math.max(40, Math.min(80, (node.connections + 1) * 4));
    if (node.type === "file") return Math.max(6, Math.min(18, (node.connections + 1) * 2));
    return 4;
  }

  function draw(state: RenderState) {
    const { nodes, edges, selectedNode, hoveredNode, matchingIds } = state;
    const t = getTransform();
    const k = t.k;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(k, k);

    const neighborIds = getNeighborIds(selectedNode ?? hoveredNode, edges);
    const focusMode = selectedNode !== null || hoveredNode !== null;
    const searchMode = matchingIds !== null;

    // ── edges ────────────────────────────────────────────────────────────────

    for (const edge of edges) {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (!src || !tgt || src.x == null || src.y == null || tgt.x == null || tgt.y == null) continue;

      // zoom-level culling
      if (k < 0.4 && edge.type !== "import") continue;
      if (k < 0.4 && src.type !== "folder" && tgt.type !== "folder") continue;

      const faded =
        (focusMode && !neighborIds.has(edge.source) && !neighborIds.has(edge.target)) ||
        (searchMode && matchingIds && !matchingIds.has(edge.source) && !matchingIds.has(edge.target));

      ctx.globalAlpha = faded ? COLORS.dimOpacity : 0.5;
      ctx.strokeStyle = COLORS.edge;
      ctx.lineWidth = 1 / k;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
    }

    // ── folder bubbles ───────────────────────────────────────────────────────

    for (const node of nodes) {
      if (node.type !== "folder") continue;
      if (node.x == null || node.y == null) continue;
      const r = nodeRadius(node, k);

      const faded = focusMode && !neighborIds.has(node.id);
      ctx.globalAlpha = faded ? COLORS.dimOpacity : 0.12;
      ctx.fillStyle = COLORS.folder;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // ── nodes ────────────────────────────────────────────────────────────────

    for (const node of nodes) {
      if (node.x == null || node.y == null) continue;

      // zoom-level visibility
      if (k < 0.4 && node.type !== "folder") continue;
      if (k < 1 && (node.type === "function" || node.type === "class")) continue;

      const r = nodeRadius(node, k);
      const color = COLORS[node.type] ?? COLORS.file;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isMatch = searchMode && matchingIds?.has(node.id);
      const faded =
        (focusMode && !neighborIds.has(node.id) && !isSelected && !isHovered) ||
        (searchMode && matchingIds && !matchingIds.has(node.id));

      ctx.globalAlpha = faded ? COLORS.dimOpacity : 1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSelected || isHovered || isMatch) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2 / k;
        ctx.stroke();
      }
    }

    // ── labels ───────────────────────────────────────────────────────────────

    if (k > 0.7) {
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const node of nodes) {
        if (node.x == null || node.y == null) continue;
        if (k < 1 && (node.type === "function" || node.type === "class")) continue;

        const faded =
          (focusMode && !neighborIds.has(node.id)) ||
          (searchMode && matchingIds && !matchingIds.has(node.id));
        if (faded) continue;

        const r = nodeRadius(node, k);
        ctx.font = `${Math.max(8, 11 / k)}px sans-serif`;
        ctx.fillText(node.label, node.x, node.y + r + 10 / k);
      }
    }

    ctx.restore();
  }

  return { draw, hitTest, updateQuadtree };
}

function getNeighborIds(
  node: GraphNode | null,
  edges: GraphEdge[]
): Set<string> {
  if (!node) return new Set();
  const ids = new Set<string>([node.id]);
  for (const e of edges) {
    if (e.source === node.id) ids.add(e.target);
    if (e.target === node.id) ids.add(e.source);
  }
  return ids;
}
