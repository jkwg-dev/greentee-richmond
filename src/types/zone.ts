import type { InterimImage, PhotoTint } from "./media";

/**
 * The Spaces domain types (docs §6, §11.4 `zone`). Nine zones on one page.
 * Journey panels are NOT here (they live on `homePage`, §5.2). Fields beyond
 * §11.4's list (chipLabel, heroTag, cta, diningPanel) are display/placeholder
 * concerns flagged in the Phase 3 report.
 */

export type ZoneFloor = "1F" | "2F";
export type RoomMotif = "Sprout" | "Grain" | "Leaf" | "Crystal";

/** Zone fact row (docs §6.2). Structurally a `Fact` without a detail line. */
export type ZoneFact = { label: string; value: string };

export type ZoneCta = {
  label: string;
  href: string;
  variant?: "solid" | "ghost";
};

/** A VIP/VVIP room card (docs §6.3, §11.4 `zone.rooms[]`). */
export type Room = {
  name: string;
  motif?: RoomMotif;
  /** One-line description (combined rooms carry one). */
  line?: string;
  /** Absent while the render is pending (docs §11.6). */
  image?: InterimImage;
  pending?: boolean;
  /** Placeholder fill + label while pending (Phase 3 interim). */
  tint?: PhotoTint;
  pendingLabel?: string;
  /** Centered crosshair mark on the pending frame (VVIP). */
  showMark?: boolean;
};

/** Crystal Jade hand-off panel that replaces the body of the Dining zone (§6.3). */
export type DiningZonePanel = {
  eyebrow: string;
  /** `\n` marks the forced line break (rendered via RichHeading). */
  title: string;
  body: string;
  ctaPrimary: ZoneCta;
  ctaSecondary: ZoneCta;
};

export type Zone = {
  slug: string;
  floor: ZoneFloor;
  name: string;
  /** Abbreviated label for the chip bar (docs §6.1); rail uses `name`. */
  chipLabel: string;
  /** Hero eyebrow label after the floor; defaults to `name`. 2F zones use "Private Area". */
  areaLabel?: string;
  conceptTitle: string;
  conceptLine: string;
  order: number;
  /** Standard body copy; absent on the Dining zone (uses `diningPanel`). */
  lead?: string;
  body?: string;
  facts?: ZoneFact[];
  cta?: ZoneCta;
  /** Hero render; absent in Phase 3 (placeholder) and while pending (§11.6). */
  heroImage?: InterimImage;
  heroTint?: PhotoTint;
  /** Deck-render note shown while the hero is a placeholder. */
  heroTag?: string;
  /** VVIP: a centered "Renders to be revealed" hero rather than a tagged render. */
  heroPending?: boolean;
  heroPendingLabel?: string;
  /** VIP/VVIP room grid. */
  rooms?: Room[];
  roomsHeading?: string;
  motifLegend?: RoomMotif[];
  /** Dining zone only. */
  diningPanel?: DiningZonePanel;
};
