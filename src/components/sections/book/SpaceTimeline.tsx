"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatSlotRange } from "@/lib/booking/format";
import { isSlotSelected } from "@/lib/booking/selection";
import { buildTimeline } from "@/lib/booking/timeline";
import { cn } from "@/lib/utils";
import type { BookingSelection, BookingSlot } from "@/types/booking";
import { TimelineCell } from "./TimelineCell";

/**
 * The §11.4 vertical timeline for one space: available cells top to bottom,
 * with a collapsed `Unavailable` divider for each run of missing time
 * (one divider regardless of length; its span reads through `formatSlotRange`
 * on the neighboring slots' verbatim strings). The column scrolls internally
 * with top and bottom fades when it overflows, momentum scroll on touch, and
 * auto-scrolls to the first available cell whenever the space opens. Every
 * displayed time is Intl on the verbatim strings; the divider blockCount comes
 * from the pure timeline helper, never date math here.
 */
export function SpaceTimeline({
  slots,
  selection,
  onTapSlot,
  maxHeightClass,
  id,
}: {
  slots: BookingSlot[];
  selection: BookingSelection | null;
  onTapSlot: (slot: BookingSlot) => void;
  /** Viewport-keyed max-height so the pane never outgrows the screen (§11.4). */
  maxHeightClass: string;
  id?: string;
}) {
  const items = buildTimeline(slots);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ top: false, bottom: false });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setFade({
      top: el.scrollTop > 1,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    });
  }, []);

  // On open (a new space, or a refetch that swaps the slot set) reset to the
  // first available cell, then remeasure the fades. Keyed on the space and its
  // first slot so re-selecting the same space still returns to the top.
  const openKey = `${slots[0]?.roomId ?? ""}|${slots[0]?.startsAt ?? ""}`;
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
    measure();
  }, [openKey, measure]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="relative">
      <div
        id={id}
        ref={scrollRef}
        onScroll={measure}
        className={cn(
          "flex touch-pan-y flex-col gap-1.5 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
          maxHeightClass,
        )}
      >
        {items.map((item) =>
          item.kind === "slot" ? (
            <TimelineCell
              key={`${item.slot.roomId}-${item.slot.startsAt}`}
              slot={item.slot}
              active={isSlotSelected(selection, item.slot)}
              onTap={() => onTapSlot(item.slot)}
            />
          ) : (
            <div
              key={`gap-${item.before.endsAt}`}
              aria-hidden="true"
              className="flex min-h-[32px] items-center justify-between gap-3 px-4 opacity-40"
            >
              <span className="text-mist text-[9.5px] leading-none font-medium tracking-[0.24em] uppercase">
                Unavailable
              </span>
              <span className="text-mist text-[10px] tabular-nums">
                {formatSlotRange(item.before.endsAt, item.after.startsAt)}
              </span>
            </div>
          ),
        )}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "from-noir pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b to-transparent transition-opacity duration-200",
          fade.top ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "from-noir pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent transition-opacity duration-200",
          fade.bottom ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
