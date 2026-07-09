import type { Metadata } from "next";
import { ChefIntro } from "@/components/sections/dining/ChefIntro";
import { restaurant } from "@/lib/mock/restaurant";

export const metadata: Metadata = {
  title: "The Chef · Crystal Jade Palace",
  description:
    "A Michelin-starred kitchen led by twenty-three years across five-star kitchens, from China to Vancouver.",
};

/**
 * `/dining/chef` (docs §8.3): kitchen-setting portrait slot, the three
 * gold-gradient credential bars, His Story with Notable Moments, and the
 * In His Own Words quote block.
 */
export default function ChefPage() {
  return <ChefIntro chef={restaurant.chef} />;
}
