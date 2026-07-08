import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FactRows } from "@/components/ui/FactRows";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { BOOK_A_TABLE_HREF } from "@/lib/site";
import type { RestaurantPreview } from "@/types";

const EYEBROW = "Dining at the Center";

/**
 * S5 Dining preview (docs §5.1, mockup `#dining`). Jade is scoped to this
 * section: a jade-washed band and a jade pending frame beside the Crystal Jade
 * Palace credentials. Reads a slice of the `restaurant` singleton (§8.4). Grid
 * stacks below 900px, image first.
 */
export function DiningPreview({
  restaurant,
}: {
  restaurant: RestaurantPreview;
}) {
  return (
    <section
      id="dining"
      className="dining-band relative px-[6vw] py-[130px] max-[900px]:py-24"
    >
      <div className="grid grid-cols-[1.1fr_1fr] items-center gap-[6vw] max-[900px]:grid-cols-1 max-[900px]:gap-11">
        <Reveal as="div">
          <PhotoFrame
            tint="jade"
            showMark
            label={{
              kicker: "Image placeholder",
              name: "Crystal Jade Palace · Dining Room",
            }}
            tag="Replace with restaurant photography"
            className="aspect-[4/3]"
          />
        </Reveal>

        <div>
          <Reveal as="div">
            <Eyebrow>{EYEBROW}</Eyebrow>
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-6 font-serif text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.1] font-medium tracking-[0.004em]"
          >
            {restaurant.name}
          </Reveal>
          <Reveal
            as="p"
            delay={150}
            className="text-mist mt-[18px] max-w-[480px] text-[14.5px]"
          >
            {restaurant.lede}
          </Reveal>
          <Reveal as="div" delay={200}>
            <FactRows facts={restaurant.credentials} className="mt-[38px] mb-11" />
          </Reveal>
          <Reveal as="div" delay={410} className="flex flex-wrap gap-3.5">
            <Button href="/dining">Discover Crystal Jade</Button>
            <Button href={BOOK_A_TABLE_HREF} variant="ghost">
              Book a Table
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
