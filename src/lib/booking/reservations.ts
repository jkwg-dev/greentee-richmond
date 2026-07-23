import "server-only";

import type {
  BookingReservation,
  CheckoutSession,
  CheckoutState,
  CheckoutStatus,
  ReservationList,
} from "@/types/booking";
import { isBookingLive } from "./config";
import { BookingApiError } from "./errors";
import {
  mapCheckoutSession,
  mapCheckoutState,
  mapCheckoutStatus,
  mapReservation,
  mapReservationList,
  type VendorCheckoutCompleteDto,
  type VendorCheckoutSessionDto,
  type VendorCheckoutStateDto,
  type VendorReservationDto,
  type VendorReservationListDto,
} from "./map";
import { vendorRequest } from "./request";

/**
 * Reserve and pay against the middleware (booking.md §12.1, §12.2). Separate
 * from the `BookingProvider` read seam on purpose: the fixture provider is a
 * browse stand-in with no reservation store, so these operations exist only in
 * live mode and the extended stub (§12.7) is the build surface.
 *
 * Every mutation takes the idempotency key its handler generated; no key is
 * ever invented down here, and none is ever logged.
 */

/** Live mode is the only mode with a reservation store behind it. */
function requireLiveMode(): void {
  if (isBookingLive()) return;
  throw new BookingApiError(
    503,
    "unavailable",
    "Online reservations are not available.",
  );
}

const RESERVATIONS = "/api/v1/simulator/reservations";

export type CreateReservationInput = {
  roomId: string;
  startsAt: string;
  endsAt: string;
  partySize: number;
  customerNotes?: string;
};

/**
 * One reservation over the selection's contiguous range (booking.md §4
 * deltas): the first slot's `startsAt` and the last slot's `endsAt`, echoed
 * verbatim. The server sums the 30 minute prices and owns the total.
 */
export async function createReservation(
  input: CreateReservationInput,
  idempotencyKey: string,
): Promise<BookingReservation> {
  requireLiveMode();
  const dto = await vendorRequest<VendorReservationDto>(RESERVATIONS, {
    method: "POST",
    idempotencyKey,
    body: input,
  });
  return mapReservation(dto);
}

/**
 * The signed-in user's reservations, one page (booking.md §13.2, vendor §9.6).
 * The cursor is opaque and passed straight through; the order is the vendor's
 * and is never re-sorted here. A GET, so no idempotency key.
 */
export async function listReservations(
  cursor?: string,
): Promise<ReservationList> {
  requireLiveMode();
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const dto = await vendorRequest<VendorReservationListDto>(
    `${RESERVATIONS}${query}`,
  );
  return mapReservationList(dto);
}

/** The single reservation, ownership-checked upstream: a foreign id is a 404 (§12.10). */
export async function getReservation(id: string): Promise<BookingReservation> {
  requireLiveMode();
  const dto = await vendorRequest<VendorReservationDto>(
    `${RESERVATIONS}/${encodeURIComponent(id)}`,
  );
  return mapReservation(dto);
}

/**
 * The Hosted Checkout handoff (vendor update §8.1). The vendor's documented
 * response carries no Moneris URL; rather than guess a Moneris host we fail
 * loudly, because a wrong payment origin is not a recoverable UI state.
 */
export async function createCheckoutSession(
  reservationId: string,
  idempotencyKey: string,
): Promise<CheckoutSession> {
  requireLiveMode();
  const dto = await vendorRequest<VendorCheckoutSessionDto>(
    `${RESERVATIONS}/${encodeURIComponent(reservationId)}/checkout/session`,
    { method: "POST", idempotencyKey },
  );
  const session = mapCheckoutSession(dto);
  if (!session) {
    console.error(
      "Booking middleware: checkout session carried no checkoutUrl; the Hosted Checkout origin is not ours to construct (booking.md §6).",
    );
    throw new BookingApiError(
      502,
      "upstream_error",
      "The booking service is unavailable.",
    );
  }
  return session;
}

/**
 * Server-to-server receipt verification (vendor update §8.2). This, not the
 * browser callback, is what may turn a reservation into a confirmed one.
 */
export async function completeCheckout(
  reservationId: string,
  ticket: string,
  idempotencyKey: string,
): Promise<CheckoutStatus> {
  requireLiveMode();
  const dto = await vendorRequest<VendorCheckoutCompleteDto>(
    `${RESERVATIONS}/${encodeURIComponent(reservationId)}/checkout/complete`,
    { method: "POST", idempotencyKey, body: { ticket } },
  );
  return mapCheckoutStatus(dto.status);
}

/** The payment status poll (vendor update §8.3). A GET, so it carries no key. */
export async function getCheckoutState(
  reservationId: string,
): Promise<CheckoutState> {
  requireLiveMode();
  const dto = await vendorRequest<VendorCheckoutStateDto>(
    `${RESERVATIONS}/${encodeURIComponent(reservationId)}/checkout`,
  );
  return mapCheckoutState(dto);
}
