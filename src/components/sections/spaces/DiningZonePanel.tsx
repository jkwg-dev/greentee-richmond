import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { RichHeading } from "@/components/ui/RichHeading";
import type { DiningZonePanel as DiningZonePanelData } from "@/types";

/**
 * Crystal Jade hand-off panel on the Dining zone (docs §6.3). A unified split
 * card (jade surface + gold border) narrower than its container: a full-height
 * image bleeds flush to the panel edge beside a padded copy column, so it reads
 * as one object. Jade is scoped to this panel on `/spaces` (§6.3). Stacks below
 * 900px, image on top.
 */
export function DiningZonePanel({ panel }: { panel: DiningZonePanelData }) {
  return (
    <Reveal as="div" threshold={0.12} className="dinezone">
      <div className="dz-media">
        <PhotoFrame
          tint="jade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="dz-copy">
        <Eyebrow className="text-jade-text mb-[22px]">{panel.eyebrow}</Eyebrow>
        <h2 className="font-serif text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.15] font-medium">
          <RichHeading text={panel.title} />
        </h2>
        <p className="text-mist mt-5 max-w-[480px] text-[14px]">{panel.body}</p>
        <div className="mt-9 flex flex-wrap gap-3.5">
          <Button href={panel.ctaPrimary.href} variant={panel.ctaPrimary.variant}>
            {panel.ctaPrimary.label}
          </Button>
          <Button
            href={panel.ctaSecondary.href}
            variant={panel.ctaSecondary.variant}
          >
            {panel.ctaSecondary.label}
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
