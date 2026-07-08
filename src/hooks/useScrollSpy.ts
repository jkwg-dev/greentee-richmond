"use client";

import { useEffect, useState } from "react";

export type UseScrollSpyOptions = {
  /** Viewport band that decides the active section (docs §6.1). */
  rootMargin?: string;
};

/**
 * Reports which section is in view, driving the `/spaces` rail and chip bar
 * (docs §6.1). One IntersectionObserver over the given anchor ids; the last
 * entry to cross the band wins. Reusable by the dining rail if ever needed.
 */
export function useScrollSpy(
  ids: string[],
  { rootMargin = "-25% 0px -65% 0px" }: UseScrollSpyOptions = {},
): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    if (!ids.length || !("IntersectionObserver" in window)) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return activeId;
}
