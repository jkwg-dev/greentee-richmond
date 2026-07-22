import { FactRows } from "@/components/ui/FactRows";
import { PageHead } from "@/components/ui/PageHead";
import { reservationFacts } from "@/components/sections/checkout/reservationFacts";
import { cn } from "@/lib/utils";
import type {
  BookingReservation,
  BookingReservationStatus,
} from "@/types/booking";

/**
 * The read-only reservation detail (booking.md §12.10), the target of the
 * confirmation's View Reservation button. Presentational only: the itemized
 * total is the server's, echoed verbatim, and there are no actions in B3c. A
 * pending reservation (reached without completing payment) states its status
 * honestly rather than fabricating a resume-payment flow. The list and the
 * cancel action arrive in B3d.
 */

/** Enum to a title-cased label (booking.md §12.10). */
const STATUS_LABEL: Record<BookingReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  no_show: "No Show",
  completed: "Completed",
};

/** Confirmed reads in champagne; the rest stay in the quiet mist type. */
const STATUS_ACCENT: Record<BookingReservationStatus, boolean> = {
  pending: false,
  confirmed: true,
  cancelled: false,
  no_show: false,
  completed: true,
};

function StatusBadge({ status }: { status: BookingReservationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-4 py-[7px] text-[11px] tracking-[0.16em]",
        STATUS_ACCENT[status]
          ? "border-champagne/40 text-champagne"
          : "border-champagne/[0.14] text-mist",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

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
        </div>
      </div>
    </>
  );
}
