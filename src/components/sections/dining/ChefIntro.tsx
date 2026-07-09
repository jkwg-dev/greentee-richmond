import { Reveal } from "@/components/motion/Reveal";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import type { RestaurantChef } from "@/types";
import { ChefQuote } from "./ChefQuote";
import { CredBars } from "./CredBars";
import { DiningHead } from "./DiningHead";

const NOTE_HEADING_CLASS =
  "text-jade-text mb-3.5 text-[9.5px] leading-none font-medium tracking-[0.28em] uppercase";

/**
 * The Chef page body (docs §8.3, mockup `.chef-grid`): sticky kitchen-setting
 * portrait slot beside the intro, credential bars, His Story with the Notable
 * Moments list, and the quote block.
 */
export function ChefIntro({ chef }: { chef: RestaurantChef }) {
  return (
    <section className="dine-sec">
      <div className="grid grid-cols-[1fr_1.15fr] items-start gap-[5vw] max-[900px]:grid-cols-1 max-[900px]:gap-11">
        <Reveal as="div" className="sticky top-[150px] max-[1024px]:static">
          <PhotoFrame
            tint="champagne"
            showMark
            label={{
              kicker: "Portrait placeholder",
              name: "Chef Portrait · Kitchen Setting",
            }}
            tag="Kitchen setting, not a studio headshot"
            className="aspect-[4/5]"
          />
        </Reveal>

        <div>
          <DiningHead eyebrow="The Chef" title={chef.intro} />

          <CredBars awards={chef.awards} />

          <Reveal as="div" delay={380} className="mt-9">
            <h4 className={NOTE_HEADING_CLASS}>His Story</h4>
            <p className="text-mist max-w-[520px] text-[14px]">{chef.bio}</p>
          </Reveal>

          <ChefQuote quote={chef.quote} />

          <Reveal as="div" delay={460} className="mt-9">
            <h4 className={NOTE_HEADING_CLASS}>Notable Moments</h4>
            <ul>
              {chef.moments.map((moment) => (
                <li
                  key={moment}
                  className="border-jade/35 text-mist before:bg-champagne relative border-t py-[11px] pl-7 text-[13.5px] before:absolute before:top-[21px] before:left-0 before:h-px before:w-3.5"
                >
                  {moment}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
