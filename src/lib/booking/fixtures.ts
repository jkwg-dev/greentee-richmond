import "server-only";

import type { Availability, BookingRoom, BookingSlot } from "@/types/booking";
import { addDaysIso, venueNowMinutes, venueTodayIso } from "./dates";
import { categorizeRoom } from "./map";
import type { AvailabilityQuery, BookingProvider } from "./provider";

/**
 * The deterministic fixture provider (booking.md §5.7): the B1 stand-in for
 * the vendor middleware. No network, no randomness; the same query always
 * returns the same slots. Every price and time here is a placeholder by
 * design.
 */

type FixtureRoom = {
  room: BookingRoom;
  offPeakCents: number;
  peakCents: number;
};

/** Placeholder pricing, integer cents, pre tax (booking.md §5.7). */
const STANDARD = { offPeakCents: 3200, peakCents: 4800 };
const VIP = { offPeakCents: 6400, peakCents: 9000 };

/** Categories run through the one §11.3 heuristic so fixtures and live data agree. */
const room = (
  id: string,
  name: string,
  maxCapacity: number,
  order: number,
): BookingRoom => ({
  id,
  name,
  maxCapacity,
  order,
  category: categorizeRoom(name),
});

const FIXTURE_ROOMS: FixtureRoom[] = [
  { room: room("bay-01", "Bay 01 · Practice", 4, 1), ...STANDARD },
  { room: room("bay-02", "Bay 02 · Play", 4, 2), ...STANDARD },
  { room: room("bay-05", "Bay 05 · Play", 4, 3), ...STANDARD },
  { room: room("vip-12", "VIP Room 12", 8, 4), ...VIP },
];

/** 30 minute block boundaries, 10:00 to 22:00 venue time; adjacent pairs form slots. */
const BLOCK_BOUNDARIES: string[] = (() => {
  const times: string[] = [];
  for (let hour = 10; hour < 22; hour++) {
    const hh = String(hour).padStart(2, "0");
    times.push(`${hh}:00`, `${hh}:30`);
  }
  times.push("22:00");
  return times;
})();

/** Peak pricing covers blocks starting 17:00 to 21:00 (booking.md §5.7). */
const PEAK_FROM = "17:00";
const PEAK_UNTIL = "21:00";

/**
 * The venue's summer offset, pinned by spec: booking.md §5.7 fixes fixture
 * output to `-07:00`. The middleware emits the live offset in B3; renderers
 * read the string either way.
 */
const FIXTURE_UTC_OFFSET = "-07:00";

const toIso = (date: string, time: string) =>
  `${date}T${time}:00${FIXTURE_UTC_OFFSET}`;

/** djb2 over the slot key: stable thinning with no `Math.random` (booking.md §5.7). */
function hashKey(key: string): number {
  let value = 5381;
  for (let index = 0; index < key.length; index++) {
    value = (Math.imul(value, 33) ^ key.charCodeAt(index)) >>> 0;
  }
  return value;
}

/** Roughly a quarter of blocks read as taken, varying by date and room. */
const isTaken = (date: string, roomId: string, start: string) =>
  hashKey(`${date}|${roomId}|${start}`) % 4 === 0;

/** The vendor's creation cutoff, minutes before a slot's start (booking.md §4). */
export const CUTOFF_MINUTES = 60;

/**
 * The §5.7 cutoff rule, replacing past-slots-only for today: a slot starting
 * within 60 minutes of venue-time now is dropped; one starting at or beyond
 * the cutoff stays (the vendor enforces "60 minutes before the slot start",
 * so the boundary slot is still creatable). Pure and count based; both
 * arguments are minutes since venue midnight.
 */
export const meetsCutoff = (
  blockStartMinutes: number,
  nowMinutes: number,
): boolean => blockStartMinutes >= nowMinutes + CUTOFF_MINUTES;

/** "HH:MM" block boundaries (fixture-internal generation values, not slot strings). */
const blockMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

function slotsFor(
  date: string,
  fixture: FixtureRoom,
  nowMinutes: number | null,
): BookingSlot[] {
  const slots: BookingSlot[] = [];
  for (let index = 0; index < BLOCK_BOUNDARIES.length - 1; index++) {
    const start = BLOCK_BOUNDARIES[index];
    if (isTaken(date, fixture.room.id, start)) continue;
    if (nowMinutes !== null && !meetsCutoff(blockMinutes(start), nowMinutes))
      continue;
    const peak = start >= PEAK_FROM && start < PEAK_UNTIL;
    slots.push({
      roomId: fixture.room.id,
      startsAt: toIso(date, start),
      endsAt: toIso(date, BLOCK_BOUNDARIES[index + 1]),
      priceCents: peak ? fixture.peakCents : fixture.offPeakCents,
      currency: "CAD",
    });
  }
  return slots;
}

export const fixtureProvider: BookingProvider = {
  async getRooms(): Promise<BookingRoom[]> {
    return FIXTURE_ROOMS.map((fixture) => fixture.room);
  },

  // Empty-state precedence: closed_today, then no_rooms, then sold out.
  // Closed is true regardless of the party; a party nothing fits gets the
  // truthful no_rooms even on the scripted sold-out date.
  async getAvailability({
    date,
    partySize,
    roomId,
  }: AvailabilityQuery): Promise<Availability> {
    const today = venueTodayIso();

    // Scripted demo state (booking.md §5.7): the club is closed three days out.
    if (date === addDaysIso(today, 3)) {
      return { date, slots: [], reasons: ["closed_today"] };
    }

    // Capacity and room filtering; an unknown roomId also lands in no_rooms.
    const open = FIXTURE_ROOMS.filter(
      (fixture) =>
        (roomId === undefined || fixture.room.id === roomId) &&
        fixture.room.maxCapacity >= partySize,
    );
    if (open.length === 0) {
      return { date, slots: [], reasons: ["no_rooms"] };
    }

    // Scripted demo state: fully booked five days out (empty slots, empty reasons).
    if (date === addDaysIso(today, 5)) {
      return { date, slots: [], reasons: [] };
    }

    // The 60 minute cutoff applies to today only (booking.md §5.7); future
    // dates keep every open block.
    const nowMinutes = date === today ? venueNowMinutes() : null;

    return {
      date,
      slots: open.flatMap((fixture) => slotsFor(date, fixture, nowMinutes)),
      reasons: [],
    };
  },
};
