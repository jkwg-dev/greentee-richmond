import { draftMode } from "next/headers";
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

const readToken = process.env.SANITY_API_READ_TOKEN;

/** Draft-perspective client for editor preview (docs §11.5); server-only. */
const draftClient =
  client && readToken
    ? client.withConfig({
        token: readToken,
        perspective: "drafts",
        stega: { enabled: true, studioUrl: "/studio" },
      })
    : null;

/**
 * The single data path (docs §11.5): server-only, tag-cached GROQ fetches.
 * Pages stay static; publishing revalidates via /api/revalidate calling
 * revalidateTag on the matching tags. Under Draft Mode (Presentation preview)
 * fetches switch to the drafts perspective, uncached, with stega overlays.
 * While Sanity is unconfigured (no .env.local yet) every fetch resolves null
 * and surfaces render their proven empty states, so builds never depend on a
 * live dataset.
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

  const { isEnabled: isDraft } = await draftMode();
  if (isDraft && draftClient) {
    return draftClient.fetch<T>(query, params, { cache: "no-store" });
  }

  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { tags },
  });
}
