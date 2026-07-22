import "server-only";

/**
 * Client idempotency keys (booking.md §4 deltas, §12.2). Every booking
 * mutation carries one, generated here on the server, one per operation. A
 * timed-out mutation is retried only by resending the identical key with the
 * identical body, which is why the handlers echo the key they used back to the
 * caller. Keys are never logged.
 *
 * The middleware derives its internal key from `userId | method | path |
 * clientKey`, so two users landing on the same client key never collide.
 */

/** The four mutations the vendor requires a key on (vendor update §4). */
export type IdempotentOperation =
  | "reservation"
  | "checkout-session"
  | "checkout-complete"
  | "cancellation";

/** The vendor's bounds (vendor update §4). */
const MIN_LENGTH = 8;
const MAX_LENGTH = 255;

/** `reservation-<uuid>`: 48 characters, inside the vendor's 8 to 255 bounds. */
export function newIdempotencyKey(operation: IdempotentOperation): string {
  return `${operation}-${crypto.randomUUID()}`;
}

/**
 * Accepts a caller-supplied key only when it is one of ours for this
 * operation: the retry path resends a key we issued, so anything else is a new
 * key and gets one generated instead.
 */
export function resolveIdempotencyKey(
  operation: IdempotentOperation,
  supplied: unknown,
): string {
  if (
    typeof supplied === "string" &&
    supplied.length >= MIN_LENGTH &&
    supplied.length <= MAX_LENGTH &&
    supplied.startsWith(`${operation}-`)
  ) {
    return supplied;
  }
  return newIdempotencyKey(operation);
}
