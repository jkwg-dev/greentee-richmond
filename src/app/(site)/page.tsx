import { BackToTop } from "@/components/layout/BackToTop";
import { IntroCurtain } from "@/components/motion/IntroCurtain";
import { ConceptMarquee } from "@/components/sections/home/ConceptMarquee";
import { DiningPreview } from "@/components/sections/home/DiningPreview";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { NewsOffersTeaser } from "@/components/sections/home/NewsOffersTeaser";
import { Outro } from "@/components/sections/home/Outro";
import { PanoramaBand } from "@/components/sections/home/PanoramaBand";
import { RatesHours } from "@/components/sections/home/RatesHours";
import { SpacesIntro } from "@/components/sections/home/SpacesIntro";
import { SpacesJourney } from "@/components/sections/home/SpacesJourney";
import { home } from "@/lib/mock/home";
import { restaurantPreview } from "@/lib/mock/restaurant";
import { getNewsEntries } from "@/sanity/lib/queries";

/**
 * Home (docs §5). The route composes the sections in the §5.1 order of record
 * (a deliberate deviation from the mockup, §5.4 note 6) and distributes the
 * data (docs §11.5); sections stay presentational. The News & Offers teaser is
 * CMS-driven (§4.2) and renders nothing when empty; the rest binds in Phase 6
 * Build 2.
 */
export default async function HomePage() {
  const newsEntries = await getNewsEntries();
  return (
    <>
      <IntroCurtain />
      <HomeHero hero={home.hero} />
      <Manifesto content={home.manifesto} />
      <PanoramaBand content={home.panorama} />
      <ConceptMarquee items={home.marqueeItems} />
      <RatesHours content={home.rates} />
      <NewsOffersTeaser head={home.newsTeaser} entries={newsEntries} />
      <DiningPreview restaurant={restaurantPreview} />
      <SpacesIntro content={home.spacesIntro} />
      <SpacesJourney panels={home.journeyPanels} />
      <Outro content={home.outro} />
      <BackToTop />
    </>
  );
}
