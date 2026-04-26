"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { GraphData, GraphNode, GraphStatus, ApiError } from "@/types";
import { createSimulation } from "@/lib/graph/simulation";
import { createRenderer } from "@/lib/graph/renderer";
import type * as d3 from "d3";

// ─── Client-side graph cache ─────────────────────────────────────────────────

const CLIENT_TTL = 30 * 60 * 1000; // 30 min

function clientCacheKey(owner: string, repo: string) {
  return `graphhub:graph:${owner}/${repo}`;
}

function readClientCache(owner: string, repo: string): GraphData | null {
  try {
    const raw = localStorage.getItem(clientCacheKey(owner, repo));
    if (!raw) return null;
    const { graph, cachedAt } = JSON.parse(raw) as { graph: GraphData; cachedAt: number };
    if (Date.now() - cachedAt > CLIENT_TTL) return null;
    return graph;
  } catch {
    return null;
  }
}

function writeClientCache(owner: string, repo: string, graph: GraphData) {
  try {
    localStorage.setItem(
      clientCacheKey(owner, repo),
      JSON.stringify({ graph, cachedAt: Date.now() })
    );
  } catch {
    // quota exceeded — fine to skip
  }
}

interface UseGraphOptions {
  owner: string;
  repo: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getTransform: () => d3.ZoomTransform;
  onStatusChange?: (status: GraphStatus) => void;
  onGraphReady?: (data: GraphData) => void;
  onError?: (err: ApiError) => void;
  visibleTypes?: Set<string>;
  visibleEdges?: Set<string>;
}

const ALPHA_IDLE = 0.001;

