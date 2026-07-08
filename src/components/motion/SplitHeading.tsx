"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

export type SplitHeadingProps = {
  /** Each string becomes one non-wrapping display line. */
  lines: string[];
  as?: "h1" | "h2";
  className?: string;
  /** Delay before the bloom starts, seconds (chained after the curtain on Home). */
  delay?: number;
};

/**
 * Per-letter hero bloom: y and blur release on a 0.03 stagger (docs §9.2).
 * Splits each line into letter spans and animates them with GSAP; reduced
 * motion leaves the CSS-settled letters in place. The full string stays
 * readable to screen readers via an `aria-label` on the heading.
 */
export function SplitHeading({
  lines,
  as: Heading = "h1",
  className,
  delay = 0,
}: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    let killed = false;

    void import("gsap").then(({ gsap }) => {
      if (killed || !el.isConnected) return;
      const letters = el.querySelectorAll<HTMLElement>(".split-line > span");
      gsap.to(letters, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.03,
        duration: 0.9,
        ease: "power3.out",
        delay,
      });
    });

    return () => {
      killed = true;
    };
  }, [reducedMotion, delay]);

  return (
    <Heading ref={ref} aria-label={lines.join(" ")} className={cn(className)}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="split-line" aria-hidden="true">
          {line.split("").map((char, charIndex) => (
            <span key={charIndex}>{char === " " ? " " : char}</span>
          ))}
        </span>
      ))}
    </Heading>
  );
}
