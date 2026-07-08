"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Floating back-to-top control (docs §5.1). Appears after roughly one viewport
 * of scroll and animates the return with a suspended-smooth-scroll GSAP tween;
 * reduced motion jumps instantly (docs §9.5).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () =>
      setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    if (reducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    void Promise.all([import("gsap"), import("gsap/ScrollToPlugin")]).then(
      ([{ gsap }, { ScrollToPlugin }]) => {
        gsap.registerPlugin(ScrollToPlugin);
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        gsap.to(window, {
          duration: 0.9,
          ease: "power2.inOut",
          scrollTo: { y: 0, autoKill: true },
          onComplete: () => {
            root.style.scrollBehavior = prev;
          },
        });
      },
    );
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={toTop}
      className={cn(
        "border-hair bg-noir/[0.55] text-champagne group fixed right-[26px] bottom-[26px] z-[80] flex h-[52px] w-[52px] items-center justify-center rounded-full border backdrop-blur-[10px] transition-[opacity,border-color,background-color] duration-350 max-[900px]:right-[18px] max-[900px]:bottom-[18px] max-[900px]:h-[46px] max-[900px]:w-[46px]",
        "hover:border-champagne hover:bg-champagne/[0.12]",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 stroke-current transition-transform duration-350 group-hover:-translate-y-[3px]"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
