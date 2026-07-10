import type { Metadata } from "next";
import { ChefIntro } from "@/components/sections/dining/ChefIntro";
import { getRestaurant } from "@/sanity/lib/queries";

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
export default async function ChefPage() {
  const restaurant = await getRestaurant();
  return <ChefIntro chef={restaurant.chef} />;
}
