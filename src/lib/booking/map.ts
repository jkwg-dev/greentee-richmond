import "server-only";

import type {
  Availability,
  AvailabilityReason,
  BookingPolicy,
  BookingReservation,
  BookingReservationStatus,
  BookingRoom,
  BookingRoomCategory,
  BookingSlot,
  CheckoutSession,
  CheckoutState,
  CheckoutStatus,
} from "@/types/booking";

/**
 * Vendor wire shapes and their domain mapping (booking.md §4, §10.2): the
 * only DTO-aware file. Slot time strings pass through verbatim, never
 * recomputed; the vendor's presentation fields (description, photoUrls) are
 * dropped by design because presentation is ours (§1).
 */

export type VendorRoomDto = {
  id: string;
  name: string;
  maxCapacity: number;
  description?: string | null;
  photoUrls?: string[] | null;
  displayOrder: number;
};

export type VendorSlotDto = {
  roomId: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  currency: string;
};

export type VendorAvailabilityDto = {
  date: string;
  slots: VendorSlotDto[];
  reasons: AvailabilityReason[];
};

/**
 * The §11.3 name heuristic, interim by ruling until real room ids and the
 * Sanity room mapping supply curated categories. VVIP checks first because
 * every VVIP name also contains VIP; a wrong guess degrades to an unfiltered
 * list, never a broken one (the filter renders only present categories).
 */
export function categorizeRoom(name: string): BookingRoomCategory {
  const lowered = name.toLowerCase();
  if (lowered.includes("vvip")) return "vvip";
  if (lowered.includes("vip")) return "vip";
  if (lowered.includes("bay")) return "bay";
  return "other";
}

export function mapRooms(dtos: VendorRoomDto[]): BookingRoom[] {
  return [...dtos]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((dto) => ({
      id: dto.id,
      name: dto.name,
      maxCapacity: dto.maxCapacity,
      order: dto.displayOrder,
      category: categorizeRoom(dto.name),
    }));
}

/**
 * The per-room chronological sort guarantee (booking.md §5.7 as amended):
 * the §5.4 adjacency walk and the §11.4 timeline both depend on it. Lexical
 * comparison of the verbatim strings is the ordering: within one response
 * every slot shares the venue offset and the fixed ISO shape, so string
 * order is time order. No parsing, no arithmetic; the §11.4 epoch exception
 * stays confined to timeline.ts. The sort is stable, so rooms keep their
 * relative order at equal instants.
 */
const byStartsAt = (a: BookingSlot, b: BookingSlot): number =>
  a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : 0;

/**
 * `GET /api/v1/simulator/policies/booking` (booking.md §4 deltas). Caps may be
 * absent or null when the vendor states no limit.
 */
export type VendorPolicyDto = {
  advanceBookingDays: number;
  sameDayCutoffMinutes: number;
  maxPerDayPerUser?: number | null;
  maxPerWeekPerUser?: number | null;
  pendingHoldMinutes: number;
  checkoutSessionMinutes: number;
  operatingHours?: {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];
};

export function mapPolicy(dto: VendorPolicyDto): BookingPolicy {
  return {
    advanceBookingDays: dto.advanceBookingDays,
    sameDayCutoffMinutes: dto.sameDayCutoffMinutes,
    maxPerDayPerUser: dto.maxPerDayPerUser ?? null,
    maxPerWeekPerUser: dto.maxPerWeekPerUser ?? null,
    pendingHoldMinutes: dto.pendingHoldMinutes,
    checkoutSessionMinutes: dto.checkoutSessionMinutes,
    operatingHours: (dto.operatingHours ?? []).map((day) => ({
      dayOfWeek: day.dayOfWeek,
      isOpen: day.isOpen,
      openTime: day.openTime,
      closeTime: day.closeTime,
    })),
  };
}

/**
 * A reservation over a contiguous range (booking.md §4 deltas). Time strings
 * pass through verbatim like slot strings; the itemized cents are the server's
 * answer and are never recomputed here.
 */
