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
}

const ALPHA_IDLE = 0.001;

export function useGraph({ owner, repo, canvasRef, getTransform }: UseGraphOptions) {
  const [status, setStatus] = useState<GraphStatus>("idle");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  // Search is kept in a ref so changing it never triggers a re-fetch
  const searchQueryRef = useRef("");
  const [searchQuery, _setSearchQuery] = useState("");

  const setSearchQuery = useCallback((q: string) => {
    searchQueryRef.current = q;
    _setSearchQuery(q);
  }, []);

  const simRef = useRef<ReturnType<typeof createSimulation> | null>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  // Store latest selection in refs so the rAF loop always sees current values
  // without needing to restart the loop on every state change
  const selectedNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  const graphDataRef = useRef<GraphData | null>(null);

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
        currentRenderer.updateQuadtree(nodes);

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

        currentRenderer.draw({
          nodes,
          edges: data.edges,
          selectedNode: selectedNodeRef.current,
          hoveredNode: hoveredNodeRef.current,
          matchingIds,
        });

        // Stop rAF when simulation is stable — restart on interaction if needed
        if (currentSim.getAlpha() > ALPHA_IDLE) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          animFrameRef.current = null;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [stopLoop]
    // Intentionally omits selectedNode/hoveredNode/searchQuery —
    // those are read from refs inside tick(), so this callback never
    // needs to be recreated when selection or search changes.
  );

  // Restart rAF for a single frame whenever selection/search changes
  // (sim is stable but we need one redraw)
  const requestRedraw = useCallback(() => {
    if (animFrameRef.current != null) return; // loop already running
    const data = graphDataRef.current;
    if (!data) return;
    startRenderLoop(data);
  }, [startRenderLoop]);

  // Keep refs in sync
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
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`/api/graph/${owner}/${repo}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json as ApiError);
        setStatus("error");
        return;
      }

      const { graph } = json as { graph: GraphData };
      setGraphData(graph);
      graphDataRef.current = graph;
      setStatus("simulating");

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
      setStatus("ready");
    } catch (err) {
      setError({ error: "internal", message: String(err) });
      setStatus("error");
    }
  }, [owner, repo, canvasRef, getTransform, startRenderLoop]);

  useEffect(() => {
    load();
    return () => {
      stopLoop();
      simRef.current?.stop();
    };
  }, [load, stopLoop]);

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
    reload: load,
  };
}
