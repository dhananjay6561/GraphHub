"use client";

import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types";

function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function themeColors() {
  return {
    folder:   cssVar("--node-folder",   "#7c7c8a"),
    file:     cssVar("--node-file",     "#8b9dc4"),
    function: cssVar("--node-function", "#8aab96"),
    class:    cssVar("--node-class",    "#c4a96e"),
    edge:     cssVar("--edge-default",  "#2e2e38"),
    label:    cssVar("--text-secondary","#a09f9a"),
    selected: cssVar("--text-primary",  "#f0efe9"),
    dimOpacity: 0.15,
  };
}

export interface RenderState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  hoveredNode: GraphNode | null;
  matchingIds: Set<string> | null;
  visibleTypes: Set<string> | null;
  visibleEdges: Set<string> | null;
}

export interface RendererHandle {
  draw: (state: RenderState) => void;
  hitTest: (x: number, y: number) => GraphNode | null;
  updateQuadtree: (nodes: GraphNode[], visibleTypes?: Set<string> | null) => void;
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  getTransform: () => d3.ZoomTransform
): RendererHandle {
  const ctx = canvas.getContext("2d")!;
  let quadtree = d3.quadtree<GraphNode>();

  function updateQuadtree(nodes: GraphNode[], visibleTypes?: Set<string> | null) {
    const visible = visibleTypes
      ? nodes.filter((n) => visibleTypes.has(n.type))
      : nodes;
    quadtree = d3
      .quadtree<GraphNode>()
      .x((n) => n.x ?? 0)
      .y((n) => n.y ?? 0)
      .addAll(visible);
  }

  function hitTest(screenX: number, screenY: number): GraphNode | null {
    const t = getTransform();
    const wx = (screenX - t.x) / t.k;
    const wy = (screenY - t.y) / t.k;
    const radius = 20 / t.k;
    return quadtree.find(wx, wy, radius) ?? null;
  }

  function nodeRadius(node: GraphNode): number {
    if (node.type === "folder") return Math.max(12, Math.min(28, (node.connections + 1) * 2.5));
    if (node.type === "file")   return Math.max(5,  Math.min(12, (node.connections + 1) * 1.2));
    return 3;
  }

  function draw(state: RenderState) {
    const { nodes, edges, selectedNode, hoveredNode, matchingIds, visibleTypes, visibleEdges } = state;
    const COLORS = themeColors();
    const t = getTransform();
    const k = t.k;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(k, k);

    const nodeById = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));
    const neighborIds = getNeighborIds(selectedNode ?? hoveredNode, edges);
    const focusMode = selectedNode !== null || hoveredNode !== null;
    const searchMode = matchingIds !== null;

    // ── folder halos ─────────────────────────────────────────────────────────
    for (const node of nodes) {
      if (node.type !== "folder") continue;
      if (visibleTypes && !visibleTypes.has("folder")) continue;
      if (node.x == null || node.y == null) continue;

      const r = nodeRadius(node);
      const faded = focusMode && !neighborIds.has(node.id);
      ctx.globalAlpha = faded ? 0.03 : 0.07;
      ctx.fillStyle = COLORS.folder;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 4.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // ── edges ─────────────────────────────────────────────────────────────────
    for (const edge of edges) {
      if (visibleEdges && !visibleEdges.has(edge.type)) continue;

      const src = nodeById.get(edge.source);
      const tgt = nodeById.get(edge.target);
      if (!src || !tgt || src.x == null || src.y == null || tgt.x == null || tgt.y == null) continue;
      if (visibleTypes && (!visibleTypes.has(src.type) || !visibleTypes.has(tgt.type))) continue;

      // hide less important edges when zoomed out
      if (k < 0.3 && edge.type !== "import") continue;

      const faded =
        (focusMode && !neighborIds.has(edge.source) && !neighborIds.has(edge.target)) ||
        (searchMode && matchingIds && !matchingIds.has(edge.source) && !matchingIds.has(edge.target));

      ctx.globalAlpha = faded ? COLORS.dimOpacity * 0.5 : 0.35;
      ctx.strokeStyle = COLORS.edge;
      ctx.lineWidth = 1 / k;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
    }

    // ── nodes ─────────────────────────────────────────────────────────────────
    for (const node of nodes) {
      if (visibleTypes && !visibleTypes.has(node.type)) continue;
      if (node.x == null || node.y == null) continue;

      // progressive detail — hide small nodes when far out
      if (k < 0.3 && node.type !== "folder") continue;
      if (k < 0.7 && (node.type === "function" || node.type === "class")) continue;

      const r = nodeRadius(node);
      const color = COLORS[node.type as keyof typeof COLORS] ?? COLORS.file;
      const isSelected = selectedNode?.id === node.id;
      const isHovered  = hoveredNode?.id === node.id;
      const isMatch    = searchMode && matchingIds?.has(node.id);
      const faded =
        (focusMode && !neighborIds.has(node.id) && !isSelected && !isHovered) ||
        (searchMode && matchingIds && !matchingIds.has(node.id));

      ctx.globalAlpha = faded ? COLORS.dimOpacity : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color as string;
      ctx.fill();

      if (isSelected || isHovered || isMatch) {
        ctx.strokeStyle = isSelected ? COLORS.selected : (color as string);
        ctx.lineWidth = isSelected ? 2.5 / k : 1.5 / k;
        ctx.globalAlpha = 1;
        ctx.stroke();

        // outer glow ring for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 6 / k, 0, 2 * Math.PI);
          ctx.strokeStyle = color as string;
          ctx.lineWidth = 1 / k;
          ctx.globalAlpha = 0.4;
          ctx.stroke();
        }
      }
    }

    // ── labels ────────────────────────────────────────────────────────────────
    if (k > 0.6) {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (const node of nodes) {
        if (visibleTypes && !visibleTypes.has(node.type)) continue;
        if (node.x == null || node.y == null) continue;
        if (k < 0.9 && (node.type === "function" || node.type === "class")) continue;
        if (k < 0.6 && node.type === "file") continue;

        const faded =
          (focusMode && !neighborIds.has(node.id)) ||
          (searchMode && matchingIds && !matchingIds.has(node.id));
        if (faded && !searchMode) continue;

        const r = nodeRadius(node);
        const fontSize = Math.max(9, 11 / k);
        ctx.font = `${fontSize}px ui-monospace, monospace`;
        ctx.fillStyle = COLORS.label;
        ctx.globalAlpha = faded ? COLORS.dimOpacity : 0.85;
        ctx.fillText(node.label, node.x, node.y + r + 4 / k);
      }
    }

    ctx.restore();
  }

  return { draw, hitTest, updateQuadtree };
}

function getNeighborIds(node: GraphNode | null, edges: GraphEdge[]): Set<string> {
  if (!node) return new Set();
  const ids = new Set<string>([node.id]);
  for (const e of edges) {
    if (e.source === node.id) ids.add(e.target);
    if (e.target === node.id) ids.add(e.source);
  }
  return ids;
}
