import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { RichHeading } from "@/components/ui/RichHeading";
import type { PhotoTint } from "@/types";

export type DiningBandProps = {
  eyebrow: string;
  /** `\n` breaks lines; `*word*` renders italic champagne (RichHeading). */
  title: string;
  /** Optional serif italic support line (mockup `.band-line`). */
  line?: string;
  frame: { tint: PhotoTint; kicker: string; name: string; tag?: string };
};

/**
 * Band hero on the story, menu, and banquet pages (mockup `.hero-band`): a
 * 46svh pending frame with the gold inset frame, eyebrow, and serif H1. The
 * brand mark lives in the site header at every width.
 */
export function DiningBand({ eyebrow, title, line, frame }: DiningBandProps) {
  return (
    <section className="relative h-[min(46svh,430px)] min-h-[320px]">
      <PhotoFrame
        tint={frame.tint}
        showMark
        label={{ kicker: frame.kicker, name: frame.name }}
        tag={frame.tag}
        className="pf-quiet absolute inset-0"
      />
      <div
        className="border-champagne/[0.28] pointer-events-none absolute inset-4 z-[4] border"
        aria-hidden="true"
      />

      <div className="absolute inset-x-11 bottom-11 z-[5] max-w-[720px] max-[900px]:inset-x-6 max-[900px]:bottom-8">
        <Reveal as="div">
          <Eyebrow className="before:opacity-[0.85]">{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal
          as="h1"
          delay={100}
          className="[&_em]:text-champagne mt-6 font-serif text-[clamp(2.3rem,4.8vw,3.8rem)] leading-[1.08] font-medium [&_em]:italic"
        >
          <RichHeading text={title} />
        </Reveal>
        {line && (
          <Reveal
            as="p"
            delay={180}
            className="text-champagne-bright/[0.92] mt-3.5 font-serif text-[16.5px] italic"
          >
            {line}
          </Reveal>
        )}
      </div>
    </section>
  );
}