export type VendorReservationDto = {
  id: string;
  roomId: string;
  roomName?: string | null;
  startsAt: string;
  endsAt: string;
  partySize: number;
  status: string;
  subtotalCents: number;
  gstCents: number;
  pstCents: number;
  totalCents: number;
  currency: string;
  expiresAt?: string | null;
  code?: string | null;
  confirmationCode?: string | null;
};

const RESERVATION_STATUSES: BookingReservationStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "no_show",
  "completed",
];

/** An unknown status reads as `pending`: never invent a confirmation (§12.6). */
function reservationStatus(value: string): BookingReservationStatus {
  return RESERVATION_STATUSES.find((status) => status === value) ?? "pending";
}

export function mapReservation(dto: VendorReservationDto): BookingReservation {
  return {
    id: dto.id,
    roomId: dto.roomId,
    roomName: dto.roomName ?? null,
    startsAt: dto.startsAt,
    endsAt: dto.endsAt,
    partySize: dto.partySize,
    status: reservationStatus(dto.status),
    subtotalCents: dto.subtotalCents,
    gstCents: dto.gstCents,
    pstCents: dto.pstCents,
    totalCents: dto.totalCents,
    currency: dto.currency,
    expiresAt: dto.expiresAt ?? null,
    code: dto.code ?? dto.confirmationCode ?? null,
  };
}

/**
 * `POST .../checkout/session` (vendor update §8.1). `checkoutUrl` is where the
 * browser is sent to pay. The vendor's documented response carries the ticket
 * and `environment` but no URL, so it is optional on the wire and the caller
 * fails loudly when it is missing: a Moneris host is never guessed here
 * (booking.md §6, open).
 */
export type VendorCheckoutSessionDto = {
  paymentId: string;
  ticket: string;
  expiresAt: string;
  environment?: string;
  checkoutUrl?: string | null;
};

export function mapCheckoutSession(
  dto: VendorCheckoutSessionDto,
): CheckoutSession | null {
  if (!dto.checkoutUrl) return null;
  return {
    paymentId: dto.paymentId,
    ticket: dto.ticket,
    expiresAt: dto.expiresAt,
    checkoutUrl: dto.checkoutUrl,
  };
}

const CHECKOUT_STATUSES: CheckoutStatus[] = [
  "succeeded",
  "declined",
  "processing",
  "review_required",
  "failed",
];

/**
 * An unrecognized payment status reads as `processing` (booking.md §12.6):
 * the safe direction is to keep watching, never to render success or to invite
 * a second purchase.
 */
export function mapCheckoutStatus(value: string): CheckoutStatus {
  return CHECKOUT_STATUSES.find((status) => status === value) ?? "processing";
}

/** `POST .../checkout/complete` (vendor update §8.2). */
export type VendorCheckoutCompleteDto = { status: string };

/** `GET .../checkout` (vendor update §8.3). */
export type VendorCheckoutStateDto = {
  paymentId?: string | null;
  status: string;
  amountCents?: number | null;
  currency?: string | null;
  expiresAt?: string | null;
  failureMessage?: string | null;
};

export function mapCheckoutState(dto: VendorCheckoutStateDto): CheckoutState {
  return {
    paymentId: dto.paymentId ?? null,
    status: mapCheckoutStatus(dto.status),
    amountCents: dto.amountCents ?? null,
    currency: dto.currency ?? null,
    expiresAt: dto.expiresAt ?? null,
  };
}

export function mapAvailability(dto: VendorAvailabilityDto): Availability {
  return {
    date: dto.date,
    slots: dto.slots
      .map(
        (slot): BookingSlot => ({
          roomId: slot.roomId,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          priceCents: slot.priceCents,
          currency: slot.currency,
        }),
      )
      // Invariant: every slot in one response shares a single venue offset and
      // ISO shape, so lexical order is chronological order. Revisit here if the
      // vendor ever mixes offsets in one payload (e.g. across a DST boundary).
      .sort(byStartsAt),
    reasons: dto.reasons,
  };
}
