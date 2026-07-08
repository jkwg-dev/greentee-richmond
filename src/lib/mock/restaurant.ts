import type { RestaurantPreview } from "@/types";

/**
 * Crystal Jade Palace preview slice (docs §8.4), feeding the Home dining preview
 * (docs §5.1 S5). Copy ported verbatim from the mockup. In Phase 6 this comes
 * from the `restaurant` singleton; the dining-room photo stays a pending frame
 * until restaurant photography lands (docs §11.6).
 */
export const restaurantPreview: RestaurantPreview = {
  name: "Crystal Jade Palace",
  lede: "Cantonese fine dining on the promenade. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen.",
  credentials: [
    {
      label: "Michelin",
      value: "Vancouver Michelin Star, four consecutive years",
      detail: "2022 to 2025",
    },
    {
      label: "Accolades",
      value: "North America's Best Chinese Cuisine Restaurant, 2025",
      detail: "Supreme Gold, World Championship of Chinese Cuisine 2024",
    },
    {
      label: "Private Dining",
      value: "Private rooms and bespoke banquet menus",
      detail: "Corporate dining by arrangement",
    },
  ],
};
