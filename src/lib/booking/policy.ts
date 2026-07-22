import "server-only";

import type { BookingPolicy } from "@/types/booking";
import { dateStripDays, isBookingLive } from "./config";
import { CUTOFF_MINUTES } from "./fixtures";
import { mapPolicy, type VendorPolicyDto } from "./map";
import { vendorRequest } from "./request";

/**
 * The booking policy read (booking.md §4 deltas, §12.5). Windows, cutoffs, and
 * caps are operational settings the vendor owns and enforces, so the UI asks
 * rather than hardcoding: in live mode these values override the §4 constants,
 * and in fixture mode the constants stand.
 */

/**
 * Fixture mode's standing policy: the §4 constants the browse already runs on,
 * with no per-user caps (the fixtures hold no reservations to count) and the
 * vendor's documented hold and session clocks.
 */
export const FIXTURE_POLICY: BookingPolicy = {
  advanceBookingDays: dateStripDays,
  sameDayCutoffMinutes: CUTOFF_MINUTES,
  maxPerDayPerUser: null,
  maxPerWeekPerUser: null,
  pendingHoldMinutes: 10,
  checkoutSessionMinutes: 15,
  operatingHours: [],
};

/**
 * Policy is operational configuration, identical for every user, so the
 * upstream read may revalidate on the same 300 second window as rooms
 * (booking.md §2). The response is cached; the token that fetched it is not.
 */
export async function getBookingPolicy(): Promise<BookingPolicy> {
  if (!isBookingLive()) return FIXTURE_POLICY;
  const dto = await vendorRequest<VendorPolicyDto>(
    "/api/v1/simulator/policies/booking",
    { cache: { revalidate: 300 } },
  );
  return mapPolicy(dto);
}
