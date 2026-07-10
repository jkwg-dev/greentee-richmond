import {
  DINING_PANEL_CTAS,
  dishTintFor,
  newsFrameFor,
  roomUiFor,
  zoneUiFor,
} from "@/lib/placeholders";
import type { NavLink } from "@/lib/site";
import type {
  Announcement,
  Dish,
  HomeContent,
  InterimImage,
  JourneyPanel,
  NewsCategory,
  NewsEntry,
  Restaurant,
  RestaurantPreview,
  RoomMotif,
  SiteSettings,
  Zone,
} from "@/types";
import { sanityFetch } from "./fetch";

/**
 * GROQ queries and their domain mappings (docs §11.5). This is the only place
 * raw GROQ shapes exist; sections receive src/types domain objects. Time-boxed
 * promotions are guarded on activeFrom/activeTo in GROQ (§4.3), never in
 * components. Placeholder display art (tints, pending frames) reattaches here
 * from the UI layer (§11.4, src/lib/placeholders.ts).
 */

/* ------------------------------------------------------- image projection -- */

/** Projects an image field to the pieces InterimImage needs (docs §11.6). */
const IMAGE_PROJECTION = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  "alt": alt,
  hotspot
}`;

type RawImage = {
  src: string | null;
  width: number | null;
  height: number | null;
  lqip: string | null;
  alt: string | null;
  hotspot: { x: number; y: number } | null;
} | null;

const pct = (fraction: number) => `${+(fraction * 100).toFixed(2)}%`;

/** Structural content has no mock fallback: missing data fails loudly. */
function required<T>(value: T | null, what: string): T {
  if (value === null) {
    throw new Error(
      `Sanity: ${what} is missing. Check .env.local and run \`pnpm seed\`.`,
    );
  }
  return value;
}

/** Hotspot x/y becomes the CSS object-position focal point (§10, §11.6). */
function toImage(raw: RawImage): InterimImage | undefined {
  if (!raw?.src) return undefined;
  return {
    src: raw.src,
    alt: raw.alt ?? "",
    width: raw.width ?? 0,
    height: raw.height ?? 0,
    position: raw.hotspot ? `${pct(raw.hotspot.x)} ${pct(raw.hotspot.y)}` : undefined,
    lqip: raw.lqip ?? undefined,
  };
}

/* --------------------------------------------------------- portable text -- */

type RawBlock = { _type: string; children?: { text?: string }[] | null };

/** Plain paragraphs from portable text; the first is the serif lead (§8.3). */
function toNarrative(blocks: RawBlock[] | null): { lead: string; body: string[] } {
  const paragraphs = (blocks ?? [])
    .filter((block) => block._type === "block")
    .map((block) => (block.children ?? []).map((child) => child.text ?? "").join(""));
  return { lead: paragraphs[0] ?? "", body: paragraphs.slice(1) };
}

/* ---------------------------------------------------------------- news §4 -- */

const NEWS_INDEX_QUERY = `
*[
  _type == "newsPost" ||
  _type == "event" ||
  (
    _type == "promotion" &&
    placement == "card" &&
    (!defined(activeFrom) || activeFrom <= now()) &&
    (!defined(activeTo) || activeTo > now())
  )
] | order(coalesce(date, start, activeFrom) desc) [0...10] {
  _id,
  _type,
  title,
  timing,
  "excerpt": coalesce(excerpt, summary)
}`;

type NewsDoc = {
  _id: string;
  _type: "event" | "promotion" | "newsPost";
  title: string;
  timing: string;
  excerpt: string | null;
};

const NEWS_CATEGORY: Record<NewsDoc["_type"], NewsCategory> = {
  promotion: "offer",
  event: "event",
  newsPost: "news",
};

/**
 * The News & Offers union (docs §4.1, §7): promotions, events, and news posts,
 * newest first. Feeds both the /news index and the Home teaser; unconfigured
 * or empty CMS yields [] and the proven empty states render.
 */
