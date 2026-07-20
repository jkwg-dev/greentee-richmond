"use client";

import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { bookingCreateEnabled } from "@/lib/booking/config";
import {
  formatCad,
  formatDateLong,
  formatDuration,
  formatSlotRange,
} from "@/lib/booking/format";
import { selectionSummary } from "@/lib/booking/selection";
import { cn } from "@/lib/utils";
import type { BookingRoom, BookingSelection } from "@/types/booking";

/** The §7 call-to-hold note; the phone substitutes in as a `tel:` link. */
function CallNote({ phone, className }: { phone: string; className?: string }) {
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  return (
    <p className={cn("text-mist text-[12px] leading-[1.8]", className)}>
      Online reservations are opening soon. To hold a time today, call{" "}
      <a
        href={telHref}
        className="text-ivory/90 hover:text-ivory transition-colors"
      >
        {phone}
      </a>
      .
    </p>
  );
}

/** The disabled Reserve button (booking.md §5.5): gated by the flag, still 44px and tabbable. */
function ReserveButton({ className }: { className?: string }) {
  const disabled = !bookingCreateEnabled;
  return (
    <Button
      variant="solid"
      aria-disabled={disabled || undefined}
      className={cn("min-h-[44px]", disabled && "opacity-40", className)}
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
  phone,
  variant,
}: {
  selection: BookingSelection | null;
  room: BookingRoom | null;
  partySize: number;
  date: string;
  phone: string;
  variant: "panel" | "bar";
}) {
  const summary = selection ? selectionSummary(selection) : null;
  const range = summary
    ? formatSlotRange(summary.startsAt, summary.endsAt)
    : null;
  const priceDetail = summary
    ? `${formatDuration(summary.slotCount)} · Before GST and PST`
    : null;

  if (variant === "bar") {
    return (
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
        <ReserveButton />
        {!bookingCreateEnabled && (
          <CallNote phone={phone} className="w-full" />
        )}
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
      <ReserveButton className="mt-8 w-full" />
      {!bookingCreateEnabled && <CallNote phone={phone} className="mt-4" />}
    </div>
  );
}
