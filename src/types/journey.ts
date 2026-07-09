import type { InterimImage, PhotoTint } from "./media";

/**
 * Spaces Journey domain types (docs §5.2). Panels are curated Home content
 * (`homePage.journeyPanels`, docs §11.4), not derived from `zone` documents:
 * panels 01 and 05 are composites of two zones each, so they are authored on the
 * home document, carry an explicit `layout`, and link to zone anchors. The index
 * derives from array order.
 *
 * Note: §11.4's field list omits `conceptTitle`, but §5.1/§5.2 render it as the
 * large-serif headline distinct from the meta `name`; kept here and flagged.
 */

export type JourneyPlate = {
  /** Placeholder tint; the fill when no interim render is present (docs §11.6). */
  tint: PhotoTint;
  /** Interim render under `/public/renders` until Sanity lands (docs §11.6). */
  image?: InterimImage;
  /** Present only for a designed pending state, e.g. the VVIP suites (docs §5.4). */
  label?: { kicker: string; name: string };
};

/** Plate arrangement per panel (docs §5.2, §11.4): two, two flipped, or one. */
export type JourneyLayout = "two" | "twoFlipped" | "solo";

export type JourneyPanel = {
  /** Panel name shown in the meta line, e.g. "At-Bat & Putting Zone" (docs §5.2). */
  name: string;
  floorLabel: string;
  /** The `/spaces` anchor this panel links to. */
  anchor: string;
  /** Large-serif concept title, e.g. "The Vitality of a Swing" (docs §5.2). */
  conceptTitle: string;
  line: string;
  /** Journey-scoped inline accent (docs §5.2); never promoted to a global token. */
  accent: string;
  layout: JourneyLayout;
  plates: JourneyPlate[];
};
