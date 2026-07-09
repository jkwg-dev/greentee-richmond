import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { BOOK_A_TABLE_HREF } from "@/lib/site";
import { DINING_SLOT_TINTS } from "@/lib/tints";
import type { Dish } from "@/types";
import { DiningHead } from "./DiningHead";

/**
 * Signature Dishes trio (docs §8.3 `/dining` item 3, mockup `.trio`): three
 * name-only dish frames and the Book a Table / View the Full Menu CTAs.
 */
export function SignatureTrio({ dishes }: { dishes: Dish[] }) {
  return (
    <section className="dine-sec">
      <DiningHead
        eyebrow="Signature Dishes"
        title="From the *kitchen*."
        className="mb-12"
      />

      <div className="grid grid-cols-3 gap-7 max-[760px]:grid-cols-1 max-[760px]:gap-10">
        {dishes.map((dish, index) => (
          <Reveal as="figure" key={dish.id} delay={index * 120}>
            <PhotoFrame
              tint={DINING_SLOT_TINTS[index % DINING_SLOT_TINTS.length]}
              label={{ kicker: "Photo", name: dish.name }}
              className="aspect-[4/5]"
            />
            <figcaption className="mt-[18px] text-center font-serif text-[20px] font-medium tracking-[0.02em]">
              {dish.name}
            </figcaption>
          </Reveal>
        ))}
      </div>

      <Reveal as="div" className="mt-14 flex flex-wrap justify-center gap-3.5">
        <Button href={BOOK_A_TABLE_HREF}>Book a Table</Button>
        <Button href="/dining/menu" variant="ghost">
          View the Full Menu
        </Button>
      </Reveal>
    </section>
  );
}
