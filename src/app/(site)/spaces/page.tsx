import type { Metadata } from "next";
import { SpacesShell } from "@/components/sections/spaces/SpacesShell";
import { ZoneSection } from "@/components/sections/spaces/ZoneSection";
import { getZones } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "The Spaces",
  description:
    "Two floors of golf, room by room: tour-grade simulator bays, a putting green, fitting and pro shops, a sauna, dining, and the Iconic 15 private rooms.",
};

/**
 * The Spaces (docs §6). Nine anchored zones on one page inside the sticky
 * rail / chip shell, read from the `zone` documents in page order (§11.4);
 * pending-state art reattaches in the mapping layer (§11.6).
 */
export default async function SpacesPage() {
  const zones = await getZones();

  const nav = zones.map((zone) => ({
    slug: zone.slug,
    name: zone.name,
    chipLabel: zone.chipLabel,
    floor: zone.floor,
  }));

  return (
    <SpacesShell nav={nav}>
      {zones.map((zone) => (
        <ZoneSection key={zone.slug} zone={zone} />
      ))}
    </SpacesShell>
  );
}
