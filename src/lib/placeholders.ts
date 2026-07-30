import { sampleNewsEntries } from "@/lib/mock/news";
import { zones as sampleZones } from "@/lib/mock/zones";
import { BOOK_A_TABLE_HREF, CRYSTAL_JADE_URL } from "@/lib/site";
import type { NewsEntry, PhotoTint, Room, Zone, ZoneCta } from "@/types";

/**
 * Placeholder display art for CMS-driven content (docs §11.4: placeholder-only
 * display fields belong to the UI layer, not the schema). Seeded documents
 * keep their mockup art via stable seed slugs; new CMS documents fall back to
 * neutral tints. This file retires with the pending states themselves, once
 * real photography lands (§11.6).
 */

/* ------------------------------------------------------------------ news -- */

const NEWS_FRAME_BY_ID = new Map<string, NewsEntry["frame"]>(
  sampleNewsEntries.map((entry) => [entry.id, entry.frame]),
);

const FALLBACK_TINTS: PhotoTint[] = ["champagne", "sage", "rosegold", "iris"];

export function newsFrameFor(
  key: string,
  title: string,
  index: number,
): NewsEntry["frame"] {
  return (
    NEWS_FRAME_BY_ID.get(key) ?? {
      tint: FALLBACK_TINTS[index % FALLBACK_TINTS.length],
      kicker: "Photo",
      name: title,
    }
  );
}

/* ----------------------------------------------------------------- zones -- */

/** The pending-state fields a zone hero renders while photography is absent. */
export type ZoneUi = Pick<
  Zone,
  "heroTint" | "heroTag" | "heroPending" | "heroPendingLabel" | "roomsHeading" | "motifLegend"
>;

const ZONE_UI_BY_SLUG = new Map<string, ZoneUi>(
  sampleZones.map((zone) => [
    zone.slug,
    {
      heroTint: zone.heroTint,
      heroTag: zone.heroTag,
      heroPending: zone.heroPending,
      heroPendingLabel: zone.heroPendingLabel,
      roomsHeading: zone.roomsHeading,
      motifLegend: zone.motifLegend,
    },
  ]),
);

export function zoneUiFor(slug: string): ZoneUi {
  return (
    ZONE_UI_BY_SLUG.get(slug) ?? {
      heroTint: "champagne",
      heroTag: "Replace with final photography",
    }
  );
}

/** Room pending art, keyed by zone slug + room name. */
type RoomUi = Pick<Room, "tint" | "pendingLabel" | "showMark">;

const ROOM_UI_BY_KEY = new Map<string, RoomUi>(
  sampleZones.flatMap(
    (zone) =>
      zone.rooms?.map((room): [string, RoomUi] => [
        `${zone.slug}/${room.name}`,
        {
          tint: room.tint,
          pendingLabel: room.pendingLabel,
          showMark: room.showMark,
        },
      ]) ?? [],
  ),
);

export function roomUiFor(zoneSlug: string, roomName: string): RoomUi {
  return (
    ROOM_UI_BY_KEY.get(`${zoneSlug}/${roomName}`) ?? { tint: "champagne" }
  );
}

/**
 * The dining panel's two CTAs are fixed targets, deliberately outside the
 * §11.4 schema (`diningPanel {eyebrow, title, copy}`). Both link out to the
 * standalone Crystal Jade site.
 */
export const DINING_PANEL_CTAS: { primary: ZoneCta; secondary: ZoneCta } = {
  primary: { label: "Crystal Jade Palace", href: CRYSTAL_JADE_URL, variant: "solid" },
  secondary: { label: "Book a Table", href: BOOK_A_TABLE_HREF, variant: "ghost" },
};
