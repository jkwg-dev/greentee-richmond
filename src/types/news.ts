import type { PhotoTint } from "./media";

/**
 * News & Offers domain type (docs §4.1, §4.2). The index is the union of
 * `promotion`, `event`, and `newsPost` documents, newest first; the home teaser
 * takes the latest as its featured entry. Imagery is a pending frame until real
 * photography lands, and `href` is stubbed until `/news/[slug]` ships (§15.10).
 */

export type NewsCategory = "offer" | "event" | "news";

export type NewsEntry = {
  id: string;
  category: NewsCategory;
  /** Short editorial timing label, e.g. "This Fall", "Through August" (docs §4.1). */
  timing: string;
  title: string;
  /** One-line summary; shown on the featured entry. */
  excerpt?: string;
  /** Placeholder frame descriptor until the image field is filled (docs §11.6). */
  frame: { tint: PhotoTint; kicker: string; name: string };
  /** Detail route; may be absent until detail routes exist (docs §15.10). */
  href?: string;
};

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  offer: "Offer",
  event: "Event",
  news: "News",
};
