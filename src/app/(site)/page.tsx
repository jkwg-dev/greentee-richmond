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
import {
  getHomeContent,
  getNewsEntries,
  getRestaurantPreview,
  getSiteSettings,
} from "@/sanity/lib/queries";

/**
 * Home (docs §5). The route composes the sections in the §5.1 order of record
 * (a deliberate deviation from the mockup, §5.4 note 6) and distributes the
 * Sanity content (docs §11.5); sections stay presentational.
 */
export default async function HomePage() {
  const [content, newsEntries, preview, settings] = await Promise.all([
    getHomeContent(),
    getNewsEntries(),
    getRestaurantPreview(),
    getSiteSettings(),
  ]);

  return (
    <>
      <IntroCurtain />
      <HomeHero hero={content.hero} />
      <Manifesto content={content.manifesto} />
      <PanoramaBand content={content.panorama} />
      <ConceptMarquee items={content.marqueeItems} />
      <RatesHours content={content.rates} />
      <NewsOffersTeaser head={content.newsTeaser} entries={newsEntries} />
      <DiningPreview restaurant={preview} />
      <SpacesIntro content={content.spacesIntro} />
      <SpacesJourney panels={content.journeyPanels} />
      <Outro content={content.outro} visitLine={settings.openSummary} />
      <BackToTop />
    </>
  );
}
