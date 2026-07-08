import type { CSSProperties } from "react";
import Link from "next/link";
import { PHOTO_TINT_CLASS } from "@/lib/tints";
import { cn } from "@/lib/utils";
import type { JourneyPanel as JourneyPanelData, JourneyPlate } from "@/types";

/** Style object carrying the journey-scoped `--acc` custom property (docs §5.2). */
type CSSVars = CSSProperties & Record<`--${string}`, string>;

const LAYOUT_CLASS: Record<JourneyPanelData["layout"], string | undefined> = {
  two: undefined,
  twoFlipped: "flip",
  solo: "hp-solo",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * A single placeholder plate (docs §11.6): an overscanned tint fill the journey
 * can kick horizontally, a grain overlay, and an optional pending-state label
 * (the VVIP suites on panel 05).
 */
function Plate({ plate, className }: { plate: JourneyPlate; className: string }) {
  return (
    <div className={cn(className, "grain-overlay")}>
      <div className={cn("hp-fill", PHOTO_TINT_CLASS[plate.tint])} />
      {plate.label && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2.5">
          <span className="text-ivory/40 text-[8.5px] font-medium tracking-[0.4em] uppercase">
            {plate.label.kicker}
          </span>
          <span className="text-ivory/[0.78] font-serif text-base tracking-[0.04em] italic">
            {plate.label.name}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * One journey panel (docs §5.2, mockup `.hs-panel`). An anchor link to its
 * `/spaces` zone carrying the oversized index numeral, one or two photo plates,
 * the meta line, concept title, panel line, and Explore cue. The index derives
 * from array order (docs §5.2). Kept in DOM order so the section linearizes for
 * screen readers (docs §9.3).
 */
export function JourneyPanel({
  panel,
  index,
}: {
  panel: JourneyPanelData;
  index: number;
}) {
  const label = pad(index);
  return (
    <Link
      href={panel.anchor}
      className={cn("hs-panel", LAYOUT_CLASS[panel.layout])}
      style={{ "--acc": panel.accent } as CSSVars}
    >
      <span className="hp-num" aria-hidden="true">
        {label}
      </span>

      <Plate plate={panel.plates[0]} className="hp-a" />
      {panel.layout !== "solo" && panel.plates[1] && (
        <Plate plate={panel.plates[1]} className="hp-b" />
      )}

      <div className="hp-info">
        <p className="hp-meta">
          <b>{label}</b>
          <i />
          <span>
            {panel.name} · {panel.floorLabel}
          </span>
        </p>
        <h3 className="hp-title">{panel.conceptTitle}</h3>
        <p className="hp-line">{panel.line}</p>
      </div>

      <span className="hp-go">Explore</span>
    </Link>
  );
}
