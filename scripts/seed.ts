/**
 * Phase 6 seed (docs §11.4, §11.5): builds every document from src/lib/mock/*
 * so the seeded dataset mirrors the static site 1:1, and uploads the interim
 * renders (hero facade, panorama, the eight journey plates) as image assets
 * wired to homePage. Idempotent: stable _ids via createOrReplace; asset
 * uploads dedupe by content hash. Ids use dashes (`<type>-<slug>`): ids
 * containing dots are path ids, hidden from unauthenticated reads.
 * Placeholder-only display fields (tints,
 * pending frame art) stay in the UI layer (§11.4) and are not seeded.
 *
 * Run: pnpm seed
 * Needs .env.local with NEXT_PUBLIC_SANITY_PROJECT_ID,
 * NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";
import { dishes } from "../src/lib/mock/dishes";
import { home } from "../src/lib/mock/home";
import { sampleNewsEntries } from "../src/lib/mock/news";
import { restaurant } from "../src/lib/mock/restaurant";
import { zones } from "../src/lib/mock/zones";
import {
  familyLinks,
  networkLinks,
  visit,
  type NavLink,
} from "../src/lib/site";
import type { InterimImage } from "../src/types";

/* ------------------------------------------------------------------ env -- */

/** sanity exec loads .env files itself; this is a fallback for plain node. */
function loadEnvLocal() {
  if (process.env.SANITY_API_WRITE_TOKEN) return;
  const file = path.join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Seed needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  token,
  useCdn: false,
});

/* -------------------------------------------------------------- helpers -- */

type SeedDoc = Record<string, unknown> & { _id: string; _type: string };

type Keyed = Record<string, unknown> & { _key: string };

function withKeys<T extends Record<string, unknown>>(
  items: T[],
  prefix: string,
): Keyed[] {
  return items.map((item, index) => ({ _key: `${prefix}${index}`, ...item }));
}

/** A plain paragraph as portable text (heritage/richmond narratives, §8.4). */
function toBlocks(paragraphs: string[], prefix: string) {
  return paragraphs.map((text, index) => ({
    _type: "block",
    _key: `${prefix}${index}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${prefix}${index}s`, text, marks: [] }],
  }));
}

function toLinks(links: NavLink[], prefix: string) {
  return withKeys(
    links.map((link) => ({ label: link.label, url: link.href })),
    prefix,
  );
}

/**
 * Upload an interim render and encode its mockup object-position as the image
 * hotspot, so hotspot-driven rendering reproduces the same crop (§10, §11.6).
 */
async function uploadInterim(image: InterimImage) {
  const file = path.join(process.cwd(), "public", image.src);
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: path.basename(file),
  });
  const [x, y] = (image.position ?? "50% 50%")
    .split(" ")
    .map((part) => parseFloat(part) / 100);
  console.log(`  asset ${path.basename(file)} -> ${asset._id}`);
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    hotspot: { _type: "sanity.imageHotspot", x, y, height: 1, width: 1 },
  };
}

/* ------------------------------------------------------------ documents -- */

async function buildHomePage() {
  const heroMedia = home.hero.media && (await uploadInterim(home.hero.media));
  const panorama =
    home.panorama.image && (await uploadInterim(home.panorama.image));

  const journeyPanels = [];
  for (const [index, panel] of home.journeyPanels.entries()) {
    const plates = [];
    for (const [plateIndex, plate] of panel.plates.entries()) {
      plates.push({
        _key: `p${index}-${plateIndex}`,
        image: plate.image ? await uploadInterim(plate.image) : undefined,
        pendingLabel: plate.label,
      });
    }
    journeyPanels.push({
      _key: `panel${index}`,
      name: panel.name,
      conceptTitle: panel.conceptTitle,
      floorLabel: panel.floorLabel,
      anchor: panel.anchor,
      line: panel.line,
      accent: panel.accent,
      layout: panel.layout,
      plates,
    });
  }

  return {
    _id: "homePage",
    _type: "homePage",
    hero: { ...home.hero, media: heroMedia },
    manifesto: {
      ...home.manifesto,
      lines: withKeys([...home.manifesto.lines], "ml"),
    },
    panoramaBand: { image: panorama, caption: home.panorama.caption },
    marqueeItems: home.marqueeItems,
    rates: {
      ...home.rates,
      rateRows: withKeys([...home.rates.rateRows], "rr"),
      hourRows: withKeys([...home.rates.hourRows], "hr"),
      stats: withKeys([...home.rates.stats], "st"),
    },
    newsTeaser: home.newsTeaser,
    journeyPanels,
    spacesIntro: home.spacesIntro,
    outro: home.outro,
  };
}

function buildSiteSettings() {
  return {
    _id: "siteSettings",
    _type: "siteSettings",
    phone: visit.phone,
    address: visit.address,
    hours: visit.hours,
    openSummary: visit.openSummary,
    careersUrl: "#",
    familyLinks: toLinks(familyLinks, "fl"),
    networkLinks: toLinks(networkLinks, "nl"),
    seo: {
      title: "GreenTee Richmond Center · Indoor Golf Club",
      description:
        "A premium indoor golf club in Richmond. Tour-grade simulator bays, private VIP rooms, and year-round play, with Crystal Jade Palace on the promenade.",
    },
  };
}

