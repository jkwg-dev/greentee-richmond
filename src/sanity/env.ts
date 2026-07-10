/**
 * Sanity environment (docs §11.5). Project id and dataset are public; the read
 * token and revalidate secret are server-only and never reach the client
 * bundle. Values come exclusively from the environment (.env.local); nothing
 * hardcodes a project id.
 *
 * Until real credentials land, `sanityConfigured` is false: `sanityFetch`
 * short-circuits to null and every surface renders its proven empty state, so
 * the build never depends on a live dataset.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** True once NEXT_PUBLIC_SANITY_PROJECT_ID is present (docs §11.5). */
export const sanityConfigured = projectId.length > 0;
