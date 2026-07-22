"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { rememberTicket } from "@/lib/booking/checkout-handoff";
import { selectionSummary } from "@/lib/booking/selection";
import type {
  BookingSelection,
  CheckoutSessionCreated,
  ReservationCreated,
} from "@/types/booking";

/**
 * The reserve leg of booking.md §12.1: create, then open the Hosted Checkout
 * session, then hand the browser to the payment page. Both POSTs go to our own
 * route handlers, which relay the JWT and attach the per-operation idempotency
 * key; the browser never calls the middleware and never sees a key it did not
 * receive from us.
 *
 * The redirect is a full-page navigation, never an iframe (CLAUDE.md booking
 * track rules).
 */

export type ReserveState =
  | { kind: "idle" }
  /** Covering the two POSTs so the redirect never feels abrupt (§12.4). */
  | { kind: "working" }
  /** A create 422 while the policy names a per-day cap (§12.5, hedge 13). */
  | { kind: "cap" }
  /** A 409: the slot went while we were deciding (§12.6). */
  | { kind: "conflict" }
  | { kind: "error" };

type ErrorEnvelope = { error?: { code?: string; message?: string } };

async function errorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorEnvelope;
    return body.error?.code ?? `http_${response.status}`;
  } catch {
    return `http_${response.status}`;
  }
}

export function useReserveFlow({
  partySize,
  hasDailyCap,
}: {
  partySize: number;
  hasDailyCap: boolean;
}) {
  const [state, setState] = useState<ReserveState>({ kind: "idle" });
  const router = useRouter();

  const dismiss = useCallback(() => setState({ kind: "idle" }), []);

  const reserve = useCallback(
    async (selection: BookingSelection) => {
      const { roomId, startsAt, endsAt } = selectionSummary(selection);
      setState({ kind: "working" });

      try {
        // 1. The pending reservation, over the whole contiguous range.
        const created = await fetch("/api/booking/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // The range endpoints are the slot strings, echoed verbatim.
          body: JSON.stringify({ roomId, startsAt, endsAt, partySize }),
        });

        if (created.status === 401) {
          router.push("/account/sign-in?next=/book");
          return;
        }
        if (!created.ok) {
          const code = await errorCode(created);
          // Interim heuristic pending a vendor error code (booking.md hedge 13):
          // a create-time rule violation reads as the per-day cap when the
          // policy names one.
          if (code === "rule_violation" && hasDailyCap) {
            setState({ kind: "cap" });
            return;
          }
          setState({ kind: code === "conflict" ? "conflict" : "error" });
          return;
        }
        const { reservation } = (await created.json()) as ReservationCreated;

        // 2. The Hosted Checkout session for that reservation.
        const opened = await fetch(
          `/api/booking/reservations/${encodeURIComponent(reservation.id)}/checkout`,
          { method: "POST" },
        );

        if (opened.status === 401) {
          router.push("/account/sign-in?next=/book");
          return;
        }
        if (!opened.ok) {
          const code = await errorCode(opened);
          setState({ kind: code === "conflict" ? "conflict" : "error" });
          return;
        }
        const { session } = (await opened.json()) as CheckoutSessionCreated;

        // 3. Leave for the payment page, keeping a fallback copy of the ticket.
        rememberTicket(reservation.id, session.ticket);
        window.location.assign(session.checkoutUrl);
      } catch {
        setState({ kind: "error" });
      }
    },
    [hasDailyCap, partySize, router],
  );

  return { state, reserve, dismiss };
}
