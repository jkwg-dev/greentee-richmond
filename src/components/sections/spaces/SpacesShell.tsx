"use client";

import { useMemo } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { SpacesRail, type ZoneNav } from "./SpacesRail";
import { ZoneChips } from "./ZoneChips";

/**
 * The `/spaces` shell (docs §6.1). Runs one `useScrollSpy` over the zone
 * anchors and feeds the active id to both the sticky rail (desktop) and the
 * chip bar (mobile). The zone sections arrive as server-rendered children and
 * fill the content column; top padding clears the fixed header.
 */
export function SpacesShell({
  nav,
  children,
}: {
  nav: ZoneNav[];
  children: React.ReactNode;
}) {
  const ids = useMemo(() => nav.map((zone) => zone.slug), [nav]);
  const activeId = useScrollSpy(ids);

  return (
    <div className="pt-[70px] max-[900px]:pt-[62px]">
      <ZoneChips nav={nav} activeId={activeId} />
      <div className="spc-shell">
        <SpacesRail nav={nav} activeId={activeId} />
        <main>{children}</main>
      </div>
    </div>
  );
}
