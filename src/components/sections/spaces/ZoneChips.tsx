import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { ZoneFloor } from "@/types";
import type { ZoneNav } from "./SpacesRail";

const FLOORS: ZoneFloor[] = ["1F", "2F"];

/**
 * Sticky chip bar beneath the header (docs §6.1, mockup `.zonechips`), shown
 * below 1024px. The same nine anchors grouped by floor on a blurred noir
 * backdrop; the active chip is ivory with a champagne underline. Active state is
 * scroll-spy driven (from `SpacesShell`).
 */
export function ZoneChips({
  nav,
  activeId,
}: {
  nav: ZoneNav[];
  activeId?: string;
}) {
  return (
    <nav className="zonechips" aria-label="Zones">
      {FLOORS.map((floor, floorIndex) => (
        <Fragment key={floor}>
          {floorIndex > 0 && <span className="zc-sep" aria-hidden="true" />}
          <span className="zc-g">{floor}</span>
          {nav
            .filter((zone) => zone.floor === floor)
            .map((zone) => (
              <a
                key={zone.slug}
                href={`#${zone.slug}`}
                aria-current={activeId === zone.slug ? "true" : undefined}
                className={cn("zc-link", activeId === zone.slug && "active")}
              >
                {zone.chipLabel}
              </a>
            ))}
        </Fragment>
      ))}
    </nav>
  );
}
