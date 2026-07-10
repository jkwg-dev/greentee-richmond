import type { Metadata } from "next";
import { BanquetFacts } from "@/components/sections/dining/BanquetFacts";
import { BespokeMenus } from "@/components/sections/dining/BespokeMenus";
import { DiningBand } from "@/components/sections/dining/DiningBand";
import { restaurant as restaurantFallback } from "@/lib/mock/restaurant";
import { getRestaurant } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Banquet · Crystal Jade Palace",
  description:
    "Private rooms, dedicated service, and bespoke banquet menus composed for the table.",
};

/**
 * `/dining/banquet` (docs §8.3): hero band, Banquet Services facts and
 * occasions beside the photo slot, and the Bespoke Menus panel.
 */
export default async function BanquetPage() {
  const restaurant = (await getRestaurant()) ?? restaurantFallback;
  return (
    <>
      <DiningBand
        eyebrow="Banquet & Private Dining"
        title={"Rooms for the occasions\nthat *matter*."}
        line="Private rooms, dedicated service, and menus composed for the table."
        frame={{
          tint: "emerald",
          kicker: "Image placeholder",
          name: "Banquet Hall · Private Dining Room",
          tag: "Replace with final photography",
        }}
      />
      <BanquetFacts banquet={restaurant.banquet} />
      <BespokeMenus banquet={restaurant.banquet} />
    </>
  );
}
