import Image from "next/image";
import { HeroParticles } from "@/components/canvas/HeroParticles";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BOOK_A_BAY_HREF } from "@/lib/site";
import type { HeroContent } from "@/types";

/**
 * Entrance offsets chained off the intro curtain (docs §5.1, §9.2). They mirror
 * the mockup intro→hero timeline so the copy blooms as the curtain clears: the
 * title bloom is in seconds (SplitHeading / GSAP), the rest in milliseconds
 * (Reveal). Reduced motion settles everything immediately, ignoring these.
 */
const BLOOM = {
  title: 2.0,
  eyebrow: 2100,
  sub: 2350,
  cta: 2650,
} as const;

/**
 * S1 Hero (docs §5.1, mockup `.hero`). Facade render bottom-anchored and scaled
 * to crop baked deck typography (§11.6), a top-heavy shade, HeroParticles behind
 * a radial scrim, and the letter-bloom H1. A server shell over client leaves.
 */
export function HomeHero({ hero }: { hero: HeroContent }) {
  return (
    <section
      id="top"
      className="relative flex h-svh min-h-[640px] items-center justify-center overflow-hidden text-center"
    >
      {hero.media && (
        <div className="absolute inset-0 z-[1]">
          <Image
            src={hero.media.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.12] object-cover"
            style={{
              objectPosition: hero.media.position ?? "50% 100%",
              transformOrigin: "50% 100%",
            }}
          />
        </div>
      )}

      <div className="hero-shade absolute inset-0 z-[2]" />
      <HeroParticles className="z-[3]" />

      <div className="hero-scrim relative z-[5] max-w-[1000px] px-[6vw]">
        <Reveal as="div" delay={BLOOM.eyebrow}>
          <Eyebrow align="center" className="mb-6">
            {hero.eyebrow}
          </Eyebrow>
        </Reveal>

        <SplitHeading
          lines={[hero.titleLines[0], hero.titleLines[1]]}
          delay={BLOOM.title}
          className="mt-1.5 mb-[26px] font-serif text-[clamp(2.6rem,9vw,7.6rem)] leading-[1.04] font-medium tracking-[0.012em]"
        />

        <Reveal
          as="p"
          delay={BLOOM.sub}
          className="text-ivory/[0.92] mx-auto mb-10 max-w-[520px] text-[14.5px] [text-shadow:0_1px_18px_rgba(0,0,0,0.8)]"
        >
          <span className="font-serif text-[17.5px] text-[rgba(255,252,244,0.98)] italic">
            {hero.italicLine}
          </span>
          <br />
          {hero.supportLine}
        </Reveal>

        <Reveal
          as="div"
          delay={BLOOM.cta}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button href={BOOK_A_BAY_HREF}>Book a Bay</Button>
          <Button href="#spaces" variant="light">
            Explore the Spaces
          </Button>
        </Reveal>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-[5] flex flex-col items-center gap-3">
        <small className="text-mist text-[8.5px] font-medium tracking-[0.4em] uppercase">
          Scroll
        </small>
        <span className="scroll-cue-line" />
      </div>
    </section>
  );
}
