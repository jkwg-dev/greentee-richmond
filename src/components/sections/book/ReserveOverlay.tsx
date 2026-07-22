"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ReserveState } from "./useReserveFlow";

/**
 * The calm cover over the two reserve POSTs (booking.md §12.4), and the surface
 * for the ways that leg can end without reaching the payment page: the per-day
 * cap (§12.8 copy), a slot conflict, and an unexpected failure. On the happy
 * path it is only ever seen briefly, because the redirect follows.
 */

const COPY = {
  working: {
    eyebrow: "One moment",
    line: "Taking you to secure checkout.",
  },
  cap: {
    eyebrow: "Already booked",
    line: "You already have a reservation for that day. See your reservations to change it.",
  },
  conflict: {
    eyebrow: "Just taken",
    line: "That time was just taken. Choose another time.",
  },
  error: {
    eyebrow: "Not completed",
    line: "Something went wrong. Please try again.",
  },
} as const;

export function ReserveOverlay({
  state,
  onDismiss,
}: {
  state: ReserveState;
  onDismiss: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // The overlay takes focus so a keyboard visitor lands on it, and Escape
  // leaves any state that is not mid-flight.
  useEffect(() => {
    if (state.kind === "idle") return;
    panel.current?.focus();
    if (state.kind === "working") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.kind, onDismiss]);

  if (state.kind === "idle") return null;
  const copy = COPY[state.kind];

  return (
    <div
      className="bg-noir/95 fixed inset-0 z-50 flex items-center justify-center px-[6vw] backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
    >
      <div
        ref={panel}
        tabIndex={-1}
        className="max-w-[440px] text-center outline-none"
      >
        <Eyebrow className="mb-[22px]">{copy.eyebrow}</Eyebrow>
        <p className="text-ivory font-serif text-[clamp(1.5rem,3.2vw,2.1rem)] leading-[1.25]">
          {copy.line}
        </p>

        {state.kind === "working" ? (
          <div
            aria-hidden="true"
            className="bg-champagne/30 mx-auto mt-10 h-px w-[120px] motion-safe:animate-pulse"
          />
        ) : (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {state.kind === "cap" ? (
              <Button href="/account" variant="solid">
                My Reservations
              </Button>
            ) : (
              <Button variant="ghost" onClick={onDismiss}>
                {state.kind === "conflict" ? "Back to Availability" : "Try Again"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
