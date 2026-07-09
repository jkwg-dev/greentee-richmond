"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { NewsEntry } from "@/types";
import { FilterChips, type NewsFilter } from "./FilterChips";
import { NewsFeature } from "./NewsFeature";
import { NewsGrid } from "./NewsGrid";

/**
 * `/news` index body (docs §7). Holds the category filter and applies it to both
 * the featured entry and the grid, toggling `hidden` (matching the mockup's
 * client filter) so reveals never re-fire. When nothing is visible, a quiet
 * empty note renders beneath the still-present filter bar.
 */
export function NewsIndex({ entries }: { entries: NewsEntry[] }) {
  const [filter, setFilter] = useState<NewsFilter>("all");

  const featured = entries[0];
  const cards = entries.slice(1);
  const matches = (entry: NewsEntry) =>
    filter === "all" || entry.category === filter;
  const visibleCount = entries.filter(matches).length;

  return (
    <>
      <Reveal
        as="div"
        delay={280}
        className="mx-auto max-w-[1360px] px-[6vw] pt-[34px] pb-[54px]"
      >
        <FilterChips active={filter} onChange={setFilter} />
      </Reveal>

      <div className="mx-auto max-w-[1360px] px-[6vw] pb-[30px]">
        {featured && (
          <Reveal as="div" className={cn(!matches(featured) && "hidden")}>
            <NewsFeature
              entry={featured}
              titleAs="h2"
              className="mb-[76px] max-[900px]:mb-[60px]"
            />
          </Reveal>
        )}

        <NewsGrid entries={cards} activeFilter={filter} />

        {visibleCount === 0 && (
          <p className="text-mist py-[60px] text-[14.5px]">
            No entries to show just yet.
          </p>
        )}
      </div>
    </>
  );
}
