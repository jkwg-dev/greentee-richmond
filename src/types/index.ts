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
} from "./home";
export type { JourneyPlate, JourneyLayout, JourneyPanel } from "./journey";
export type {
  CredentialRow,
  RestaurantFact,
  PhilosophyCard,
  RestaurantStory,
  ChefAward,
  RestaurantChef,
  BanquetMenu,
  RestaurantBanquet,
  RestaurantReserve,
  RestaurantSocial,
  Restaurant,
  RestaurantPreview,
} from "./restaurant";
export type { DishCategory, Dish } from "./dish";
export { DISH_CATEGORY_LABEL } from "./dish";
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
