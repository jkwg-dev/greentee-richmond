import type { InterimImage } from "./media";

/**
 * Crystal Jade Palace domain types (docs §8.4). The Home dining preview (§5.1
 * S5) reads a slice of the `restaurant` singleton, not `homePage`. Portable
 * text fields (heritage, richmond) are plain string paragraphs until Sanity
 * lands in Phase 6; imagery fields are optional because photography arrives
 * after copy (§11.6).
 */

/** Michelin / accolade / private-dining credential (docs §5.1 S5, §8.4). */
export type CredentialRow = {
  label: string;
  value: string;
  detail?: string;
};

/** Label / value row for dining fact lists (docs §8.3). */
export type RestaurantFact = {
  label: string;
  value: string;
  /** Optional second line, e.g. "Placeholder, confirm count". */
  detail?: string;
};

/** Kitchen-philosophy concept card (docs §8.3 story item 4). */
export type PhilosophyCard = {
  title: string;
  line: string;
  image?: InterimImage;
};

export type RestaurantStory = {
  /** Heritage narrative: serif lead plus body paragraphs (§8.3 story item 2). */
  heritage: { lead: string; body: string[] };
  /** Global footprint, pending brand-guide confirmation (§15.8). */
  footprint: string[];
  /** The highlighted closing stop, "Now, Richmond". */
  footprintNow: string;
  /** Why Richmond, Why Now narrative (§8.3 story item 3). */
  richmond: { lead: string; body: string[] };
  philosophy: PhilosophyCard[];
};

/** Award credential bar (docs §8.3 chef item 2). */
export type ChefAward = {
  title: string;
  /** e.g. "Four consecutive years", "Individual Supreme Gold Award". */
  detail?: string;
  /** Ranges written "2022 to 2025" (§8.1). */
  years: string;
};

export type RestaurantChef = {
  /** Kitchen-setting portrait, explicitly not a studio headshot (§8.3). */
  portrait?: InterimImage;
  /** Intro heading line, "A journey measured in quiet decades." */
  intro: string;
  awards: ChefAward[];
  bio: string;
  /** Notable Moments list beside His Story (§8.3 chef item 3). */
  moments: string[];
  /** Placeholder pending the chef interview (§8.3 chef item 4). */
  quote: string;
};

/** Bespoke menu format (Per Person / Per Table, §8.3 banquet item 3). */
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
  /** Absent until the OpenTable account is live (§15.3). */
  openTableUrl?: string;
  phone: string;
  wechat: string;
  /** Service windows, e.g. ["Lunch 11:00 to 14:30", "Dinner 17:30 to 22:00"]. */
  hours: string[];
  address: { name: string; line: string };
};

/** Restaurant social link for the info strip (§8.2, §8.4); stub URLs for now. */
export type RestaurantSocial = {
  label: string;
  url: string;
};

/**
 * The `restaurant` singleton (docs §8.4). The top-level `lede` feeds the Home
 * dining preview; `intro` is the `/dining` landing intro (§8.3 item 2).
 */
export type Restaurant = {
  name: string;
  /** Credential line under the hero H1 (§8.3 `/dining` item 1). */
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

/** The fields the Home dining preview needs from the `restaurant` singleton. */
export type RestaurantPreview = {
  name: string;
  lede: string;
  credentials: CredentialRow[];
};
