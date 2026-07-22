/**
 * Booking domain types (booking.md §5.7). These are the only booking shapes
 * components may import; vendor DTOs and their mapping stay inside
 * `src/lib/booking/` and never leak past it (booking.md §2).
 */

/** Why a date returned no slots (the vendor `reasons` enum, booking.md §4). */
export type AvailabilityReason =
  "closed_today" | "no_rooms" | "no_pricing_configured" | "pricing_gaps";

/**
 * The room's type for the §11.2 cards and the §11.3 filter. Derived by name
 * heuristic in the mapper until real room ids and the Sanity room mapping
 * supply curated categories (booking.md §11.3, interim by ruling).
 */
export type BookingRoomCategory = "bay" | "vip" | "vvip" | "other";

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
  category: BookingRoomCategory;
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

/**
 * The visitor's pick on /book (booking.md §5.7 as amended): a contiguous
 * same-room range of one or more slots, in chronological order. Invariants
 * (non-empty, contiguous by string-equality adjacency, single room) are
 * maintained by `src/lib/booking/selection.ts`, the only writer; a range may
 * never span an unavailable slot (§2 decision 2). It maps 1:1 onto the future
 * create payload: the first slot's `startsAt` plus the last slot's `endsAt`.
 */
export type BookingSelection = {
  kind: "range";
  slots: BookingSlot[];
};

/** One day of the club's operating window (booking.md §4 deltas). */
export type BookingOperatingHours = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

/**
 * Server-owned booking policy (booking.md §4 deltas, §12.5). Windows, cutoffs,
 * caps, and the two clocks are operational settings the vendor enforces; the
 * UI renders from them and never hardcodes one. Live mode reads the policy
 * endpoint, fixture mode keeps the §4 constants. A null cap means the vendor
 * states no limit.
 */
export type BookingPolicy = {
  advanceBookingDays: number;
  sameDayCutoffMinutes: number;
  maxPerDayPerUser: number | null;
  maxPerWeekPerUser: number | null;
  pendingHoldMinutes: number;
  checkoutSessionMinutes: number;
  operatingHours: BookingOperatingHours[];
};

/** The vendor's reservation lifecycle (booking.md §4). */
export type BookingReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no_show"
  | "completed";

/**
 * One reservation over a contiguous range (booking.md §4 deltas): `startsAt`
 * and `endsAt` span the whole booking and echo the slot strings verbatim. The
 * server owns the money; the itemized cents here are its answer, never our
 * arithmetic. `expiresAt` is the pending hold's own clock, rendered as given.
 */
export type BookingReservation = {
  id: string;
  roomId: string;
  roomName: string | null;
  startsAt: string;
  endsAt: string;
  partySize: number;
  status: BookingReservationStatus;
  subtotalCents: number;
  gstCents: number;
  pstCents: number;
  totalCents: number;
  currency: string;
  expiresAt: string | null;
  code: string | null;
};

/**
 * Payment state (booking.md §4 deltas, §12.6). `succeeded` is the only value
 * that may render as success, and only after the server verified the receipt;
 * the browser callback proves nothing.
 */
export type CheckoutStatus =
  | "succeeded"
  | "declined"
  | "processing"
  | "review_required"
  | "failed";

/**
 * A Hosted Checkout handoff (booking.md §12.2). `ticket` is a public,
 * short-lived handoff value, not proof of payment; `checkoutUrl` is where the
 * browser is sent to pay, supplied by the middleware and never constructed
 * here. Neither is ever logged.
 */
export type CheckoutSession = {
  paymentId: string;
  ticket: string;
  expiresAt: string;
  checkoutUrl: string;
};

/** The payment status read (booking.md §4 deltas, §8.3 of the vendor update). */
export type CheckoutState = {
  paymentId: string | null;
  status: CheckoutStatus;
  amountCents: number | null;
  currency: string | null;
  expiresAt: string | null;
};

/**
 * What `POST /api/booking/reservations` answers (booking.md §12.2): the
 * pending reservation plus the key it was created under, echoed so a timed-out
 * retry resends the identical key with the identical body instead of issuing a
 * new one.
 */
export type ReservationCreated = {
  reservation: BookingReservation;
  idempotencyKey: string;
};

/** What `POST /api/booking/reservations/{id}/checkout` answers (booking.md §12.2). */
export type CheckoutSessionCreated = {
  session: CheckoutSession;
  idempotencyKey: string;
};

/** What `POST /api/booking/reservations/{id}/complete` answers (booking.md §12.2). */
export type CheckoutCompleted = {
  status: CheckoutStatus;
  idempotencyKey: string;
};
