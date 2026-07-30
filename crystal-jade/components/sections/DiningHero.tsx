import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SiteImage } from "@/components/ui/SiteImage";
import type { InterimImage } from "@/types";

const EYEBROW = "Cantonese Fine Dining · GreenTee Richmond Center";

/**
 * Full-screen landing hero (mockup `.hero-full`). The visual slot stays a
 * pending frame until the photo or video loop arrives; a gold frame insets
 * the band and a scroll cue leads to the intro. The brand mark lives in the
 * site header at every width.
 */
export function DiningHero({
  title,
  tagline,
  media,
}: {
  title: string;
  tagline: string;
  media?: InterimImage;
}) {
  return (
    <section className="relative h-[min(76svh,720px)] min-h-[460px] max-[900px]:h-[78svh]">
      <PhotoFrame
        tint="jade"
        showMark={!media}
        label={
          media
            ? undefined
            : {
                kicker: "Full-screen visual",
                name: "Dining Room · Photo or Video Loop",
              }
        }
        tag={
          media
            ? undefined
            : "Replace with restaurant photography or video loop"
        }
        className="absolute inset-0"
      >
        {media && (
          <SiteImage
            image={media}
            alt=""
            fill
            sizes="100vw"
            lqip={media.lqip}
            className="z-[1] object-cover"
          />
        )}
      </PhotoFrame>
      <div
        className="dine-hero-shade absolute inset-0 z-[2]"
        aria-hidden="true"
      />
      <div
        className="border-champagne/[0.32] pointer-events-none absolute inset-4 z-[4] border"
        aria-hidden="true"
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
