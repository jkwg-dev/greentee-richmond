import type { Dish, NavLink, Restaurant } from "@/types";
import { dishes, signatureDishes } from "./content/dishes";
import { restaurant } from "./content/restaurant";

/**
 * The single content accessor for the Crystal Jade site.
 *
 * Every piece of page content flows through this module: components receive
 * it via props or call a getter in a Server Component, and never hold copy,
 * nav items, hours, or menu data inline.
 *
 * Today the backing store is local typed config in `lib/content/`. Later it
 * becomes a separate Sanity project (NEXT_PUBLIC_SANITY_PROJECT_ID /
 * NEXT_PUBLIC_SANITY_DATASET, documented in .env.example, unused for now).
 * The getters are async so their signatures hold when that swap happens; the
 * Sanity client and CMS types will live inside this module, invisible to
 * every component. If the Sanity client makes this module server-only, the
 * nav constants split into a client-safe config module at that point; today
 * only Server Components import from here (client leaves get nav via props).
 */

/** The five page links on the rail and chips, in rail order. */
export const sitePages: NavLink[] = [
  { label: "Our Story", href: "/story" },
  { label: "The Chef", href: "/chef" },
  { label: "Menu", href: "/menu" },
  { label: "Banquet", href: "/banquet" },
  { label: "Reserve", href: "/reserve" },
];

/**
 * Book a Table target: the reserve page. Consumed only by the link provider
 * in `lib/reservations.ts`; components never read it directly, they render
 * `ReservationCta` with a provider-resolved target.
 */
export const BOOK_A_TABLE_HREF = "/reserve";

/** The restaurant singleton: copy, credentials, story, chef, banquet, reserve. */
export async function getRestaurant(): Promise<Restaurant> {
  return restaurant;
}

/** All menu dishes, unordered; the grid sorts by `order`. */
export async function getDishes(): Promise<Dish[]> {
  return dishes;
}

/** The landing Signature Dishes trio, in landing order. */
export async function getSignatureDishes(): Promise<Dish[]> {
  return signatureDishes;
}
