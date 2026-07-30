/** Domain types consumed by sections (docs §11.2). Never raw GROQ shapes. */
export type { InterimImage, PhotoTint } from "./media";
export type {
  HeroContent,
  ManifestoLine,
  ManifestoContent,
  PanoramaContent,
  NewsTeaserHead,
  SpacesIntroContent,
  RateRow,
  HourRow,
  Stat,
  RatesContent,
  OutroContent,
  HomeContent,
  CredentialRow,
  DiningPreviewContent,
} from "./home";
export type { JourneyPlate, JourneyLayout, JourneyPanel } from "./journey";
export type { SiteSettings } from "./settings";
export type { NewsCategory, NewsEntry, Announcement } from "./news";
export { NEWS_CATEGORY_LABEL } from "./news";
export type {
  ZoneFloor,
  RoomMotif,
  ZoneFact,
  ZoneCta,
  Room,
  DiningZonePanel,
  Zone,
} from "./zone";
