import type { BookingSlot } from "@/types/booking";

/**
 * The pure timeline builder (booking.md §11.4): one space's sorted day as a
 * sequence of available cells and collapsed gap runs. Epoch parsing of the
 * verbatim slot strings lives here and nowhere else, confined to layout math
 * by the §11.4 ruling; outputs are runs, counts, and boundary slot
 * references, never time strings. Every displayed time stays Intl on the
 * verbatim strings (`formatSlotRange(before.endsAt, after.startsAt)` for a
 * gap's span label).
 */

/** An available slot, rendered as a tappable timeline row. */
export type TimelineSlotCell = {
  kind: "slot";
  slot: BookingSlot;
};

/**
 * A run of unavailable time between two returned slots, rendered as one
 * collapsed divider regardless of length. `before` and `after` are the
 * neighboring slots; the span label's endpoints are `before.endsAt` and
 * `after.startsAt`, verbatim.
 */
export type TimelineGapRun = {
  kind: "gap";
  before: BookingSlot;
  after: BookingSlot;
  /** Missing 30 minute blocks in the run, from the confined epoch math. */
  blockCount: number;
};

export type TimelineItem = TimelineSlotCell | TimelineGapRun;

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

/**
 * `slots` is one room's availability in the mapper-guaranteed chronological
 * order. A gap exists exactly where string-equality adjacency breaks, so the
 * timeline's dividers land precisely where the §5.4 rule 5 walk resets.
 */
export function buildTimeline(slots: readonly BookingSlot[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (let index = 0; index < slots.length; index++) {
    const slot = slots[index];
    const previous = index > 0 ? slots[index - 1] : null;
    if (previous && previous.endsAt !== slot.startsAt) {
      const gapMs = Date.parse(slot.startsAt) - Date.parse(previous.endsAt);
      items.push({
        kind: "gap",
        before: previous,
        after: slot,
        blockCount: Math.max(0, Math.round(gapMs / THIRTY_MINUTES_MS)),
      });
    }
    items.push({ kind: "slot", slot });
  }
  return items;
}
