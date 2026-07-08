import { PHOTO_TINT_CLASS } from "@/lib/tints";
import { cn } from "@/lib/utils";
import type { PhotoTint } from "@/types/media";

export type { PhotoTint };

export type PhotoFrameProps = {
  /** Placeholder gradient, sampled from the deck renders (docs §11.6). */
  tint?: PhotoTint;
  /** Centered kicker + name overlay. */
  label?: { kicker: string; name: string };
  /** Bottom-left provenance note, e.g. "Replace with restaurant photography". */
  tag?: string;
  /** Show the crosshair image mark above the label. */
  showMark?: boolean;
  /** Sizing / aspect (e.g. `aspect-[16/9]`), applied to the frame. */
  className?: string;
  /** Overrides the tinted fill, e.g. a future `<SanityImage>`. */
  children?: React.ReactNode;
};

/**
 * Styled pending state standing in for production imagery (docs §11.3 `.ph`).
 * Noir surface, inset vignette, and an irregular fractal-noise grain overlay;
 * every image ships through this until `<SanityImage>` lands. Decorative, so
 * the frame is `aria-hidden`.
 */
export function PhotoFrame({
  tint = "champagne",
  label,
  tag,
  showMark = false,
  className,
  children,
}: PhotoFrameProps) {
  return (
    <figure
      aria-hidden="true"
      className={cn(
        "grain-overlay border-hair relative overflow-hidden border bg-[#0f0f11] shadow-[inset_0_0_90px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      {children ?? (
        <div
          className={cn("absolute inset-[-10%] z-[1]", PHOTO_TINT_CLASS[tint])}
        />
      )}

      {label && (
        <div className="pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-3.5">
          {showMark && <span className="pf-mark" />}
          <span className="text-ivory/40 text-[8.5px] font-medium tracking-[0.4em] uppercase">
            {label.kicker}
          </span>
          <span className="text-ivory/[0.78] font-serif text-base tracking-[0.04em] italic">
            {label.name}
          </span>
        </div>
      )}

      {tag && (
        <figcaption className="text-mist/75 absolute bottom-3 left-4 z-[4] text-[8.5px] font-medium tracking-[0.26em] uppercase">
          {tag}
        </figcaption>
      )}
    </figure>
  );
}
