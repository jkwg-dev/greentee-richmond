import type { Metadata } from "next";
import { ReserveBlock } from "@/components/sections/dining/ReserveBlock";
import { restaurant } from "@/lib/mock/restaurant";

export const metadata: Metadata = {
  title: "Reserve · Crystal Jade Palace",
  description:
    "Book a table at Crystal Jade Palace by telephone, WeChat, or online, for lunch and dinner daily.",
};

/**
 * `/dining/reserve` (docs §8.3): contact rows, the Book a Table CTA, the
 * banquet crosslink, and the OpenTable embed placeholder (§15.3).
 */
export default function ReservePage() {
  return <ReserveBlock reserve={restaurant.reserve} />;
}