export async function getNewsEntries(): Promise<NewsEntry[]> {
  const docs = await sanityFetch<NewsDoc[]>({
    query: NEWS_INDEX_QUERY,
    tags: ["news", "event", "promotion"],
  });

  return (docs ?? []).map((doc, index) => ({
    id: doc._id,
    category: NEWS_CATEGORY[doc._type],
    timing: doc.timing,
    title: doc.title,
    excerpt: doc.excerpt ?? undefined,
    // Placeholder frame art is UI-layer (§11.4); seeded entries keep their
    // mockup frames via the stable seed id (`<type>-<slug>`).
    frame: newsFrameFor(
      doc._id.startsWith(`${doc._type}-`)
        ? doc._id.slice(doc._type.length + 1)
        : doc._id,
      doc.title,
      index,
    ),
  }));
}

/* -------------------------------------------------- announcement bar §4.2 -- */

const ANNOUNCEMENT_QUERY = `
*[
  _type == "promotion" &&
  placement == "banner" &&
  (!defined(activeFrom) || activeFrom <= now()) &&
  (!defined(activeTo) || activeTo > now())
] | order(activeFrom desc) [0] {
  _id,
  title,
  summary,
  link
}`;

type AnnouncementDoc = {
  _id: string;
  title: string;
  summary: string | null;
  link: string | null;
};

/** At most one active banner promotion at a time (docs §4.2). */
export async function getAnnouncement(): Promise<Announcement | null> {
  const doc = await sanityFetch<AnnouncementDoc | null>({
    query: ANNOUNCEMENT_QUERY,
    tags: ["promotion"],
  });
  if (!doc) return null;
  return {
    id: doc._id,
    title: doc.title,
    summary: doc.summary ?? undefined,
    link: doc.link ?? undefined,
  };
}

/* ------------------------------------------------------------- home §11.4 -- */

const HOME_QUERY = `
*[_id == "homePage"][0] {
  hero { eyebrow, titleLines, italicLine, supportLine, "media": media ${IMAGE_PROJECTION} },
  manifesto { eyebrow, lines[] { text, emphasis }, caption },
  panoramaBand { "image": image ${IMAGE_PROJECTION}, caption },
  marqueeItems,
  rates {
    eyebrow, title, sub, footnote,
    rateRows[] { name, detail, price, unit },
    hourRows[] { name, detail, value },
    stats[] { value, suffix, label }
  },
  newsTeaser { eyebrow, title, sub },
  journeyPanels[] {
    name, conceptTitle, floorLabel, anchor, line, accent, layout,
    plates[] { "image": image ${IMAGE_PROJECTION}, pendingLabel { kicker, name } }
  },
  spacesIntro { eyebrow, title, sub, linkLabel },
  outro { eyebrow, title, line }
}`;

type RawHome = {
  hero: {
    eyebrow: string;
    titleLines: string[];
    italicLine: string;
    supportLine: string;
    media: RawImage;
  };
  manifesto: {
    eyebrow: string;
    lines: { text: string; emphasis: string }[] | null;
    caption: string;
  };
  panoramaBand: { image: RawImage; caption: string };
  marqueeItems: string[] | null;
  rates: {
    eyebrow: string;
    title: string;
    sub: string;
    footnote: string;
    rateRows: { name: string; detail: string; price: string; unit: string | null }[] | null;
    hourRows: { name: string; detail: string; value: string }[] | null;
    stats: { value: number; suffix: string | null; label: string }[] | null;
  };
  newsTeaser: { eyebrow: string; title: string; sub: string };
  journeyPanels:
    | {
        name: string;
        conceptTitle: string;
        floorLabel: string;
        anchor: string;
        line: string;
        accent: string;
        layout: JourneyPanel["layout"];
        plates:
          | {
              image: RawImage;
              pendingLabel: { kicker: string | null; name: string | null } | null;
            }[]
          | null;
      }[]
    | null;
  spacesIntro: { eyebrow: string; title: string; sub: string; linkLabel: string };
  outro: { eyebrow: string; title: string; line: string };
} | null;

