"use client";

import { useRef } from "react";
import { useCanvasLoop, type CanvasSize } from "@/hooks/useCanvasLoop";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type Seed = {
  x: number; // 0 to 1 across width
  y: number; // 0 to 1, rising; recycles past the top
  r: number; // radius
  v: number; // rise speed, fraction of height per frame
  a: number; // sway phase
  sw: number; // sway amplitude, px
  ts: number; // twinkle speed factor
  al: number; // base alpha
  gold: boolean;
};

/** One seed of light (docs §9.4). `init` scatters the field; otherwise spawn below the fold. */
function makeSeed(init: boolean): Seed {
  return {
    x: Math.random(),
    y: init ? Math.random() : 1.04 + Math.random() * 0.08,
    r: 0.6 + Math.random() * 1.6,
    v: 0.00016 + Math.random() * 0.00038,
    a: Math.random() * Math.PI * 2,
    sw: 8 + Math.random() * 20,
    ts: 0.25 + Math.random() * 0.5,
    al: 0.12 + Math.random() * 0.42,
    gold: Math.random() < 0.32,
  };
}

/** Particle count drops on small screens per the performance budget (docs §9.4). */
function seedCount(width: number): number {
  return width > 0 && width < 768 ? 40 : 56;
}

/**
 * Calm rising seeds of light behind the hero copy (docs §9.4). The only canvas
 * module. Hidden entirely under reduced motion; the loop pauses offscreen and
 * on hidden tabs via useCanvasLoop. Decorative, so `aria-hidden`.
 */
export function HeroParticles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seedsRef = useRef<Seed[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useCanvasLoop(canvasRef, {
    enabled: !reducedMotion,
    onInit: (_ctx, size: CanvasSize) => {
      const n = seedCount(size.width);
      seedsRef.current = Array.from({ length: n }, () => makeSeed(true));
    },
    onFrame: (ctx, size, frame) => {
      const { width: W, height: H } = size;
      const seeds = seedsRef.current;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < seeds.length; i++) {
        const p = seeds[i];
        p.y -= p.v;
        const px = p.x * W + Math.sin(frame * 0.008 * p.ts + p.a) * p.sw;
        const py = p.y * H;
        const tw = 0.55 + 0.45 * Math.sin(frame * 0.016 * p.ts + p.a);
        ctx.beginPath();
        ctx.fillStyle = p.gold
          ? `rgba(216,180,122,${p.al * tw})`
          : `rgba(242,237,226,${p.al * tw})`;
        ctx.shadowColor = p.gold
          ? "rgba(216,180,122,.7)"
          : "rgba(242,237,226,.6)";
        ctx.shadowBlur = p.r * 4;
        ctx.arc(px, py, p.r, 0, 7);
        ctx.fill();
        if (p.y < -0.04) seeds[i] = makeSeed(false);
      }
    },
  });

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
    />
  );
}
