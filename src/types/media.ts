/**
 * Media domain types. Interim renders (Phase 2) and, later, Sanity CDN assets
 * (Phase 6) share `InterimImage`; placeholder frames use `PhotoTint`.
 */

/** Placeholder gradient family, sampled from the deck renders (docs §11.6). */
export type PhotoTint =
  | "champagne"
  | "jade"
  | "rosegold"
  | "sage"
  | "emerald"
  | "iris"
  | "map";

/**
 * A concrete raster. In Phase 2 this points at an interim export under
 * `/public/renders`; in Phase 6 the same shape is filled from the Sanity CDN.
 * Optional on content types because imagery can arrive after copy (docs §11.6).
 */
export type InterimImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position focal point, matching the mockup crop. */
  position?: string;
  /** LQIP blur placeholder from the Sanity asset metadata (Phase 6, additive). */
  lqip?: string;
};
