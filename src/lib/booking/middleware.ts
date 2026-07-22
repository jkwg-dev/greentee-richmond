import "server-only";

import type { Availability, BookingRoom } from "@/types/booking";
import {
  mapAvailability,
  mapRooms,
  type VendorAvailabilityDto,
  type VendorRoomDto,
} from "./map";
import type { AvailabilityQuery, BookingProvider } from "./provider";
import { vendorRequest } from "./request";

/**
 * The live provider (booking.md §10.2): the two read endpoints on the Green
 * Tee middleware. The JWT relay, the error mapping, and the caching contract
 * live in request.ts, which the reserve and checkout calls (§12.2) share.
 * Nothing above the provider seam knows which provider answered.
 */
export const middlewareProvider: BookingProvider = {
  async getRooms(): Promise<BookingRoom[]> {
    // Room data is not user specific (booking.md §10.2), so the upstream
    // fetch may revalidate on a 300 second window.
    const dtos = await vendorRequest<VendorRoomDto[]>(
      "/api/v1/simulator/rooms",
      { cache: { revalidate: 300 } },
    );
    return mapRooms(dtos);
  },

  async getAvailability({
    date,
    partySize,
    roomId,
  }: AvailabilityQuery): Promise<Availability> {
    const params = new URLSearchParams({
      date,
      partySize: String(partySize),
    });
    if (roomId) params.set("roomId", roomId);
    const dto = await vendorRequest<VendorAvailabilityDto>(
      `/api/v1/simulator/availability?${params.toString()}`,
      { cache: "no-store" },
    );
    return mapAvailability(dto);
  },
};
