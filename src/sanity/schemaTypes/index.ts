import type { SchemaTypeDefinition } from "sanity";

/**
 * Content schemas (docs §11.4). Populated in Phase 6 (siteSettings, homePage,
 * zone, restaurant, dish, event, promotion, newsPost). Empty at bootstrap so
 * the embedded Studio mounts cleanly.
 */
export const schemaTypes: SchemaTypeDefinition[] = [];
