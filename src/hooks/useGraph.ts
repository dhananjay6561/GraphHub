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

export function useGraph({ owner, repo, canvasRef, getTransform }: UseGraphOptions) {
  const [status, setStatus] = useState<GraphStatus>("idle");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const simRef = useRef<ReturnType<typeof createSimulation> | null>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopLoop = useCallback(() => {
    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startRenderLoop = useCallback(
    (data: GraphData) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const renderer = rendererRef.current!;
      const sim = simRef.current!;

      const matchingIds =
        searchQuery.trim().length > 0
          ? new Set(
              data.nodes
                .filter((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((n) => n.id)
            )
          : null;

      function tick() {
        const nodes = sim.getNodes();
        renderer.updateQuadtree(nodes);
        renderer.draw({
          nodes,
          edges: data.edges,
          selectedNode,
          hoveredNode,
          matchingIds,
        });
        animFrameRef.current = requestAnimationFrame(tick);
      }

      stopLoop();
      animFrameRef.current = requestAnimationFrame(tick);
      void canvas;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, selectedNode, hoveredNode, stopLoop]
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

  useEffect(() => {
    if (graphData && simRef.current && rendererRef.current) {
      startRenderLoop(graphData);
    }
  }, [searchQuery, selectedNode, hoveredNode, graphData, startRenderLoop]);

  const hitTest = useCallback((x: number, y: number) => {
    return rendererRef.current?.hitTest(x, y) ?? null;
  }, []);

  return {
    status,
    graphData,
    error,
    selectedNode,
    setSelectedNode,
    hoveredNode,
    setHoveredNode,
    searchQuery,
    setSearchQuery,
    hitTest,
    reload: load,
  };
}

