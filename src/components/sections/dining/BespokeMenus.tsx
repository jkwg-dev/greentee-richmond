import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import type { RestaurantBanquet } from "@/types";
import { DiningHead } from "./DiningHead";

/**
 * Bespoke Menus (docs §8.3 banquet item 3, mockup `.banq-box`): the jade panel
 * with the composed-course photo slot, the Per Person / Per Table rows
 * (pricing on enquiry), and the Enquire Now CTA.
 */
export function BespokeMenus({ banquet }: { banquet: RestaurantBanquet }) {
  const rows = banquet.menus.map((menu) => ({
    label: menu.label,
    value: menu.line,
    detail: menu.detail,
  }));

  return (
    <section className="dine-sec">
      <div className="jade-panel dine-box">
        <Reveal as="div">
          <PhotoFrame
            tint="jade"
            showMark
            label={{ kicker: "Image placeholder", name: "Composed Course" }}
            tag="Replace with final photography"
            className="aspect-[4/3]"
          />
        </Reveal>
        <div>
          <DiningHead eyebrow="Bespoke Menus" title={"Two ways to\n*compose*."} />
          <Reveal as="div" delay={160}>
            <FactRows accent="jade" facts={rows} className="mt-[34px] mb-[38px]" />
          </Reveal>
          <Reveal as="div" delay={280}>
            <Button href={banquet.enquiryTarget}>Enquire Now</Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
