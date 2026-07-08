"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

export type ParallaxImageProps = {
  children: React.ReactNode;
  /** yPercent travel at each extreme; spec is 5 (range -5 to 5) (docs §9.2). */
  amount?: number;
  /** Applied to the clipping frame. */
  className?: string;
};

/**
 * Inner vertical parallax scrubbed across the element's viewport transit
 * (docs §9.2): the panorama band and large photo plates outside the journey.
 * The inner layer is overscanned so the travel never reveals an edge. Static
 * under reduced motion or without GSAP.
 */
export function ParallaxImage({
  children,
  amount = 5,
  className,
}: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;
    let killed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed) return;
        gsap.registerPlugin(ScrollTrigger);
        const tween = gsap.fromTo(
          inner,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    return () => {
      killed = true;
      cleanup?.();
    };
  }, [reducedMotion, amount]);

  return (
    <div ref={frameRef} className={cn("relative overflow-hidden", className)}>
      <div
        ref={innerRef}
        className="absolute inset-[-8%] will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
