import type { NewsEntry } from "@/types";

/**
 * Sample News & Offers dataset: the union of promotion/event/newsPost (docs
 * §4.1), newest first. The featured slot is simply the latest entry ([0]). The
 * home teaser (docs §4.2, §5.1 S4) takes the featured plus the next three cards;
 * the `/news` index (docs §7) uses all ten. CMS-driven in Phase 6; imagery is
 * placeholder frames and detail links are stubbed (§15.10).
 *
 * "An Evening at Crystal Jade" keeps its jade placeholder tint: the card's
 * subject is Crystal Jade Palace, which §2.1's subject-based scope covers
 * (§7 mockup note 3). Empty states are proven by the two toggles.
 */
const entries: NewsEntry[] = [
  {
    id: "crystal-jade-arrives",
    category: "news",
    timing: "This Fall",
    title: "Crystal Jade Palace Arrives",
    excerpt:
      "The first Crystal Jade Palace in North America opens on the promenade this September, led by a Michelin-starred kitchen and four consecutive years of Vancouver stars.",
    frame: { tint: "champagne", kicker: "Photo", name: "Crystal Jade Palace" },
  },
  {
    id: "twilight-bay-rates",
    category: "offer",
    timing: "Through August",
    title: "Twilight Bay Rates",
    excerpt:
      "Evening bay bookings, Sunday to Thursday, at opening-season rates.",
    frame: { tint: "champagne", kicker: "Photo", name: "Twilight Bays" },
  },
  {
    id: "autumn-simulator-league",
    category: "event",
    timing: "From September",
    title: "The Autumn Simulator League",
    excerpt:
      "Eighteen weeks, four-player teams, a new championship course every round.",
    frame: { tint: "sage", kicker: "Photo", name: "Simulator League" },
  },
  {
    id: "junior-golf-mornings",
    category: "event",
    timing: "Saturdays",
    title: "Junior Golf Mornings",
    excerpt:
      "Coached sessions for young players on the general at-bat floor.",
    frame: { tint: "emerald", kicker: "Photo", name: "Junior Mornings" },
  },
  {
    id: "opening-month",
    category: "news",
    timing: "August",
    title: "Opening Month at the Center",
    excerpt: "Doors open on the first indoor club in the GreenTee network.",
    frame: { tint: "rosegold", kicker: "Photo", name: "Opening Month" },
  },
  {
    id: "golf-academy-indoors",
    category: "news",
    timing: "July",
    title: "GreenTee Golf Academy Comes Indoors",
    excerpt: "Lessons from the family academy arrive on the simulator floor.",
    frame: { tint: "iris", kicker: "Photo", name: "Golf Academy" },
  },
  {
    id: "morning-nine",
    category: "offer",
    timing: "Weekdays",
    title: "Morning Nine: Early Bay Hours",
    excerpt: "Nine simulated holes before work, with coffee from the promenade.",
    frame: { tint: "iris", kicker: "Photo", name: "Morning Nine" },
  },
  {
    id: "crystal-jade-evening",
    category: "event",
    timing: "Monthly",
    title: "An Evening at Crystal Jade",
    excerpt:
      "A seasonal tasting across the private rooms, paired with the chef's notes.",
    frame: { tint: "jade", kicker: "Photo", name: "Crystal Jade Evening" },
  },
  {
    id: "facade-lights-up",
    category: "news",
    timing: "June",
    title: "The Facade Lights Up",
    excerpt: "Blooming Buds glows for the first time over Garden Way.",
    frame: { tint: "champagne", kicker: "Photo", name: "Blooming Buds" },
  },
  {
    id: "gift-cards-season",
    category: "offer",
    timing: "Year-round",
    title: "Gift Cards for the Season",
    excerpt: "Bays, rooms, and dinners at Crystal Jade, in one envelope.",
    frame: { tint: "emerald", kicker: "Photo", name: "Gift Cards" },
  },
];

/**
 * The raw sample set: the Phase 6 seed source (scripts/seed.ts) and the
 * UI-layer placeholder frame map (src/lib/placeholders.ts) both read it.
 */
export const sampleNewsEntries: NewsEntry[] = entries;

/** Flip to true to prove the empty state on the Home teaser (docs §4.2). */
export const NEWS_TEASER_EMPTY = false;
/** Flip to true to prove the empty state on the `/news` index (docs §7). */
export const NEWS_INDEX_EMPTY = false;

/** Home teaser: featured + first three cards (docs §5.1 S4). */
export const newsEntries: NewsEntry[] = NEWS_TEASER_EMPTY ? [] : entries;
/** `/news` index: featured + nine cards (docs §7). */
export const newsIndexEntries: NewsEntry[] = NEWS_INDEX_EMPTY ? [] : entries;
