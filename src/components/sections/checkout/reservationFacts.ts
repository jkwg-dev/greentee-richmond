import type { Fact } from "@/components/ui/FactRows";
import {
  formatCad,
  formatSlotDateLong,
  formatSlotRange,
} from "@/lib/booking/format";
import type { BookingReservation } from "@/types/booking";

/**
 * The reservation as rows (booking.md §12.4, §12.10): space, date, the time
 * range, party, and the itemized money exactly as the server stated it, never
 * recomputed here. Shared so the confirmation and the read-only detail read
 * the same way; only the total's label differs (`Total Paid` once paid, `Total`
 * on the detail). The reservation code, when present, rides on the total row.
 */
export function reservationFacts(
  reservation: BookingReservation,
  totalLabel: string,
): Fact[] {
  return [
    { label: "Space", value: reservation.roomName ?? reservation.roomId },
    { label: "Date", value: formatSlotDateLong(reservation.startsAt) },
    {
      label: "Time",
      value: formatSlotRange(reservation.startsAt, reservation.endsAt),
    },
    { label: "Party", value: String(reservation.partySize) },
    { label: "Subtotal", value: formatCad(reservation.subtotalCents) },
    { label: "GST", value: formatCad(reservation.gstCents) },
    { label: "PST", value: formatCad(reservation.pstCents) },
    {
      label: totalLabel,
      value: formatCad(reservation.totalCents),
      ...(reservation.code ? { detail: `Reservation ${reservation.code}` } : {}),
    },
  ];
}
