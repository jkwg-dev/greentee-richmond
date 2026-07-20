import type { BookingSelection, BookingSlot } from "@/types/booking";

/**
 * The range selection model (booking.md §2 decision 2, §5.4 as amended).
 * Pure helpers over domain types; no state, no fetch, no time strings ever
 * recomputed. Adjacency is exact string equality (`next.startsAt ===
 * previous.endsAt`); the mapper's per-room chronological sort guarantee makes
 * the equality walk sufficient. Client safe by design: the /book island is
 * the caller.
 */

/** Slots are identified by room plus verbatim start; strings never parse here. */
const sameSlot = (a: BookingSlot, b: BookingSlot): boolean =>
  a.roomId === b.roomId && a.startsAt === b.startsAt;

const rangeOf = (slots: BookingSlot[]): BookingSelection => ({
  kind: "range",
  slots,
});

/**
 * The five §5.4 interaction rules, in order, first match wins:
 * 1. no selection: the tap selects that slot;
 * 2. a different room: the selection becomes that slot;
 * 3. an edge of the range: that edge leaves (a range of one deselects);
 * 4. an interior slot: the selection resets to that slot;
 * 5. beyond an edge in the same room: extend if the run is unbroken,
 *    reset to the tapped slot if it is broken (a range may never span an
 *    unavailable slot).
 *
 * `slots` is the current availability's slot list (any rooms); the tapped
 * room's slots are read from it, in the mapper-guaranteed chronological
 * order. Returns the next selection, or null for an empty one.
 */
export function applyTap(
  slots: readonly BookingSlot[],
  current: BookingSelection | null,
  tapped: BookingSlot,
): BookingSelection | null {
  // Rule 1: nothing selected yet.
  if (!current || current.slots.length === 0) return rangeOf([tapped]);

  const first = current.slots[0];
  const last = current.slots[current.slots.length - 1];

  // Rule 2: a different room always starts over.
  if (tapped.roomId !== first.roomId) return rangeOf([tapped]);

  // Rule 3: an edge tap shrinks; a range of one deselects (the B1 toggle).
  if (sameSlot(tapped, first)) {
    return current.slots.length === 1 ? null : rangeOf(current.slots.slice(1));
  }
  if (sameSlot(tapped, last)) {
    return rangeOf(current.slots.slice(0, -1));
  }

  // Rule 4: an interior tap resets to that slot.
  if (current.slots.some((slot) => sameSlot(slot, tapped))) {
    return rangeOf([tapped]);
  }

  // Rule 5: beyond an edge. Walk the room's chronological slots between the
  // nearer edge and the tap; one broken adjacency (string inequality) means
  // an unavailable span, and the selection resets to the tapped slot.
  const roomSlots = slots.filter((slot) => slot.roomId === tapped.roomId);
  const indexOf = (target: BookingSlot) =>
    roomSlots.findIndex((slot) => sameSlot(slot, target));
  const tappedIndex = indexOf(tapped);
  const firstIndex = indexOf(first);
  const lastIndex = indexOf(last);
  if (tappedIndex === -1 || firstIndex === -1 || lastIndex === -1) {
    // The selection no longer matches the availability; start over.
    return rangeOf([tapped]);
  }

  const [walkFrom, walkTo] =
    tappedIndex > lastIndex ? [lastIndex, tappedIndex] : [tappedIndex, firstIndex];
  for (let index = walkFrom; index < walkTo; index++) {
    if (roomSlots[index + 1].startsAt !== roomSlots[index].endsAt) {
      return rangeOf([tapped]);
    }
  }

  return rangeOf(
    roomSlots.slice(
      Math.min(firstIndex, tappedIndex),
      Math.max(lastIndex, tappedIndex) + 1,
    ),
  );
}

/** Whether a timeline cell renders the active treatment (§5.4: all selected cells do). */
export function isSlotSelected(
  selection: BookingSelection | null,
  slot: BookingSlot,
): boolean {
  return selection?.slots.some((entry) => sameSlot(entry, slot)) ?? false;
}

/**
 * The range read for rendering and, in B3c, the create payload (booking.md
 * §5.5, §2 decision 2): the span's verbatim endpoints, the slot count
 * (duration is always count based, never date math), and the summed price
 * (display only; the server computes the authoritative total at creation).
 */
export function selectionSummary(selection: BookingSelection): {
  roomId: string;
  startsAt: string;
  endsAt: string;
  slotCount: number;
  priceCents: number;
} {
  const first = selection.slots[0];
  const last = selection.slots[selection.slots.length - 1];
  return {
    roomId: first.roomId,
    startsAt: first.startsAt,
    endsAt: last.endsAt,
    slotCount: selection.slots.length,
    priceCents: selection.slots.reduce(
      (total, slot) => total + slot.priceCents,
      0,
    ),
  };
}