/** The homePage singleton mapped to HomeContent (docs §5, §11.4). */
export async function getHomeContent(): Promise<HomeContent> {
  const raw = required(
    await sanityFetch<RawHome>({ query: HOME_QUERY, tags: ["home"] }),
    "the homePage document",
  );

  return {
    hero: {
      eyebrow: raw.hero.eyebrow,
      titleLines: [raw.hero.titleLines?.[0] ?? "", raw.hero.titleLines?.[1] ?? ""],
      italicLine: raw.hero.italicLine,
      supportLine: raw.hero.supportLine,
      media: toImage(raw.hero.media),
    },
    manifesto: {
      eyebrow: raw.manifesto.eyebrow,
      lines: raw.manifesto.lines ?? [],
      caption: raw.manifesto.caption,
    },
    panorama: {
      image: toImage(raw.panoramaBand.image),
      caption: raw.panoramaBand.caption,
    },
    marqueeItems: raw.marqueeItems ?? [],
    rates: {
      eyebrow: raw.rates.eyebrow,
      title: raw.rates.title,
      sub: raw.rates.sub,
      footnote: raw.rates.footnote,
      rateRows: (raw.rates.rateRows ?? []).map((row) => ({
        ...row,
        unit: row.unit ?? undefined,
      })),
      hourRows: raw.rates.hourRows ?? [],
      stats: (raw.rates.stats ?? []).map((stat) => ({
        ...stat,
        suffix: stat.suffix ?? undefined,
      })),
    },
    newsTeaser: raw.newsTeaser,
    journeyPanels: (raw.journeyPanels ?? []).map((panel) => ({
      name: panel.name,
      conceptTitle: panel.conceptTitle,
      floorLabel: panel.floorLabel,
      anchor: panel.anchor,
      line: panel.line,
      accent: panel.accent,
      layout: panel.layout,
      plates: (panel.plates ?? []).map((plate) => ({
        // Plate tints are UI-layer placeholder art (§11.4); champagne is the
        // designed pending fill (the VVIP plate, §5.4).
        tint: "champagne" as const,
        image: toImage(plate.image),
        label:
          plate.pendingLabel?.kicker || plate.pendingLabel?.name
            ? {
                kicker: plate.pendingLabel.kicker ?? "",
                name: plate.pendingLabel.name ?? "",
              }
            : undefined,
      })),
    })),
    spacesIntro: raw.spacesIntro,
    outro: raw.outro,
  };
}

/* ------------------------------------------------------------- zones §6 -- */

const ZONES_QUERY = `
*[_type == "zone"] | order(order asc) {
  "slug": slug.current,
  floor, name, chipLabel, areaLabel, conceptTitle, conceptLine, order,
  lead, body,
  facts[] { label, value },
  cta { label, href, variant },
  "heroImage": heroImage ${IMAGE_PROJECTION},
  diningPanel { eyebrow, title, copy },
  rooms[] { name, motif, line, pending }
}`;

type RawZone = {
  slug: string;
  floor: Zone["floor"];
  name: string;
  chipLabel: string | null;
  areaLabel: string | null;
  conceptTitle: string;
  conceptLine: string;
  order: number;
  lead: string | null;
  body: string | null;
  facts: { label: string; value: string }[] | null;
  cta: { label: string; href: string; variant: "solid" | "ghost" | null } | null;
  heroImage: RawImage;
  diningPanel: { eyebrow: string; title: string; copy: string } | null;
  rooms:
    | {
        name: string;
        motif: RoomMotif | null;
        line: string | null;
        pending: boolean | null;
      }[]
    | null;
};

