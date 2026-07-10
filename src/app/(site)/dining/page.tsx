import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { DiningHero } from "@/components/sections/dining/DiningHero";
import { PrivatePreview } from "@/components/sections/dining/PrivatePreview";
import { SignatureTrio } from "@/components/sections/dining/SignatureTrio";
import { signatureDishes as signatureFallback, signatureDishIds } from "@/lib/mock/dishes";
import { restaurant as restaurantFallback } from "@/lib/mock/restaurant";
import { getDishes, getRestaurant } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Crystal Jade Palace",
  description:
    "Cantonese fine dining at GreenTee Richmond Center. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen.",
};

/**
 * `/dining` landing (docs §8.3): full-screen hero, restaurant intro, the
 * Signature Dishes trio, and the Private Dining preview. Static data from the
 * `restaurant` and `dish` mocks; CMS-driven in Phase 6.
 */
export default async function DiningPage() {
  const [cmsRestaurant, cmsDishes] = await Promise.all([
    getRestaurant(),
    getDishes(),
  ]);
  const restaurant = cmsRestaurant ?? restaurantFallback;
  // The landing trio (§8.3 item 3): the three signature dishes in mockup order.
  const signatureDishes = signatureDishIds
    .map((id) => cmsDishes.find((dish) => dish.id === `dish-${id}`))
    .filter((dish) => dish !== undefined);
  const trio = signatureDishes.length === 3 ? signatureDishes : signatureFallback;
  return (
    <>
      <DiningHero title={restaurant.name} tagline={restaurant.tagline} />

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
