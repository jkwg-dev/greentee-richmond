import type { Metadata } from "next";
import { ReserveBlock } from "@/components/sections/ReserveBlock";
import { getRestaurant } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reserve",
  description:
    "Book a table at Crystal Jade Palace by telephone, WeChat, or online, for lunch and dinner daily.",
};

/**
 * `/reserve` (reserve mockup v6): contact rows, the Book a Table CTA, the
 * banquet crosslink, and the OpenTable embed placeholder.
 */
export default async function ReservePage() {
  const restaurant = await getRestaurant();
  return <ReserveBlock reserve={restaurant.reserve} />;
}
