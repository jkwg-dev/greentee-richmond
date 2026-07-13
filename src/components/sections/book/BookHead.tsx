import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";

/**
 * /book page head (booking.md §5.2 item 1): mirrors the news index head
 * proportions with the §7 strings; the champagne italic emphasis comes through
 * RichHeading. Standard reveals.
 */
export function BookHead() {
  return (
    <div className="mx-auto max-w-[1360px] px-[6vw] pt-[158px] pb-2 max-[900px]:pt-[130px]">
      <Reveal as="div">
        <Eyebrow className="mb-[22px]">Book a Bay</Eyebrow>
      </Reveal>
      <Reveal
        as="h1"
        delay={100}
        className="[&_em]:text-champagne font-serif text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.05] font-medium [&_em]:italic"
      >
        <RichHeading text="Choose your *time*." />
      </Reveal>
      <Reveal
        as="p"
        delay={200}
        className="text-mist mt-[18px] max-w-[560px] text-[14.5px]"
      >
        Pick a date and party size to see open bays and times.
      </Reveal>
    </div>
  );
}
