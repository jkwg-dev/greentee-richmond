import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";
import type { SpacesIntroContent } from "@/types";

/**
 * S6 Spaces head (docs §5.1, mockup `#spaces` `.sec-head`). Introduces the
 * journey with a standard staggered reveal and a fixed link to `/spaces`.
 * Carries the `#spaces` anchor that the hero "Explore the Spaces" targets.
 */
export function SpacesIntro({ content }: { content: SpacesIntroContent }) {
  return (
    <div id="spaces" className="px-[6vw] pt-[120px] pb-[60px]">
      <Reveal as="div">
        <Eyebrow>{content.eyebrow}</Eyebrow>
      </Reveal>

      <Reveal
        as="h2"
        delay={100}
        className="mt-6 font-serif text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.1] font-medium tracking-[0.004em]"
      >
        <RichHeading text={content.title} />
      </Reveal>

      <Reveal
        as="p"
        delay={150}
        className="text-mist mt-5 max-w-[560px] text-[14.5px]"
      >
        {content.sub}
      </Reveal>

      <Reveal as="div" delay={220} className="mt-[26px]">
        <Link
          href="/spaces"
          className="border-hair text-ivory hover:border-champagne hover:text-champagne inline-block border-b pb-2 text-[10px] font-medium tracking-[0.26em] uppercase transition-colors"
        >
          {content.linkLabel}
        </Link>
      </Reveal>
    </div>
  );
}
