"use client";

import { useRef, useCallback, useEffect } from "react";
import * as d3 from "d3";

export function useZoom(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const onZoomRef = useRef<(() => void) | null>(null);

  const getTransform = useCallback(() => transformRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.05, 8])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        onZoomRef.current?.();
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
    onZoomRef.current?.();
  }, [canvasRef]);

  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomRef.current) return;
    d3.select(canvas).call(zoomRef.current.scaleBy, 1.3);
    onZoomRef.current?.();
  }, [canvasRef]);

  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomRef.current) return;
    d3.select(canvas).call(zoomRef.current.scaleBy, 1 / 1.3);
    onZoomRef.current?.();
  }, [canvasRef]);

  const setOnZoom = useCallback((fn: () => void) => {
    onZoomRef.current = fn;
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomRef.current) return;
    d3.select(canvas).call(zoomRef.current.translateBy, dx, dy);
    onZoomRef.current?.();
  }, [canvasRef]);

  return { getTransform, resetZoom, zoomIn, zoomOut, setOnZoom, panBy };
}
