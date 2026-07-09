import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";

export type DiningHeadProps = {
  eyebrow: string;
  /** `\n` breaks lines; `*word*` renders italic champagne (RichHeading). */
  title: string;
  as?: "h1" | "h2";
  className?: string;
};

/**
 * Jade eyebrow over a serif heading, the dining section head (docs §8.1,
 * mockup `.eyebrow` + `.h2`). Reveals stagger eyebrow then heading, matching
 * the mockup delays.
 */
export function DiningHead({
  eyebrow,
  title,
  as = "h2",
  className,
}: DiningHeadProps) {
  return (
    <div className={className}>
      <Reveal as="div">
        <Eyebrow accent="jade">{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal
        as={as}
        delay={100}
        className="[&_em]:text-champagne mt-6 font-serif text-[clamp(2.1rem,4.2vw,3.2rem)] leading-[1.1] font-medium tracking-[0.004em] [&_em]:italic"
      >
        <RichHeading text={title} />
      </Reveal>
    </div>
  );
}
