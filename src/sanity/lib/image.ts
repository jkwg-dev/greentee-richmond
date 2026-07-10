import createImageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";
import { dataset, projectId, sanityConfigured } from "../env";

const builder = sanityConfigured
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

/**
 * Build a Sanity CDN image URL with hotspot cropping (docs §11.6). Callers sit
 * behind `sanityFetch`, which returns null while unconfigured, so this only
 * runs once credentials exist.
 */
export function urlForImage(source: SanityImageSource) {
  if (!builder) {
    throw new Error("Sanity is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID)");
  }
  return builder.image(source);
}
