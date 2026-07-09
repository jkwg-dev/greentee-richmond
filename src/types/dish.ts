import type { InterimImage, PhotoTint } from "./media";

/**
 * Crystal Jade Palace menu dish (docs §4.1). Dishes are separate `dish`
 * documents so seasonal menu updates stay pure content edits (§8.4); they feed
 * the `/dining/menu` grid and the `/dining` signature trio. Imagery is a
 * pending frame until editorial dish photography lands (§11.6).
 */

export type DishCategory =
  | "dimsum"
  | "roast"
  | "seafood"
  | "mains"
  | "desserts";

export type Dish = {
  id: string;
  name: string;
  /** Chinese dish name, rendered in the `--font-zh` system stack (docs §2.2). */
  zhName: string;
  /** One line under the name, e.g. "Lacquered skin, carved to order." */
  line: string;
  category: DishCategory;
  order: number;
  /** Editorial photo; absent until the tenant delivers photography (§8.3). */
  image?: InterimImage;
  seasonal?: boolean;
  available?: boolean;
  /** Placeholder frame descriptor until the image field is filled (docs §11.6). */
  frame: { tint: PhotoTint };
};

/** Chip / card labels for the five menu categories (docs §8.3). */
export const DISH_CATEGORY_LABEL: Record<DishCategory, string> = {
  dimsum: "Dim Sum",
  roast: "Roasted Meats",
  seafood: "Seafood",
  mains: "Mains",
  desserts: "Desserts",
};
