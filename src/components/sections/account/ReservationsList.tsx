"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ReservationList } from "@/types/booking";
import { ReservationRow } from "./ReservationRow";

/**
 * The reservations list island (booking.md §13.3, §13.4). The first page is
 * server-rendered and handed in as `initial`; further pages load on demand
 * through Show More, appending in place and never scrolling or replacing the
 * list. `initial === null` means the server-side fetch failed (live mode only),
 * so the pane opens in the error state. Read-only: no mutation lives here, and
 * cancel is B3d-2.
 *
 * The browser talks only to our `/api/booking/reservations` handler; the cursor
 * is opaque and passed back verbatim.
 */
export function ReservationsList({
  initial,
}: {
  initial: ReservationList | null;
}) {
  const [items, setItems] = useState(initial?.items ?? []);
  const [nextCursor, setNextCursor] = useState(initial?.nextCursor ?? null);
  const [status, setStatus] = useState<"ready" | "loading" | "error">(
    initial ? "ready" : "error",
  );
  // Whether we hold a valid page yet: false only after an initial-fetch failure,
  // which is what tells retry to reload the first page rather than the next.
  const [loaded, setLoaded] = useState(initial !== null);
  const router = useRouter();

  const fetchPage = async (
    cursor: string | null,
  ): Promise<ReservationList | "unauth"> => {
    const url = cursor
      ? `/api/booking/reservations?cursor=${encodeURIComponent(cursor)}`
      : "/api/booking/reservations";
    const response = await fetch(url);
    if (response.status === 401) return "unauth";
    if (!response.ok) throw new Error(`reservations ${response.status}`);
    return (await response.json()) as ReservationList;
  };

  const loadFirst = async () => {
    setStatus("loading");
    try {
      const data = await fetchPage(null);
      if (data === "unauth") {
        router.push("/account/sign-in?next=/account");
        return;
      }
      setItems(data.items);
      setNextCursor(data.nextCursor);
      setLoaded(true);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setStatus("loading");
    try {
      const data = await fetchPage(nextCursor);
      if (data === "unauth") {
        router.push("/account/sign-in?next=/account");
        return;
      }
      // Append in place; the existing rows stay put (booking.md §13.3).
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  // On an initial failure retry the first page; after a Show More failure the
  // rows stay and retry re-attempts that same next page.
  const retry = () => (loaded ? loadMore() : loadFirst());

  const showMore = loaded && nextCursor !== null && status !== "error";

  return (
    <div>
      <p className="text-mist mb-6 text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase">
        Reservations
      </p>

      {items.length > 0 && (
        <ul>
          {items.map((reservation) => (
            <ReservationRow key={reservation.id} reservation={reservation} />
          ))}
        </ul>
      )}

      {/* Initial load pulse (server-rendered first paint means this is only the
          retry-from-error case; booking.md §13.4). */}
      {!loaded && status === "loading" && <PulseRows />}

      {loaded && items.length === 0 && status === "ready" && <EmptyState />}

      {status === "error" && <ErrorState onRetry={retry} />}

      {showMore && (
        <div className="mt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={status === "loading"}
            aria-disabled={status === "loading" || undefined}
            className={cn("min-h-[44px]", status === "loading" && "opacity-50")}
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}

/** The §13.4 empty state: a quiet line and the one link back into booking. */
function EmptyState() {
  return (
    <div className="border-champagne/[0.12] border-t pt-8">
      <p className="text-mist text-[14px]">No reservations yet.</p>
      <Button href="/book" variant="solid" size="sm" className="mt-6">
        Book a Bay
      </Button>
    </div>
  );
}

/** The §13.4 error state, confined to the list pane. */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-champagne/[0.12] mt-8 border-t pt-8">
      <p className="text-mist text-[14px]">
        Something went wrong while loading your reservations.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="mt-6 min-h-[44px]"
      >
        Try Again
      </Button>
    </div>
  );
}

/** Three pulse placeholder rows at the row height (booking.md §13.4, §5.6). */
function PulseRows() {
  return (
    <ul aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li
          key={index}
          className="border-champagne/[0.12] flex items-start justify-between gap-5 border-t py-5"
        >
          <div className="w-1/2 space-y-2.5">
            <div className="bg-champagne/[0.08] h-4 w-3/4 motion-safe:animate-pulse" />
            <div className="bg-champagne/[0.06] h-3 w-1/2 motion-safe:animate-pulse" />
          </div>
          <div className="bg-champagne/[0.06] h-6 w-24 motion-safe:animate-pulse" />
        </li>
      ))}
    </ul>
  );
}
