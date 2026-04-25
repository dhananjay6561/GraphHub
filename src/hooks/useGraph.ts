"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { GraphData, GraphNode, GraphStatus, ApiError } from "@/types";
import { createSimulation } from "@/lib/graph/simulation";
import { createRenderer } from "@/lib/graph/renderer";
import type * as d3 from "d3";

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

  const load = useCallback(async () => {
    updateStatus("loading");
    setError(null);

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
      setGraphData(graph);
      graphDataRef.current = graph;
      onGraphReady?.(graph);
      updateStatus("simulating");

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
    } catch (err) {
      setError({ error: "internal", message: String(err) });
      updateStatus("error");
    }
  }, [owner, repo, canvasRef, getTransform, startRenderLoop, updateStatus, onGraphReady]);

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
