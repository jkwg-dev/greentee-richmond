import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ManifestoContent } from "@/types";

/**
 * S2 Manifesto (docs §5.1, mockup `.manifesto`). Two serif lines, each closing
 * on an italic champagne emphasis word, over a supporting caption. Line-by-line
 * reveal; reduced motion settles immediately.
 */
export function Manifesto({ content }: { content: ManifestoContent }) {
  return (
    <section className="px-[6vw] pt-[160px] text-center">
      <Reveal as="div">
        <Eyebrow align="center" className="mb-6">
          {content.eyebrow}
        </Eyebrow>
      </Reveal>

      {content.lines.map((line, i) => (
        <Reveal
          as="p"
          key={line.emphasis}
          delay={i === 0 ? 80 : 180}
          className="font-serif text-[clamp(1.7rem,3.6vw,2.9rem)] leading-[1.36] font-medium [&_em]:text-champagne [&_em]:italic"
        >
          {line.text} <em>{line.emphasis}</em>.
        </Reveal>
      ))}

      <Reveal
        as="p"
        delay={300}
        className="text-mist mx-auto mt-8 max-w-[560px] text-[14.5px]"
      >
        {content.caption}
      </Reveal>
    </section>
  );
}
