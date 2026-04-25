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
import type { GraphNode, NodeType, GraphStatus, GraphData } from "@/types";

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface Props {
  owner: string;
  repo: string;
  onNodeSelect: (node: GraphNode | null) => void;
  onStatusChange?: (status: GraphStatus) => void;
  onGraphReady?: (data: GraphData) => void;
  searchQuery?: string;
  visibleTypes?: Set<NodeType>;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, Props>(
  function GraphCanvas(
    { owner, repo, onNodeSelect, onStatusChange, onGraphReady, searchQuery },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { getTransform, resetZoom, zoomIn, zoomOut, setOnZoom } =
      useZoom(canvasRef);

    useImperativeHandle(ref, () => ({ zoomIn, zoomOut, resetZoom }), [
      zoomIn,
      zoomOut,
      resetZoom,
    ]);

    const { hitTest, setSelectedNode, setHoveredNode, setSearchQuery, requestRedraw } =
      useGraph({
        owner,
        repo,
        canvasRef,
        getTransform,
        onStatusChange,
        onGraphReady,
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
          className="block w-full h-full cursor-crosshair"
        />
      </div>
    );
  }
);
