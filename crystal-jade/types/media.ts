/**
 * Media domain types. Placeholder frames use `PhotoTint`; `InterimImage` is
 * the concrete-raster shape that the Sanity CDN fills once the separate
 * Crystal Jade Sanity project is wired into `lib/content.ts`.
 */

/** Placeholder gradient family, sampled from the deck renders. */
export type PhotoTint =
  "champagne" | "jade" | "rosegold" | "sage" | "emerald" | "iris" | "map";

/**
 * A concrete raster. Optional on content types because imagery can arrive
 * after copy; while absent, the styled pending frame renders instead.
 */
export type InterimImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position focal point, matching the mockup crop. */
  position?: string;
  /** LQIP blur placeholder from the asset metadata (Sanity-later, additive). */
  lqip?: string;
};
