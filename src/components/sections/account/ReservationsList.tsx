"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type {
  BookingReservation,
  CancelReservationResult,
  ReservationList,
} from "@/types/booking";
import { CancelDialog } from "./CancelDialog";
import { ReservationRow } from "./ReservationRow";

/**
 * The reservations list island (booking.md §13.2, §13.3, §13.4). Two views: the
 * default Reservations view holds every non-cancelled reservation, the Cancelled
 * view holds cancelled ones. Each view is a flat sort by the parsed instant of
 * `createdAt`, descending; the key is the epoch, not the string, because offsets
 * may mix (§13.2), and the stored value stays verbatim. The first page is
 * server-rendered and handed in as `initial`; further pages append through Show
 * More and both views re-derive. `initial === null` is an initial-fetch failure
 * (live mode only), opening the pane in the error state.
 *
 * `roomNames` resolves a room id to a name (the vendor reservation carries none)
 * from the server rooms read, so appended pages resolve with no browser vendor
 * call; an unknown id falls back to itself.
 *
 * The browser talks only to our `/api/booking/reservations` handler; the cursor
 * is opaque and passed back verbatim. Cancel is the §14 flow; this island stays
 * read-only apart from the Complete payment resume link on pending rows.
 */

type View = "active" | "cancelled";

export function ReservationsList({
  initial,
  roomNames,
}: {
  initial: ReservationList | null;
  roomNames: Record<string, string>;
}) {
  const [items, setItems] = useState(initial?.items ?? []);
  const [nextCursor, setNextCursor] = useState(initial?.nextCursor ?? null);
  const [status, setStatus] = useState<"ready" | "loading" | "error">(
    initial ? "ready" : "error",
  );
  // Whether we hold a valid page yet: false only after an initial-fetch failure,
  // which is what tells retry to reload the first page rather than the next.
  const [loaded, setLoaded] = useState(initial !== null);
  const [view, setView] = useState<View>("active");
  const [cancelling, setCancelling] = useState<BookingReservation | null>(null);
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
      // Append in place; both views re-derive from the fuller set (§13.2).
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

  // Flat sort by the parsed instant of createdAt, descending, then split by
  // view (booking.md §13.2). Parsing for comparison mutates nothing.
  const { active, cancelled } = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
    return {
      active: sorted.filter((r) => r.status !== "cancelled"),
      cancelled: sorted.filter((r) => r.status === "cancelled"),
    };
  }, [items]);

  const shown = view === "cancelled" ? cancelled : active;
  const resolveName = (r: BookingReservation) =>
    roomNames[r.roomId] ?? r.roomName ?? r.roomId;

  // A completed cancel hands back the updated (cancelled) reservation; swapping
  // it into the set flips its status, so the next re-derive migrates the row out
  // of the default view into Cancelled (booking.md §14.4). No refetch needed.
  const handleCancelled = useCallback((result: CancelReservationResult) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === result.reservation.id ? result.reservation : item,
      ),
    );
  }, []);

  const showMore = loaded && nextCursor !== null && status !== "error";

  return (
    <div>
      <div className="mb-6 flex gap-7">
        <ViewTab
          label="Reservations"
          active={view === "active"}
          onSelect={() => setView("active")}
        />
        <ViewTab
          label="Cancelled"
          active={view === "cancelled"}
          onSelect={() => setView("cancelled")}
        />
      </div>

      {shown.length > 0 && (
        <ul>
          {shown.map((reservation) => (
            <ReservationRow
              key={reservation.id}
              reservation={reservation}
              roomName={resolveName(reservation)}
              onCancel={setCancelling}
            />
          ))}
        </ul>
      )}

      {/* First-fetch pulse; server-rendered first paint means this is only the
          retry-from-error case (booking.md §13.4). Never the empty state. */}
      {!loaded && status === "loading" && <PulseRows />}

      {loaded &&
        status === "ready" &&
        shown.length === 0 &&
        (view === "cancelled" ? <CancelledEmpty /> : <EmptyState />)}

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

      {cancelling && (
        <CancelDialog
          reservation={cancelling}
          roomName={resolveName(cancelling)}
          onCancelled={handleCancelled}
          onClose={() => setCancelling(null)}
        />
      )}
    </div>
  );
}

/** A quiet text tab (booking.md §13.2): hairline underline on the active one, no fill. */
function ViewTab({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="inline-flex min-h-[44px] items-center"
    >
      <span
        className={cn(
          "border-b pb-1 text-[9.5px] font-medium tracking-[0.28em] uppercase transition-colors",
          active
            ? "border-champagne text-ivory"
            : "text-mist hover:text-ivory border-transparent",
        )}
      >
        {label}
      </span>
    </button>
  );
}

/** The default view empty state: a quiet line and the one link back into booking. */
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

/** The Cancelled view empty state (booking.md §13.4): the same quiet treatment, no button. */
function CancelledEmpty() {
  return (
    <div className="border-champagne/[0.12] border-t pt-8">
      <p className="text-mist text-[14px]">No cancelled reservations.</p>
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
