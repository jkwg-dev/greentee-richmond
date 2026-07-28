/**
 * The checkout ticket's ride to the callback route (booking.md §6, §12.3).
 *
 * There is no redirect: the payment page stores the ticket here in its
 * `payment_complete` handler, then navigates to `/book/checkout/callback`, where
 * `complete` needs it back for server-side verification. `sessionStorage` is the
 * primary carrier; the query parameter is the fallback, appended only when the
 * write below throws. `sessionStorage` is same-origin and dies with the tab; the
 * value is a public handoff, not a credential, and it is never logged.
 */

const key = (reservationId: string) => `greentee.checkout.${reservationId}`;

/**
 * Stores the ticket for the callback to recall. Returns whether the write
 * succeeded, so the caller can fall back to the query parameter (private mode,
 * a full quota) exactly when it did not.
 */
export function rememberTicket(reservationId: string, ticket: string): boolean {
  try {
    sessionStorage.setItem(key(reservationId), ticket);
    return true;
  } catch {
    return false;
  }
}

export function recallTicket(reservationId: string): string | null {
  try {
    return sessionStorage.getItem(key(reservationId));
  } catch {
    return null;
  }
}

export function forgetTicket(reservationId: string): void {
  try {
    sessionStorage.removeItem(key(reservationId));
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