/** The nine zones (docs §6, §11.4), pending-state art reattached per §11.6. */
export async function getZones(): Promise<Zone[]> {
  const docs = await sanityFetch<RawZone[]>({ query: ZONES_QUERY, tags: ["zone"] });
  if (!docs || docs.length === 0) {
    throw new Error(
      "Sanity: no zone documents. Check .env.local and run `pnpm seed`.",
    );
  }

  return docs.map((doc) => ({
    slug: doc.slug,
    floor: doc.floor,
    name: doc.name,
    chipLabel: doc.chipLabel ?? doc.name,
    areaLabel: doc.areaLabel ?? undefined,
    conceptTitle: doc.conceptTitle,
    conceptLine: doc.conceptLine,
    order: doc.order,
    lead: doc.lead ?? undefined,
    body: doc.body ?? undefined,
    facts: doc.facts ?? undefined,
    cta: doc.cta
      ? { label: doc.cta.label, href: doc.cta.href, variant: doc.cta.variant ?? undefined }
      : undefined,
    heroImage: toImage(doc.heroImage),
    diningPanel: doc.diningPanel
      ? {
          eyebrow: doc.diningPanel.eyebrow,
          title: doc.diningPanel.title,
          body: doc.diningPanel.copy,
          ctaPrimary: DINING_PANEL_CTAS.primary,
          ctaSecondary: DINING_PANEL_CTAS.secondary,
        }
      : undefined,
    rooms: doc.rooms?.map((room) => ({
      name: room.name,
      motif: room.motif ?? undefined,
      line: room.line ?? undefined,
      pending: room.pending ?? undefined,
      ...roomUiFor(doc.slug, room.name),
    })),
    ...zoneUiFor(doc.slug),
  }));
}

/* -------------------------------------------------------- restaurant §8.4 -- */

const RESTAURANT_QUERY = `
*[_id == "restaurant"][0] {
  name, tagline, lede,
  intro { lede, support },
  credentials[] { label, value, detail },
  story {
    heritage, footprint, footprintNow, richmond,
    philosophy[] { title, line }
  },
  chef { intro, awards[] { title, detail, years }, bio, moments, quote },
  privateDining { copy, facts[] { label, value, detail } },
  banquet {
    copy,
    facts[] { label, value, detail },
    occasions,
    menus[] { label, line, detail },
    enquiryTarget
  },
  reserve { openTableUrl, phone, wechat, hours, address { name, line } },
  socials[] { label, url }
}`;

type RawFact = { label: string; value: string; detail: string | null };

type RawRestaurant = {
  name: string;
  tagline: string;
  lede: string;
  intro: { lede: string; support: string };
  credentials: RawFact[] | null;
  story: {
    heritage: RawBlock[] | null;
    footprint: string[] | null;
    footprintNow: string;
    richmond: RawBlock[] | null;
    philosophy: { title: string; line: string }[] | null;
  };
  chef: {
    intro: string;
    awards: { title: string; detail: string | null; years: string }[] | null;
    bio: string;
    moments: string[] | null;
    quote: string;
  };
  privateDining: { copy: string; facts: RawFact[] | null };
  banquet: {
    copy: string;
    facts: RawFact[] | null;
    occasions: string[] | null;
    menus: { label: string; line: string; detail: string | null }[] | null;
    enquiryTarget: string;
  };
  reserve: {
    openTableUrl: string | null;
    phone: string;
    wechat: string;
    hours: string[] | null;
    address: { name: string; line: string };
  };
  socials: { label: string; url: string }[] | null;
} | null;

const mapFacts = (facts: RawFact[] | null) =>
  (facts ?? []).map((fact) => ({
    label: fact.label,
    value: fact.value,
    detail: fact.detail ?? undefined,
  }));

