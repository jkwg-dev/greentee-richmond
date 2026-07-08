/**
 * Static navigation and visit data (docs §3.4). CMS-backed in Phase 6 via
 * `siteSettings`; centralized here so the header, FullMenu, and footer share
 * one source. Placeholders (address, hours, phone) are confirmed before launch.
 */

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** Book a Bay lands on the footer `#contact` anchor until booking exists (docs §15.1). */
export const BOOK_A_BAY_HREF = "#contact";
/** Book a Table routes to the reservation page everywhere (docs §3.4). */
export const BOOK_A_TABLE_HREF = "/dining/reserve";

export const primaryNav: NavLink[] = [
  { label: "The Spaces", href: "/spaces" },
  { label: "News & Offers", href: "/news" },
  { label: "Dining", href: "/dining" },
];

/** On `/dining` the Dining item expands into these two (docs §3.4). */
export const diningSubNav: NavLink[] = [
  { label: "Crystal Jade Palace", href: "/dining" },
  { label: "Menu & Reserve", href: "/dining/menu" },
];

export const networkLinks: NavLink[] = [
  {
    label: "Westwood Plateau",
    href: "https://www.gtccwestwoodplateau.com/",
    external: true,
  },
  { label: "Tobiano", href: "https://gtcctobiano.com/", external: true },
  { label: "Langley", href: "#" },
];

export const familyLinks: NavLink[] = [
  { label: "JK World Group", href: "#" },
  { label: "GreenTee Golf Shop", href: "#" },
  { label: "GreenTee Golf Academy", href: "#" },
  { label: "JKWG Design & Development", href: "#" },
  { label: "Jess' Restaurants", href: "#" },
];

/** Placeholder visit facts (docs §5.3, §15). */
export const visit = {
  address: "0000 Garden Way, Richmond",
  hours: "Daily, 06:00 to 24:00",
  phone: "+1 000 000 0000",
  designCredit: "Interior & exterior design concept: JKWG",
} as const;
