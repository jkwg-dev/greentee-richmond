import { client } from "./client";

/** The §11.5 cache tags. Every query declares the tags that invalidate it. */
export type SanityTag =
  | "home"
  | "zone"
  | "restaurant"
  | "dish"
  | "event"
  | "promotion"
  | "news"
  | "settings";

/**
 * The single data path (docs §11.5): server-only, tag-cached GROQ fetches.
 * Pages stay static; publishing revalidates via /api/revalidate calling
 * revalidateTag on the matching tags. While Sanity is unconfigured (no
 * .env.local yet) every fetch resolves null and surfaces render their proven
 * empty states, so builds never depend on a live dataset.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags: SanityTag[];
}): Promise<T | null> {
  if (!client) return null;
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { tags },
  });
}
