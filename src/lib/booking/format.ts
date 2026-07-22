import { calendarDateAnchor, VENUE_TIME_ZONE } from "./dates";

/**
 * Booking display formatting (booking.md §5.7). Everything is Intl in venue
 * time; slot ISO strings are read, never recomputed, and integer cents become
 * dollars only here, at render (CLAUDE.md booking track rules). Ranges join
 * with "to" per the global dash rule.
 */

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

/** Integer cents to "$32.00". The division to dollars exists only at this render boundary. */
export function formatCad(cents: number): string {
  return cad.format(cents / 100);
}

const slotTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: VENUE_TIME_ZONE,
});

/** Hour:minute and AM/PM pulled apart so a range can share one period label. */
function slotTimeParts(iso: string): { time: string; period: string } {
  const parts = slotTime.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return { time: `${get("hour")}:${get("minute")}`, period: get("dayPeriod") };
}

/** "2:30 PM" from a slot ISO string, in venue time. */
export function formatSlotTime(iso: string): string {
  const { time, period } = slotTimeParts(iso);
  return `${time} ${period}`;
}

/** "6:00 to 6:30 PM"; the period repeats only when the range crosses noon or midnight. */
export function formatSlotRange(startIso: string, endIso: string): string {
  const start = slotTimeParts(startIso);
  const end = slotTimeParts(endIso);
  return start.period === end.period
    ? `${start.time} to ${end.time} ${end.period}`
    : `${start.time} ${start.period} to ${end.time} ${end.period}`;
}

/**
 * Slot count times 30 minutes as "30 minutes", "1 hour", "1 hour 30 minutes"
 * (booking.md §5.5 as amended). Duration is always derived from the count,
 * never from date math on the slot strings.
 */
export function formatDuration(slotCount: number): string {
  const hours = Math.floor(slotCount / 2);
  const halfHour = slotCount % 2 === 1;
  if (hours === 0) return "30 minutes";
  const hourPart = hours === 1 ? "1 hour" : `${hours} hours`;
  return halfHour ? `${hourPart} 30 minutes` : hourPart;
}

const chipDay = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  timeZone: VENUE_TIME_ZONE,
});

/** "Sat 18" for a `YYYY-MM-DD` venue date (the date strip labels, booking.md §5.3). */
export function formatDateChip(date: string): string {
  const parts = chipDay.formatToParts(calendarDateAnchor(date));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")}`;
}

const longDay = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: VENUE_TIME_ZONE,
});

/**
 * "Friday, July 18, 2026" for a `YYYY-MM-DD` venue date: the date chips' full
 * `aria-label` (booking.md §5.3) and the summary Date row (§5.5).
 */
export function formatDateLong(date: string): string {
  return longDay.format(calendarDateAnchor(date));
}

/**
 * The same long date read straight off a slot or reservation ISO string, in
 * venue time (booking.md §12.4). Intl on the verbatim string: the calendar day
 * is never sliced out of it, and no arithmetic touches it.
 */
export function formatSlotDateLong(iso: string): string {
  return longDay.format(new Date(iso));
}
