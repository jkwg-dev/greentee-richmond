import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { NewsEntry } from "@/types";
import type { NewsFilter } from "./FilterChips";
import { NewsCard } from "./NewsCard";

/**
 * News & Offers card grid (docs §7, mockup `.ngrid`). Three columns collapsing
 * to one below 900px (per §7; the mockup's intermediate 2-column step is
 * dropped). Every card stays mounted and toggles `hidden` so the filter never
 * re-triggers reveals; cards render unlinked (docs §15.10).
 */
export function NewsGrid({
  entries,
  activeFilter,
}: {
  entries: NewsEntry[];
  activeFilter: NewsFilter;
}) {
  return (
    <div className="grid grid-cols-3 gap-x-[26px] gap-y-11 max-[900px]:grid-cols-1 max-[900px]:gap-[34px]">
      {entries.map((entry, i) => {
        const matches =
          activeFilter === "all" || entry.category === activeFilter;
        return (
          <Reveal
            key={entry.id}
            as="div"
            delay={(i % 3) * 80}
            className={cn(!matches && "hidden")}
          >
            <NewsCard entry={entry} showLine />
          </Reveal>
        );
      })}
    </div>
  );
}
