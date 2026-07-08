"use client";

import { useEffect, useRef, type RefObject } from "react";

export type CanvasSize = { width: number; height: number };

export type UseCanvasLoopOptions = {
  /** Called once after the first sizing. Seed state here. */
  onInit?: (ctx: CanvasRenderingContext2D, size: CanvasSize) => void;
  /** Called every animation frame while the canvas is visible. */
  onFrame: (
    ctx: CanvasRenderingContext2D,
    size: CanvasSize,
    frame: number,
  ) => void;
  /** IntersectionObserver margin for the offscreen pause (docs §9.4). */
  rootMargin?: string;
  /** When false the loop never starts (e.g. reduced motion). */
  enabled?: boolean;
};

/**
 * Drives a Canvas 2D render loop with the shared lifecycle rules (docs §9.4):
 * devicePixelRatio capped at 2, resize handling in CSS pixels, and pause both
 * when the canvas leaves the viewport and on hidden tabs. Sizing lives here so
 * canvas modules only describe what to draw.
 */
export function useCanvasLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  {
    onInit,
    onFrame,
    rootMargin = "80px",
    enabled = true,
  }: UseCanvasLoopOptions,
) {
  const onInitRef = useRef(onInit);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onInitRef.current = onInit;
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size: CanvasSize = { width: 0, height: 0 };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size.width = canvas.clientWidth;
      size.height = canvas.clientHeight;
      canvas.width = size.width * dpr;
      canvas.height = size.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    onInitRef.current?.(ctx, size);

    let frame = 0;
    let raf = 0;
    let running = false;

    const tick = () => {
      if (!running) return;
      frame += 1;
      onFrameRef.current(ctx, size, frame);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      tick();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    window.addEventListener("resize", resize);

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => (entries[0].isIntersecting ? start() : stop()),
        { rootMargin },
      );
      io.observe(canvas);
    } else {
      start();
    }

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [canvasRef, enabled, rootMargin]);
}
