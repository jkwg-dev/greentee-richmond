import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * News & Offers page head (docs §7, mockup `.pagehead`): eyebrow, H1, and a
 * supporting line, capped and centered. Top padding clears the fixed header.
 *
 * Flag: the mockup sub ends "Every entry below is managed in Sanity." That reads
 * as a dev/CMS note, not user copy, so it is dropped (matching the §11.4
 * newsTeaser sub); everything else is verbatim.
 */
export function NewsIndexHead() {
  return (
    <div className="mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-2 max-[900px]:pt-[130px]">
      <Reveal as="div">
        <Eyebrow className="mb-[22px]">News &amp; Offers</Eyebrow>
      </Reveal>
      <Reveal
        as="h1"
        delay={100}
        className="font-serif text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.05] font-medium"
      >
        What&apos;s on at the Center.
      </Reveal>
      <Reveal
        as="p"
        delay={200}
        className="text-mist mt-[18px] max-w-[560px] text-[14.5px]"
      >
        Leagues, seasonal offers, and news from the club and Crystal Jade Palace.
      </Reveal>
    </div>
  );
}
