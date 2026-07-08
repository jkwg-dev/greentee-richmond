import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/**
 * Read-only Sanity client. Data flows through src/sanity/lib/fetch.ts (Phase 6)
 * which layers cache tags on top; presentational components never import this.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
