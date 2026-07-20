"use client";

import type { BookingRoom, BookingSelection, BookingSlot } from "@/types/booking";
import { BookingSummary } from "./BookingSummary";
import { CATEGORY_MICROLABEL } from "./categories";
import { SpaceTimeline } from "./SpaceTimeline";

/** Viewport-keyed so the sticky pane never outgrows the screen (booking.md §11.4). */
const DESKTOP_TIMELINE_MAX_H = "max-h-[clamp(300px,calc(100svh-320px),640px)]";

const HELPER_LINE = "Tap a start time, then an end time. Times in between must be open.";

/**
 * The §11.1 desktop detail pane for the selected space: a header (name,
 * capacity, category microlabel), then the timeline with its helper line and
 * the selection summary. At 1280 and up the timeline and summary sit side by
 * side beneath the header; below 1280 they stack. A space with no slots shows
 * the same "No times for this day." line in place of the timeline.
 */
export function DetailPane({
  room,
  slots,
  selection,
  onTapSlot,
  date,
  phone,
  partySize,
}: {
  room: BookingRoom;
  slots: BookingSlot[];
  selection: BookingSelection | null;
  onTapSlot: (slot: BookingSlot) => void;
  date: string;
  phone: string;
  partySize: number;
}) {
  return (
    <div>
      <div>
        <p className="text-mist text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase">
          {CATEGORY_MICROLABEL[room.category]}
        </p>
        <h2 className="text-ivory mt-3 font-serif text-[24px] leading-tight">
          {room.name}
        </h2>
        <p className="text-mist mt-1.5 text-[13px]">
          Up to {room.maxCapacity} {room.maxCapacity === 1 ? "guest" : "guests"}
        </p>
      </div>

      <div className="mt-8 grid gap-x-10 gap-y-9 min-[1280px]:grid-cols-[420px_minmax(0,1fr)]">
        <div>
          <p className="text-mist mb-4 text-[12px] leading-[1.7]">
            {HELPER_LINE}
          </p>
          {slots.length > 0 ? (
            <SpaceTimeline
              slots={slots}
              selection={selection}
              onTapSlot={onTapSlot}
              maxHeightClass={DESKTOP_TIMELINE_MAX_H}
            />
          ) : (
            <p className="text-mist border-hair border-t pt-[18px] text-[13.5px]">
              No times for this day.
            </p>
          )}
        </div>
        <BookingSummary
          variant="panel"
          selection={selection}
          room={room}
          partySize={partySize}
          date={date}
          phone={phone}
        />
      </div>
    </div>
  );
}
