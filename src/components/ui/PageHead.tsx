import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";

/**
 * The shared page head (docs §7 news pagehead proportions; booking.md §5.2,
 * §9.4): eyebrow, serif H1 through the RichHeading `*emphasis*` convention,
 * optional support line, standard reveals. Extracted from the news, book,
 * and account near-copies by the B3a ruling; output stays pixel identical
 * to the originals.
 */
export function PageHead({
  eyebrow,
  title,
  support,
}: {
  eyebrow: string;
  /** Single-string heading; `*word*` renders as the champagne italic em. */
  title: string;
  support?: string;
}) {
  return (
    <div className="mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-2 max-[900px]:pt-[130px]">
      <Reveal as="div">
        <Eyebrow className="mb-[22px]">{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal
        as="h1"
        delay={100}
        className="[&_em]:text-champagne font-serif text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.05] font-medium [&_em]:italic"
      >
        <RichHeading text={title} />
      </Reveal>
      {support && (
        <Reveal
          as="p"
          delay={200}
          className="text-mist mt-[18px] max-w-[560px] text-[14.5px]"
        >
          {support}
        </Reveal>
      )}
    </div>
  );
}
