"use client";

import { formatCad, formatSlotTime } from "@/lib/booking/format";
import { cn } from "@/lib/utils";
import type { BookingSlot } from "@/types/booking";

/**
 * A booking scoped composite on the Chip recipe (booking.md §5.4): hairline
 * border, 44px minimum target, champagne active fill with ink text. Start time
 * with the price right aligned; the price wraps beneath the time below 560px.
 * Only open slots render, so there is no disabled state.
 */
export function SlotChip({
  slot,
  roomName,
  active,
  onToggle,
}: {
  slot: BookingSlot;
  roomName: string;
  active: boolean;
  onToggle: () => void;
}) {
  const time = formatSlotTime(slot.startsAt);
  const price = formatCad(slot.priceCents);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${time}, ${price}, ${roomName}`}
      onClick={onToggle}
      className={cn(
        "flex min-h-[44px] cursor-pointer items-center justify-between gap-2 border px-4 py-[10px] text-[11px] leading-none font-medium tracking-[0.08em] transition-[background-color,color,border-color] duration-300",
        "max-[560px]:flex-col max-[560px]:items-start max-[560px]:justify-center max-[560px]:gap-1.5",
        active
          ? "border-champagne bg-champagne text-ink"
          : "border-champagne/[0.26] text-ivory hover:border-champagne/50",
      )}
    >
      <span>{time}</span>
      <span className={cn("tabular-nums", active ? "text-ink" : "text-mist")}>
        {price}
      </span>
    </button>
  );
}
