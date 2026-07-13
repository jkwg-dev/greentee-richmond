"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import type {
  Availability,
  AvailabilityReason,
  BookingRoom,
  BookingSlot,
} from "@/types/booking";
import { SlotChip } from "./SlotChip";

export type SlotStatus = "ready" | "loading" | "error";

/** The §7 empty states, in the ruled precedence: closed, no_rooms, pricing, sold out. */
function emptyMessage(reasons: AvailabilityReason[]): string {
  if (reasons.includes("closed_today"))
    return "The club is closed on this date.";
  if (reasons.includes("no_rooms"))
    return "No spaces fit this party size. Try a smaller group or another date.";
  if (
    reasons.includes("no_pricing_configured") ||
    reasons.includes("pricing_gaps")
  )
    return "Times for this date are still being finalized. Call us and we will set you up.";
  return "Fully booked on this date. Try another date.";
}

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[10px]";

/**
 * The slot area (booking.md §5.4, §5.6): room-grouped chips on All spaces, a
 * flat grid for one space, with the pulse loading, error, and §7 empty states.
 * Data swaps cross-fade about 200ms; the fade is skipped under reduced motion
 * and reveals never re-run here (the Reveal lives on the container above).
 */
export function SlotArea({
  availability,
  rooms,
  roomId,
  status,
  selectedSlot,
  onToggleSlot,
  onRetry,
}: {
  availability: Availability;
  rooms: BookingRoom[];
  roomId?: string;
  status: SlotStatus;
  selectedSlot: BookingSlot | null;
  onToggleSlot: (slot: BookingSlot) => void;
  onRetry: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const firstData = useRef(true);

  // New data lands at opacity 0, released a frame later so the 200ms opacity
  // transition runs (booking.md §5.4). DOM class toggling, not state: the
  // container's className never changes, so React leaves the classList alone.
  // Skipped under reduced motion (§5.6).
  useEffect(() => {
    if (firstData.current) {
      firstData.current = false;
      return;
    }
    if (reducedMotion) return;
    const content = contentRef.current;
    if (!content) return;
    content.classList.add("opacity-0");
    let release: number | undefined;
    const raf = requestAnimationFrame(() => {
      release = requestAnimationFrame(() =>
        content.classList.remove("opacity-0"),
      );
    });
    return () => {
      cancelAnimationFrame(raf);
      if (release !== undefined) cancelAnimationFrame(release);
      content.classList.remove("opacity-0");
    };
  }, [availability, reducedMotion]);

  const selectedRoom = roomId
    ? rooms.find((room) => room.id === roomId)
    : undefined;
  const groups = selectedRoom
    ? [{ room: selectedRoom, slots: availability.slots }]
    : rooms
        .map((room) => ({
          room,
          slots: availability.slots.filter((slot) => slot.roomId === room.id),
        }))
        .filter((group) => group.slots.length > 0);

  // The pulse skeleton mirrors the outgoing content's shape so the grid holds
  // its height while loading (booking.md §5.6: no layout shift, no spinners).
  const skeletonShape = groups.length
    ? groups.map((group) => group.slots.length)
    : [12];

  return (
    <div aria-busy={status === "loading"} className="min-h-[220px]">
      {status === "error" ? (
        <div>
          <p className="text-mist text-[13.5px]">
            Something went wrong while loading times.
          </p>
          <Button variant="ghost" size="sm" className="mt-5" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      ) : status === "loading" ? (
        <div aria-hidden="true" className="space-y-8">
          {skeletonShape.map((count, groupIndex) => (
            <div key={groupIndex}>
              {!selectedRoom && (
                <div className="border-champagne/[0.12] mb-3 h-[10px] w-32 border motion-safe:animate-pulse" />
              )}
              <div className={GRID}>
                {Array.from({ length: count }).map((_, cellIndex) => (
                  <div
                    key={cellIndex}
                    className="border-champagne/[0.12] min-h-[44px] border motion-safe:animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={contentRef}
          className={cn(!reducedMotion && "transition-opacity duration-200")}
        >
          {availability.slots.length === 0 ? (
            <p className="text-mist text-[13.5px]">
              {emptyMessage(availability.reasons)}
            </p>
          ) : (
            groups.map(({ room, slots }) => (
              <div key={room.id} className="mt-8 first:mt-0">
                {!selectedRoom && (
                  <h3 className="text-mist mb-3 text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase">
                    {room.name}
                  </h3>
                )}
                <div className={GRID}>
                  {slots.map((slot) => (
                    <SlotChip
                      key={`${slot.roomId}-${slot.startsAt}`}
                      slot={slot}
                      roomName={room.name}
                      active={
                        selectedSlot?.roomId === slot.roomId &&
                        selectedSlot?.startsAt === slot.startsAt
                      }
                      onToggle={() => onToggleSlot(slot)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
