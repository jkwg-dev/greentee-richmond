import type { MetadataRoute } from "next";

/** Keep in sync with `metadataBase` in src/app/layout.tsx (placeholder until the domain lands). */
const BASE_URL = "https://greentee-richmond.example";

/** The v1 surfaces (docs §3.1) plus /book (booking.md §5.1). Static by design; nothing CMS driven. */
const ROUTES = [
  "/",
  "/spaces",
  "/news",
  "/dining",
  "/dining/story",
  "/dining/chef",
  "/dining/menu",
  "/dining/banquet",
  "/dining/reserve",
  "/book",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${BASE_URL}${route}` }));
}
