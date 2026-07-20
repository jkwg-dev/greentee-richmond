"use client";

import { Chip } from "@/components/ui/Chip";
import { formatDateChip, formatDateLong } from "@/lib/booking/format";

/** Small tracked group label above each control row (booking.md §5.3). */
function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-mist mb-3 text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase">
      {children}
    </p>
  );
}

/**
 * The top control rows (booking.md §5.3, §11.1): the 14 day date strip in
 * venue time and party sizes to the largest capacity in the data. The type
 * filter that replaced the B1 space chips lives in the browse layout's left
 * column (§11.2), not here. All single select `Chip` buttons; date chips
 * carry the full date as `aria-label`.
 */
export function BookingControls({
  dates,
  date,
  partySize,
  maxPartySize,
  onDateChange,
  onPartySizeChange,
}: {
  dates: string[];
  date: string;
  partySize: number;
  maxPartySize: number;
  onDateChange: (date: string) => void;
  onPartySizeChange: (partySize: number) => void;
}) {
  return (
    <div>
      <div>
        <ControlLabel>Date</ControlLabel>
        <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {dates.map((day, index) => (
            <Chip
              key={day}
              active={day === date}
              aria-label={formatDateLong(day)}
              onClick={() => onDateChange(day)}
              className="shrink-0 px-4"
            >
              {index === 0
                ? "Today"
                : index === 1
                  ? "Tomorrow"
                  : formatDateChip(day)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <ControlLabel>Party</ControlLabel>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxPartySize }, (_, index) => index + 1).map(
            (size) => (
              <Chip
                key={size}
                active={size === partySize}
                aria-label={`Party of ${size}`}
                onClick={() => onPartySizeChange(size)}
                className="min-w-[44px] justify-center px-0"
              >
                {size}
              </Chip>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
