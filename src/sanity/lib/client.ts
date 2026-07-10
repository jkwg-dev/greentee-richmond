import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "../env";

/**
 * Read-only Sanity client, or null until credentials land in .env.local. Data
 * flows through src/sanity/lib/fetch.ts, which layers the §11.5 cache tags on
 * top; presentational components never import this. `useCdn` stays off because
 * caching is tag-driven ISR through the Next fetch cache (§11.5); the API CDN
 * would add a second, untaggable cache in front of it.
 */
export const client: SanityClient | null = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    })
  : null;
