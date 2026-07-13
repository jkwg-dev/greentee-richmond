/**
 * Booking domain types (booking.md §5.7). These are the only booking shapes
 * components may import; vendor DTOs and their mapping stay inside
 * `src/lib/booking/` and never leak past it (booking.md §2).
 */

/** Why a date returned no slots (the vendor `reasons` enum, booking.md §4). */
export type AvailabilityReason =
  "closed_today" | "no_rooms" | "no_pricing_configured" | "pricing_gaps";

/**
 * A bookable simulator room. Vendor data supplies inventory, capacity, and
 * order; presentation (imagery, descriptions) is ours and arrives elsewhere
 * (booking.md §1), so the domain type carries none of it.
 */
export type BookingRoom = {
  id: string;
  name: string;
  maxCapacity: number;
  order: number;
};

/**
 * One open 30 minute block. `startsAt` and `endsAt` are ISO 8601 strings with
 * the venue offset, rendered and echoed verbatim, never recomputed.
 * `priceCents` is integer CAD cents, treated as pre tax (booking.md §6.3).
 */
export type BookingSlot = {
  roomId: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  currency: string;
};

/**
 * The availability response for one venue calendar date. Empty `slots` with
 * empty `reasons` means fully booked (booking.md §4).
 */
export type Availability = {
  date: string;
  slots: BookingSlot[];
  reasons: AvailabilityReason[];
};

/** The visitor's pick on /book: a single slot, no duration control in B1 (booking.md §6.2). */
export type BookingSelection = {
  room: BookingRoom;
  slot: BookingSlot;
  partySize: number;
};
