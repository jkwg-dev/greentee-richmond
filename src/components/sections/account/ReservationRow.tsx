import Link from "next/link";
import {
  formatCad,
  formatSlotDateLong,
  formatSlotRange,
} from "@/lib/booking/format";
import type { BookingReservation } from "@/types/booking";
import { StatusBadge } from "./StatusBadge";

/**
 * One reservations-list row (booking.md §13.3): the whole row links to the
 * §12.10 detail. Left, the space name over the date and time range, both read
 * from the verbatim strings. Right, the status badge and the total. At 1024 and
 * up the badge sits above the total; below 1024 the badge moves beneath it,
 * both right-aligned, so nothing truncates at 390. The space name reads ivory
 * at rest as the row's identity; the date and time stay mist for hierarchy;
 * hover lifts the row subtly by brightening the hairline. The global focus ring
 * makes the row keyboard-visible.
 */
export function ReservationRow({
  reservation,
}: {
  reservation: BookingReservation;
}) {
  return (
    <li>
      <Link
        href={`/account/reservations/${reservation.id}`}
        className="border-champagne/[0.12] hover:border-champagne/30 hover:bg-champagne/[0.02] flex min-h-[44px] items-start justify-between gap-5 border-t py-5 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-ivory font-serif text-[16px] leading-snug">
            {reservation.roomName ?? reservation.roomId}
          </p>
          <p className="text-mist mt-1.5 text-[12.5px]">
            {formatSlotDateLong(reservation.startsAt)}
          </p>
          <p className="text-mist text-[12.5px]">
            {formatSlotRange(reservation.startsAt, reservation.endsAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col-reverse items-end gap-2 min-[1024px]:flex-col">
          <StatusBadge status={reservation.status} />
          <span className="text-mist text-[13px] tabular-nums">
            {formatCad(reservation.totalCents)}
          </span>
        </div>
      </Link>
    </li>
  );
}
