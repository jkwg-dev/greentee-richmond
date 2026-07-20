"use client";

import { Chip } from "@/components/ui/Chip";
import {
  CATEGORY_FILTER_LABEL,
  type FilterableCategory,
} from "./categories";

export type TypeFilterValue = FilterableCategory | "all";

/**
 * The §11.2 type filter: `All Spaces` plus one chip per category present in
 * the data (booking.md §11.3). Single select; selecting narrows the space
 * cards. Replaces the B1 per-room space chips (§5.3). When only one category
 * is present, the caller omits the row entirely (a filter of one is noise).
 */
export function TypeFilter({
  present,
  value,
  onChange,
}: {
  present: FilterableCategory[];
  value: TypeFilterValue;
  onChange: (value: TypeFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        All Spaces
      </Chip>
      {present.map((category) => (
        <Chip
          key={category}
          active={value === category}
          onClick={() => onChange(category)}
        >
          {CATEGORY_FILTER_LABEL[category]}
        </Chip>
      ))}
    </div>
  );
}
