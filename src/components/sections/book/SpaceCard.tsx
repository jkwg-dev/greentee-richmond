"use client";

import { cn } from "@/lib/utils";
import type { BookingRoom } from "@/types/booking";
import { CATEGORY_MICROLABEL } from "./categories";

/**
 * One §11.2 space card: name, capacity line, category microlabel, and either
 * the "From {price} per 30 minutes" line or, when the space has no slots for
 * the current query, the dimmed "No times for this day." A no-times card
 * stays selectable (its detail pane shows the same line). Rest carries the
 * hair border; the selected card carries a champagne border.
 *
 * Selection mode (desktop) is a toggle button (`aria-pressed`); disclosure
 * mode (the mobile accordion) sets `aria-expanded`/`aria-controls` instead.
 */
export function SpaceCard({
  room,
  priceLabel,
  selected,
  onSelect,
  disclosure,
}: {
  room: BookingRoom;
  /** The formatted "From {price} per 30 minutes"; null renders the no-times line. */
  priceLabel: string | null;
  selected: boolean;
  onSelect: () => void;
  disclosure?: { expanded: boolean; controlsId: string };
}) {
  const noTimes = priceLabel === null;
  const capacity = `Up to ${room.maxCapacity} ${
    room.maxCapacity === 1 ? "guest" : "guests"
  }`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={disclosure ? undefined : selected}
      aria-expanded={disclosure ? disclosure.expanded : undefined}
      aria-controls={disclosure?.controlsId}
      className={cn(
        "flex w-full flex-col items-start gap-1.5 border p-5 text-left transition-[border-color,background-color] duration-300",
        selected
          ? "border-champagne bg-champagne/[0.04]"
          : "border-hair hover:border-champagne/40",
        noTimes && "opacity-55",
      )}
    >
      <span className="text-mist text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase">
        {CATEGORY_MICROLABEL[room.category]}
      </span>
      <span className="text-ivory font-serif text-[18px] leading-tight">
        {room.name}
      </span>
      <span className="text-mist text-[12px]">{capacity}</span>
      <span className="text-mist mt-1 text-[12px]">
        {noTimes ? "No times for this day." : priceLabel}
      </span>
    </button>
  );
}
