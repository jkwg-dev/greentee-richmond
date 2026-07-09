import type { Restaurant, RestaurantPreview } from "@/types";

/**
 * The full Crystal Jade Palace `restaurant` singleton (docs §8.4), feeding the
 * six `/dining` routes (§8.3) and, via `restaurantPreview`, the Home dining
 * preview (§5.1 S5). Copy ported verbatim from the dining mockups (v6); the
 * phone, WeChat handle, hours, address, room count, and footprint list are
 * placeholders confirmed before launch (§15). CMS-driven in Phase 6.
 */
export const restaurant: Restaurant = {
  name: "Crystal Jade Palace",
  tagline: "A Michelin dining experience · The first in North America",
  lede: "Cantonese fine dining on the promenade. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen.",
  intro: {
    lede: "One of Asia's most respected Cantonese kitchens arrives in Richmond.",
    support:
      "Classical technique, premium ingredients, and a quiet creativity that never obscures either. Lunch and dinner daily, within GreenTee Richmond Center.",
  },
  credentials: [
    {
      label: "Michelin",
      value: "Vancouver Michelin Star, four consecutive years",
      detail: "2022 to 2025",
    },
    {
      label: "Accolades",
      value: "North America's Best Chinese Cuisine Restaurant, 2025",
      detail: "Supreme Gold, World Championship of Chinese Cuisine 2024",
    },
    {
      label: "Private Dining",
      value: "Private rooms and bespoke banquet menus",
      detail: "Corporate dining by arrangement",
    },
  ],
  privateDining: {
    copy: "From board dinners to family celebrations, eight private rooms hold intimate parties and full banquet tables, each with dedicated service and menus composed for the occasion.",
    facts: [
      {
        label: "Private Rooms",
        value: "Eight rooms",
        detail: "Placeholder, confirm count",
      },
      { label: "Capacity", value: "From six guests to full banquet tables" },
      { label: "Booking", value: "Separate enquiry channel for private events" },
    ],
  },
  story: {
    heritage: {
      lead: "Crystal Jade began with one Cantonese kitchen and grew into one of Asia's most respected names in fine dining.",
      body: [
        "Across decades and cities, the group has carried the discipline of classical technique wherever it opens a door. The standard travels. The kitchen adapts.",
      ],
    },
    footprint: ["Singapore", "Hong Kong", "Shanghai", "Across Asia"],
    footprintNow: "Now, Richmond",
    richmond: {
      lead: "Richmond is home to one of the most discerning Cantonese dining audiences outside Asia.",
      body: [
        "Crystal Jade Palace comes here not to introduce the cuisine, but to honor how well this city already knows it.",
        "The timing is simple. A room worthy of the kitchen became possible at GreenTee Richmond Center, and the kitchen was ready.",
      ],
    },
    philosophy: [
      {
        title: "Classical Technique",
        line: "Recipes held to the standard of the masters who wrote them. Nothing enters the menu until it survives that comparison.",
      },
      {
        title: "Premium Ingredients",
        line: "Sourcing decides the ceiling of every dish. The kitchen sources accordingly, season by season.",
      },
      {
        title: "Quiet Creativity",
        line: "New ideas arrive slowly, and only when they deepen the original rather than decorate it.",
      },
    ],
  },
  chef: {
    intro: "A journey measured\nin quiet *decades*.",
    awards: [
      {
        title: "Vancouver Michelin Star",
        detail: "Four consecutive years",
        years: "2022 to 2025",
      },
      {
        title: "World Championship of Chinese Cuisine",
        detail: "Individual Supreme Gold Award",
        years: "2024",
      },
      {
        title: "North America's Best Chinese Cuisine Restaurant",
        years: "2025",
      },
    ],
    bio: "Twenty-three years across five-star kitchens, from Banyan Tree and Marriott to InterContinental and Pan Pacific. A culinary journey that began in China and now settles in Vancouver.",
    moments: [
      "Host to a Canadian Prime Minister and senators",
      "Commended by a State Councilor of China",
      "Featured in culinary publications",
    ],
    quote:
      "Cantonese cuisine rewards patience. My work is to let the ingredient speak first, and to speak second.",
  },
  banquet: {
    copy: "Corporate dinners, family celebrations, and ceremonies, held behind a closed door with a team assigned to the room.",
    facts: [
      {
        label: "Private Rooms",
        value: "Eight rooms",
        detail: "Placeholder, confirm count",
      },
      { label: "Capacity", value: "From six guests to full banquet tables" },
      { label: "Service", value: "Dedicated service team for every room" },
    ],
    occasions: ["Corporate dining", "Celebrations", "Ceremonies"],
    menus: [
      {
        label: "Per Person",
        line: "Individually plated set menus",
        detail: "Pricing on enquiry",
      },
      {
        label: "Per Table",
        line: "Traditional banquet menus, shared",
        detail: "Pricing on enquiry",
      },
    ],
    enquiryTarget: "/dining/reserve",
  },
  reserve: {
    phone: "+1 000 000 0000",
    wechat: "CrystalJadeYVR",
    hours: ["Lunch 11:00 to 14:30", "Dinner 17:30 to 22:00"],
    address: { name: "GreenTee Richmond Center", line: "0000 Garden Way, Richmond" },
  },
  socials: [
    { label: "Xiaohongshu", url: "#" },
    { label: "Instagram", url: "#" },
  ],
};

/** Home dining preview slice (docs §5.1 S5): the singleton's top-level lede. */
export const restaurantPreview: RestaurantPreview = {
  name: restaurant.name,
  lede: restaurant.lede,
  credentials: restaurant.credentials,
};
