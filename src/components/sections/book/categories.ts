import type { BookingRoomCategory } from "@/types/booking";

/**
 * UI labels for the §11.3 categories, component-side (not a data concern).
 * The filter renders a chip only for the three named categories when present
 * (booking.md §11.3, §11.5); `other` is the heuristic's degradation bucket, so
 * a mis-guessed room simply lives under All Spaces with no dedicated chip,
 * never a broken filter. The per-card and pane microlabel is the singular form.
 */

/** Fixed display order; `other` intentionally absent (no filter chip). */
export const CATEGORY_FILTER_ORDER = ["bay", "vip", "vvip"] as const;

export type FilterableCategory = (typeof CATEGORY_FILTER_ORDER)[number];

export const CATEGORY_FILTER_LABEL: Record<FilterableCategory, string> = {
  bay: "Bays",
  vip: "VIP Rooms",
  vvip: "VVIP Suites",
};

/** The card and detail-pane microlabel (singular). */
export const CATEGORY_MICROLABEL: Record<BookingRoomCategory, string> = {
  bay: "Bay",
  vip: "VIP Room",
  vvip: "VVIP Suite",
  other: "Space",
};
