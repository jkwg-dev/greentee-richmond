import { cn } from "@/lib/utils";
import type { BookingReservationStatus } from "@/types/booking";

/**
 * The reservation status badge (booking.md §12.10, §13.3). Shared so the
 * read-only detail and the reservations list render the identical treatment
 * for the same reservation. Title-cased labels from the enum; confirmed and
 * completed read in champagne, the rest in the quiet mist type.
 */

const STATUS_LABEL: Record<BookingReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  no_show: "No Show",
  completed: "Completed",
};

const STATUS_ACCENT: Record<BookingReservationStatus, boolean> = {
  pending: false,
  confirmed: true,
  cancelled: false,
  no_show: false,
  completed: true,
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingReservationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-4 py-[7px] text-[11px] tracking-[0.16em]",
        STATUS_ACCENT[status]
          ? "border-champagne/40 text-champagne"
          : "border-champagne/[0.14] text-mist",
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
