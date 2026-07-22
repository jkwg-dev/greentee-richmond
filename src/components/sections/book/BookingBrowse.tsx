"use client";

import { Button } from "@/components/ui/Button";
import type {
  Availability,
  AvailabilityReason,
  BookingRoom,
  BookingSelection,
  BookingSlot,
} from "@/types/booking";
import type { ReserveAffordance } from "./BookingSummary";
import { DetailPane } from "./DetailPane";
import { SpaceCard } from "./SpaceCard";
import { SpaceTimeline } from "./SpaceTimeline";
import { TypeFilter, type TypeFilterValue } from "./TypeFilter";
import type { FilterableCategory } from "./categories";

export type SlotStatus = "ready" | "loading" | "error";

/** A space in the browse layout: its room, its slots for the query, and the card price line. */
export type BrowseSpace = {
  room: BookingRoom;
  slots: BookingSlot[];
  /** "From {price} per 30 minutes", or null when the space has no slots today. */
  priceLabel: string | null;
};

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

/**
 * The §11 master-detail browse area. Desktop (1024 and up): the type filter
 * and space cards in the left column, the selected space's detail pane on the
 * right. Below 1024: the filter over an accordion, one timeline open at a
 * time. Loading, error, and the §5.6 empty states precede the layout; a
 * dimmed no-times card is still selectable. Presentational only; every tap and
 * selection is owned by BookingPanel.
 */
export function BookingBrowse({
  availability,
  status,
  spaces,
  present,
  filter,
  onFilterChange,
  selection,
  selectedRoom,
  expandedRoomId,
  onTapSlot,
  onSelectCard,
  onToggleCard,
  onRetry,
  date,
  reserve,
  partySize,
}: {
  availability: Availability;
  status: SlotStatus;
  spaces: BrowseSpace[];
  present: FilterableCategory[];
  filter: TypeFilterValue;
  onFilterChange: (value: TypeFilterValue) => void;
  selection: BookingSelection | null;
  selectedRoom: BrowseSpace | null;
  expandedRoomId: string | null;
  onTapSlot: (slot: BookingSlot) => void;
  onSelectCard: (id: string) => void;
  onToggleCard: (id: string) => void;
  onRetry: () => void;
  date: string;
  reserve: ReserveAffordance;
  partySize: number;
}) {
  if (status === "error") {
    return (
      <div className="min-h-[220px]">
        <p className="text-mist text-[13.5px]">
          Something went wrong while loading times.
        </p>
        <Button variant="ghost" size="sm" className="mt-5" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="grid min-h-[320px] grid-cols-1 gap-8 min-[1024px]:grid-cols-[340px_minmax(0,1fr)]"
      >
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="border-hair min-h-[112px] border motion-safe:animate-pulse"
            />
          ))}
        </div>
        <div className="border-hair hidden min-h-[320px] border motion-safe:animate-pulse min-[1024px]:block" />
      </div>
    );
  }

  if (availability.slots.length === 0) {
    return (
      <p className="text-mist min-h-[120px] text-[13.5px]">
        {emptyMessage(availability.reasons)}
      </p>
    );
  }

  const showFilter = present.length > 1;
  const cards = (mode: "select" | "accordion") =>
    spaces.map((space) => {
      const controlsId = `timeline-${mode}-${space.room.id}`;
      const expanded = expandedRoomId === space.room.id;
      return (
        <div key={space.room.id}>
          <SpaceCard
            room={space.room}
            priceLabel={space.priceLabel}
            selected={
              mode === "accordion"
                ? expanded
                : selectedRoom?.room.id === space.room.id
            }
            onSelect={() =>
              mode === "accordion"
                ? onToggleCard(space.room.id)
                : onSelectCard(space.room.id)
            }
            disclosure={
              mode === "accordion" ? { expanded, controlsId } : undefined
            }
          />
          {mode === "accordion" && expanded && (
            <div id={controlsId} className="mt-2 mb-2">
              {space.slots.length > 0 ? (
                <SpaceTimeline
                  slots={space.slots}
                  selection={selection}
                  onTapSlot={onTapSlot}
                  maxHeightClass="max-h-[320px]"
                />
              ) : (
                <p className="text-mist text-[13.5px]">No times for this day.</p>
              )}
            </div>
          )}
        </div>
      );
    });

  return (
    <>
      {/* Desktop: filter + cards | detail pane */}
      <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-[clamp(2rem,4vw,4rem)] max-[1023px]:hidden">
        <div>
          {showFilter && (
            <TypeFilter
              present={present}
              value={filter}
              onChange={onFilterChange}
            />
          )}
          <div className="mt-6 flex flex-col gap-3">{cards("select")}</div>
        </div>
        <div className="sticky top-[110px]">
          {selectedRoom && (
            <DetailPane
              room={selectedRoom.room}
              slots={selectedRoom.slots}
              selection={selection}
              onTapSlot={onTapSlot}
              date={date}
              reserve={reserve}
              partySize={partySize}
            />
          )}
        </div>
      </div>

      {/* Mobile: filter over an accordion */}
      <div className="min-[1024px]:hidden">
        {showFilter && (
          <TypeFilter
            present={present}
            value={filter}
            onChange={onFilterChange}
          />
        )}
        <div className="mt-6 flex flex-col gap-3">{cards("accordion")}</div>
      </div>
    </>
  );
}
