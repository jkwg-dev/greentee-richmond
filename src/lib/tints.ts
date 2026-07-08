import type { PhotoTint } from "@/types/media";

/**
 * Placeholder tint to recipe-class map (docs §11.6). Shared by `PhotoFrame` and
 * the journey plates so the pending-state gradients stay defined in one place.
 * The classes themselves live in `globals.css` under `@layer components`.
 */
export const PHOTO_TINT_CLASS: Record<PhotoTint, string> = {
  champagne: "tint-champagne",
  jade: "tint-jade",
  rosegold: "tint-rosegold",
  sage: "tint-sage",
  emerald: "tint-emerald",
  iris: "tint-iris",
  map: "tint-map",
};
