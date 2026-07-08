import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { FactRows } from "@/components/ui/FactRows";
import type { Zone } from "@/types";
import { DiningZonePanel } from "./DiningZonePanel";
import { RoomGrid } from "./RoomGrid";
import { ZoneHero } from "./ZoneHero";
import { ZonePager } from "./ZonePager";

/**
 * One `/spaces` zone (docs §6.2): hero, then either the standard body (lead,
 * supporting paragraph, fact rows, optional CTA), the Dining hand-off panel, or
 * a VIP/VVIP room grid, then the prev/next pager. Reveals fire at 12 percent.
 */
export function ZoneSection({
  zone,
  prev,
  next,
}: {
  zone: Zone;
  prev?: Zone;
  next?: Zone;
}) {
  return (
    <section id={zone.slug} className="zone">
      <ZoneHero zone={zone} />

      <div className="zbody">
        {zone.diningPanel ? (
          <DiningZonePanel panel={zone.diningPanel} />
        ) : (
          <>
            <div className="zgrid">
              <div>
                {zone.lead && (
                  <Reveal
                    as="p"
                    threshold={0.12}
                    className="text-ivory/90 font-serif text-[19px] leading-[1.7]"
                  >
                    {zone.lead}
                  </Reveal>
                )}
                {zone.body && (
                  <Reveal
                    as="p"
                    threshold={0.12}
                    className="text-mist mt-[18px] max-w-[560px] text-[14px]"
                  >
                    {zone.body}
                  </Reveal>
                )}
              </div>
              {zone.facts && (
                <Reveal as="div" threshold={0.12}>
                  <FactRows
                    facts={zone.facts}
                    firstRule={false}
                    className="mt-1.5"
                  />
                </Reveal>
              )}
            </div>

            {zone.rooms && (
              <RoomGrid
                rooms={zone.rooms}
                heading={zone.roomsHeading}
                motifLegend={zone.motifLegend}
              />
            )}

            {zone.cta && (
              <Reveal
                as="div"
                threshold={0.12}
                className="mt-[52px] flex flex-wrap gap-3.5"
              >
                <Button href={zone.cta.href} variant={zone.cta.variant}>
                  {zone.cta.label}
                </Button>
              </Reveal>
            )}
          </>
        )}
      </div>

      <ZonePager prev={prev} next={next} />
    </section>
  );
}
