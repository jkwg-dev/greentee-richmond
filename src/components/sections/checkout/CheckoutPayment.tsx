"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { rememberTicket } from "@/lib/booking/checkout-handoff";
import type {
  BookingReservation,
  CheckoutSessionCreated,
  CheckoutState,
} from "@/types/booking";
import { CheckoutOutcome } from "./CheckoutOutcome";
import { CheckoutShell } from "./CheckoutShell";
import { MockCheckoutSurface } from "./MockCheckoutSurface";
import { MonerisCheckoutSlot } from "./MonerisCheckoutSlot";
import { reservationFacts } from "./reservationFacts";

/**
 * The payment page island (booking.md §6 leg 2, §12.11). On load it reads the
 * checkout status first: `succeeded` forwards to the reservation detail,
 * `processing` or `review_required` forward to the callback route for
 * verification, and anything else opens a session. It then mounts the surface
 * the session `mode` names: the mock QA surface, or the Moneris SDK slot.
 *
 * The browser never decides an outcome here. The mock surface simulates the
 * `payment_complete` handoff only; verification runs on the callback route
 * through the server complete call and the polling machine.
 */

type Phase =
  | { kind: "loading" }
  | { kind: "mock"; ticket: string }
  | { kind: "moneris" }
  | { kind: "expired" }
  | { kind: "error" };

const OUTER =
  "mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-[140px] max-[900px]:pt-[130px]";

export function CheckoutPayment({
  reservation,
  mockEnabled,
}: {
  reservation: BookingReservation;
  mockEnabled: boolean;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();
  const id = reservation.id;

  // The payment_complete handler (§6 leg 3), the same store-then-navigate the
  // real Moneris callback will run when the SDK lands: keep the ticket in
  // sessionStorage, then go to the callback route. The query fallback carries
  // the ticket only when the storage write failed, so it does not otherwise
  // reach logs, history, or the referrer.
  const completePayment = useCallback(
    (ticket: string) => {
      const stored = rememberTicket(id, ticket);
      const suffix = stored ? "" : `&ticket=${encodeURIComponent(ticket)}`;
      router.push(
        `/book/checkout/callback?reservationId=${encodeURIComponent(id)}${suffix}`,
      );
    },
    [id, router],
  );

  useEffect(() => {
    let live = true;
    const base = `/api/booking/reservations/${encodeURIComponent(id)}`;

    // The status read first (§6 leg 2). "gone" means it navigated away or the
    // session must not be opened; "proceed" means opening a session is next. A
    // 404 is no checkout yet, the normal first load.
    const readStatus = async (): Promise<"proceed" | "gone"> => {
      const res = await fetch(`${base}/checkout`);
      if (!live) return "gone";
      if (res.status === 401) {
        router.push("/account/sign-in?next=/book");
        return "gone";
      }
      if (res.status === 404) return "proceed";
      if (!res.ok) {
        setPhase({ kind: "error" });
        return "gone";
      }
      const state = (await res.json()) as CheckoutState;
      if (!live) return "gone";
      if (state.status === "succeeded") {
        router.replace(`/account/reservations/${encodeURIComponent(id)}`);
        return "gone";
      }
      if (state.status === "processing" || state.status === "review_required") {
        router.replace(
          `/book/checkout/callback?reservationId=${encodeURIComponent(id)}`,
        );
        return "gone";
      }
      // declined or failed: a fresh session lets the visitor try again.
      return "proceed";
    };

    const openSession = async () => {
      const res = await fetch(`${base}/checkout`, { method: "POST" });
      if (!live) return;
      if (res.status === 401) {
        router.push("/account/sign-in?next=/book");
        return;
      }
      // A 422 on the session POST reads as the expired hold (§12.11).
      if (res.status === 422) {
        setPhase({ kind: "expired" });
        return;
      }
      // A 409 means a session is already settling: re-read status, never open a
      // second one (§12.6). If the re-read finds nothing to forward on, surface
      // the error rather than looping a POST.
      if (res.status === 409) {
        if ((await readStatus()) === "proceed" && live) {
          setPhase({ kind: "error" });
        }
        return;
      }
      if (!res.ok) {
        setPhase({ kind: "error" });
        return;
      }
      const { session } = (await res.json()) as CheckoutSessionCreated;
      if (!live) return;
      setPhase(
        session.mode === "mock"
          ? { kind: "mock", ticket: session.ticket }
          : { kind: "moneris" },
      );
    };

    void (async () => {
      if ((await readStatus()) === "proceed") await openSession();
    })();

    return () => {
      live = false;
    };
  }, [id, attempt, router]);

  // Retry re-reads status before any new session POST (§12.11): reset to the
  // loading surface and bump the attempt so the effect re-runs from the top.
  const retry = useCallback(() => {
    setPhase({ kind: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  if (phase.kind === "loading") {
    return (
      <div className={OUTER}>
        <CheckoutShell eyebrow="One moment" heading="Opening secure checkout.">
          <div
            aria-hidden="true"
            className="bg-champagne/30 mt-10 h-px w-[120px] motion-safe:animate-pulse"
          />
        </CheckoutShell>
      </div>
    );
  }

  if (phase.kind === "expired") {
    return (
      <div className={OUTER}>
        <CheckoutOutcome outcome={{ kind: "timedOut" }} />
      </div>
    );
  }

  // mock, moneris, and error share the two-pane payment layout: the reservation
  // summary beside the checkout area (§12.11, standard two-pane responsive).
  return (
    <div className={OUTER}>
      <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-[clamp(2rem,4vw,4rem)] max-[1023px]:grid-cols-1 max-[1023px]:gap-12">
        <div>
          <p className="text-mist text-[9.5px] font-medium tracking-[0.28em] uppercase">
            Your reservation
          </p>
          <FactRows
            facts={reservationFacts(reservation, "Total")}
            className="mt-6"
          />
        </div>
        <div>
          {phase.kind === "mock" && mockEnabled ? (
            <MockCheckoutSurface
              onComplete={() => completePayment(phase.ticket)}
            />
          ) : phase.kind === "moneris" ? (
            <MonerisCheckoutSlot onRetry={retry} />
          ) : (
            // Mock with the flag off, or a generic error: the generic error
            // surface with a retry that re-reads status before any session POST.
            <CheckoutShell
              eyebrow="One moment"
              heading="Something went wrong. Please try again."
            >
              <div className="mt-10">
                <Button variant="ghost" onClick={retry}>
                  Try Again
                </Button>
              </div>
            </CheckoutShell>
          )}
        </div>
      </div>
    </div>
  );
}
