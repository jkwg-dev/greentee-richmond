import { BOOK_A_BAY_HREF, BOOK_A_TABLE_HREF } from "@/lib/site";
import type { Zone } from "@/types";

/**
 * The nine `/spaces` zones (docs §6.3), ported verbatim from
 * `docs/mockups/greentee-spaces.html` (v3). Shapes mirror the §11.4 `zone`
 * schema; journey panels are NOT here (they live on the home mock, §5.2).
 *
 * Deviations from the mockup, flagged in the Phase 3 report:
 * - Hero renders and room images are PhotoFrame/tint placeholders (§11.6, as in
 *   Phase 2); the deck-render `heroTag` marks the pending state.
 * - Motif labels use champagne, not the mockup's `--jade-text`: §6.3 scopes jade
 *   on `/spaces` to the Dining panel only.
 * Fields beyond §11.4 (chipLabel, areaLabel, heroTag, cta, diningPanel) are
 * display/placeholder concerns.
 */
export const zones: Zone[] = [
  {
    slug: "general-at-bat",
    floor: "1F",
    name: "General At-Bat",
    chipLabel: "At-Bat",
    conceptTitle: "The Vitality of a Swing",
    conceptLine:
      "The refreshing trajectory of a swing and its details create the vitality of the space.",
    order: 1,
    lead: "Rows of tour-grade bays run the length of the first floor, each one a quiet capsule of focus.",
    body: "Multi-sensor tracking reads ball and club on every swing, and an analysis system keeps the numbers honest, so practice here carries to the course.",
    facts: [
      { label: "Bays", value: "Tour-grade simulator bays" },
      { label: "Tracking", value: "Multi-sensor ball and club data" },
      { label: "Format", value: "Solo practice and group play" },
    ],
    cta: { label: "Book a Bay", href: BOOK_A_BAY_HREF, variant: "solid" },
    heroTint: "champagne",
    heroTag: "Deck render · replace with final photography",
  },
  {
    slug: "putting-zone",
    floor: "1F",
    name: "Putting Zone",
    chipLabel: "Putting",
    conceptTitle: "Sunlight Through a Forest",
    conceptLine: "A vibrant space that flows like the sunlight through a forest.",
    order: 2,
    lead: "A true-roll green under a botanical canopy, where filtered light falls as if through leaves.",
    body: "Tables and perches along the edge keep the zone social: focused practice on the surface, easy conversation around it.",
    facts: [
      { label: "Surface", value: "True-roll practice green" },
      { label: "Setting", value: "Botanical canopy, filtered light" },
      { label: "Use", value: "Short game and social practice" },
    ],
    cta: { label: "Book a Bay", href: BOOK_A_BAY_HREF, variant: "solid" },
    heroTint: "sage",
    heroTag: "Deck render · replace with final photography",
  },
  {
    slug: "fitting-shop",
    floor: "1F",
    name: "Fitting Shop",
    chipLabel: "Fitting",
    conceptTitle: "Balance and Proportion",
    conceptLine:
      "A space designed exclusively for individuals, where balance and proportion converge.",
    order: 3,
    lead: "An enclosed capsule bay, built for one player at a time and the equipment that fits them alone.",
    body: "Full club fitting and gapping, verified on the launch monitor and finished with a specification you can carry to the pro shop next door.",
    facts: [
      { label: "Studio", value: "Enclosed capsule fitting bay" },
      { label: "Service", value: "Full fitting and gapping" },
      { label: "Data", value: "Launch monitor verified" },
    ],
    cta: { label: "Enquire", href: BOOK_A_BAY_HREF, variant: "solid" },
    heroTint: "rosegold",
    heroTag: "Deck render · replace with final photography",
  },
  {
    slug: "pro-shop",
    floor: "1F",
    name: "Pro Shop",
    chipLabel: "Pro Shop",
    conceptTitle: "Movements That Draw the Gaze",
    conceptLine:
      "The delicate movements of a vitalizing breeze become a patterned object overhead.",
    order: 4,
    lead: "A champagne lattice of shelves beneath a ceiling that moves like the wind that shaped the building.",
    body: "Clubs, apparel, and accessories curated for the club, with member sourcing available on request.",
    facts: [
      { label: "Range", value: "Clubs, apparel, accessories" },
      { label: "Setting", value: "Champagne lattice display" },
      { label: "Service", value: "Member sourcing on request" },
    ],
    cta: { label: "Visit the shop", href: BOOK_A_BAY_HREF, variant: "ghost" },
    heroTint: "champagne",
    heroTag: "Deck render · replace with final photography",
  },
  {
    slug: "sauna",
    floor: "1F",
    name: "Sauna",
    chipLabel: "Sauna",
    conceptTitle: "Breathing Alongside Nature",
    conceptLine:
      "The essence of harmony, a warm cedar calm for the hour after the round.",
    order: 5,
    lead: "A dry cedar sauna, warm and quiet, where the day settles before you step back out.",
    body: "Shower and powder rooms sit alongside, so the visit ends as composed as it began.",
    facts: [
      { label: "Type", value: "Dry cedar sauna" },
      { label: "Adjacent", value: "Shower and powder rooms" },
      { label: "Access", value: "Included with play" },
    ],
    heroTint: "rosegold",
    heroTag: "Deck render · replace with final photography",
  },
  {
    slug: "amenities",
    floor: "1F",
    name: "Amenities",
    chipLabel: "Amenities",
    conceptTitle: "Harmony in the Details",
    conceptLine:
      "Meticulous attention to detail, even in the spaces you only pass through.",
    order: 6,
    lead: "The standard of the club holds everywhere, including the rooms most places overlook.",
    body: "Toilet W and M, a shower room, and a powder room, each finished with the same materials and light as the floors they serve.",
    facts: [
      { label: "Rooms", value: "Toilet W and M, shower, powder room" },
      { label: "Floor", value: "1F, beside the sauna" },
    ],
    heroTint: "map",
    heroTag: "Deck renders · Toilet W · Toilet M · Shower · Powder Room",
  },
  {
    slug: "dining",
    floor: "1F",
    name: "Dining",
    chipLabel: "Dining",
    conceptTitle: "Warm Sunshine on the Western River",
    conceptLine:
      "Everyday and togetherness, gathered under soothing waves of light.",
    order: 7,
    heroTint: "champagne",
    heroTag: "Deck render · replace with restaurant photography",
    diningPanel: {
      eyebrow: "Crystal Jade Palace",
      title: "Cantonese fine dining,\non the promenade.",
      body: "The dining room belongs to Crystal Jade Palace, the first in North America, led by a Michelin-starred kitchen. Its full story, menu, and reservations live on its own page.",
      ctaPrimary: {
        label: "Crystal Jade Palace",
        href: "/dining",
        variant: "solid",
      },
      ctaSecondary: {
        label: "Book a Table",
        href: BOOK_A_TABLE_HREF,
        variant: "ghost",
      },
    },
  },
  {
    slug: "vip-rooms",
    floor: "2F",
    name: "VIP Rooms",
    chipLabel: "VIP Rooms",
    areaLabel: "Private Area",
    conceptTitle: "Iconic 15",
    conceptLine:
      "Fifteen imaginary landscapes infused with the physical properties of nature.",
    order: 8,
    lead: "Iconic 15 is the private second floor: fifteen VIP rooms, each translating a property of nature into a room-scale landscape.",
    body: "Sprout, grain, leaf, and crystal. The motifs shift from room to room, so no two evenings read the same, and every room carries a full simulator of its own.",
    facts: [
      { label: "Rooms", value: "Fifteen on the second floor" },
      { label: "Motifs", value: "Sprout, grain, leaf, crystal" },
      { label: "Booking", value: "By the room, hourly" },
    ],
    cta: { label: "Book a Room", href: BOOK_A_BAY_HREF, variant: "solid" },
    heroTint: "iris",
    heroTag: "Deck render · replace with final photography",
    roomsHeading: "The fifteen rooms",
    motifLegend: ["Sprout", "Grain", "Leaf", "Crystal"],
    rooms: [
      { name: "VIP Room 1", motif: "Grain", tint: "champagne" },
      { name: "VIP Room 2", motif: "Crystal", tint: "iris" },
      { name: "VIP Room 3", motif: "Leaf", tint: "emerald" },
      { name: "VIP Room 4", motif: "Leaf", tint: "emerald" },
      { name: "VIP Room 5", motif: "Sprout", tint: "sage" },
      { name: "VIP Room 6", motif: "Crystal", tint: "iris" },
      { name: "VIP Room 7", motif: "Sprout", tint: "sage" },
      { name: "VIP Room 8", motif: "Crystal", tint: "iris" },
      {
        name: "VIP Room 9 & 10",
        motif: "Sprout",
        tint: "sage",
        line: "Drawn into a dreamy world through the spaces between the stems.",
      },
      {
        name: "VIP Room 11 & 12",
        motif: "Leaf",
        tint: "emerald",
        line: "The melody of nature, resonating through falling raindrops.",
      },
      {
        name: "VIP Room 13",
        motif: "Crystal",
        tint: "iris",
        line: "Life blooming through the snowy field.",
      },
      {
        name: "VIP Room 14",
        motif: "Grain",
        tint: "champagne",
        pending: true,
        pendingLabel: "Render pending",
      },
      {
        name: "VIP Room 15",
        motif: "Sprout",
        tint: "sage",
        pending: true,
        pendingLabel: "Render pending",
      },
    ],
  },
  {
    slug: "vvip-rooms",
    floor: "2F",
    name: "VVIP Rooms",
    chipLabel: "VVIP",
    areaLabel: "Private Area",
    conceptTitle: "Beyond the Fifteen",
    conceptLine: "Four singular suites, reserved for the few.",
    order: 9,
    lead: "Above the fifteen sit four VVIP suites, each a singular commission with a design of its own.",
    body: "Their interiors are held back for now and will be revealed to members first.",
    facts: [
      { label: "Suites", value: "Four, all different" },
      { label: "Status", value: "Designs to be revealed" },
      { label: "Access", value: "By arrangement" },
    ],
    cta: { label: "Enquire", href: BOOK_A_BAY_HREF, variant: "ghost" },
    heroPending: true,
    heroPendingLabel: "Renders to be revealed",
    heroTint: "champagne",
    rooms: [
      {
        name: "VVIP Room 1",
        pending: true,
        pendingLabel: "To be revealed",
        showMark: true,
        tint: "champagne",
      },
      {
        name: "VVIP Room 2",
        pending: true,
        pendingLabel: "To be revealed",
        showMark: true,
        tint: "emerald",
      },
      {
        name: "VVIP Room 3",
        pending: true,
        pendingLabel: "To be revealed",
        showMark: true,
        tint: "emerald",
      },
      {
        name: "VVIP Room 4",
        pending: true,
        pendingLabel: "To be revealed",
        showMark: true,
        tint: "champagne",
      },
    ],
  },
];
