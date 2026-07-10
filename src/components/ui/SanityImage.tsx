import Image from "next/image";
import type { InterimImage } from "@/types";

export type SanityImageProps = {
  /** Mapped domain image; in Phase 6 `src` is a Sanity CDN URL with hotspot baked in (docs §11.6). */
  image: InterimImage;
  /** Required per docs §10: every image declares sizes. */
  sizes: string;
  /** Fill the positioned parent instead of intrinsic sizing. */
  fill?: boolean;
  /** LQIP blur placeholder from the asset metadata, when the mapping provides it. */
  lqip?: string;
  /** Decorative images (inside labelled links, aria-hidden frames) pass "". */
  alt?: string;
  className?: string;
};

/**
 * Production image leaf (docs §11.1): next/image over the Sanity CDN with
 * hotspot cropping applied by the mapping layer (urlForImage) and optional
 * LQIP blur. PhotoFrame remains the designed pending state wherever an image
 * field is empty; callers branch, this component never does.
 */
export function SanityImage({
  image,
  sizes,
  fill = false,
  lqip,
  alt,
  className,
}: SanityImageProps) {
  return (
    <Image
      src={image.src}
      alt={alt ?? image.alt}
      {...(fill
        ? { fill: true }
        : { width: image.width, height: image.height })}
      sizes={sizes}
      placeholder={lqip ? "blur" : undefined}
      blurDataURL={lqip}
      className={className}
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}
