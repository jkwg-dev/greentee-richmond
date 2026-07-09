import { Chip } from "@/components/ui/Chip";
import { DISH_CATEGORY_LABEL, type DishCategory } from "@/types";

export type DishFilter = "all" | DishCategory;

const FILTERS: { value: DishFilter; label: string }[] = [
  { value: "all", label: "All Dishes" },
  ...(Object.keys(DISH_CATEGORY_LABEL) as DishCategory[]).map((category) => ({
    value: category,
    label: DISH_CATEGORY_LABEL[category],
  })),
];

/**
 * Menu category chips (docs §8.3 menu item 2, mockup `.chips`): the jade Chip
 * variant, scoped to Crystal Jade content (§2.1). State lives in `DishGrid`.
 */
export function MenuChips({
  active,
  onChange,
}: {
  active: DishFilter;
  onChange: (filter: DishFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {FILTERS.map((filter) => (
        <Chip
          key={filter.value}
          accent="jade"
          active={active === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Chip>
      ))}
    </div>
  );
}
