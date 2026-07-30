import type { InterimImage } from "./media";

/**
 * Crystal Jade Palace domain types. Narrative fields are plain string
 * paragraphs until Sanity lands; imagery fields are optional because
 * photography arrives after copy.
 */

/** Michelin / accolade / private-dining credential. */
export type CredentialRow = {
  label: string;
  value: string;
  detail?: string;
};

/** Label / value row for fact lists. */
export type RestaurantFact = {
  label: string;
  value: string;
  /** Optional second line, e.g. "Placeholder, confirm count". */
  detail?: string;
};

/** Kitchen-philosophy concept card (story page). */
export type PhilosophyCard = {
  title: string;
  line: string;
  image?: InterimImage;
};

export type RestaurantStory = {
  /** Heritage narrative: serif lead plus body paragraphs. */
  heritage: { lead: string; body: string[] };
  /** Global footprint, pending brand-guide confirmation. */
  footprint: string[];
  /** The highlighted closing stop, "Now, Richmond". */
  footprintNow: string;
  /** Why Richmond, Why Now narrative. */
  richmond: { lead: string; body: string[] };
  philosophy: PhilosophyCard[];
};

/** Award credential bar (chef page). */
export type ChefAward = {
  title: string;
  /** e.g. "Four consecutive years", "Individual Supreme Gold Award". */
  detail?: string;
  /** Ranges written "2022 to 2025". */
  years: string;
};

export type RestaurantChef = {
  /** Kitchen-setting portrait, explicitly not a studio headshot. */
  portrait?: InterimImage;
  /** Intro heading line, "A journey measured in quiet decades." */
  intro: string;
  awards: ChefAward[];
  bio: string;
  /** Notable Moments list beside His Story. */
  moments: string[];
  /** Placeholder pending the chef interview. */
  quote: string;
};

/** Bespoke menu format (Per Person / Per Table). */
export type BanquetMenu = {
  label: string;
  line: string;
  /** e.g. "Pricing on enquiry". */
  detail?: string;
};

export type RestaurantBanquet = {
  copy: string;
  facts: RestaurantFact[];
  occasions: string[];
  menus: BanquetMenu[];
  /** Enquire Now target; the reserve page until a dedicated flow exists. */
  enquiryTarget: string;
};

export type RestaurantReserve = {
  /** Absent until the OpenTable account is live. */
  openTableUrl?: string;
  phone: string;
  wechat: string;
  /** Service windows, e.g. ["Lunch 11:00 to 14:30", "Dinner 17:30 to 22:00"]. */
  hours: string[];
  address: { name: string; line: string };
};

/** Restaurant social link for the info strip; stub URLs for now. */
export type RestaurantSocial = {
  label: string;
  url: string;
};

/**
 * The restaurant singleton. `intro` is the landing intro; `lede` is the
 * one-paragraph positioning line kept for reuse in previews and metadata.
 */
export type Restaurant = {
  name: string;
  /** Credential line under the hero H1. */
  tagline: string;
  lede: string;
  intro: { lede: string; support: string };
  heroMedia?: InterimImage;
  credentials: CredentialRow[];
  privateDining: { copy: string; facts: RestaurantFact[] };
  story: RestaurantStory;
  chef: RestaurantChef;
  banquet: RestaurantBanquet;
  reserve: RestaurantReserve;
  socials: RestaurantSocial[];
};
