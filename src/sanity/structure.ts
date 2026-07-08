import type { StructureResolver } from "sanity/structure";

/**
 * Studio desk structure (docs §11.4). Singletons (siteSettings, homePage,
 * restaurant) get pinned entries in Phase 6; the default list stands in for now.
 */
export const structure: StructureResolver = (S) =>
  S.list().title("Content").items(S.documentTypeListItems());
