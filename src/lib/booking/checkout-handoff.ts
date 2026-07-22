/**
 * The Hosted Checkout ticket's ride across the redirect (booking.md §12.3).
 *
 * The ticket is the public handoff value the vendor issues; `complete` needs it
 * back after the browser returns. The return URL is expected to carry it, but
 * that shape is the payment provider's, not ours, so the tab keeps its own copy
 * as the fallback. `sessionStorage` is same-origin and dies with the tab; the
 * value is not a credential, and it is never logged.
 */

const key = (reservationId: string) => `greentee.checkout.${reservationId}`;

export function rememberTicket(reservationId: string, ticket: string): void {
  try {
    sessionStorage.setItem(key(reservationId), ticket);
  } catch {
    // Private mode or a full quota: the return URL is still the primary path.
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
