import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  formatCad,
  formatSlotDateLong,
  formatSlotRange,
  formatStamp,
} from "@/lib/booking/format";
import type { BookingReservation } from "@/types/booking";
import { StatusBadge } from "./StatusBadge";

/**
 * One reservations-list row (booking.md §13.3). The main area links to the
 * §12.10 detail: the resolved room name over the date and time range, then the
 * `Booked` line and, on a cancelled row, the `Cancelled` line, all read from the
 * verbatim strings. Right, the status badge and the total. At 1024 and up the
 * badge sits above the total; below 1024 it moves beneath, both right-aligned,
 * so nothing truncates at 390. The row's hairline brightens on hover.
 *
 * The Complete payment resume link (pending rows) sits outside the row link, so
 * it is a sibling anchor, never a nested one. `roomName` is resolved upstream
 * from the rooms read (the vendor reservation carries none). Cancel is offered
 * on pending and confirmed rows (booking.md §14.2) and opens the §14 dialog
 * through `onCancel`; terminal rows carry no action.
 */
export function ReservationRow({
  reservation,
  roomName,
  onCancel,
}: {
  reservation: BookingReservation;
  roomName: string;
  onCancel: (reservation: BookingReservation) => void;
}) {
  const pending = reservation.status === "pending";
  const cancellable = pending || reservation.status === "confirmed";
  return (
    <li className="group border-champagne/[0.12] hover:border-champagne/30 border-t transition-colors">
      <Link
        href={`/account/reservations/${reservation.id}`}
        className="hover:bg-champagne/[0.02] flex min-h-[44px] items-start justify-between gap-5 py-5 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-ivory font-serif text-[16px] leading-snug">
            {roomName}
          </p>
          <p className="text-mist mt-1.5 text-[12.5px]">
            {formatSlotDateLong(reservation.startsAt)}
          </p>
          <p className="text-mist text-[12.5px]">
            {formatSlotRange(reservation.startsAt, reservation.endsAt)}
          </p>
          <p className="text-mist/70 mt-2 text-[11px]">
            Booked {formatStamp(reservation.createdAt)}
          </p>
          {reservation.status === "cancelled" && reservation.cancelledAt && (
            <p className="text-mist/70 text-[11px]">
              Cancelled {formatStamp(reservation.cancelledAt)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col-reverse items-end gap-2 min-[1024px]:flex-col">
          <StatusBadge status={reservation.status} />
          <span className="text-mist text-[13px] tabular-nums">
            {formatCad(reservation.totalCents)}
          </span>
        </div>
      </Link>

      {cancellable && (
        <div className="flex flex-wrap gap-3 pb-5">
          {pending && (
            <Button
              href={`/book/checkout?reservationId=${encodeURIComponent(reservation.id)}`}
              variant="ghost"
              size="sm"
            >
              Complete payment
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onCancel(reservation)}>
            Cancel
          </Button>
        </div>
      )}
    </li>
  );
}
