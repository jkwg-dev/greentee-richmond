"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type StatCounterProps = {
  /** Target value counted up to (docs §9.2). */
  value: number;
  /** Trailing string, e.g. "+" for "200+". */
  suffix?: string;
  /** Count duration in ms; spec is 1.4s cubic ease-out. */
  durationMs?: number;
  className?: string;
};

/**
 * Counts 0 to `value` over 1.4s with a cubic ease-out, starting at 50 percent
 * visibility (docs §9.2). Reduced motion prints the final value. The animated
 * numerals are decorative, so `aria-hidden`.
 */
export function StatCounter({
  value,
  suffix = "",
  durationMs = 1400,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [counted, setCounted] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / durationMs);
        setCounted(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      // No observer: animate on mount rather than snapping to the final value.
      raf = requestAnimationFrame(run);
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        run();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs, reducedMotion]);

  return (
    <b ref={ref} aria-hidden="true" className={className}>
      {reducedMotion ? value : counted}
      {suffix}
    </b>
  );
}
