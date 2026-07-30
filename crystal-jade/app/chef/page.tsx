import type { Metadata } from "next";
import { ChefIntro } from "@/components/sections/ChefIntro";
import { getRestaurant } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Chef",
  description:
    "A Michelin-starred kitchen led by twenty-three years across five-star kitchens, from China to Vancouver.",
};

/**
 * `/chef` (chef mockup v6): kitchen-setting portrait slot, the three
 * gold-gradient credential bars, His Story with Notable Moments, and the
 * In His Own Words quote block.
 */
export default async function ChefPage() {
  const restaurant = await getRestaurant();
  return <ChefIntro chef={restaurant.chef} />;
}
