"use client";

import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import {
  formatCad,
  formatDateLong,
  formatDuration,
  formatSlotRange,
} from "@/lib/booking/format";
import { selectionSummary } from "@/lib/booking/selection";
import { cn } from "@/lib/utils";
import type { BookingRoom, BookingSelection } from "@/types/booking";

/**
 * The reserve affordance, travelling as one prop because its three parts are
 * one decision made once on the server: whether the flow is open (§5.5),
 * whether the policy caps a user at one a day (§12.4), and what to run.
 */
export type ReserveAffordance = {
  createEnabled: boolean;
  showDailyCapNote: boolean;
  onReserve: () => void;
};

/** The §7 note that stands in until the reserve flow is enabled. */
function CallNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-mist text-[12px] leading-[1.8]", className)}>
      Online reservations are opening soon.
    </p>
  );
}

/** The §12.8 line, so the cap is never a surprise at submit (booking.md §12.4). */
function DailyCapNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-mist text-[12px] leading-[1.8]", className)}>
      One reservation per day. Booking a second time replaces today&apos;s.
    </p>
  );
}

/**
 * The Reserve action (booking.md §5.5, §12.4). Disabled by the flag through
 * B3b and still disabled with nothing selected; enabled it opens the reserve
 * flow. Either way it stays 44px and in the tab order.
 */
function ReserveButton({
  enabled,
  onReserve,
  className,
}: {
  enabled: boolean;
  onReserve?: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="solid"
      aria-disabled={enabled ? undefined : true}
      onClick={enabled ? onReserve : undefined}
      className={cn("min-h-[44px]", !enabled && "opacity-40", className)}
    >
      Reserve This Time
    </Button>
  );
}

/**
 * The selection summary (booking.md §5.5, §11.1 as amended). `panel` is the
 * desktop detail-pane form (full FactRows over the range); `bar` is the
 * condensed mobile bottom-bar form. Both carry the range, the count-based
 * duration, and the summed price; the Reserve button stays disabled through
 * B3b. Not a live region itself: BookingPanel owns a single SR-only announcer
 * so the two forms never announce twice.
 */
export function BookingSummary({
  selection,
  room,
  partySize,
  date,
  variant,
  reserve,
}: {
  selection: BookingSelection | null;
  room: BookingRoom | null;
  partySize: number;
  date: string;
  variant: "panel" | "bar";
  reserve: ReserveAffordance;
}) {
  const { createEnabled, showDailyCapNote, onReserve } = reserve;
  // Nothing to reserve without a selection, whatever the flag says.
  const canReserve = createEnabled && selection !== null;
  const summary = selection ? selectionSummary(selection) : null;
  const range = summary
    ? formatSlotRange(summary.startsAt, summary.endsAt)
    : null;
  const priceDetail = summary
    ? `${formatDuration(summary.slotCount)} · Before GST and PST`
    : null;

  if (variant === "bar") {
    // The cap and call notes sit on their own row above the details, never
    // wrapped beneath the button where the bar's edge would clip them.
    return (
      <div className="flex flex-col gap-3">
        {showDailyCapNote && <DailyCapNote />}
        {!createEnabled && <CallNote />}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            {summary ? (
              <>
                <p className="text-ivory text-[14px]">{range}</p>
                <p className="text-mist mt-1 text-[11.5px]">
                  {formatCad(summary.priceCents)} · {priceDetail}
                </p>
              </>
            ) : (
              <p className="text-mist text-[13.5px]">
                Select a time to see the details here.
              </p>
            )}
          </div>
          <ReserveButton enabled={canReserve} onReserve={onReserve} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {summary ? (
        <FactRows
          facts={[
            { label: "Date", value: formatDateLong(date) },
            { label: "Time", value: range },
            { label: "Space", value: room?.name ?? "" },
            { label: "Party", value: String(partySize) },
            {
              label: "Price",
              value: formatCad(summary.priceCents),
              detail: priceDetail ?? undefined,
            },
          ]}
        />
      ) : (
        <p className="text-mist border-champagne/[0.12] border-t pt-[18px] text-[13.5px]">
          Select a time to see the details here.
        </p>
      )}
      {showDailyCapNote && <DailyCapNote className="mt-8" />}
      <ReserveButton
        enabled={canReserve}
        onReserve={onReserve}
        className={cn("w-full", showDailyCapNote ? "mt-4" : "mt-8")}
      />
      {!createEnabled && <CallNote className="mt-4" />}
    </div>
  );
}
