"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { forgetTicket, recallTicket } from "@/lib/booking/checkout-handoff";
import type {
  BookingReservation,
  CheckoutCompleted,
  CheckoutState,
  CheckoutStatus,
} from "@/types/booking";
import { CheckoutOutcome, type Outcome } from "./CheckoutOutcome";

/**
 * The return leg (booking.md §12.3, §12.6). The browser coming back from the
 * payment page proves nothing, so this opens in the confirming state and asks
 * our own handler to verify the receipt server to server. Success renders only
 * on `succeeded`; while `processing` it polls and never opens a second session.
 */

/** Inside the vendor's 2 to 5 second guidance (booking.md §4 deltas). */
const POLL_MS = 3000;
/** About two minutes of polling before offering a manual retry instead of looping forever. */
const MAX_POLLS = 40;

/**
 * The return URL is the primary carrier of the ticket, but its shape is the
 * payment provider's, so this falls back to the copy the tab kept before it
 * left (booking.md §12.3). Async by design: storage cannot be read while
 * rendering on the server, and resolving it off the render path keeps the whole
 * verification sequence in one asynchronous flow.
 */
async function resolveTicket(
  urlTicket: string | null,
  reservationId: string | null,
): Promise<string | null> {
  if (urlTicket) return urlTicket;
  return reservationId ? recallTicket(reservationId) : null;
}

export function CheckoutCallback({
  reservationId,
  urlTicket,
  phone,
}: {
  reservationId: string | null;
  /** The ticket the return URL carried, if the payment page sent one back. */
  urlTicket: string | null;
  phone: string;
}) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [stalled, setStalled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const polls = useRef(0);
  const router = useRouter();

  // Scrub the ticket and mode from the address bar once the render has captured
  // them (booking.md §12.3, CLAUDE.md booking rules). The ticket is a public
  // handoff value, not a secret, but our Never list names it, and a full URL
  // otherwise lands in the request logger, access logs, browser history, and
  // the referrer. The reservation id stays so a refresh still resolves.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const clean = reservationId
      ? `${window.location.pathname}?reservationId=${encodeURIComponent(reservationId)}`
      : window.location.pathname;
    window.history.replaceState(null, "", clean);
  }, [reservationId]);

  const settle = useCallback(
    async (status: CheckoutStatus): Promise<Outcome | null> => {
      if (status === "processing") return null;
      if (status === "declined") return { kind: "declined" };
      if (status === "review_required") return { kind: "review", phone };
      if (status === "failed") return { kind: "timedOut" };

      // Only here, and only after the server said so.
      if (!reservationId) return { kind: "confirmed", reservation: null };
      forgetTicket(reservationId);
      try {
        const response = await fetch(
          `/api/booking/reservations/${encodeURIComponent(reservationId)}`,
        );
        if (!response.ok) return { kind: "confirmed", reservation: null };
        return {
          kind: "confirmed",
          reservation: (await response.json()) as BookingReservation,
        };
      } catch {
        // The payment is verified either way; the detail is what is missing.
        return { kind: "confirmed", reservation: null };
      }
    },
    [phone, reservationId],
  );

  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const base = `/api/booking/reservations/${encodeURIComponent(reservationId ?? "")}`;

    const resolve = async (status: CheckoutStatus) => {
      const next = await settle(status);
      if (!live) return;
      if (next) setOutcome(next);
      else schedulePoll();
    };

    const schedulePoll = () => {
      if (polls.current >= MAX_POLLS) {
        setStalled(true);
        return;
      }
      polls.current += 1;
      timer = setTimeout(poll, POLL_MS);
    };

    const poll = async () => {
      try {
        const response = await fetch(`${base}/checkout`);
        if (!live) return;
        if (response.status === 401) {
          router.push("/account/sign-in?next=/book");
          return;
        }
        if (!response.ok) {
          // An unreadable status is not an outcome: keep watching rather than
          // inventing a failure the customer might act on.
          schedulePoll();
          return;
        }
        const state = (await response.json()) as CheckoutState;
        await resolve(state.status);
      } catch {
        if (live) schedulePoll();
      }
    };

    const verify = async () => {
      const ticket = await resolveTicket(urlTicket, reservationId);
      if (!live) return;
      // Nothing to verify with: the session is gone, which reads as timed out.
      if (!reservationId || !ticket) {
        setOutcome({ kind: "timedOut" });
        return;
      }
      try {
        const response = await fetch(`${base}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket }),
        });
        if (!live) return;

        if (response.status === 401) {
          router.push("/account/sign-in?next=/book");
          return;
        }
        // A rule violation here is an expired or spent ticket (§12.5).
        if (response.status === 422) {
          setOutcome({ kind: "timedOut" });
          return;
        }
        // Already in flight upstream: read the status, never open a second one.
        if (!response.ok) {
          schedulePoll();
          return;
        }
        const { status } = (await response.json()) as CheckoutCompleted;
        await resolve(status);
      } catch {
        if (live) schedulePoll();
      }
    };

    void verify();

    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }, [reservationId, urlTicket, settle, router, attempt]);

  const retry = () => {
    polls.current = 0;
    setStalled(false);
    setAttempt((count) => count + 1);
  };

  return (
    <CheckoutOutcome
      outcome={outcome ?? { kind: "confirming", stalled, onRetry: retry }}
    />
  );
}
