import { DiningChips } from "@/components/sections/dining/DiningChips";
import { DiningInfoStrip } from "@/components/sections/dining/DiningInfoStrip";
import { DiningRail } from "@/components/sections/dining/DiningRail";
import { restaurant } from "@/lib/mock/restaurant";

/**
 * Crystal Jade Palace shell (docs §8.2): every `/dining` route renders inside
 * the jade page wash with the sticky rail (1025px and up) or the chip bar
 * (below), plus the restaurant details strip above the footer. Active states
 * are route-driven inside the client leaves; this layout stays a server shell.
 * Below 1025px the wrapper clears the fixed header so the chip bar sits
 * beneath it (docs §8.2; the mockup let the bar slide under the header).
 */
export default function DiningLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      id="top"
      className="dine-bg pb-16 max-[1024px]:pt-[70px] max-[900px]:pt-[62px]"
    >
      <DiningChips />
      <div className="dine-shell">
        <DiningRail />
        <div className="dine-main">{children}</div>
      </div>
      <DiningInfoStrip restaurant={restaurant} />
    </div>
  );
}
