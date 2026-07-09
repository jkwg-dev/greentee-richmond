import { Reveal } from "@/components/motion/Reveal";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import type { RestaurantStory } from "@/types";
import { DiningHead } from "./DiningHead";

/**
 * Why Richmond, Why Now (docs §8.3 story item 3, mockup section 3): the
 * homecoming narrative beside the Richmond photo slot, image first.
 */
export function StoryRichmond({ story }: { story: RestaurantStory }) {
  return (
    <section className="dine-sec">
      <div className="dine-split img-first">
        <Reveal as="div">
          <PhotoFrame
            tint="champagne"
            showMark
            label={{
              kicker: "Image placeholder",
              name: "Richmond · The Vancouver Chapter",
            }}
            tag="Replace with final photography"
            className="aspect-[4/5] max-h-[560px] max-[900px]:max-h-[440px]"
          />
        </Reveal>
        <div>
          <DiningHead
            eyebrow="Why Richmond, Why Now"
            title={"Not an introduction.\nA *homecoming*."}
          />
          <Reveal
            as="p"
            delay={180}
            className="text-ivory/90 mt-[26px] max-w-[520px] font-serif text-[19px] leading-[1.7]"
          >
            {story.richmond.lead}
          </Reveal>
          {story.richmond.body.map((paragraph, index) => (
            <Reveal
              key={index}
              as="p"
              delay={260 + index * 60}
              className="text-mist mt-5 max-w-[520px] text-[14px]"
            >
              {paragraph}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
