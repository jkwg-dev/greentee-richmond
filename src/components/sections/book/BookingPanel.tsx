"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { defaultPartySize } from "@/lib/booking/config";
import { addDaysIso } from "@/lib/booking/dates";
import {
  formatCad,
  formatDuration,
  formatSlotRange,
} from "@/lib/booking/format";
import { applyTap, selectionSummary } from "@/lib/booking/selection";
import type {
  Availability,
  BookingPolicy,
  BookingRoom,
  BookingSelection,
  BookingSlot,
} from "@/types/booking";
import { BookingBrowse, type BrowseSpace, type SlotStatus } from "./BookingBrowse";
import { BookingControls } from "./BookingControls";
import { BookingSummary, type ReserveAffordance } from "./BookingSummary";
import { CATEGORY_FILTER_ORDER, type FilterableCategory } from "./categories";
import { ReserveOverlay } from "./ReserveOverlay";
import { useReserveFlow } from "./useReserveFlow";
import type { TypeFilterValue } from "./TypeFilter";

type SlotQuery = { date: string; partySize: number };

/**
 * The /book island (booking.md §5.2 item 2, §11): the master-detail browse.
 * State lives here; the browser talks only to /api/booking/availability, and
 * the server render supplies the initial data so first paint needs no client
 * fetch. The type filter narrows the cards client side (no refetch); date and
 * party changes refetch. A single SR-only live region announces the range so
 * the desktop and mobile summaries never announce twice.
 */
