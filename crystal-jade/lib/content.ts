/**
 * The single content accessor for the Crystal Jade site.
 *
 * Every piece of page content flows through the typed getters in this module.
 * Components never hold copy, nav items, hours, or menu data inline; they
 * receive it from here via props or call a getter in a Server Component.
 *
 * Today the backing store is local typed config. Later it becomes a separate
 * Sanity project (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET,
 * documented in .env.example, unused for now). When that lands, only this
 * module changes: the getters keep their signatures and the Sanity client and
 * CMS types stay inside it, invisible to every component.
 */

export interface SiteContent {
  /** Restaurant display name, used for the brand mark and titles. */
  name: string;
  /** One-line positioning statement under the brand. */
  tagline: string;
}

const site: SiteContent = {
  name: "Crystal Jade Palace",
  tagline: "The first Crystal Jade Palace in North America.",
};

export function getSite(): SiteContent {
  return site;
}