/** The restaurant singleton mapped to the §8.4 domain shape. */
export async function getRestaurant(): Promise<Restaurant> {
  const raw = required(
    await sanityFetch<RawRestaurant>({
      query: RESTAURANT_QUERY,
      tags: ["restaurant"],
    }),
    "the restaurant document",
  );

  return {
    name: raw.name,
    tagline: raw.tagline,
    lede: raw.lede,
    intro: raw.intro,
    credentials: mapFacts(raw.credentials),
    privateDining: {
      copy: raw.privateDining.copy,
      facts: mapFacts(raw.privateDining.facts),
    },
    story: {
      heritage: toNarrative(raw.story.heritage),
      footprint: raw.story.footprint ?? [],
      footprintNow: raw.story.footprintNow,
      richmond: toNarrative(raw.story.richmond),
      philosophy: raw.story.philosophy ?? [],
    },
    chef: {
      intro: raw.chef.intro,
      awards: (raw.chef.awards ?? []).map((award) => ({
        title: award.title,
        detail: award.detail ?? undefined,
        years: award.years,
      })),
      bio: raw.chef.bio,
      moments: raw.chef.moments ?? [],
      quote: raw.chef.quote,
    },
    banquet: {
      copy: raw.banquet.copy,
      facts: mapFacts(raw.banquet.facts),
      occasions: raw.banquet.occasions ?? [],
      menus: (raw.banquet.menus ?? []).map((menu) => ({
        label: menu.label,
        line: menu.line,
        detail: menu.detail ?? undefined,
      })),
      enquiryTarget: raw.banquet.enquiryTarget,
    },
    reserve: {
      openTableUrl: raw.reserve.openTableUrl ?? undefined,
      phone: raw.reserve.phone,
      wechat: raw.reserve.wechat,
      hours: raw.reserve.hours ?? [],
      address: raw.reserve.address,
    },
    socials: raw.socials ?? [],
  };
}

/** The Home dining preview slice (docs §5.1 S5). */
export async function getRestaurantPreview(): Promise<RestaurantPreview> {
  const restaurant = await getRestaurant();
  return {
    name: restaurant.name,
    lede: restaurant.lede,
    credentials: restaurant.credentials,
  };
}

/* ------------------------------------------------------------ dishes §4.1 -- */

const DISHES_QUERY = `
*[_type == "dish" && available != false] | order(order asc) {
  _id, name, zhName, line, category, seasonal, available, order
}`;

type RawDish = {
  _id: string;
  name: string;
  zhName: string;
  line: string;
  category: Dish["category"];
  seasonal: boolean | null;
  available: boolean | null;
  order: number;
};

/** Available dishes in menu order (docs §4.1); frame tints from the UI layer. */
export async function getDishes(): Promise<Dish[]> {
  const docs = await sanityFetch<RawDish[]>({ query: DISHES_QUERY, tags: ["dish"] });

  return (docs ?? []).map((doc, index) => {
    const key = doc._id.startsWith("dish-") ? doc._id.slice(5) : doc._id;
    return {
      id: doc._id,
      name: doc.name,
      zhName: doc.zhName,
      line: doc.line,
      category: doc.category,
      order: doc.order,
      seasonal: doc.seasonal ?? undefined,
      available: doc.available ?? undefined,
      frame: { tint: dishTintFor(key, index) },
    };
  });
}

/* --------------------------------------------------------- settings §11.4 -- */

const SETTINGS_QUERY = `
*[_id == "siteSettings"][0] {
  phone, address, hours, openSummary,
  familyLinks[] { label, url },
  networkLinks[] { label, url }
}`;

type RawSettings = {
  phone: string;
  address: string;
  hours: string;
  openSummary: string | null;
  familyLinks: { label: string; url: string }[] | null;
  networkLinks: { label: string; url: string }[] | null;
} | null;

const toNavLinks = (links: { label: string; url: string }[] | null): NavLink[] =>
  (links ?? []).map((link) => ({
    label: link.label,
    href: link.url,
    external: link.url.startsWith("http"),
  }));

/** siteSettings: the single source for the center's hours and address (§11.4). */
export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = required(
    await sanityFetch<RawSettings>({
      query: SETTINGS_QUERY,
      tags: ["settings"],
    }),
    "the siteSettings document",
  );

  return {
    phone: raw.phone,
    address: raw.address,
    hours: raw.hours,
    openSummary: raw.openSummary ?? `${raw.hours} · ${raw.address}`,
    familyLinks: toNavLinks(raw.familyLinks),
    networkLinks: toNavLinks(raw.networkLinks),
  };
}
