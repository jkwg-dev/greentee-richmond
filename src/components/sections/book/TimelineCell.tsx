"use client";

import { formatCad, formatSlotTime } from "@/lib/booking/format";
import { cn } from "@/lib/utils";
import type { BookingSlot } from "@/types/booking";

/**
 * One available timeline row (booking.md §11.4): full width, at least 48px,
 * start time on the left, price on the right. Champagne fill with ink text
 * when in the selected range; a hairline chip at rest. The whole row is a
 * button with `aria-pressed`; taps flow through the §5.4 range model.
 */
export function TimelineCell({
  slot,
  active,
  onTap,
}: {
  slot: BookingSlot;
  active: boolean;
  onTap: () => void;
}) {
  const time = formatSlotTime(slot.startsAt);
  const price = formatCad(slot.priceCents);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${time}, ${price}`}
      onClick={onTap}
      className={cn(
        "flex min-h-[48px] w-full items-center justify-between gap-3 border px-4 transition-[background-color,color,border-color] duration-200",
        active
          ? "border-champagne bg-champagne text-ink"
          : "border-hair text-ivory hover:border-champagne/50",
      )}
    >
      <span className="text-[11px] font-medium tracking-[0.1em] tabular-nums">
        {time}
      </span>
      <span
        className={cn(
          "text-[10px] tracking-[0.06em] tabular-nums",
          active ? "text-ink/80" : "text-mist",
        )}
      >
        {price}
      </span>
    </button>
  );
}
