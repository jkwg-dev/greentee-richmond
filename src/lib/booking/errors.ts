import "server-only";

/**
 * Typed booking failures (booking.md §10.2). The route handlers translate
 * these into the §4 error envelope; raw vendor messages stay in server logs.
 */

/** No session, or the vendor rejected the token: handlers answer 401. */
export class BookingAuthError extends Error {
  constructor() {
    super("Booking: a signed-in session is required in live mode.");
    this.name = "BookingAuthError";
  }
}

/** A mapped upstream failure carrying the status our handlers answer with. */
export class BookingApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "BookingApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * A vendor `409 CONFLICT` (booking.md §4 deltas, §12.6): a slot taken while we
 * were deciding, a checkout already processing, or the same idempotency key
 * still in flight. The UI refetches availability or re-reads checkout status;
 * it never blindly retries, and never opens a second checkout.
 */
export class BookingConflictError extends BookingApiError {
  constructor(message: string) {
    super(409, "conflict", message);
    this.name = "BookingConflictError";
  }
}

/**
 * A vendor `422 VALIDATION_FAILED` (booking.md §4 deltas): a business rule, an
 * idempotency violation, or a key reused with a different body. Distinct from
 * the `400` bad-input mapping so the UI can answer a rule with the §12.8 copy
 * instead of the generic error state.
 */
export class BookingRuleError extends BookingApiError {
  constructor(message: string) {
    super(422, "rule_violation", message);
    this.name = "BookingRuleError";
  }
}
