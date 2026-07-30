import type { Metadata } from "next";
import { BanquetFacts } from "@/components/sections/BanquetFacts";
import { BespokeMenus } from "@/components/sections/BespokeMenus";
import { DiningBand } from "@/components/sections/DiningBand";
import { getRestaurant } from "@/lib/content";

export const metadata: Metadata = {
  title: "Banquet",
  description:
    "Private rooms, dedicated service, and bespoke banquet menus composed for the table.",
};

/**
 * `/banquet` (banquet mockup v6): hero band, Banquet Services facts and
 * occasions beside the photo slot, and the Bespoke Menus panel.
 */
export default async function BanquetPage() {
  const restaurant = await getRestaurant();
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
