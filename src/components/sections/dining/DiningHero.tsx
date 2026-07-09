import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { CrystalJadeMark } from "./CrystalJadeMark";

const EYEBROW = "Cantonese Fine Dining · GreenTee Richmond Center";

/**
 * Full-screen landing hero (docs §8.3 `/dining` item 1, mockup `.hero-full`).
 * The visual slot stays a pending frame until the photo or video loop arrives
 * (§11.6); a gold frame insets the band and a scroll cue leads to the intro.
 * Below 1025px the Crystal Jade mark joins the hero (docs §8.2).
 */
export function DiningHero({
  title,
  tagline,
}: {
  title: string;
  tagline: string;
}) {
  return (
    <section className="relative h-[min(76svh,720px)] min-h-[460px] max-[900px]:h-[78svh]">
      <PhotoFrame
        tint="jade"
        showMark
        label={{
          kicker: "Full-screen visual",
          name: "Dining Room · Photo or Video Loop",
        }}
        tag="Replace with restaurant photography or video loop"
        className="absolute inset-0"
      />
      <div className="dine-hero-shade absolute inset-0 z-[2]" aria-hidden="true" />
      <div
        className="border-champagne/[0.32] pointer-events-none absolute inset-4 z-[4] border"
        aria-hidden="true"
      />

      <CrystalJadeMark
        rule={false}
        className="absolute top-10 left-11 z-[5] min-[1025px]:hidden max-[900px]:left-6"
      />

      <div className="absolute inset-x-11 bottom-12 z-[5] max-w-[680px] max-[900px]:inset-x-6 max-[900px]:bottom-8">
        <Reveal as="div">
          <Eyebrow className="before:opacity-[0.85]">{EYEBROW}</Eyebrow>
        </Reveal>
        <Reveal
          as="h1"
          delay={100}
          className="mt-6 mb-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[1.04] font-medium"
        >
          {title}
        </Reveal>
        <Reveal
          as="p"
          delay={180}
          className="text-champagne-bright/[0.92] font-serif text-[17px] italic"
        >
          {tagline}
        </Reveal>
      </div>

      <a
        href="#intro"
        aria-label="Scroll to introduction"
        className="dine-scrolldown"
      >
        <span />
      </a>
    </section>
  );
}
