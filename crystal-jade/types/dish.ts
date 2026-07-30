import type { InterimImage, PhotoTint } from "./media";

/**
 * Menu dish. Dishes are separate entries so seasonal menu updates stay pure
 * content edits; they feed the `/menu` grid and the landing signature trio.
 * Imagery is a pending frame until editorial dish photography lands.
 */

export type DishCategory =
  "dimsum" | "roast" | "seafood" | "mains" | "desserts";

export type Dish = {
  id: string;
  name: string;
  /** Chinese dish name, rendered in the `--font-zh` system stack. */
  zhName: string;
  /** One line under the name, e.g. "Lacquered skin, carved to order." */
  line: string;
  category: DishCategory;
  order: number;
  /** Editorial photo; absent until the tenant delivers photography. */
  image?: InterimImage;
  seasonal?: boolean;
  available?: boolean;
  /** Placeholder frame descriptor until the image field is filled. */
  frame: { tint: PhotoTint };
};

/** Chip / card labels for the five menu categories. */
export const DISH_CATEGORY_LABEL: Record<DishCategory, string> = {
  dimsum: "Dim Sum",
  roast: "Roasted Meats",
  seafood: "Seafood",
  mains: "Mains",
  desserts: "Desserts",
};