export function BookingPanel({
  rooms,
  initialDate,
  initialAvailability,
  createEnabled,
  policy,
}: {
  rooms: BookingRoom[];
  initialDate: string;
  initialAvailability: Availability;
  /** booking.md §5.5, §8: the server's read of the flag, live mode included. */
  createEnabled: boolean;
  policy: BookingPolicy;
}) {
  const [query, setQuery] = useState<SlotQuery>({
    date: initialDate,
    partySize: defaultPartySize,
  });
  const [availability, setAvailability] = useState(initialAvailability);
  const [status, setStatus] = useState<SlotStatus>("ready");
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [filter, setFilter] = useState<TypeFilterValue>("all");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const initialQuery = useRef(query);
  const router = useRouter();

  // The booking window is the server's to state (booking.md §4 deltas): live
  // mode gets the vendor's advanceBookingDays, fixture mode keeps its constant
  // (FIXTURE_POLICY carries dateStripDays). Floored at 1 so a zero or bad
  // policy value can never render an empty strip.
  const stripDays = Math.max(1, policy.advanceBookingDays);
  const dates = Array.from({ length: stripDays }, (_, index) =>
    addDaysIso(initialDate, index),
  );
  const maxPartySize = Math.max(...rooms.map((room) => room.maxCapacity));

  useEffect(() => {
    if (query === initialQuery.current && attempt === 0) return;

    const controller = new AbortController();
    setStatus("loading");
    const params = new URLSearchParams({
      date: query.date,
      partySize: String(query.partySize),
    });

    fetch(`/api/booking/availability?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) {
          router.push("/account/sign-in?next=/book");
          return null;
        }
        if (!response.ok) throw new Error(`availability ${response.status}`);
        return response.json() as Promise<Availability>;
      })
      .then((data) => {
        if (!data) return;
        setAvailability(data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [query, attempt, router]);

  // Eligible spaces: rooms the party fits (booking.md §11.2). A room with no
  // slots today keeps its card, dimmed; a room too small is dropped entirely.
  const spaces: BrowseSpace[] = rooms
    .filter((room) => room.maxCapacity >= query.partySize)
    .map((room) => {
      const slots = availability.slots.filter((slot) => slot.roomId === room.id);
      const minPriceCents = slots.length
        ? Math.min(...slots.map((slot) => slot.priceCents))
        : null;
      return {
        room,
        slots,
        priceLabel:
          minPriceCents === null
            ? null
            : `From ${formatCad(minPriceCents)} per 30 minutes`,
      };
    });

  const present: FilterableCategory[] = CATEGORY_FILTER_ORDER.filter(
    (category) => spaces.some((space) => space.room.category === category),
  );
  const shown =
    filter === "all"
      ? spaces
      : spaces.filter((space) => space.room.category === filter);
  // Desktop auto-selects the first shown space; the stored id wins when it is
  // still in view (booking.md §11.1).
  const selectedRoom =
    shown.find((space) => space.room.id === selectedRoomId) ?? shown[0] ?? null;

  const selectionRoom = selection
    ? (rooms.find((room) => room.id === selection.slots[0].roomId) ?? null)
    : null;

  const tapSlot = (slot: BookingSlot) =>
    setSelection((current) => applyTap(availability.slots, current, slot));

  // Date or party changes refetch and reset the pick and any open accordion.
  const update = (patch: Partial<SlotQuery>) => {
    setSelection(null);
    setExpandedRoomId(null);
    setQuery((current) => ({ ...current, ...patch }));
  };

  // The filter narrows client side; switching scope clears the pick.
  const changeFilter = (value: TypeFilterValue) => {
    setSelection(null);
    setExpandedRoomId(null);
    setFilter(value);
  };

  // Switching to a different space clears the pick (a range is single-room).
  const selectCard = (id: string) => {
    if (id !== selectedRoom?.room.id) setSelection(null);
    setSelectedRoomId(id);
  };
  const toggleCard = (id: string) => {
    if (id !== selectionRoom?.id) setSelection(null);
    setExpandedRoomId((current) => (current === id ? null : id));
  };

  // The reserve leg (booking.md §12.1). The cap heuristic and the §12.4 note
  // both read the policy the server fetched, never a hardcoded limit.
  const hasDailyCap = policy.maxPerDayPerUser !== null;
  const { state: reserveState, reserve: startReserve, dismiss } = useReserveFlow(
    { partySize: query.partySize, hasDailyCap },
  );
  const reserve: ReserveAffordance = {
    createEnabled,
    showDailyCapNote: createEnabled && policy.maxPerDayPerUser === 1,
    onReserve: () => {
      if (selection) void startReserve(selection);
    },
  };

  // A conflict means the availability we drew is stale (booking.md §12.6).
  const dismissOverlay = () => {
    if (reserveState.kind === "conflict") setAttempt((count) => count + 1);
    dismiss();
  };

  const summary = selection ? selectionSummary(selection) : null;
  const announcement = summary
    ? `${formatSlotRange(summary.startsAt, summary.endsAt)}, ${formatDuration(summary.slotCount)}, ${formatCad(summary.priceCents)}`
    : "";
  const showBar = status === "ready" && availability.slots.length > 0;

  return (
    <section>
      <Reveal as="div">
        <BookingControls
          dates={dates}
          date={query.date}
          partySize={query.partySize}
          maxPartySize={maxPartySize}
          onDateChange={(date) => update({ date })}
          onPartySizeChange={(partySize) => update({ partySize })}
        />
      </Reveal>

      <Reveal as="div" delay={120} threshold={0.01} className="mt-12">
        <BookingBrowse
          availability={availability}
          status={status}
          spaces={shown}
          present={present}
          filter={filter}
          onFilterChange={changeFilter}
          selection={selection}
          selectedRoom={selectedRoom}
          expandedRoomId={expandedRoomId}
          onTapSlot={tapSlot}
          onSelectCard={selectCard}
          onToggleCard={toggleCard}
          onRetry={() => setAttempt((count) => count + 1)}
          date={availability.date}
          reserve={reserve}
          partySize={query.partySize}
        />
      </Reveal>

      {/* Single announcer for both summary forms (booking.md §11.4). */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* Mobile fixed bottom bar (booking.md §5.8, §11.1); desktop keeps the
          summary inside the detail pane. */}
      {showBar && (
        <>
          <div aria-hidden="true" className="h-40 min-[1024px]:hidden" />
          <div className="border-hair bg-noir-soft/95 fixed inset-x-0 bottom-0 z-40 border-t px-[6vw] py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur min-[1024px]:hidden">
            <BookingSummary
              variant="bar"
              selection={selection}
              room={selectionRoom}
              partySize={query.partySize}
              date={availability.date}
              reserve={reserve}
            />
          </div>
        </>
      )}

      <ReserveOverlay state={reserveState} onDismiss={dismissOverlay} />
    </section>
  );
}
