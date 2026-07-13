import "server-only";

import type { Availability, BookingRoom } from "@/types/booking";
import { fixtureProvider } from "./fixtures";

/** The availability query (booking.md §4): a venue calendar date, the party, optionally one room. */
export type AvailabilityQuery = {
  date: string;
  partySize: number;
  roomId?: string;
};

/**
 * The swap seam (booking.md §5.7): B1 binds the deterministic fixtures, B3
 * binds the vendor middleware behind this same interface, and nothing above
 * this module changes. Server only; the browser reaches booking data solely
 * through the /api/booking/* route handlers.
 */
export type BookingProvider = {
  getRooms(): Promise<BookingRoom[]>;
  getAvailability(query: AvailabilityQuery): Promise<Availability>;
};

/** Bound to the fixture provider in B1; the middleware provider replaces it in B3. */
export const activeProvider: BookingProvider = fixtureProvider;
