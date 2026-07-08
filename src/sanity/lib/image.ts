import createImageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Build a Sanity CDN image URL with hotspot cropping (docs §11.6). */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
