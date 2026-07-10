import type { Metadata } from "next";
import { DiningBand } from "@/components/sections/dining/DiningBand";
import { KitchenPhilosophy } from "@/components/sections/dining/KitchenPhilosophy";
import { StoryHeritage } from "@/components/sections/dining/StoryHeritage";
import { StoryRichmond } from "@/components/sections/dining/StoryRichmond";
import { restaurant as restaurantFallback } from "@/lib/mock/restaurant";
import { getRestaurant } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Our Story · Crystal Jade Palace",
  description:
    "From a single Cantonese kitchen to one of Asia's most respected names in fine dining, now arriving in Richmond.",
};

/**
 * `/dining/story` (docs §8.3): hero band, Heritage and the global footprint,
 * Why Richmond Why Now, and the Kitchen Philosophy cards.
 */
export default async function StoryPage() {
  const restaurant = (await getRestaurant()) ?? restaurantFallback;
  return (
    <>
      <DiningBand
        eyebrow="Our Story"
        title={"From a single kitchen\nto the world."}
        frame={{
          tint: "emerald",
          kicker: "Image placeholder",
          name: "Crystal Jade Brand Imagery",
          tag: "Replace with brand photography per brand guide",
        }}
      />
      <StoryHeritage story={restaurant.story} />
      <StoryRichmond story={restaurant.story} />
      <KitchenPhilosophy cards={restaurant.story.philosophy} />
    </>
  );
}
