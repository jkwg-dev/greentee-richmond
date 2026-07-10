import type { NavLink } from "@/lib/site";

/**
 * Global settings domain type (docs §11.4 `siteSettings`): the single source
 * for the center's hours and address (footer visit line, outro visit line).
 * The restaurant's service hours live on `restaurant.reserve` — a different
 * business (§8.4).
 */
export type SiteSettings = {
  phone: string;
  address: string;
  hours: string;
  /** Compact outro visit line, e.g. "Open daily · 06:00 to 24:00 · Garden Way, Richmond". */
  openSummary: string;
  familyLinks: NavLink[];
  networkLinks: NavLink[];
};
