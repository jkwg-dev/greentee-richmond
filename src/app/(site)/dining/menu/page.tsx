import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DiningBand } from "@/components/sections/dining/DiningBand";
import { DishGrid } from "@/components/sections/dining/DishGrid";
import { dishes } from "@/lib/mock/dishes";

export const metadata: Metadata = {
  title: "Menu · Crystal Jade Palace",
  description:
    "Signature Cantonese dishes across dim sum, roasted meats, seafood, mains, and desserts, changing with the seasons.",
};

/**
 * `/dining/menu` (docs §8.3): hero band over the category-filtered dish grid.
 * Static data from the `dish` mock; CMS-driven in Phase 6 (§4.2).
 */
export default function MenuPage() {
  return (
    <>
      <DiningBand
        eyebrow="The Menu"
        title="Signature *dishes*."
        line="Dishes that change with the seasons. Technique that does not."
        frame={{
          tint: "champagne",
          kicker: "Full-width banner",
          name: "Signature Dish · Editorial Photography",
          tag: "Replace with final dish photography",
        }}
      />
      <section className="dine-sec">
        <DishGrid dishes={dishes} />
        <Reveal
          as="p"
          className="text-champagne-bright/85 mt-16 text-center font-serif text-base italic"
        >
          Our menu evolves with the seasons and the chef&apos;s current
          inspiration.
        </Reveal>
      </section>
    </>
  );
}
