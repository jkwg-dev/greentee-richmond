import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Availability, BookingRoom } from "@/types/booking";
import { bookingApiBaseUrl } from "./config";
import { BookingApiError, BookingAuthError } from "./errors";
import {
  mapAvailability,
  mapRooms,
  type VendorAvailabilityDto,
  type VendorRoomDto,
} from "./map";
import type { AvailabilityQuery, BookingProvider } from "./provider";

/**
 * The live provider (booking.md §10.2): the two read endpoints on the Green
 * Tee middleware, called with the current user's JWT relayed per request.
 * The token is read from the Supabase server client inside the request
 * scope and never cached or shared across requests. Nothing above the
 * provider seam knows which provider answered.
 */

/** The §4 vendor error envelope. */
type VendorErrorEnvelope = { error?: { code?: string; message?: string } };

/** This request's access token; a typed auth error when there is no session. */
async function accessToken(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new BookingAuthError();
  return session.access_token;
}

async function vendorFetch<T>(
  path: string,
  cache: { revalidate: number } | "no-store",
): Promise<T> {
  const token = await accessToken();
  const requestId = crypto.randomUUID();

  const response = await fetch(`${bookingApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "x-request-id": requestId,
    },
    ...(cache === "no-store"
      ? { cache: "no-store" as const }
      : { next: cache }),
  });

  if (!response.ok) {
    let envelope: VendorErrorEnvelope = {};
    try {
      envelope = (await response.json()) as VendorErrorEnvelope;
    } catch {
      // Non-JSON failure body; the status alone carries the mapping.
    }
    const code = envelope.error?.code ?? `HTTP_${response.status}`;
    // The raw vendor message stays in the server log with the request id;
    // handlers and the UI only ever see our mapped envelope (§10.2).
    console.error(
      `Booking middleware: ${path} failed ${response.status} ${code} (x-request-id ${requestId}): ${envelope.error?.message ?? response.statusText}`,
    );
    if (response.status === 401 || code === "UNAUTHORIZED") {
      throw new BookingAuthError();
    }
    if (response.status === 400 || code === "VALIDATION_FAILED") {
      throw new BookingApiError(
        400,
        "validation_failed",
        "The booking request was invalid.",
      );
    }
    throw new BookingApiError(
      502,
      "upstream_error",
      "The booking service is unavailable.",
    );
  }

  return response.json() as Promise<T>;
}

export const middlewareProvider: BookingProvider = {
  async getRooms(): Promise<BookingRoom[]> {
    // Room data is not user specific (booking.md §10.2), so the upstream
    // fetch may revalidate on a 300 second window.
    const dtos = await vendorFetch<VendorRoomDto[]>("/api/v1/simulator/rooms", {
      revalidate: 300,
    });
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
    const dto = await vendorFetch<VendorAvailabilityDto>(
      `/api/v1/simulator/availability?${params.toString()}`,
      "no-store",
    );
    return mapAvailability(dto);
  },
};
