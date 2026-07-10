import { newsFrameFor } from "@/lib/placeholders";
import type { NewsCategory, NewsEntry } from "@/types";
import { sanityFetch } from "./fetch";

/**
 * GROQ queries and their domain mappings (docs §11.5). This is the only place
 * raw GROQ shapes exist; sections receive src/types domain objects. Time-boxed
 * promotions are guarded on activeFrom/activeTo in GROQ (§4.3), never in
 * components.
 */

/* ---------------------------------------------------------------- news §4.2 */

const NEWS_INDEX_QUERY = `
*[
  _type == "newsPost" ||
  _type == "event" ||
  (
    _type == "promotion" &&
    placement == "card" &&
    (!defined(activeFrom) || activeFrom <= now()) &&
    (!defined(activeTo) || activeTo > now())
  )
] | order(coalesce(date, start, activeFrom) desc) [0...10] {
  _id,
  _type,
  title,
  timing,
  "excerpt": coalesce(excerpt, summary)
}`;

type NewsDoc = {
  _id: string;
  _type: "event" | "promotion" | "newsPost";
  title: string;
  timing: string;
  excerpt: string | null;
};

const NEWS_CATEGORY: Record<NewsDoc["_type"], NewsCategory> = {
  promotion: "offer",
  event: "event",
  newsPost: "news",
};

/**
 * The News & Offers union (docs §4.1, §7): promotions, events, and news posts,
 * newest first. Feeds both the /news index and the Home teaser; unconfigured
 * or empty CMS yields [] and the proven empty states render.
 */
export async function getNewsEntries(): Promise<NewsEntry[]> {
  const docs = await sanityFetch<NewsDoc[]>({
    query: NEWS_INDEX_QUERY,
    tags: ["news", "event", "promotion"],
  });

  return (docs ?? []).map((doc, index) => ({
    id: doc._id,
    category: NEWS_CATEGORY[doc._type],
    timing: doc.timing,
    title: doc.title,
    excerpt: doc.excerpt ?? undefined,
    // Placeholder frame art is UI-layer (§11.4); seeded entries keep their
    // mockup frames via the stable seed id (`<type>.<slug>`).
    frame: newsFrameFor(doc._id.split(".").pop() ?? doc._id, doc.title, index),
  }));
}
