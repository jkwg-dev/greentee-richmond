import type { HomeContent } from "@/types";

/**
 * Static Home content (docs §5), copy ported verbatim from
 * `docs/mockups/greentee-home.html` (v22). Shapes mirror the `homePage`
 * singleton (docs §11.4). Sanity replaces this in Phase 6.
 *
 * Two things §11.4 does not carry, kept and flagged in the report:
 * - The Rates section head + column labels are static in `RatesHours`.
 * - `journeyPanels[].conceptTitle` (the large-serif headline, §5.2) is not in
 *   §11.4's `journeyPanels` field list but is required to render the panel.
 * hero/panorama renders are interim exports under `/public/renders` (§11.6).
 */
export const home: HomeContent = {
  hero: {
    eyebrow: "Blooming Buds · Indoor Golf Club",
    titleLines: ["GreenTee", "Richmond Center"],
    italicLine: "Glittering, brightly colored, alluring flowers bloom splendidly.",
    supportLine:
      "An indoor golf club where the game comes into bloom after dark.",
    media: {
      src: "/renders/hero-facade.jpg",
      alt: "The GreenTee Richmond Center facade lit against the night.",
      width: 1199,
      height: 679,
      position: "50% 100%",
    },
  },

  manifesto: {
    eyebrow: "Seed to Blossom",
    lines: [
      { text: "Every visit begins as a", emphasis: "seed" },
      { text: "Under ten thousand lights, your game", emphasis: "blooms" },
    ],
    caption:
      "GreenTee Richmond Center brings together tour-grade simulation, private play, and coaching across two floors of botanical luxury.",
  },

  panorama: {
    image: {
      src: "/renders/panorama-vip-corridor.jpg",
      alt: "The canopy and column of the second-floor VIP Corridor.",
      width: 1204,
      height: 386,
      position: "62% 50%",
    },
    caption: "The canopy & column · VIP Corridor, 2F",
  },

  marqueeItems: [
    "Blooming Buds",
    "Seed to Blossom",
    "Carried by the Wind",
    "Sunlight Through a Forest",
    "Warm Sunshine on the Western River",
    "Iconic 15",
  ],

  newsTeaser: {
    eyebrow: "News & Offers",
    title: "What's on at the Center.",
    sub: "Leagues, seasonal offers, and news from the club and Crystal Jade Palace.",
  },

  rates: {
    rateRows: [
      {
        name: "General Bay · Day",
        detail: "Weekdays 06:00 to 17:00 · up to 4 players",
        price: "$60",
        unit: "/ hour",
      },
      {
        name: "General Bay · Twilight",
        detail: "Weekdays from 17:00, and all day on weekends",
        price: "$75",
        unit: "/ hour",
      },
      {
        name: "VIP Room · 2F",
        detail: "Private simulator room for up to 6 guests",
        price: "$120",
        unit: "/ hour",
      },
      {
        name: "VVIP Suite · 2F",
        detail: "Rooms 1 to 4, with a dedicated host",
        price: "From $200",
        unit: "/ hour",
      },
      {
        name: "Putting Zone",
        detail: "Complimentary with any bay or room booking",
        price: "Included",
      },
    ],
    hourRows: [
      {
        name: "Open Daily",
        detail: "365 days a year, rain or shine",
        value: "06:00 to 24:00",
      },
      {
        name: "Last Tee Time",
        detail: "Final one-hour bookings each night",
        value: "22:30",
      },
      {
        name: "Peak Hours",
        detail:
          "Weekday evenings and weekends fill first. Reserve 3 to 5 days ahead.",
        value: "18:00 to 22:00",
      },
      {
        name: "Walk-Ins",
        detail: "Subject to availability. Mornings are quietest.",
        value: "Welcome",
      },
      {
        name: "Reservations",
        detail: "Online, or by phone at +1 000 000 0000",
        value: "Up to 14 days",
      },
    ],
    footnote:
      "Rates are per bay or room, not per player. Clubs and shoes are available at the Pro Shop.",
    stats: [
      { value: 4, label: "Simulator Bays" },
      { value: 19, label: "Private VIP Rooms" },
      { value: 200, suffix: "+", label: "Championship Courses" },
      { value: 365, label: "Days of Golf a Year" },
    ],
  },

  journeyPanels: [
    {
      name: "At-Bat & Putting Zone",
      floorLabel: "1F",
      anchor: "/spaces#general-at-bat",
      conceptTitle: "The Vitality of a Swing",
      line: "Tour-grade simulator bays and a true-roll putting green beneath the canopy.",
      accent: "#c9a66b",
      layout: "two",
      plates: [{ tint: "champagne" }, { tint: "champagne" }],
    },
    {
      name: "Fitting Shop & Pro Shop",
      floorLabel: "1F",
      anchor: "/spaces#fitting-shop",
      conceptTitle: "Balance and Proportion",
      line: "Precision club fitting and a curated pro shop along the central promenade.",
      accent: "#b98d7a",
      layout: "twoFlipped",
      plates: [{ tint: "rosegold" }, { tint: "rosegold" }],
    },
    {
      name: "Dining",
      floorLabel: "1F",
      anchor: "/spaces#dining",
      conceptTitle: "Warm Sunshine on the Western River",
      line: "Crystal Jade Palace brings Cantonese fine dining to the promenade.",
      accent: "#57ad85",
      layout: "solo",
      plates: [{ tint: "jade" }],
    },
    {
      name: "Sauna & Amenity",
      floorLabel: "1F",
      anchor: "/spaces#sauna",
      conceptTitle: "Breathing Alongside Nature",
      line: "A dry sauna and full amenities to close out every round.",
      accent: "#9db18f",
      layout: "twoFlipped",
      plates: [{ tint: "sage" }, { tint: "sage" }],
    },
    {
      name: "VIP & VVIP Rooms",
      floorLabel: "2F",
      anchor: "/spaces#vip-rooms",
      conceptTitle: "Iconic 15 and Beyond",
      line: "Fifteen private rooms and four VVIP suites, one floor above the game.",
      accent: "#8a6fc9",
      layout: "two",
      plates: [
        { tint: "iris" },
        {
          tint: "champagne",
          label: { kicker: "Renders to be revealed", name: "VVIP Suites 1 to 4" },
        },
      ],
    },
  ],

  spacesIntro: {
    eyebrow: "The Spaces",
    title: "Two floors of golf,\nroom by room.",
    sub: "From open simulator bays to private VIP rooms, every space in the club is built around the game.",
    linkLabel: "View all spaces",
  },

  outro: {
    eyebrow: "Under Ten Thousand Lights",
    title: "The course is *always* open.",
    line: "Book a bay, gather in a private room, or stay for dinner at Crystal Jade Palace.",
  },
};
