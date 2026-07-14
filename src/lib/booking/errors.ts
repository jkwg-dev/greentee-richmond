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
