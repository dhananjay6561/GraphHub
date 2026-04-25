"use client";

import { useRef, useEffect, useCallback } from "react";
import { useGraph } from "@/hooks/useGraph";
import { useZoom } from "@/hooks/useZoom";
import { ProgressBar } from "@/components/ProgressBar";
import type { GraphNode } from "@/types";

interface Props {
  owner: string;
  repo: string;
  onNodeSelect: (node: GraphNode | null) => void;
}

export function GraphCanvas({ owner, repo, onNodeSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { getTransform, resetZoom } = useZoom(canvasRef);

  const { status, hitTest, setSelectedNode, setHoveredNode } = useGraph({
    owner,
    repo,
    canvasRef,
    getTransform,
  });

  // resize canvas to fill container
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
    <div ref={containerRef} className="relative w-full h-full bg-slate-950">
      <ProgressBar status={status} />
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block w-full h-full cursor-crosshair"
      />
      <button
        onClick={resetZoom}
        className="absolute bottom-4 right-4 bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded"
      >
        reset zoom
      </button>
    </div>
  );
}
