/**
 * Booking feature flags (booking.md §5.1). Client safe; B1 has no booking
 * environment variables and no secrets (booking.md §8).
 */

/**
 * Gates the summary CTA (booking.md §5.5): `false` renders the B1 call-to-hold
 * path; B3 flips it to the reserve flow.
 */
export const bookingCreateEnabled: boolean = false;
