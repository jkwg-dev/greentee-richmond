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
 * Cancel (the §14 dialog), placed at the bottom. The Back to Account affordance
 * rides above the title through the PageHead `back` prop. `roomName` is resolved
 * upstream from the rooms read (the vendor reservation carries none).
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
      <PageHead
        eyebrow="Your Reservation"
        title="Reservation *detail*."
        back={{ href: "/account", label: "Back to Account" }}
      />
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
            <>
              <p className="text-mist mt-6 text-[13.5px] leading-[1.8]">
                Payment was not completed for this reservation.
              </p>
              <div className="mt-6">
                <Button
                  href={`/book/checkout?reservationId=${encodeURIComponent(reservation.id)}`}
                  variant="solid"
                  size="sm"
                >
                  Complete payment
                </Button>
              </div>
            </>
          )}

          <FactRows
            facts={reservationFacts(reservation, "Total", roomName)}
            className="mt-10"
          />

          {/* Cancel (the §14 dialog) at the bottom, for pending and confirmed. */}
          {cancellable && (
            <div className="mt-12">
              <CancelReservationButton
                reservation={reservation}
                roomName={roomName}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
