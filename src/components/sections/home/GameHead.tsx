import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";

export type GameHeadProps = {
  eyebrow: string;
  title: string;
  sub: string;
};

/**
 * Two-column section head (mockup `.game-head`): eyebrow + serif H2 on the left,
 * support line on the right, staggered reveals. Shared by Rates & Hours and the
 * News & Offers teaser (docs §5.1 S3, S4). Stacks below 900px.
 */
export function GameHead({ eyebrow, title, sub }: GameHeadProps) {
  return (
    <div className="mb-[70px] grid grid-cols-[1.2fr_1fr] items-end gap-[5vw] max-[900px]:grid-cols-1 max-[900px]:gap-11">
      <div>
        <Reveal as="div">
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal
          as="h2"
          delay={100}
          className="mt-6 font-serif text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.1] font-medium tracking-[0.004em] [&_em]:text-champagne [&_em]:italic"
        >
          <RichHeading text={title} />
        </Reveal>
      </div>
      <Reveal as="p" delay={200} className="text-mist max-w-[560px] text-[14.5px]">
        {sub}
      </Reveal>
    </div>
  );
}
