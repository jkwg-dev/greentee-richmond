"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatSlotDateLong, formatSlotRange } from "@/lib/booking/format";
import {
  REFUND_POLICY_LINE,
  REFUND_UNPAID_LINE,
  refundBracketPercent,
  refundPreviewLine,
} from "@/lib/booking/refund";
import type {
  BookingReservation,
  CancelReservationResult,
  ReservationCancelled,
} from "@/types/booking";
import { CancelResult } from "./CancelResult";

/**
 * The cancel confirm dialog and its post-cancel states (booking.md §14.3,
 * §14.4). The confirm view states the advisory refund bracket, computed from
 * the start time against the current clock, plus the standing policy line; a
 * pending reservation with no captured payment skips the bracket and says so.
 *
 * Cancel Reservation runs one POST to our own route, which mints the
 * per-operation idempotency key server side; the view locks to a working state
 * for the duration so a second request can never start from the same attempt. A
 * 401 sends the visitor to sign in, a 409 or 422 renders the generic error with
 * the server's message, and Try Again is a fresh attempt with a fresh key.
 *
 * The result view renders strictly from the response through `<CancelResult>`:
 * the advisory preview never leaks into the outcome. On success `onCancelled`
 * hands the updated reservation up so the list migrates the row to the
 * Cancelled view; `onClose` dismisses the dialog.
 */

type Phase =
  | { kind: "confirm" }
  | { kind: "working" }
  | { kind: "result"; result: CancelReservationResult }
  | { kind: "error"; message: string | null };

type ErrorEnvelope = { error?: { message?: string } };

async function errorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as ErrorEnvelope;
    const message = body.error?.message;
    return typeof message === "string" && message.length > 0 ? message : null;
  } catch {
    return null;
  }
}

export function CancelDialog({
  reservation,
  roomName,
  onCancelled,
  onClose,
}: {
  reservation: BookingReservation;
  roomName: string;
  onCancelled: (result: CancelReservationResult) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "confirm" });
  // The advisory bracket is fixed to the clock at open time (§14.3).
  const [previewPercent] = useState(() =>
    refundBracketPercent(reservation.startsAt, Date.now()),
  );
  const panel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const router = useRouter();

  const paid = reservation.status === "confirmed";

  useEffect(() => {
    panel.current?.focus();
  }, []);

  // Escape leaves the dialog, except while the cancel call is in flight.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase.kind !== "working") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase.kind, onClose]);

  const runCancel = useCallback(async () => {
    // Re-entry guard: one attempt fires exactly one request and one key.
    if (busy.current) return;
    busy.current = true;
    setPhase({ kind: "working" });
    try {
      const response = await fetch(
        `/api/booking/reservations/${encodeURIComponent(reservation.id)}/cancel`,
        { method: "POST" },
      );
      if (response.status === 401) {
        router.push("/account/sign-in?next=/account");
        return;
      }
      if (!response.ok) {
        setPhase({ kind: "error", message: await errorMessage(response) });
        return;
      }
      const { result } = (await response.json()) as ReservationCancelled;
      onCancelled(result);
      setPhase({ kind: "result", result });
    } catch {
      setPhase({ kind: "error", message: null });
    } finally {
      busy.current = false;
    }
  }, [reservation.id, onCancelled, router]);

  // Portal to the body so the fixed overlay is measured against the viewport,
  // not a transformed ancestor (the account list sits inside a motion Reveal,
  // whose transform would otherwise confine the overlay to that column).
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="bg-noir/95 fixed inset-0 z-50 flex items-center justify-center px-[6vw] py-16 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panel}
        tabIndex={-1}
        className="max-h-full w-full max-w-[460px] overflow-y-auto outline-none"
      >
        {phase.kind === "confirm" && (
          <>
            <Eyebrow className="mb-[18px]">Cancellation</Eyebrow>
            <h2 className="text-ivory font-serif text-[clamp(1.6rem,3.4vw,2.2rem)] leading-[1.18] font-medium">
              Cancel this reservation?
            </h2>
            <p className="text-mist mt-5 text-[13px] leading-[1.7]">
              {roomName} · {formatSlotDateLong(reservation.startsAt)} ·{" "}
              {formatSlotRange(reservation.startsAt, reservation.endsAt)}
            </p>
            <p className="text-ivory/90 mt-6 text-[13.5px] leading-[1.75]">
              {paid ? refundPreviewLine(previewPercent) : REFUND_UNPAID_LINE}
            </p>
            <p className="text-mist mt-3 text-[12.5px] leading-[1.75]">
              {REFUND_POLICY_LINE}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button variant="solid" size="sm" onClick={runCancel}>
                Cancel Reservation
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Keep Reservation
              </Button>
            </div>
          </>
        )}

        {phase.kind === "working" && (
          <>
            <Eyebrow className="mb-[18px]">One moment</Eyebrow>
            <h2 className="text-ivory font-serif text-[clamp(1.6rem,3.4vw,2.2rem)] leading-[1.18] font-medium">
              Cancelling your reservation.
            </h2>
            <div
              aria-hidden="true"
              className="bg-champagne/30 mt-9 h-px w-[120px] motion-safe:animate-pulse"
            />
          </>
        )}

        {phase.kind === "result" && (
          <>
            <CancelResult result={phase.result} />
            <div className="mt-9">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}

        {phase.kind === "error" && (
          <>
            <Eyebrow className="mb-[18px]">Not completed</Eyebrow>
            <h2 className="text-ivory font-serif text-[clamp(1.6rem,3.4vw,2.2rem)] leading-[1.18] font-medium">
              We could not cancel this reservation. Please try again.
            </h2>
            {phase.message && (
              <p className="text-mist mt-5 text-[13px] leading-[1.75]">
                {phase.message}
              </p>
            )}
            <div className="mt-9 flex flex-wrap gap-4">
              <Button variant="solid" size="sm" onClick={runCancel}>
                Try Again
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Keep Reservation
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
