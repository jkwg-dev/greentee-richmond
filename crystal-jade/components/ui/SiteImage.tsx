import Image from "next/image";
import type { InterimImage } from "@/types";

export type SiteImageProps = {
  /** Mapped domain image; once Sanity lands, `src` is a CDN URL with hotspot baked in. */
  image: InterimImage;
  /** Every image declares sizes. */
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
 * Production image leaf: next/image over the mapped `InterimImage` shape.
 * No CMS client lives here; when the separate Sanity project is wired in,
 * `lib/content.ts` fills the same shape from the CDN. PhotoFrame remains the
 * designed pending state wherever an image field is empty; callers branch,
 * this component never does.
 */
export function SiteImage({
  image,
  sizes,
  fill = false,
  lqip,
  alt,
  className,
}: SiteImageProps) {
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
