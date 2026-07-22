import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FactRows } from "@/components/ui/FactRows";
import type { BookingReservation } from "@/types/booking";
import { reservationFacts } from "./reservationFacts";

/**
 * The settled surfaces of booking.md §12.4 and §12.6, presentational only: it
 * renders the outcome it is handed and decides nothing. The confirmed variant
 * is the one success surface in the flow, and the island only ever passes it
 * after the server answered `succeeded`.
 */

export type Outcome =
  | { kind: "confirming"; stalled: boolean; onRetry: () => void }
  | { kind: "confirmed"; reservation: BookingReservation | null }
  | { kind: "declined" }
  | { kind: "review"; phone: string }
  | { kind: "timedOut" };

export function CheckoutOutcome({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === "confirming") {
    return (
      <Shell eyebrow="One moment" heading="Confirming your payment. This only takes a moment.">
        {outcome.stalled ? (
          <div className="mt-10">
            <Button variant="ghost" onClick={outcome.onRetry}>
              Try Again
            </Button>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="bg-champagne/30 mt-10 h-px w-[120px] motion-safe:animate-pulse"
          />
        )}
      </Shell>
    );
  }

  if (outcome.kind === "confirmed") {
    return (
      <Shell eyebrow="Confirmed" heading="You are booked.">
        <p className="text-mist mt-5 text-[14.5px]">
          A confirmation is on its way.
        </p>
        {outcome.reservation && (
          <FactRows
            facts={reservationFacts(outcome.reservation, "Total Paid")}
            className="mt-12"
          />
        )}
        <div className="mt-10">
          <Button
            variant="solid"
            href={
              outcome.reservation
                ? `/account/reservations/${outcome.reservation.id}`
                : "/account"
            }
          >
            View Reservation
          </Button>
        </div>
      </Shell>
    );
  }

  if (outcome.kind === "declined") {
    return (
      <Shell
        eyebrow="Payment declined"
        heading="That payment did not go through. You can try again."
      >
        <div className="mt-10">
          <Button variant="solid" href="/book">
            Back to Review
          </Button>
        </div>
      </Shell>
    );
  }

  if (outcome.kind === "review") {
    return (
      <Shell eyebrow="In review" heading="We are confirming this payment with our team.">
        <p className="text-mist mt-5 max-w-[460px] text-[14.5px] leading-[1.8]">
          Check your reservations for the final status, or call us at{" "}
          <a
            className="text-ivory hover:text-champagne underline underline-offset-4 transition-colors"
            href={`tel:${outcome.phone.replace(/[^+\d]/g, "")}`}
          >
            {outcome.phone}
          </a>
          .
        </p>
        <div className="mt-10">
          <Button variant="ghost" href="/account">
            My Reservations
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Timed out"
      heading="That session timed out before payment finished. Please choose your time again."
    >
      <div className="mt-10">
        <Button variant="solid" href="/book">
          Back to Availability
        </Button>
      </div>
    </Shell>
  );
}

function Shell({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-[620px]">
      <Eyebrow className="mb-[22px]">{eyebrow}</Eyebrow>
      <h1 className="text-ivory font-serif text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.15] font-medium">
        {heading}
      </h1>
      {children}
    </div>
  );
}
