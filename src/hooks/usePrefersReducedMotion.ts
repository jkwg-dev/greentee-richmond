"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Server snapshot: assume motion is allowed so markup matches the first client paint. */
function getServerSnapshot() {
  return false;
}

/**
 * Tracks the user's reduced-motion preference (docs §9.5) via an external-store
 * subscription. Motion and canvas leaves branch on this to settle instantly,
 * hide the canvas, and print final counter values.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
