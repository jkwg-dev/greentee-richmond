/**
 * Venue calendar helpers (booking.md §5.3, §5.7). The date strip and the
 * fixtures' scripted demo states both reason about the club's calendar in
 * venue time, so a visitor in another timezone sees the club's day, not their
 * own. Calendar date arithmetic only; slot time strings are never computed
 * here or anywhere (CLAUDE.md booking track rules).
 */

/** The club's timezone. All booking display and calendar logic uses it, never the browser's. */
export const VENUE_TIME_ZONE = "America/Vancouver";

/** en-CA prints YYYY-MM-DD, the wire date format (booking.md §4). */
const venueDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: VENUE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's `YYYY-MM-DD` on the club's calendar. */
export function venueTodayIso(): string {
  return venueDay.format(new Date());
}

const venueClock = new Intl.DateTimeFormat("en-US", {
  timeZone: VENUE_TIME_ZONE,
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Venue-time now as minutes since venue midnight, read through Intl like all
 * venue clock logic (never the browser or server timezone). The fixtures'
 * 60 minute cutoff (booking.md §5.7) compares block starts against this;
 * no slot string is ever parsed for it.
 */
export function venueNowMinutes(): number {
  const parts = venueClock.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return get("hour") * 60 + get("minute");
}

/**
 * A Date safely inside the given calendar day for date-only Intl formatting:
 * noon UTC is 4 or 5 AM in Vancouver, always the same calendar date, in both
 * DST states.
 */
export function calendarDateAnchor(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/** `YYYY-MM-DD` plus n days. The noon UTC anchor keeps the calendar math DST proof. */
export function addDaysIso(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12))
    .toISOString()
    .slice(0, 10);
}