export function useGraph({ owner, repo, canvasRef, getTransform, onStatusChange, onGraphReady, onError, visibleTypes, visibleEdges }: UseGraphOptions) {
  const [status, setStatus] = useState<GraphStatus>("idle");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const searchQueryRef = useRef("");
  const [searchQuery, _setSearchQuery] = useState("");

  const setSearchQuery = useCallback((q: string) => {
    searchQueryRef.current = q;
    _setSearchQuery(q);
  }, []);

  const simRef = useRef<ReturnType<typeof createSimulation> | null>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const selectedNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  const graphDataRef = useRef<GraphData | null>(null);
  const visibleTypesRef = useRef<Set<string> | null>(visibleTypes ?? null);
  const visibleEdgesRef = useRef<Set<string> | null>(visibleEdges ?? null);

  const updateStatus = useCallback(
    (s: GraphStatus) => {
      setStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange]
  );

  const stopLoop = useCallback(() => {
    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startRenderLoop = useCallback(
    (data: GraphData) => {
      const renderer = rendererRef.current;
      const sim = simRef.current;
      if (!renderer || !sim) return;

      stopLoop();

      function tick() {
        const currentSim = simRef.current;
        const currentRenderer = rendererRef.current;
        if (!currentSim || !currentRenderer) return;

        const nodes = currentSim.getNodes();

        const q = searchQueryRef.current.trim().toLowerCase();
        const matchingIds =
          q.length > 0
            ? new Set(
                data.nodes
                  .filter(
                    (n) =>
                      n.label.toLowerCase().includes(q) ||
                      n.path.toLowerCase().includes(q)
                  )
                  .map((n) => n.id)
              )
            : null;

        currentRenderer.updateQuadtree(nodes, visibleTypesRef.current);
        currentRenderer.draw({
          nodes,
          edges: data.edges,
          selectedNode: selectedNodeRef.current,
          hoveredNode: hoveredNodeRef.current,
          matchingIds,
          visibleTypes: visibleTypesRef.current,
          visibleEdges: visibleEdgesRef.current,
        });

        if (currentSim.getAlpha() > ALPHA_IDLE) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          animFrameRef.current = null;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [stopLoop]
  );

  const requestRedraw = useCallback(() => {
    if (animFrameRef.current != null) return;
    const data = graphDataRef.current;
    if (!data) return;
    startRenderLoop(data);
  }, [startRenderLoop]);

  const wrappedSetSelectedNode = useCallback(
    (node: GraphNode | null) => {
      selectedNodeRef.current = node;
      setSelectedNode(node);
      requestRedraw();
    },
    [requestRedraw]
  );

  const wrappedSetHoveredNode = useCallback(
    (node: GraphNode | null) => {
      hoveredNodeRef.current = node;
      setHoveredNode(node);
      requestRedraw();
    },
    [requestRedraw]
  );

  const wrappedSetSearchQuery = useCallback(
    (q: string) => {
      setSearchQuery(q);
      requestRedraw();
    },
    [setSearchQuery, requestRedraw]
  );

  const startGraph = useCallback(
    (graph: GraphData) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const sim = createSimulation(graph.nodes, graph.edges, graph.clusters, {
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      });
      simRef.current = sim;

      const renderer = createRenderer(canvas, getTransform);
      rendererRef.current = renderer;

      sim.start();
      startRenderLoop(graph);
      updateStatus("ready");
    },
    [canvasRef, getTransform, startRenderLoop, updateStatus]
  );

  const load = useCallback(async () => {
    setError(null);

    // ── Client cache hit — render immediately, skip network ───────────────────
    const cached = readClientCache(owner, repo);
    if (cached) {
      setGraphData(cached);
      graphDataRef.current = cached;
      onGraphReady?.(cached);
      updateStatus("simulating");
      startGraph(cached);
      return;
    }

    // ── Cache miss — fetch from server ────────────────────────────────────────
    updateStatus("loading");

    try {
      const res = await fetch(`/api/graph/${owner}/${repo}`);
      const json = await res.json();

      if (!res.ok) {
        const apiErr = json as ApiError;
        setError(apiErr);
        onError?.(apiErr);
        updateStatus("error");
        return;
      }

      const { graph } = json as { graph: GraphData };
      writeClientCache(owner, repo, graph);

      setGraphData(graph);
      graphDataRef.current = graph;
      onGraphReady?.(graph);
      updateStatus("simulating");
      startGraph(graph);
    } catch (err) {
      setError({ error: "internal", message: String(err) });
      updateStatus("error");
    }
  }, [owner, repo, canvasRef, getTransform, startRenderLoop, updateStatus, onGraphReady, onError, startGraph]);

  useEffect(() => {
    load();
    return () => {
      stopLoop();
      simRef.current?.stop();
    };
  }, [load, stopLoop]);

  // Sync visibility refs and redraw whenever the sets change
  useEffect(() => {
    visibleTypesRef.current = visibleTypes ?? null;
    requestRedraw();
  }, [visibleTypes, requestRedraw]);

  useEffect(() => {
    visibleEdgesRef.current = visibleEdges ?? null;
    requestRedraw();
  }, [visibleEdges, requestRedraw]);

  const hitTest = useCallback((x: number, y: number) => {
    return rendererRef.current?.hitTest(x, y) ?? null;
  }, []);

  // Node dragging — native listeners so we can intercept before D3 zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dragId: string | null = null;

    function onMouseDown(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const node = rendererRef.current?.hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (!node) return;
      dragId = node.id;
      simRef.current?.pinNode(node.id, node.x ?? 0, node.y ?? 0);
      simRef.current?.reheat();
      // Stop D3 zoom from treating this mousedown as a pan start
      e.stopImmediatePropagation();
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragId) return;
      const rect = canvas!.getBoundingClientRect();
      const t = getTransform();
      const wx = (e.clientX - rect.left - t.x) / t.k;
      const wy = (e.clientY - rect.top - t.y) / t.k;
      simRef.current?.pinNode(dragId, wx, wy);
      requestRedraw();
    }

    function onMouseUp() {
      if (!dragId) return;
      simRef.current?.unpinNode(dragId);
      dragId = null;
      requestRedraw();
    }

    // capture: true so our handler runs before D3's mousedown listener
    canvas.addEventListener("mousedown", onMouseDown, { capture: true });
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown, { capture: true } as EventListenerOptions);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
    };
  }, [canvasRef, getTransform, requestRedraw]);

  return {
    status,
    graphData,
    error,
    selectedNode,
    setSelectedNode: wrappedSetSelectedNode,
    hoveredNode,
    setHoveredNode: wrappedSetHoveredNode,
    searchQuery,
    setSearchQuery: wrappedSetSearchQuery,
    hitTest,
    requestRedraw,
    reload: load,
  };
}
