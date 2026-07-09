"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Dish } from "@/types";
import { DishCard } from "./DishCard";
import { MenuChips, type DishFilter } from "./MenuChips";

/**
 * Client-filtered dish grid (docs §8.3 menu item 2, mockup `.dishes`). Every
 * card stays mounted and toggles `hidden` (matching the mockup filter) so
 * reveals never re-fire; two columns, one below 760px.
 */
export function DishGrid({ dishes }: { dishes: Dish[] }) {
  const [filter, setFilter] = useState<DishFilter>("all");
  const ordered = [...dishes].sort((a, b) => a.order - b.order);

  return (
    <>
      <Reveal as="div" className="mb-12">
        <MenuChips active={filter} onChange={setFilter} />
      </Reveal>

      <div className="grid grid-cols-2 gap-x-8 gap-y-11 max-[760px]:grid-cols-1">
        {ordered.map((dish, index) => (
          <Reveal
            as="article"
            key={dish.id}
            delay={(index % 2) * 80}
            className={cn(
              filter !== "all" && dish.category !== filter && "hidden",
            )}
          >
            <DishCard dish={dish} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
