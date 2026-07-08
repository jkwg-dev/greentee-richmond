import type { Metadata } from "next";
import { SpacesShell } from "@/components/sections/spaces/SpacesShell";
import { ZoneSection } from "@/components/sections/spaces/ZoneSection";
import { zones } from "@/lib/mock/zones";

export const metadata: Metadata = {
  title: "The Spaces",
  description:
    "Two floors of golf, room by room: tour-grade simulator bays, a putting green, fitting and pro shops, a sauna, dining, and the Iconic 15 private rooms.",
};

/**
 * The Spaces (docs §6). Nine anchored zones on one page inside the sticky
 * rail / chip shell. Static zone data from the mock; sections stay
 * presentational. Per-zone detail routes are a later phase.
 */
export default function SpacesPage() {
  const nav = zones.map((zone) => ({
    slug: zone.slug,
    name: zone.name,
    chipLabel: zone.chipLabel,
    floor: zone.floor,
  }));

  return (
    <SpacesShell nav={nav}>
      {zones.map((zone, i) => (
        <ZoneSection
          key={zone.slug}
          zone={zone}
          prev={zones[i - 1]}
          next={zones[i + 1]}
        />
      ))}
    </SpacesShell>
  );
}
