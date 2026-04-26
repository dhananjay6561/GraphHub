"use client";

import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useGraph } from "@/hooks/useGraph";
import { useZoom } from "@/hooks/useZoom";
import type { GraphNode, NodeType, GraphStatus, GraphData, ApiError } from "@/types";

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  panBy: (dx: number, dy: number) => void;
}

interface Props {
  owner: string;
  repo: string;
  onNodeSelect: (node: GraphNode | null) => void;
  onStatusChange?: (status: GraphStatus) => void;
  onGraphReady?: (data: GraphData) => void;
  onError?: (err: ApiError) => void;
  searchQuery?: string;
  visibleTypes?: Set<NodeType>;
  visibleEdges?: Set<string>;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, Props>(
  function GraphCanvas(
    { owner, repo, onNodeSelect, onStatusChange, onGraphReady, onError, searchQuery, visibleTypes, visibleEdges },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { getTransform, resetZoom, zoomIn, zoomOut, setOnZoom, panBy } =
      useZoom(canvasRef);

    useImperativeHandle(ref, () => ({ zoomIn, zoomOut, resetZoom, panBy }), [
      zoomIn,
      zoomOut,
      resetZoom,
      panBy,
    ]);

    const { hitTest, setSelectedNode, setHoveredNode, setSearchQuery, requestRedraw } =
      useGraph({
        owner,
        repo,
        canvasRef,
        getTransform,
        onStatusChange,
        onGraphReady,
        onError,
        visibleTypes,
        visibleEdges,
      });

    // Trigger a redraw after zoom/pan so canvas updates even when sim is settled
    useEffect(() => {
      setOnZoom(requestRedraw);
    }, [setOnZoom, requestRedraw]);

    // Sync external search query
    useEffect(() => {
      if (searchQuery !== undefined) {
        setSearchQuery(searchQuery);
      }
    }, [searchQuery, setSearchQuery]);

    // Resize canvas to fill container
    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const ro = new ResizeObserver(() => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      });

      ro.observe(container);
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      return () => ro.disconnect();
    }, []);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const node = hitTest(e.clientX - rect.left, e.clientY - rect.top);
        setSelectedNode(node);
        onNodeSelect(node);
      },
      [hitTest, setSelectedNode, onNodeSelect]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const node = hitTest(e.clientX - rect.left, e.clientY - rect.top);
        setHoveredNode(node);
      },
      [hitTest, setHoveredNode]
    );

    const handleMouseLeave = useCallback(() => {
      setHoveredNode(null);
    }, [setHoveredNode]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLCanvasElement>) => {
        const PAN = 60;
        switch (e.key) {
          case "ArrowLeft":  e.preventDefault(); panBy(-PAN, 0); break;
          case "ArrowRight": e.preventDefault(); panBy(PAN, 0);  break;
          case "ArrowUp":    e.preventDefault(); panBy(0, -PAN); break;
          case "ArrowDown":  e.preventDefault(); panBy(0, PAN);  break;
          case "+": case "=": e.preventDefault(); zoomIn();  break;
          case "-":           e.preventDefault(); zoomOut(); break;
          case "0":           e.preventDefault(); resetZoom(); break;
          case "Escape":
            setSelectedNode(null);
            onNodeSelect(null);
            break;
        }
      },
      [panBy, zoomIn, zoomOut, resetZoom, setSelectedNode, onNodeSelect]
    );

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full dot-grid"
        style={{ background: "var(--bg-primary)" }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="img"
          aria-label={`Interactive codebase graph for ${owner}/${repo}. Use arrow keys to pan, + and - to zoom, Escape to deselect.`}
          className="block w-full h-full cursor-crosshair focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
        />
      </div>
    );
  }
);
