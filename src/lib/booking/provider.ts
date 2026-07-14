import "server-only";

import type { Availability, BookingRoom } from "@/types/booking";
import { isBookingLive } from "./config";
import { fixtureProvider } from "./fixtures";
import { middlewareProvider } from "./middleware";

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

/**
 * Live mode selects the middleware provider, fixture mode keeps B1's
 * (booking.md §10.1). The environment is fixed per process, so the binding
 * is module scoped; nothing above the seam changes when it swaps.
 */
export const activeProvider: BookingProvider = isBookingLive()
  ? middlewareProvider
  : fixtureProvider;
