import type { NewsEntry } from "@/types";

/**
 * Sample News & Offers entries feeding the Home teaser (docs §4.2, §5.1 S5).
 * The union of promotion/event/newsPost, newest first: the teaser takes the
 * first as its featured preview and the next three as cards. CMS-driven in
 * Phase 6; imagery is placeholder frames and detail links are stubbed (§15.10).
 *
 * Empty-state proof: flip `NEWS_TEASER_EMPTY` to true and the teaser renders
 * nothing (docs §4.2).
 */
export const NEWS_TEASER_EMPTY = false;

const entries: NewsEntry[] = [
  {
    id: "crystal-jade-arrives",
    category: "news",
    timing: "This Fall",
    title: "Crystal Jade Palace Arrives",
    excerpt:
      "The first Crystal Jade Palace in North America opens on the promenade this September, led by a Michelin-starred kitchen.",
    frame: { tint: "champagne", kicker: "Photo", name: "Crystal Jade Palace" },
  },
  {
    id: "twilight-bay-rates",
    category: "offer",
    timing: "Through August",
    title: "Twilight Bay Rates",
    frame: { tint: "champagne", kicker: "Photo", name: "Twilight Bays" },
  },
  {
    id: "autumn-simulator-league",
    category: "event",
    timing: "From September",
    title: "The Autumn Simulator League",
    frame: { tint: "sage", kicker: "Photo", name: "Simulator League" },
  },
  {
    id: "junior-golf-mornings",
    category: "event",
    timing: "Saturdays",
    title: "Junior Golf Mornings",
    frame: { tint: "emerald", kicker: "Photo", name: "Junior Mornings" },
  },
];

export const newsEntries: NewsEntry[] = NEWS_TEASER_EMPTY ? [] : entries;
