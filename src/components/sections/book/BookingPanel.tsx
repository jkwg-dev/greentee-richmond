"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { dateStripDays, defaultPartySize } from "@/lib/booking/config";
import { addDaysIso } from "@/lib/booking/dates";
import type {
  Availability,
  BookingRoom,
  BookingSelection,
  BookingSlot,
} from "@/types/booking";
import { BookingControls } from "./BookingControls";
import { BookingSummary } from "./BookingSummary";
import { SlotArea, type SlotStatus } from "./SlotArea";

type SlotQuery = { date: string; partySize: number; roomId?: string };

/**
 * The /book island (booking.md §5.2 item 2): controls and slots on the left,
 * the sticky summary right at 1024px and above, one column below. State lives
 * here; the browser talks only to /api/booking/availability, and the server
 * render supplies the initial data so first paint needs no client fetch.
 */
export function BookingPanel({
  rooms,
  initialDate,
  initialAvailability,
  phone,
}: {
  rooms: BookingRoom[];
  initialDate: string;
  initialAvailability: Availability;
  phone: string;
}) {
  const [query, setQuery] = useState<SlotQuery>({
    date: initialDate,
    partySize: defaultPartySize,
  });
  const [availability, setAvailability] = useState(initialAvailability);
  const [status, setStatus] = useState<SlotStatus>("ready");
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [attempt, setAttempt] = useState(0);
  const initialQuery = useRef(query);
  const router = useRouter();

  // The strip is generated from the server's venue-time today (booking.md
  // §5.3), so a visitor sees the club's calendar, not their own.
  const dates = Array.from({ length: dateStripDays }, (_, index) =>
    addDaysIso(initialDate, index),
  );
  const maxPartySize = Math.max(...rooms.map((room) => room.maxCapacity));

  useEffect(() => {
    // The server render already carries the initial query's data (§5.7);
    // only control changes and retries fetch.
    if (query === initialQuery.current && attempt === 0) return;

    const controller = new AbortController();
    setStatus("loading");
    const params = new URLSearchParams({
      date: query.date,
      partySize: String(query.partySize),
    });
    if (query.roomId) params.set("roomId", query.roomId);

    fetch(`/api/booking/availability?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) {
          // The live session lapsed mid browse (booking.md §10.4).
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

  // Any control change resets the pick; the old slot may not exist under the
  // new query.
  const update = (patch: Partial<SlotQuery>) => {
    setSelection(null);
    setQuery((current) => ({ ...current, ...patch }));
  };

  const toggleSlot = (slot: BookingSlot) => {
    setSelection((current) => {
      if (
        current?.slot.roomId === slot.roomId &&
        current?.slot.startsAt === slot.startsAt
      )
        return null;
      const room = rooms.find((entry) => entry.id === slot.roomId);
      return room ? { room, slot, partySize: query.partySize } : null;
    });
  };

  return (
    <section className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-[5vw] max-[1023px]:grid-cols-1 max-[1023px]:gap-14">
      <div>
        <Reveal as="div">
          <BookingControls
            dates={dates}
            rooms={rooms}
            date={query.date}
            partySize={query.partySize}
            maxPartySize={maxPartySize}
            roomId={query.roomId}
            onDateChange={(date) => update({ date })}
            onPartySizeChange={(partySize) => update({ partySize })}
            onRoomChange={(roomId) => update({ roomId })}
          />
        </Reveal>
        {/* The slot container is tall and data-sized, so a fraction threshold
            would keep it hidden at short viewports; reveal on first contact. */}
        <Reveal as="div" delay={120} threshold={0.01} className="mt-12">
          <SlotArea
            availability={availability}
            rooms={rooms}
            roomId={query.roomId}
            status={status}
            selectedSlot={selection?.slot ?? null}
            onToggleSlot={toggleSlot}
            onRetry={() => setAttempt((count) => count + 1)}
          />
        </Reveal>
      </div>
      <Reveal
        as="aside"
        delay={180}
        className="sticky top-[110px] max-[1023px]:static"
      >
        <BookingSummary
          selection={selection}
          date={availability.date}
          phone={phone}
        />
      </Reveal>
    </section>
  );
}
