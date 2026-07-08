import Image from "next/image";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";
import type { PanoramaContent } from "@/types";

/**
 * S2b Panorama band (docs §5.1, mockup `.mani-media`). Full-bleed render with an
 * inner y-parallax (-5 to 5, scrubbed), a noir fade into the page top and
 * bottom, and a provenance caption. Collapses to 320px below 900px.
 */
export function PanoramaBand({ content }: { content: PanoramaContent }) {
  return (
    <Reveal
      as="figure"
      className="relative mt-[110px] h-[min(70vh,620px)] min-h-[400px] overflow-hidden max-[900px]:mt-[70px] max-[900px]:h-[320px] max-[900px]:min-h-0"
    >
      {content.image && (
        <ParallaxImage className="absolute inset-0 h-full w-full">
          <Image
            src={content.image.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: content.image.position ?? "62% 50%" }}
          />
        </ParallaxImage>
      )}

      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,var(--color-noir)_0%,transparent_13%,transparent_84%,var(--color-noir)_100%)]" />

      <figcaption className="text-ivory/85 absolute bottom-7 left-[6vw] z-[2] text-[9px] leading-[1.8] font-medium tracking-[0.28em] uppercase [text-shadow:0_1px_14px_rgba(0,0,0,0.75)]">
        {content.caption}
      </figcaption>
    </Reveal>
  );
}
