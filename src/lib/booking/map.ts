import "server-only";

import type {
  Availability,
  AvailabilityReason,
  BookingRoom,
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

export function mapRooms(dtos: VendorRoomDto[]): BookingRoom[] {
  return [...dtos]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((dto) => ({
      id: dto.id,
      name: dto.name,
      maxCapacity: dto.maxCapacity,
      order: dto.displayOrder,
    }));
}

export function mapAvailability(dto: VendorAvailabilityDto): Availability {
  return {
    date: dto.date,
    slots: dto.slots.map((slot): BookingSlot => ({
      roomId: slot.roomId,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      priceCents: slot.priceCents,
      currency: slot.currency,
    })),
    reasons: dto.reasons,
  };
}
