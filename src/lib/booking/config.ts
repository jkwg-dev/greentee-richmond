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

/**
 * The reserve flow gate (booking.md §5.5, §8, §12). The committed constant
 * stays `false` through B3c and B3d; `BOOKING_CREATE_ENABLED` is the inline QA
 * override (`BOOKING_CREATE_ENABLED=1 pnpm dev`), never written to a file or
 * set on Vercel, so the committed default can never ship enabled by accident.
 *
 * Live mode is also required, because reservations exist only behind the
 * middleware: the fixture provider is a read-only browse stand-in with no
 * reservation store, so an enabled Reserve button in fixture mode could only
 * lead to an error. QA therefore runs the stub and points at it:
 * `BOOKING_CREATE_ENABLED=1 BOOKING_API_BASE_URL=http://127.0.0.1:4141 pnpm dev`.
 * Server-side truth only; the flag reaches the browser as a prop.
 */
export function isBookingCreateEnabled(): boolean {
  const override = process.env.BOOKING_CREATE_ENABLED;
  const enabled =
    bookingCreateEnabled || override === "1" || override === "true";
  return enabled && isBookingLive();
}

/**
 * Live mode is the presence of BOOKING_API_BASE_URL (booking.md §8, §10.1):
 * one variable arms the middleware provider, the route handler auth
 * requirement, and the /book gate together. Server-side truth only; the
 * variable is not NEXT_PUBLIC, so a client bundle would read it as absent.
 */
export function isBookingLive(): boolean {
  return Boolean(process.env.BOOKING_API_BASE_URL);
}

/**
 * The validated vendor base URL (booking.md §8): http or https, trailing
 * slashes normalized away, a clear error when malformed. Callers append
 * absolute paths, so normalization keeps URLs single-slashed either way.
 */
export function bookingApiBaseUrl(): string {
  const raw = process.env.BOOKING_API_BASE_URL;
  if (!raw) {
    throw new Error(
      "Booking: BOOKING_API_BASE_URL is not set; the middleware provider only runs in live mode (booking.md §8).",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `Booking: BOOKING_API_BASE_URL is not a valid URL (booking.md §8): "${raw}"`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Booking: BOOKING_API_BASE_URL must be http or https (booking.md §8): "${raw}"`,
    );
  }
  return raw.replace(/\/+$/, "");
}

/** Strip length in days, a placeholder pending the vendor's booking window answer (booking.md §6.5). */
export const dateStripDays = 14;

/** The preselected party size on /book (booking.md §5.3). */
export const defaultPartySize = 2;
