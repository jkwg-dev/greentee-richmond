"use client";

import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { bookingCreateEnabled } from "@/lib/booking/config";
import {
  formatCad,
  formatDateLong,
  formatSlotRange,
} from "@/lib/booking/format";
import { cn } from "@/lib/utils";
import type { BookingSelection } from "@/types/booking";

/**
 * The selection summary (booking.md §5.5): FactRows over the picked slot, the
 * Reserve This Time CTA gated by `bookingCreateEnabled` (disabled in B1, the
 * reserve flow in B3), and the call note with the settings phone as a `tel:`
 * link. The facts region is `aria-live` so selection changes are announced.
 */
export function BookingSummary({
  selection,
  date,
  phone,
}: {
  selection: BookingSelection | null;
  date: string;
  phone: string;
}) {
  const reserveDisabled = !bookingCreateEnabled;
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  return (
    <div>
      <div aria-live="polite">
        {selection ? (
          <FactRows
            facts={[
              { label: "Date", value: formatDateLong(date) },
              {
                label: "Time",
                value: formatSlotRange(
                  selection.slot.startsAt,
                  selection.slot.endsAt,
                ),
              },
              { label: "Space", value: selection.room.name },
              { label: "Party", value: String(selection.partySize) },
              {
                label: "Price",
                value: formatCad(selection.slot.priceCents),
                detail: "Before GST and PST",
              },
            ]}
          />
        ) : (
          <p className="text-mist border-champagne/[0.12] border-t pt-[18px] text-[13.5px]">
            Select a time to see the details here.
          </p>
        )}
      </div>
      <Button
        variant="solid"
        aria-disabled={reserveDisabled || undefined}
        className={cn(
          "mt-8 min-h-[44px] w-full",
          reserveDisabled && "opacity-40",
        )}
      >
        Reserve This Time
      </Button>
      {reserveDisabled && (
        <p className="text-mist mt-4 text-[12px] leading-[1.8]">
          Online reservations are opening soon. To hold a time today, call{" "}
          <a
            href={telHref}
            className="text-ivory/90 hover:text-ivory transition-colors"
          >
            {phone}
          </a>
          .
        </p>
      )}
    </div>
  );
}
