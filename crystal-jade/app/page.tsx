import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DiningHero } from "@/components/sections/DiningHero";
import { PrivatePreview } from "@/components/sections/PrivatePreview";
import { SignatureTrio } from "@/components/sections/SignatureTrio";
import { getRestaurant, getSignatureDishes } from "@/lib/content";

export const metadata: Metadata = {
  description:
    "Cantonese fine dining at GreenTee Richmond Center. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen.",
};

/**
 * Landing page (dining mockup v6): full-screen hero, restaurant intro, the
 * Signature Dishes trio, and the Private Dining preview.
 */
export default async function HomePage() {
  const [restaurant, trio] = await Promise.all([
    getRestaurant(),
    getSignatureDishes(),
  ]);
  return (
    <>
      <DiningHero
        title={restaurant.name}
        tagline={restaurant.tagline}
        media={restaurant.heroMedia}
      />

      <section id="intro" className="dine-sec text-center">
        <div className="mx-auto max-w-[820px]">
          <Reveal
            as="p"
            className="text-ivory/90 font-serif text-[clamp(1.45rem,2.6vw,2rem)] leading-[1.5]"
          >
            {restaurant.intro.lede}
          </Reveal>
          <Reveal
            as="p"
            delay={140}
            className="text-mist mx-auto mt-5 max-w-[620px] text-[14.5px]"
          >
            {restaurant.intro.support}
          </Reveal>
        </div>
      </section>

      <SignatureTrio dishes={trio} />
      <PrivatePreview privateDining={restaurant.privateDining} />
    </>
  );
}
