import Link from "next/link";
import { reservationFacts } from "@/components/sections/checkout/reservationFacts";
import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { PageHead } from "@/components/ui/PageHead";
import { formatStamp } from "@/lib/booking/format";
import type { BookingReservation } from "@/types/booking";
import { CancelReservationButton } from "./CancelReservationButton";
import { StatusBadge } from "./StatusBadge";

/**
 * The read-only reservation detail (booking.md §12.10, §14.5), reachable from
 * the confirmation's View Reservation button and from the reservations list.
 * The itemized total is the server's, echoed verbatim. `Booked` shows always
 * and `Cancelled` on a cancelled reservation. A pending reservation states its
 * status honestly and offers Complete payment; pending and confirmed both offer
 * Cancel (the §14 dialog). `roomName` is resolved upstream from the rooms read
 * (the vendor reservation carries none).
 */
export function ReservationDetail({
  reservation,
  roomName,
}: {
  reservation: BookingReservation;
  roomName: string;
}) {
  const cancellable =
    reservation.status === "pending" || reservation.status === "confirmed";
  return (
    <>
      <PageHead eyebrow="Your Reservation" title="Reservation *detail*." />
      <div className="mx-auto max-w-[1360px] px-[6vw] pt-[46px] pb-[110px]">
        <div className="max-w-[540px]">
          <StatusBadge status={reservation.status} />

          <p className="text-mist/70 mt-4 text-[11px]">
            Booked {formatStamp(reservation.createdAt)}
          </p>
          {reservation.status === "cancelled" && reservation.cancelledAt && (
            <p className="text-mist/70 text-[11px]">
              Cancelled {formatStamp(reservation.cancelledAt)}
            </p>
          )}

          {reservation.status === "pending" && (
            <p className="text-mist mt-6 text-[13.5px] leading-[1.8]">
              Payment was not completed for this reservation.
            </p>
          )}

          {cancellable && (
            <div className="mt-6 flex flex-wrap gap-3">
              {reservation.status === "pending" && (
                <Button
                  href={`/book/checkout?reservationId=${encodeURIComponent(reservation.id)}`}
                  variant="solid"
                  size="sm"
                >
                  Complete payment
                </Button>
              )}
              <CancelReservationButton
                reservation={reservation}
                roomName={roomName}
              />
            </div>
          )}

          <FactRows
            facts={reservationFacts(reservation, "Total", roomName)}
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
