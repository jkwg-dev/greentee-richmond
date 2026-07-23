import Link from "next/link";
import { reservationFacts } from "@/components/sections/checkout/reservationFacts";
import { FactRows } from "@/components/ui/FactRows";
import { PageHead } from "@/components/ui/PageHead";
import type { BookingReservation } from "@/types/booking";
import { StatusBadge } from "./StatusBadge";

/**
 * The read-only reservation detail (booking.md §12.10), reachable from the
 * confirmation's View Reservation button and, since B3d-1, from the
 * reservations list. Presentational only: the itemized total is the server's,
 * echoed verbatim, and there are no actions in this phase. A pending
 * reservation (reached without completing payment) states its status honestly
 * rather than fabricating a resume-payment flow. The cancel action arrives in
 * B3d-2.
 */
export function ReservationDetail({
  reservation,
}: {
  reservation: BookingReservation;
}) {
  return (
    <>
      <PageHead eyebrow="Your Reservation" title="Reservation *detail*." />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <div className="max-w-[540px]">
          <StatusBadge status={reservation.status} />

          {reservation.status === "pending" && (
            <p className="text-mist mt-6 text-[13.5px] leading-[1.8]">
              Payment was not completed for this reservation.
            </p>
          )}

          <FactRows
            facts={reservationFacts(reservation, "Total")}
            className="mt-10"
          />

          {/* Back affordance to the account home (booking.md §12.10 amended). */}
          <Link
            href="/account"
            className="text-mist hover:text-ivory mt-10 inline-flex min-h-[44px] items-center text-[10.5px] font-medium tracking-[0.24em] uppercase transition-colors"
          >
            Back to Account
          </Link>
        </div>
      </div>
    </>
  );
}
