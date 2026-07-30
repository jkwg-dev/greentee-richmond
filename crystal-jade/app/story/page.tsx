import type { Metadata } from "next";
import { DiningBand } from "@/components/sections/DiningBand";
import { KitchenPhilosophy } from "@/components/sections/KitchenPhilosophy";
import { StoryHeritage } from "@/components/sections/StoryHeritage";
import { StoryRichmond } from "@/components/sections/StoryRichmond";
import { getRestaurant } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "From a single Cantonese kitchen to one of Asia's most respected names in fine dining, now arriving in Richmond.",
};

/**
 * `/story` (story mockup v6): hero band, Heritage and the global footprint,
 * Why Richmond Why Now, and the Kitchen Philosophy cards.
 */
export default async function StoryPage() {
  const restaurant = await getRestaurant();
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
