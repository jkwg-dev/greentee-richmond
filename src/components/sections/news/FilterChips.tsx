import { Chip } from "@/components/ui/Chip";
import type { NewsCategory } from "@/types";

export type NewsFilter = "all" | NewsCategory;

const FILTERS: { value: NewsFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "offer", label: "Offers" },
  { value: "event", label: "Events" },
  { value: "news", label: "News" },
];

/**
 * News & Offers category filter (docs §7, mockup `.filterbar`). A plain (not
 * sticky) row of the Phase-1 Chip buttons: active fills champagne with ink text,
 * idle is mist with a champagne hairline. State lives in `NewsIndex`.
 */
export function FilterChips({
  active,
  onChange,
}: {
  active: NewsFilter;
  onChange: (filter: NewsFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {FILTERS.map((filter) => (
        <Chip
          key={filter.value}
          active={active === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Chip>
      ))}
    </div>
  );
}
