import type { InterimImage } from "./media";
import type { JourneyPanel } from "./journey";

/**
 * Home page domain types (docs §5). Field names and nesting mirror the
 * `homePage` singleton (docs §11.4). Two fields the schema does not carry are
 * flagged in the Phase 2 report and kept because the mockup needs them: the
 * Rates head copy (static in the component) and journey `conceptTitle`.
 */

export type HeroContent = {
  eyebrow: string;
  titleLines: [string, string];
  italicLine: string;
  supportLine: string;
  /** Facade nightscape render; interim in Phase 2 (docs §11.6). */
  media?: InterimImage;
};

/** A manifesto line closing on an italic emphasis word (docs §5.1 S2, §11.4). */
export type ManifestoLine = {
  text: string;
  emphasis: string;
};

export type ManifestoContent = {
  eyebrow: string;
  lines: ManifestoLine[];
  caption: string;
};

export type PanoramaContent = {
  /** Optional until final photography is shot (docs §11.6). */
  image?: InterimImage;
  caption: string;
};

/** Static head above the CMS-driven News & Offers teaser (docs §11.4). */
export type NewsTeaserHead = {
  eyebrow: string;
  title: string;
  sub: string;
};

export type SpacesIntroContent = {
  eyebrow: string;
  /** May contain `\n` for a forced line break (rendered via RichHeading). */
  title: string;
  sub: string;
  linkLabel: string;
};

export type RateRow = {
  name: string;
  detail: string;
  price: string;
  /** Trailing unit, e.g. "/ hour"; omitted for "Included". */
  unit?: string;
};

export type HourRow = {
  name: string;
  detail: string;
  value: string;
};

export type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

/** Rates content (docs §11.4). The column labels stay static UI copy. */
export type RatesContent = {
  eyebrow: string;
  title: string;
  sub: string;
  rateRows: RateRow[];
  hourRows: HourRow[];
  footnote: string;
  stats: Stat[];
};

export type OutroContent = {
  eyebrow: string;
  /** `*word*` marks the italic champagne emphasis (docs §5.1 S8). */
  title: string;
  line: string;
};

/** The full static Home payload, distributed to sections by the route (docs §11.5). */
export type HomeContent = {
  hero: HeroContent;
  manifesto: ManifestoContent;
  panorama: PanoramaContent;
  marqueeItems: string[];
  newsTeaser: NewsTeaserHead;
  rates: RatesContent;
  journeyPanels: JourneyPanel[];
  spacesIntro: SpacesIntroContent;
  outro: OutroContent;
};
