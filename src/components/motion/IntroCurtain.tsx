"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type IntroCurtainProps = {
  /** Fires when the curtain finishes (or is skipped). Home chains the hero bloom off it. */
  onComplete?: () => void;
};

/**
 * The S0 intro curtain (docs §5.1, §9.2): the brand mark fades in and out on
 * noir, then the curtain slides up. Once per load, about 2s. Skipped entirely
 * under reduced motion or without GSAP, firing `onComplete` immediately so the
 * page below proceeds.
 */
export function IntroCurtain({ onComplete }: IntroCurtainProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [done, setDone] = useState(false);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (reducedMotion) {
      completeRef.current?.();
      return;
    }
    const root = rootRef.current;
    const mark = markRef.current;
    if (!root || !mark) return;
    let killed = false;
    let tl: { kill: () => void } | undefined;

    void import("gsap").then(({ gsap }) => {
      if (killed || !root.isConnected) return;
      tl = gsap
        .timeline({
          onComplete: () => {
            setDone(true);
            completeRef.current?.();
          },
        })
        .to(mark, {
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.15,
        })
        .to(mark, { opacity: 0, duration: 0.4, delay: 0.5, ease: "power2.in" })
        .to(root, { yPercent: -100, duration: 0.85, ease: "power4.inOut" });
    });

    return () => {
      killed = true;
      tl?.kill();
    };
  }, [reducedMotion]);

  if (done || reducedMotion) return null;

  return (
    <div
      ref={rootRef}
      data-intro-curtain
      className="bg-noir fixed inset-0 z-[200] flex items-center justify-center"
    >
      <div ref={markRef} className="text-center opacity-0">
        <div className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-medium tracking-[0.02em]">
          GreenTee Richmond
        </div>
        <small className="text-champagne mt-2.5 block text-[9px] font-medium tracking-[0.42em] uppercase">
          Center · Indoor Golf Club
        </small>
      </div>
    </div>
  );
}
