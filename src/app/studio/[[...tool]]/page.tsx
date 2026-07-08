/**
 * Embedded Sanity Studio at /studio (docs §3.3). The catch-all route hands the
 * whole subtree to the Studio component; noindex is set in the sibling layout.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
