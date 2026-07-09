import { Reveal } from "@/components/motion/Reveal";
import { FactRows } from "@/components/ui/FactRows";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import type { RestaurantBanquet } from "@/types";
import { DiningHead } from "./DiningHead";

/**
 * Banquet Services (docs §8.3 banquet item 2, mockup section 2): the service
 * narrative with fact rows and the occasions list beside the banquet-table
 * photo slot.
 */
export function BanquetFacts({ banquet }: { banquet: RestaurantBanquet }) {
  const rows = [
    ...banquet.facts,
    { label: "Occasions", value: banquet.occasions.join(" · ") },
  ];

  return (
    <section className="dine-sec">
      <div className="dine-split">
        <div>
          <DiningHead
            eyebrow="Banquet Services"
            title={"Composed around\nthe *table*."}
          />
          <Reveal
            as="p"
            delay={180}
            className="text-ivory/90 mt-[26px] max-w-[520px] font-serif text-[19px] leading-[1.7]"
          >
            {banquet.copy}
          </Reveal>
          <Reveal as="div" delay={240}>
            <FactRows accent="jade" facts={rows} className="mt-[34px] mb-[38px]" />
          </Reveal>
        </div>
        <Reveal as="div" delay={200}>
          <PhotoFrame
            tint="champagne"
            showMark
            label={{ kicker: "Food image", name: "Banquet Table" }}
            tag="Replace with final photography"
            className="aspect-[4/5] max-h-[560px] max-[900px]:max-h-[440px]"
          />
        </Reveal>
      </div>
    </section>
  );
}
