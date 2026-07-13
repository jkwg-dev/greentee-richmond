import { FactRows } from "@/components/ui/FactRows";

const PLACEHOLDER_DETAIL = "Placeholder, confirming with the booking system";

/**
 * Policy notes band beneath the booking panel (booking.md §5.2 item 3, §7):
 * placeholder rows per the Rates & Hours convention, each marked in its
 * detail line.
 */
export function BookingNotes() {
  return (
    <FactRows
      facts={[
        {
          label: "Session length",
          value: "30 minutes per block",
          detail: PLACEHOLDER_DETAIL,
        },
        {
          label: "Booking window",
          value: "Up to 14 days ahead",
          detail: PLACEHOLDER_DETAIL,
        },
        {
          label: "Cancellation",
          value: "Policy to be confirmed",
          detail: PLACEHOLDER_DETAIL,
        },
      ]}
    />
  );
}
