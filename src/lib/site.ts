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

/** Book a Bay routes to the B1 booking browse page; this constant is the single source for the CTA target (booking.md §5.1). */
export const BOOK_A_BAY_HREF = "/book";
/**
 * The Crystal Jade standalone site; placeholder host until the domain is
 * final (design.md §15 item 11). Links always render this fallback so no
 * href is ever undefined.
 */
export const CRYSTAL_JADE_URL =
  process.env.NEXT_PUBLIC_CRYSTAL_JADE_URL ?? "https://crystal-jade-palace.example";
/** Every Book a Table CTA links out to the standalone site's reserve page, new tab (docs §3.4). */
export const BOOK_A_TABLE_HREF = `${CRYSTAL_JADE_URL}/reserve`;

export const primaryNav: NavLink[] = [
  { label: "The Spaces", href: "/spaces" },
  { label: "News & Offers", href: "/news" },
  { label: "Dining", href: CRYSTAL_JADE_URL, external: true },
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
  /** Compact hours + location line for the Home outro (docs §5.1 S8, §11.4). */
  openSummary: "Open daily · 06:00 to 24:00 · Garden Way, Richmond",
} as const;

/**
 * The siteSettings shape from the constants above: the seed source and the
 * render fallback while the CMS is unconfigured or unseeded (docs §11.5).
 */
export const fallbackSettings = {
  phone: visit.phone,
  address: visit.address,
  hours: visit.hours,
  openSummary: visit.openSummary,
  familyLinks,
  networkLinks,
};
