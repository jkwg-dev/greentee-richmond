import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";
import type { DiningZonePanel as DiningZonePanelData } from "@/types";

/**
 * Crystal Jade hand-off panel on the Dining zone (docs §6.3). A wide, short jade
 * banner (gold hairline border) narrower than its container and centered, with
 * no image: the headline sits left, the copy and CTAs right. Jade is scoped to
 * this panel on `/spaces` (§6.3). Stacks below 900px.
 */
export function DiningZonePanel({ panel }: { panel: DiningZonePanelData }) {
  return (
    <Reveal as="div" threshold={0.12} className="jade-panel dinezone">
      <div>
        <Eyebrow className="text-jade-text mb-4">{panel.eyebrow}</Eyebrow>
        <h2 className="font-serif text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.2] font-medium">
          <RichHeading text={panel.title} />
        </h2>
      </div>
      <div>
        <p className="text-mist text-[14px]">{panel.body}</p>
        <div className="mt-7 flex flex-wrap gap-3.5">
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
