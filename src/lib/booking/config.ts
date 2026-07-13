/**
 * Booking feature flags (booking.md §5.1). Client safe; B1 has no booking
 * environment variables and no secrets (booking.md §8).
 */

/**
 * Gates the summary CTA (booking.md §5.5): `false` renders the disabled
 * Reserve This Time button with the call note; B3 flips it to the reserve
 * flow.
 */
export const bookingCreateEnabled: boolean = false;

/** Strip length in days, a placeholder pending the vendor's booking window answer (booking.md §6.5). */
export const dateStripDays = 14;

/** The preselected party size on /book (booking.md §5.3). */
export const defaultPartySize = 2;
