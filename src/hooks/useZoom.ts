"use client";

import { useRef, useCallback, useEffect } from "react";
import * as d3 from "d3";

export function useZoom(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);

  const getTransform = useCallback(() => transformRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 8])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
      });

    d3.select(canvas).call(zoom);
    zoomRef.current = zoom;

    return () => {
      d3.select(canvas).on(".zoom", null);
    };
  }, [canvasRef]);

  const resetZoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomRef.current) return;
    d3.select(canvas).call(zoomRef.current.transform, d3.zoomIdentity);
  }, [canvasRef]);

  return { getTransform, resetZoom };
}
