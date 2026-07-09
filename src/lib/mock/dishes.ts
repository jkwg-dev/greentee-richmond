import type { Dish } from "@/types";

/**
 * Sample `dish` documents (docs §4.1): the 11 mockup dishes feeding the
 * `/dining/menu` grid, in mockup order with their placeholder frame tints
 * (`t-jade` / `t-gold` / `t-emerald`; gold is the champagne recipe). CMS-driven
 * in Phase 6 with 8 to 12 documents (§8.3).
 */
export const dishes: Dish[] = [
  {
    id: "crystal-har-gow",
    name: "Crystal Har Gow",
    zhName: "水晶蝦餃",
    line: "Hand-pleated shrimp dumplings, bamboo shoot, translucent skin.",
    category: "dimsum",
    order: 1,
    frame: { tint: "jade" },
  },
  {
    id: "char-siu-sou",
    name: "Char Siu Sou",
    zhName: "蜜汁叉燒酥",
    line: "Flaky baked pastry, honeyed barbecue pork.",
    category: "dimsum",
    order: 2,
    frame: { tint: "champagne" },
  },
  {
    id: "steamed-siu-mai",
    name: "Steamed Siu Mai",
    zhName: "魚子燒賣",
    line: "Pork and prawn, crowned with flying fish roe.",
    category: "dimsum",
    order: 3,
    frame: { tint: "emerald" },
  },
  {
    id: "signature-crispy-roast-duck",
    name: "Signature Crispy Roast Duck",
    zhName: "招牌脆皮燒鴨",
    line: "Lacquered skin, carved to order.",
    category: "roast",
    order: 4,
    frame: { tint: "champagne" },
  },
  {
    id: "crispy-pork-belly",
    name: "Crispy Pork Belly",
    zhName: "化皮燒腩仔",
    line: "Glass-crisp crackling, five-spice salt.",
    category: "roast",
    order: 5,
    frame: { tint: "jade" },
  },
  {
    id: "wok-seared-lobster",
    name: "Wok-Seared Lobster",
    zhName: "薑蔥焗龍蝦",
    line: "Ginger and scallion, superior stock.",
    category: "seafood",
    order: 6,
    frame: { tint: "emerald" },
  },
  {
    id: "steamed-catch-of-the-day",
    name: "Steamed Catch of the Day",
    zhName: "清蒸游水海魚",
    line: "Whole fish, aged soy, hot oil finish.",
    category: "seafood",
    order: 7,
    frame: { tint: "jade" },
  },
  {
    id: "braised-abalone-sea-cucumber",
    name: "Braised Abalone & Sea Cucumber",
    zhName: "鮑魚扣遼參",
    line: "Ten-hour master stock, seasonal greens.",
    category: "mains",
    order: 8,
    frame: { tint: "champagne" },
  },
  {
    id: "wok-fried-beef-tenderloin",
    name: "Wok-Fried Beef Tenderloin",
    zhName: "中式牛柳",
    line: "Cantonese style, caramelized shallot.",
    category: "mains",
    order: 9,
    frame: { tint: "emerald" },
  },
  {
    id: "chilled-mango-sago-pomelo",
    name: "Chilled Mango Sago Pomelo",
    zhName: "楊枝甘露",
    line: "A Crystal Jade classic, finished with fresh cream.",
    category: "desserts",
    order: 10,
    frame: { tint: "jade" },
  },
  {
    id: "double-boiled-almond-cream",
    name: "Double-Boiled Almond Cream",
    zhName: "生磨杏仁茶",
    line: "Stone-ground, served warm.",
    category: "desserts",
    order: 11,
    frame: { tint: "champagne" },
  },
];

/**
 * The `/dining` Signature Dishes trio, in landing order (§8.3 item 3). The
 * landing frames carry their own slot tints; the names come from the dishes.
 */
export const signatureDishIds = [
  "signature-crispy-roast-duck",
  "wok-seared-lobster",
  "crystal-har-gow",
] as const;

export const signatureDishes: Dish[] = signatureDishIds
  .map((id) => dishes.find((dish) => dish.id === id))
  .filter((dish): dish is Dish => dish !== undefined);
