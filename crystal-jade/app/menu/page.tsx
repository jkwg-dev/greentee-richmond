import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DiningBand } from "@/components/sections/DiningBand";
import { DishGrid } from "@/components/sections/DishGrid";
import { getDishes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Signature Cantonese dishes across dim sum, roasted meats, seafood, mains, and desserts, changing with the seasons.",
};

/**
 * `/menu` (menu mockup v6): hero band over the category-filtered dish grid.
 */
export default async function MenuPage() {
  const dishes = await getDishes();
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
