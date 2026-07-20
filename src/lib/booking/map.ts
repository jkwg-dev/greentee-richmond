import "server-only";

import type {
  Availability,
  AvailabilityReason,
  BookingRoom,
  BookingRoomCategory,
  BookingSlot,
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
