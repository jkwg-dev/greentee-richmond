import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RichHeading } from "@/components/ui/RichHeading";
import { BOOK_A_BAY_HREF, BOOK_A_TABLE_HREF } from "@/lib/site";
import type { OutroContent } from "@/types";

/**
 * S8 Outro (docs §5.1, mockup `#outro`). Centered closing statement over a soft
 * champagne glow; the visit line arrives from siteSettings (docs §11.4). Book a
 * Bay is a stub until booking exists, Book a Table lands on `/dining/reserve`.
 */
export function Outro({
  content,
  visitLine,
}: {
  content: OutroContent;
  visitLine: string;
}) {
  return (
    <section
      id="outro"
      className="outro-glow px-[6vw] pt-[170px] pb-[160px] text-center max-[900px]:pt-[120px] max-[900px]:pb-[110px]"
    >
      <Reveal as="div">
        <Eyebrow align="center" className="mb-6">
          {content.eyebrow}
        </Eyebrow>
      </Reveal>

      <Reveal
        as="h2"
        delay={100}
        className="mx-auto mb-[22px] max-w-[900px] font-serif text-[clamp(2.3rem,5.2vw,4.4rem)] leading-[1.08] font-medium [&_em]:text-champagne [&_em]:italic"
      >
        <RichHeading text={content.title} />
      </Reveal>

      <Reveal
        as="p"
        delay={180}
        className="text-mist mx-auto mb-[14px] max-w-[560px] text-[14.5px]"
      >
        {content.line}
      </Reveal>

      <Reveal
        as="p"
        delay={240}
        className="text-mist mb-11 text-[9.5px] leading-[1.9] font-medium tracking-[0.28em] uppercase"
      >
        {visitLine}
      </Reveal>

      <Reveal
        as="div"
        delay={300}
        className="flex flex-wrap justify-center gap-4"
      >
        <Button href={BOOK_A_BAY_HREF}>Book a Bay</Button>
        <Button href={BOOK_A_TABLE_HREF} variant="ghost">
          Book a Table
        </Button>
      </Reveal>
    </section>
  );
}
