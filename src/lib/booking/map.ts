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
  CancelReservationResult,
  CheckoutMode,
  CheckoutSession,
  CheckoutState,
  CheckoutStatus,
  RefundStatus,
  ReservationList,
} from "@/types/booking";
import { assumeQaIsMock } from "./config";
import { BookingApiError } from "./errors";

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

/**
 * `GET /rooms` response envelope (OpenAPI): the array is wrapped in `{ rooms }`.
 * The vendor OpenAPI document is the contract, so the provider reads the
 * envelope rather than a bare array; the stub emits the same envelope.
 */
export type VendorRoomsDto = { rooms: VendorRoomDto[] };

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
  reservationCode?: string | null;
  confirmationCode?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
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
    // The v0.1 list and detail name it `reservationCode`; the middleware update
    // examples use `code`. Accept either, plus the older `confirmationCode`.
    code: dto.code ?? dto.reservationCode ?? dto.confirmationCode ?? null,
    // Verbatim time strings (booking.md §14.5); parsed only for the §13.2 sort.
    createdAt: dto.createdAt,
    cancelledAt: dto.cancelledAt ?? null,
  };
}

/**
 * `GET /api/v1/simulator/reservations` (vendor spec §9.6): the signed-in user's
 * reservations plus an opaque `nextCursor` (null on the last page). The order
 * is the vendor's; it is never re-sorted here (booking.md §13.2).
 */
export type VendorReservationListDto = {
  reservations: VendorReservationDto[];
  nextCursor?: string | null;
};

export function mapReservationList(
  dto: VendorReservationListDto,
): ReservationList {
  return {
    items: (dto.reservations ?? []).map(mapReservation),
    nextCursor: dto.nextCursor ?? null,
  };
}

const REFUND_STATUSES: Exclude<RefundStatus, null>[] = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
  "review_required",
];

/**
 * Maps the vendor `refundStatus` (booking.md §4, §14; OpenAPI). `null` is a
 * valid value (nothing to refund, or a zero-percent bracket). An unrecognized
 * non-null value fails loudly, consistent with the environment and checkout
 * status mappers: a refund state we do not model is never guessed.
 */
export function mapRefundStatus(value: string | null | undefined): RefundStatus {
  if (value == null) return null;
  const status = REFUND_STATUSES.find((s) => s === value);
  if (!status) {
    throw new BookingApiError(
      502,
      "upstream_error",
      "The booking service is unavailable.",
    );
  }
  return status;
}

/** `POST .../cancel` (booking.md §14.1, OpenAPI `CancelReservationResponse`). */
export type VendorCancelResponseDto = {
  reservation: VendorReservationDto;
  refundCents: number;
  refundAmountCents: number;
  refundPercent: number;
  refundStatus?: string | null;
};

export function mapCancelResult(
  dto: VendorCancelResponseDto,
): CancelReservationResult {
  return {
    reservation: mapReservation(dto.reservation),
    refundCents: dto.refundCents,
    refundAmountCents: dto.refundAmountCents,
    refundPercent: dto.refundPercent,
    refundStatus: mapRefundStatus(dto.refundStatus),
  };
}

/**
 * `POST .../checkout/session` (booking.md §6, vendor 2026-07-28 reply). The
 * response carries `paymentId`, `ticket`, `expiresAt`, and `environment`; there
 * is no `checkoutUrl` and none will be added. `mode` is derived from
 * `environment` alone, in `environmentToMode` below.
 */
export type VendorCheckoutSessionDto = {
  paymentId: string;
  ticket: string;
  expiresAt: string;
  environment?: string;
};

/**
 * The one place the vendor `environment` field becomes our checkout `mode`
 * (booking.md §6). Interim ruling pending open question Q2 (the value the
 * staging mock provider returns): `"qa"` and `"production"` are Moneris,
 * `"mock"` is the mock surface, and anything else, including a missing value,
 * fails loudly as the documented 502. Never guessed, never defaulted; the Q2
 * answer is absorbed by a single line here.
 */
function environmentToMode(environment: string | undefined): CheckoutMode {
  switch (environment) {
    case "qa":
      // §4 interim override: treat staging "qa" as mock when the env flag is
      // set, so the vendor's mock verification flow can run. Removed when the
      // vendor ships a structured provider signal (booking.md §4, §8).
      return assumeQaIsMock() ? "mock" : "moneris";
    case "production":
      return "moneris";
    case "mock":
      return "mock";
    default:
      throw new BookingApiError(
        502,
        "upstream_error",
        "The booking service is unavailable.",
      );
  }
}

export function mapCheckoutSession(
  dto: VendorCheckoutSessionDto,
): CheckoutSession {
  return {
    paymentId: dto.paymentId,
    ticket: dto.ticket,
    expiresAt: dto.expiresAt,
    mode: environmentToMode(dto.environment),
  };
}

const CHECKOUT_STATUSES: CheckoutStatus[] = [
  "not_started",
  "pending",
  "processing",
  "succeeded",
  "declined",
  "failed",
  "review_required",
];

/**
 * Maps the vendor payment status to the domain enum (booking.md §4 deltas, §6;
 * OpenAPI `CheckoutStatus`). An unrecognized value fails loudly, consistent
 * with the environment mapper: a payment state we do not model is never
 * silently read as `processing`, because that once let an unknown status
 * forward the payment page past the session step.
 */
export function mapCheckoutStatus(value: string): CheckoutStatus {
  const status = CHECKOUT_STATUSES.find((s) => s === value);
  if (!status) {
    throw new BookingApiError(
      502,
      "upstream_error",
      "The booking service is unavailable.",
    );
  }
  return status;
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
