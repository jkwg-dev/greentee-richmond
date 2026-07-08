import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PHOTO_TINT_CLASS } from "@/lib/tints";
import { cn } from "@/lib/utils";
import type { Zone } from "@/types";

/**
 * Zone hero (docs §6.2, mockup `.zhero`): a full-bleed render at min(58vh,560px)
 * with an irregular fractal-noise grain overlay, a directional shade, and the
 * eyebrow / concept-title / subline. Phase 3 ships the pending state: a tint
 * placeholder plus the deck-render tag (§11.6), or the VVIP "Renders to be
 * revealed" mark. Real renders arrive in Phase 6.
 */
export function ZoneHero({ zone }: { zone: Zone }) {
  return (
    <div className="zhero grain-overlay">
      <div
        className={cn(
          "absolute inset-0 z-[1]",
          PHOTO_TINT_CLASS[zone.heroTint ?? "champagne"],
        )}
      />
      <div className="zshade" />

      {zone.heroPending ? (
        <div className="pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-3">
          <span className="pf-mark" />
          <span className="text-ivory/40 text-[8.5px] font-medium tracking-[0.4em] uppercase">
            {zone.heroPendingLabel}
          </span>
        </div>
      ) : (
        zone.heroTag && (
          <span className="text-mist/75 absolute bottom-3 left-4 z-[5] text-[8.5px] leading-[1.5] font-medium tracking-[0.26em] uppercase">
            {zone.heroTag}
          </span>
        )
      )}

      <Reveal as="div" threshold={0.12} className="zhero-inner">
        <Eyebrow className="mb-[22px]">
          {zone.floor} · {zone.areaLabel ?? zone.name}
        </Eyebrow>
        <h1 className="zhero-title">{zone.conceptTitle}</h1>
        <p className="zsub">{zone.conceptLine}</p>
      </Reveal>
    </div>
  );
}
