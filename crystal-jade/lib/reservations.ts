import { BOOK_A_TABLE_HREF, getRestaurant } from "./content";

/**
 * The reservation seam.
 *
 * Every reservation action renders through `ReservationCta`, and every
 * target it renders is resolved here. Today the active implementation is
 * the link provider below: internal routes and the reserve page's embed
 * anchor, driven by config. An OpenTable provider will replace it when
 * that integration opens (no SDK, embed, or script before then).
 *
 * No component outside this module may know which provider is active.
 * Server Components and pages call `getReservationProvider()` and pass the
 * resolved `ReservationTarget` down as props; client leaves receive it the
 * same way (the props-over-import rule in CLAUDE.md). The methods are
 * async so their signatures hold when a provider needs config or network.
 */

export type ReservationTarget = {
  href: string;
  /** External targets open a new tab with rel="noopener noreferrer". */
  external?: boolean;
};

export interface ReservationProvider {
  /** The global Book a Table entry: header, menu, and section CTAs. */
  book(): Promise<ReservationTarget>;
  /** The terminal action on the reserve page (the future booking surface). */
  reserve(): Promise<ReservationTarget>;
}

/**
 * Link provider: Book a Table routes to the reserve page; the reserve
 * page's own CTA goes to the configured OpenTable URL once it exists,
 * and to the on-page embed-placeholder anchor until then.
 */
const linkProvider: ReservationProvider = {
  async book() {
    return { href: BOOK_A_TABLE_HREF };
  },
  async reserve() {
    const { reserve } = await getRestaurant();
    return reserve.openTableUrl
      ? { href: reserve.openTableUrl, external: true }
      : { href: "#reservations" };
  },
};

export function getReservationProvider(): ReservationProvider {
  return linkProvider;
}
