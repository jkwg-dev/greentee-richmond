import { Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { BOOK_A_BAY_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ZoneFloor } from "@/types";

/** Lightweight nav shape for the rail + chips (derived from zones). */
export type ZoneNav = {
  slug: string;
  name: string;
  chipLabel: string;
  floor: ZoneFloor;
};

const FLOORS: ZoneFloor[] = ["1F", "2F"];

/**
 * Sticky left rail (docs §6.1, mockup `.spcrail`), desktop only. Wordmark, the
 * zone nav grouped by floor with the active link gaining a champagne dash, and
 * a Book a Bay CTA. Active state is scroll-spy driven (from `SpacesShell`).
 */
export function SpacesRail({
  nav,
  activeId,
}: {
  nav: ZoneNav[];
  activeId?: string;
}) {
  return (
    <aside className="spcrail" aria-label="Zones">
      <a href={`#${nav[0]?.slug ?? ""}`} className="sr-mark">
        <span className="sr-title">The Spaces</span>
        <span className="sr-sub">GreenTee Richmond</span>
      </a>
      <nav className="sr-nav" aria-label="Zone navigation">
        {FLOORS.map((floor) => (
          <Fragment key={floor}>
            <span className="sr-g">{floor}</span>
            {nav
              .filter((zone) => zone.floor === floor)
              .map((zone) => (
                <a
                  key={zone.slug}
                  href={`#${zone.slug}`}
                  aria-current={activeId === zone.slug ? "true" : undefined}
                  className={cn("sr-link", activeId === zone.slug && "active")}
                >
                  {zone.name}
                </a>
              ))}
          </Fragment>
        ))}
      </nav>
      <Button href={BOOK_A_BAY_HREF} size="sm">
        Book a Bay
      </Button>
    </aside>
  );
}