function buildRestaurant() {
  return {
    _id: "restaurant",
    _type: "restaurant",
    name: restaurant.name,
    tagline: restaurant.tagline,
    lede: restaurant.lede,
    intro: restaurant.intro,
    credentials: withKeys([...restaurant.credentials], "cr"),
    story: {
      heritage: toBlocks(
        [restaurant.story.heritage.lead, ...restaurant.story.heritage.body],
        "her",
      ),
      footprint: restaurant.story.footprint,
      footprintNow: restaurant.story.footprintNow,
      richmond: toBlocks(
        [restaurant.story.richmond.lead, ...restaurant.story.richmond.body],
        "ric",
      ),
      philosophy: withKeys(
        restaurant.story.philosophy.map(({ title, line }) => ({ title, line })),
        "ph",
      ),
    },
    chef: {
      intro: restaurant.chef.intro,
      awards: withKeys([...restaurant.chef.awards], "aw"),
      bio: restaurant.chef.bio,
      moments: restaurant.chef.moments,
      quote: restaurant.chef.quote,
    },
    privateDining: {
      copy: restaurant.privateDining.copy,
      facts: withKeys([...restaurant.privateDining.facts], "pf"),
    },
    banquet: {
      copy: restaurant.banquet.copy,
      facts: withKeys([...restaurant.banquet.facts], "bf"),
      occasions: restaurant.banquet.occasions,
      menus: withKeys([...restaurant.banquet.menus], "bm"),
      enquiryTarget: restaurant.banquet.enquiryTarget,
    },
    reserve: {
      phone: restaurant.reserve.phone,
      wechat: restaurant.reserve.wechat,
      hours: restaurant.reserve.hours,
      address: restaurant.reserve.address,
    },
    socials: withKeys(
      restaurant.socials.map(({ label, url }) => ({ label, url })),
      "so",
    ),
  };
}

function buildZones() {
  return zones.map((zone) => ({
    _id: `zone-${zone.slug}`,
    _type: "zone",
    name: zone.name,
    slug: { _type: "slug", current: zone.slug },
    floor: zone.floor,
    chipLabel: zone.chipLabel,
    areaLabel: zone.areaLabel,
    conceptTitle: zone.conceptTitle,
    conceptLine: zone.conceptLine,
    lead: zone.lead,
    body: zone.body,
    facts: zone.facts && withKeys([...zone.facts], "zf"),
    order: zone.order,
    cta: zone.cta,
    diningPanel: zone.diningPanel && {
      eyebrow: zone.diningPanel.eyebrow,
      title: zone.diningPanel.title,
      copy: zone.diningPanel.body,
    },
    rooms:
      zone.rooms &&
      withKeys(
        zone.rooms.map(({ name, motif, line, pending }) => ({
          name,
          motif,
          line,
          pending,
        })),
        "rm",
      ),
  }));
}

function buildDishes() {
  return dishes.map((dish) => ({
    _id: `dish-${dish.id}`,
    _type: "dish",
    name: dish.name,
    zhName: dish.zhName,
    line: dish.line,
    category: dish.category,
    seasonal: dish.seasonal ?? false,
    available: dish.available ?? true,
    order: dish.order,
  }));
}

/**
 * News docs: the mock array is curated newest-first; descending dates one day
 * apart reproduce that exact order under the GROQ coalesce sort. Promotions
 * seed with an open activeTo so the §4.3 window guard keeps them live.
 */
const NEWS_BASE_DATE = Date.UTC(2026, 5, 30, 12);

function buildNews() {
  return sampleNewsEntries.map((entry, index) => {
    const date = new Date(NEWS_BASE_DATE - index * 86_400_000).toISOString();
    if (entry.category === "news") {
      return {
        _id: `newsPost-${entry.id}`,
        _type: "newsPost",
        title: entry.title,
        slug: { _type: "slug", current: entry.id },
        date,
        timing: entry.timing,
        excerpt: entry.excerpt,
      };
    }
    if (entry.category === "event") {
      return {
        _id: `event-${entry.id}`,
        _type: "event",
        title: entry.title,
        slug: { _type: "slug", current: entry.id },
        timing: entry.timing,
        start: date,
        excerpt: entry.excerpt,
      };
    }
    return {
      _id: `promotion-${entry.id}`,
      _type: "promotion",
      title: entry.title,
      timing: entry.timing,
      summary: entry.excerpt,
      activeFrom: date,
      placement: "card",
    };
  });
}

/* ----------------------------------------------------------------- main -- */

async function main() {
  console.log(`Seeding ${projectId}/${dataset} from src/lib/mock/*`);

  console.log("Uploading interim renders (§11.6):");
  const documents: SeedDoc[] = [
    buildSiteSettings(),
    await buildHomePage(),
    buildRestaurant(),
    ...buildZones(),
    ...buildDishes(),
    ...buildNews(),
  ];

  const transaction = client.transaction();
  for (const doc of documents) transaction.createOrReplace(doc);
  await transaction.commit();

  const counts = new Map<string, number>();
  for (const doc of documents) {
    counts.set(doc._type, (counts.get(doc._type) ?? 0) + 1);
  }
  console.log("Seeded:");
  for (const [type, count] of counts) console.log(`  ${type} x${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
