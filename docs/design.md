# GreenTee Richmond Center
## Website Design & Architecture

> **Stack**: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Sanity · Vercel
> **Language**: English only (Crystal Jade Palace carries a 中文 toggle, pending translation; see §15)
> **Visual reference**: the nine mockups in `docs/mockups/` are the references for look, motion, and copy tone. See `CLAUDE.md` for the porting contract.

| Mockup file | Route | Version |
|---|---|---|
| `greentee-home.html` | `/` | Homepage v22 |
| `greentee-spaces.html` | `/spaces` | The Spaces v3 |
| `greentee-news.html` | `/news` | News & Offers v1 |
| `greentee-dining.html` | `/dining` | Crystal Jade Palace v6 · Home |
| `greentee-dining-story.html` | `/dining/story` | v6 · Our Story |
| `greentee-dining-chef.html` | `/dining/chef` | v6 · The Chef |
| `greentee-dining-menu.html` | `/dining/menu` | v6 · Menu |
| `greentee-dining-banquet.html` | `/dining/banquet` | v6 · Banquet |
| `greentee-dining-reserve.html` | `/dining/reserve` | v6 · Reserve |

Cross-links between the mockup files stand in for the real routes (`greentee-spaces.html#sauna` maps to `/spaces#sauna`, and so on).

---

## 1. Brand & design direction

**Identity anchor: indoor golf, first and always.** GreenTee Richmond Center is a premium indoor golf club in the GreenTee Country Club family. Every page must read, within seconds, as world-class golf played indoors: tour-grade simulators, honest practice surfaces, private rooms, year-round and weather-proof. The architecture and the dining are the stage; golf is the story. Copy leads with play, never with decor.

**Concept**: Botanical Luxury · a nocturnal garden. The building's own zone narratives are the headline system of the site. Each zone concept name is promoted verbatim into H1 and journey titles rather than rewritten: The Vitality of a Swing, Sunlight Through a Forest, Balance and Proportion, Movements That Draw the Gaze, Breathing Alongside Nature, Harmony in the Details, Warm Sunshine on the Western River, Iconic 15, Beyond the Fifteen.

**Mood keywords**: Nocturnal Garden / Luminous / Organic Geometry / Quiet Luxury

**Principles**
1. **Indoor golf leads.** Bays, rates, and year-round play are never buried below brand storytelling on any page.
2. **Light on a dark canvas.** Background is near-black; images and type glow like blossoms.
3. **Whitespace is the luxury.** One message per screen, low density.
4. **Serif dignity.** Oversized serif display against small tracked sans captions. Display lines may close with an italic emphasis word and a champagne period.
5. **A single motion language: Bloom.** Reveals are fade plus rise; the hero blooms letter by letter; the journey turns like pages.
6. **Photography leads.** UI is a frame; renders and photography own the screen, full-bleed by default.

**Signature element**: the Spaces Journey (Home S7). A full-bleed, gesture-gated horizontal slider: one wheel or swipe gesture turns exactly one panel, five panels walk the two floors, and a champagne progress bar with a page counter marks the position. The web translation of walking the building. The `/spaces` page is the long-form version of the same walk: nine zones, one scroll, a rail that keeps the floor plan in hand.

**Copy rules (global, enforced in every deliverable)**
- Never use an em dash or an en dash anywhere in copy. Rewrite around them.
- Date and number ranges are written with "to": "2022 to 2025", "06:00 to 24:00", "8 to 12 dishes".
- No exclamation points anywhere in Crystal Jade Palace copy (§8.1).
- No membership language, and never the term "media art".

**Hard bans**
- White background sections, card shadows, gradient buttons, emoji icons
- Literal flower, petal, or leaf illustrations of any kind
- Regular, repeating decorative patterns; texture comes from irregular fractal-noise grain overlays (as on the `/spaces` zone heroes), never from tiles that read as a pattern

---

## 2. Design tokens

### 2.1 Color

```css
@theme {
  --color-noir: #0a0a0b;        /* base background */
  --color-noir-soft: #131315;   /* surfaces */
  --color-ivory: #f2ede2;       /* primary text */
  --color-mist: #8f8b82;        /* secondary text, captions */
  --color-champagne: #c9a66b;   /* global accent: CTA, hairlines, index, progress */
  --color-jade: #1f6b4f;        /* Crystal Jade Palace surfaces and rail hairline */
  --color-jade-text: #57ad85;   /* Crystal Jade Palace text accent, active rail states */
  --hair: rgba(201,166,107,.16); /* champagne hairline */
}
```

**Usage rules**
- 90 percent of any screen is noir + ivory. Champagne is the only global accent.
- Jade + jade-text belongs exclusively to Crystal Jade Palace content: the `/dining` pages, the Dining zone on `/spaces`, the Dining journey panel, and the Home dining preview.
- The journey panels carry a per-panel accent as an inline `--acc` custom property (§5.2), used for the panel index numeral and meta divider only. These accents are journey-scoped and are not global tokens.
- Legacy accents from earlier mockups (`--rosegold`, `--emerald`, `--sage`, `--iris`) survive in some mockup `:root` blocks but have no independent UI role in v22/v3; do not promote them to the theme unless a section spec calls for one.

### 2.2 Typography

| Role | Face | Notes |
|---|---|---|
| Display (EN) | Cormorant Garamond 400 to 600, italic for concept lines and emphasis words | Google Fonts. Upgrade path: Canela / Freight Display if licensed |
| Body / UI | Inter 300 / 400 / 500 | tracked uppercase for labels, chips, and rail links |
| 中文 (dining only) | system stack: PingFang SC, Hiragino Sans GB, Microsoft YaHei, Inter fallback | dish names and future zh strings; no webfont |

Scale: H1 `clamp(2.6rem, 9vw, 7.6rem)` in two stacked lines (hero) · zone H1 `clamp(2.4rem, 5.4vw, 4.4rem)` · H2 `clamp(2.1rem, 4.6vw, 3.5rem)` · body 15px / 1.85 · eyebrow 10px, tracking 0.34em, uppercase, champagne, hairline lead-in · rail and chip links 9.5px, tracking 0.24em to 0.26em, uppercase.

### 2.3 Buttons

| Variant | Spec | Use |
|---|---|---|
| `solid` | champagne bg, near-black text (#141008) | primary CTA (Book a Bay, Book a Table) |
| `light` | ivory bg, near-black text, borderless look, hover to pure white | secondary CTA over bright imagery (Explore the Spaces) |
| `ghost` | transparent, champagne border and text | tertiary, dark surfaces only |

All buttons: uppercase 10.5px, tracking 0.22em, sharp corners. A `sm` size exists for the header and the rails (`btn-sm` in the mockups). No new button styles.

---

## 3. Information architecture

### 3.1 Scope at launch
v1 ships four page surfaces plus the Crystal Jade Palace sub-site:
`/` · `/spaces` · `/news` · `/dining` with `/dining/story`, `/dining/chef`, `/dining/menu`, `/dining/banquet`, `/dining/reserve`.
Navigation, footer, and Sanity schemas are built from day one to grow into the rest of this section without rework.

### 3.2 GreenTee network alignment
The center belongs to the GreenTee Country Club family (JK World Group), alongside GreenTee Country Club Westwood Plateau (gtccwestwoodplateau.com) and GreenTee Country Club Tobiano (gtcctobiano.com). The IA mirrors their proven structure, translated from outdoor course to indoor club. Key translation: there is no course, no tee time, and no membership program here; the bookable product is the simulator bay and the private room, available year-round.

| Sibling pattern (Westwood / Tobiano) | Richmond adaptation (indoor) |
|---|---|
| Golf: courses, simulator rooms, driving range, rates, lessons | The Spaces page (nine zones) + Rates & Hours on Home; Lessons (GreenTee Golf Academy) later |
| Book a Tee Time (persistent CTA) | **Book a Bay** (persistent CTA) |
| Events: weddings, corporate, banquets, tournaments | folded into News & Offers for v1; `/events` hub later |
| Dining: Jess' restaurants | Dining: Crystal Jade Palace sub-site |
| Shop: GreenTee Golf Shop, promotions, gift cards | Fitting Shop and Pro Shop live as `/spaces` zones; promotions and gift cards under News & Offers |
| News / weekly news | News & Offers (CMS-driven index) |
| Membership (Tobiano) | none; no membership program at Richmond |
| Contact, careers | Footer visit line + `#contact`; Contact page and Careers link later |
| Footer family sites | JK World Group · GreenTee Golf Shop · GreenTee Golf Academy · JKWG Design & Development · Jess' Restaurants, plus the GreenTee network (Westwood Plateau · Tobiano · Langley) |

### 3.3 Route map

| Route | Page | Status |
|---|---|---|
| `/` | Home | **v1** |
| `/spaces` | The Spaces: nine anchored zones on one page (§6) | **v1** |
| `/news` | News & Offers index (§7) | **v1** |
| `/dining` | Crystal Jade Palace · landing (§8) | **v1** |
| `/dining/story` · `/dining/chef` · `/dining/menu` · `/dining/banquet` · `/dining/reserve` | Crystal Jade Palace pages (§8) | **v1** |
| `/news/[slug]` | Entry detail | planned |
| `/spaces/[slug]` | Per-zone facility pages (deep facts, galleries) | planned |
| `/golf/rates` | Standalone rates page (v1 carries Rates & Hours on Home) | planned |
| `/golf/lessons` | Lessons · GreenTee Golf Academy | planned |
| `/events` · `/events/[slug]` | Events hub (v1 folds events into News & Offers) | planned |
| `/shop` · `/contact` | Shop hand-off, contact | planned |
| `/studio` | Sanity Studio (noindex) | v1 |

### 3.4 Navigation

**Header (all pages, settled)**: brand mark ("GreenTee Richmond" serif over "Center") linking to `/`, then **The Spaces · News & Offers · Dining**, then a persistent solid `sm` **Book a Bay** button. The header gains a `scrolled` treatment past 40px of scroll. Below 900px the nav collapses to a hamburger.

**FullMenu (mobile overlay)**: dialog with focus trap and Escape close. Items: Home · The Spaces · News & Offers · Dining, plus the Book a Bay CTA. On `/dining` pages the Dining item expands into two entries (Crystal Jade Palace · Menu & Reserve). Body scroll locks while open.

**Footer (canonical, all pages)**: mirrors the header exactly: brand mark to `#top`, then The Spaces · News & Offers · Dining. Beneath: the visit line (address · hours · phone), the design credit ("Interior & exterior design concept: JKWG"), copyright, and two link columns: GreenTee Network (Westwood Plateau · Tobiano · Langley) and Family (JK World Group · GreenTee Golf Shop · GreenTee Golf Academy · JKWG Design & Development · Jess' Restaurants). The Home v22 footer is the canonical reference; the other mockups still show an older footer (see §15.9). The footer carries `id="contact"` and is the Book a Bay anchor target until a booking flow exists.

**Book a Table** CTAs route to `/dining/reserve` everywhere.

---

## 4. Content operations (Sanity)

The site carries a steady stream of updates: events, promotions, news, and Crystal Jade menu changes. All are editor-managed in Sanity Studio with no deploys.

### 4.1 Content types
| Type | Fields (core) | Feeds |
|---|---|---|
| `event` | title, slug, timing label, start, end, image, excerpt, body, cta | `/news` (chip: Events), Home teaser |
| `promotion` | title, image, timing label, summary, body, activeFrom, activeTo, placement (banner, card), link | announcement bar, `/news` (chip: Offers), Home teaser |
| `newsPost` | title, slug, date, timing label, image, excerpt, body | `/news` (chip: News), Home teaser |
| `dish` | name, zhName, line, image, category (dimsum, roast, seafood, mains, desserts), seasonal, available, order | `/dining/menu` grid, `/dining` signature trio |

Every News & Offers entry renders with a meta line of the form "Category · Timing" where Timing is a short editorial label (This Fall, Through August, From September, Saturdays).

### 4.2 Surfaces
- **Home · News & Offers teaser (§5, S4)**: the latest entry as a large featured preview plus a three-card row of the next entries, drawn from active promotions, upcoming events, and news, newest first. A "View More" link routes to `/news`. The section renders nothing when empty.
- **`/news` index (§7)**: featured latest entry + nine-card grid with client-side category chips (All · Offers · Events · News).
- **Announcement bar**: optional slim bar beneath the header, driven by a single `promotion` with `placement: banner`, dismissible per session. At most one at a time. Not in the mockups; build from this spec.
- **`/dining/menu`**: the dish grid reads `dish` documents; seasonal menu updates are pure content edits.

### 4.3 Workflow
Editors publish in Studio; a webhook revalidates the matching cache tags (`event`, `promotion`, `news`, `dish`). Time-boxed promotions use Sanity scheduled publishing plus `activeFrom` / `activeTo` guards in queries, so expired offers disappear without manual cleanup. All imagery uses Sanity hotspot cropping.

---

## 5. Home page specification

**Mockup**: `greentee-home.html` (v22).

### 5.1 Sections

| # | Section | Content | Motion / behavior |
|---|---|---|---|
| S0 | Intro curtain | Brand mark on noir, mark fades in and out, curtain slides up | Once per load, about 2s (mark in .55s, out .4s after a .5s hold, curtain up .85s power4.inOut), skipped under reduced motion |
| S1 | Hero (`#top`) | Facade nightscape render full-bleed. Eyebrow "Blooming Buds · Indoor Golf Club". H1 "GreenTee" / "Richmond Center". Italic concept line "Glittering, brightly colored, alluring flowers bloom splendidly." + support line "An indoor golf club where the game comes into bloom after dark." CTAs: solid **Book a Bay** (`#contact`), light "Explore the Spaces" (`#spaces`). Scroll cue | `100svh`, min 640px. Render bottom-anchored, scale 1.12, transform-origin bottom so baked deck typography crops out; top-heavy shade gradient; radial scrim behind copy. Per-letter bloom-in (y + blur release, .03 stagger) chained after the curtain. HeroParticles canvas (§9.4) |
| S2 | Manifesto | Eyebrow "Seed to Blossom" + two serif lines ("Every visit begins as a seed." / "Under ten thousand lights, your game blooms."), each closing on an italic emphasis word and a champagne period + caption "GreenTee Richmond Center brings together tour-grade simulation, private play, and coaching across two floors of botanical luxury." | Line-by-line reveal |
| S2b | Panorama band | Full-bleed panoramic render (`.mani-media`). Caption: "The canopy & column · VIP Corridor, 2F" | Inner-image parallax (yPercent -5 to 5, scrub); fade overlay into noir; height 320px below 900px |
| S2c | Marquee | Concept names loop: Blooming Buds · Seed to Blossom · Carried by the Wind · Sunlight Through a Forest · Warm Sunshine on the Western River · Iconic 15 | CSS loop, hairline top and bottom, paused under reduced motion |
| S3 | Rates & Hours (`#rates`) | Eyebrow "Rates & Hours" · H2 "Book by the hour, play all year." · sub. Two-column grid: **Bays & Rooms** rate rows and **Hours & Availability** rows (§5.3), each column headed by a small H3. CTAs: solid Book a Bay, ghost "Plan a Private Room". Beneath, the stats strip: **4 Simulator Bays · 19 Private VIP Rooms · 200+ Championship Courses · 365 Days of Golf a Year** (19 = 15 VIP + 4 VVIP) | Rows reveal with stagger; counters ease out over 1.4s (cubic ease-out) on first view at 50 percent visibility; reduced motion sets final values. Grid stacks below 900px; stats 4 to 2 columns (560px: 1) |
| S4 | News & Offers (`#news`) | Featured latest entry (image, meta "News · This Fall · Featured", serif title, one line, "Read the story") + three-card row (photo, meta "Category · Timing", title) + "View More" to `/news`. Renders nothing when empty (§4.2) | Reveals with stagger; single column below 900px |
| S5 | Dining preview (`#dining`) | Two-column grid: photo slot left ("Crystal Jade Palace · Dining Room"), content right. Eyebrow "Dining at the Center" · H2 "Crystal Jade Palace". Lede: "Cantonese fine dining on the promenade. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen." Credential rows: Michelin (Vancouver Michelin Star, four consecutive years, 2022 to 2025) · Accolades (North America's Best Chinese Cuisine Restaurant, 2025; Supreme Gold, World Championship of Chinese Cuisine 2024) · Private Dining (private rooms and bespoke banquet menus; corporate dining by arrangement). CTAs: solid "Discover Crystal Jade" to `/dining`; ghost "Book a Table" to `/dining/reserve`. Content is sourced from the `restaurant` singleton (§8.4), not `homePage` | Jade is scoped to this section; standard reveals; grid stacks below 900px, image first |
| S6 | Spaces head (`#spaces`) | Eyebrow "The Spaces" · H2 "Two floors of golf, room by room." · sub "From open simulator bays to private VIP rooms, every space in the club is built around the game." · link "View all spaces" to `/spaces` | Standard reveals |
| S7 | Spaces Journey (`#spacesScroll`) | Five full-bleed panels (§5.2). Each panel is one anchor link to its `/spaces` zone and carries: an oversized index numeral, one or two photo plates, meta (index · name · floor), the concept title in large serif, one line, and an "Explore" cue. Progress UI: zero-padded counter ("01 / 05") + champagne fill bar | Gesture-gated page-turn journey; full contract in §9.3. Mobile and fallback: native horizontal scroll with `scroll-snap-type: x mandatory`; scroll position drives the same progress UI |
| S8 | Outro (`#outro`) | Eyebrow "Under Ten Thousand Lights" · H2 "The course is always open." (italic emphasis on "always") · line "Book a bay, gather in a private room, or stay for dinner at Crystal Jade Palace." · visit line "Open daily · 06:00 to 24:00 · Garden Way, Richmond" · CTAs: solid Book a Bay (`#contact`), ghost Book a Table (`/dining/reserve`) | Standard reveals |
| S9 | Footer (`#contact`) | Canonical footer per §3.4 | Anchor target for Book a Bay |

A floating back-to-top button appears after scroll and animates the return (instant under reduced motion).

### 5.2 Journey panels (order · anchor · accent)

| # | Panel | Anchor on `/spaces` | Concept title | `--acc` | Layout |
|---|---|---|---|---|---|
| 01 | At-Bat & Putting Zone · 1F | `#general-at-bat` | The Vitality of a Swing | `#c9a66b` | two plates |
| 02 | Fitting Shop & Pro Shop · 1F | `#fitting-shop` | Balance and Proportion | `#b98d7a` | two plates, flipped |
| 03 | Dining · 1F | `#dining` | Warm Sunshine on the Western River | `#57ad85` | single plate |
| 04 | Sauna & Amenity · 1F | `#sauna` | Breathing Alongside Nature | `#9db18f` | two plates, flipped |
| 05 | VIP & VVIP Rooms · 2F | `#vip-rooms` | Iconic 15 and Beyond | `#8a6fc9` | two plates; the second is the "Renders to be revealed · VVIP Suites 1 to 4" placeholder |

Panels are curated Home content (`homePage.journeyPanels`, §11.4), not derived from `zone` documents: panels 01 and 05 are composites of two zones each, so they are authored on the home document, carry an explicit `layout` (two, twoFlipped, solo), and link to zone anchors. The panel index derives from array order. The accent colors the index numeral and meta divider only. Panel lines: 01 "Tour-grade simulator bays and a true-roll putting green beneath the canopy." · 02 "Precision club fitting and a curated pro shop along the central promenade." · 03 "Crystal Jade Palace brings Cantonese fine dining to the promenade." · 04 "A dry sauna and full amenities to close out every round." · 05 "Fifteen private rooms and four VVIP suites, one floor above the game."

### 5.3 Rates & Hours content (opening placeholders, confirm before launch, §15.2)

Bays & Rooms: General Bay · Day (weekdays 06:00 to 17:00, up to 4 players) $60/hour · General Bay · Twilight (weekdays from 17:00, and all day on weekends) $75/hour · VIP Room · 2F (private simulator room for up to 6 guests) $120/hour · VVIP Suite · 2F (Rooms 1 to 4, with a dedicated host) From $200/hour · Putting Zone (complimentary with any bay or room booking) Included. Footnote: "Rates are per bay or room, not per player. Clubs and shoes are available at the Pro Shop."

Hours & Availability: Open Daily (365 days a year, rain or shine) 06:00 to 24:00 · Last Tee Time (final one-hour bookings each night) 22:30 · Peak Hours (weekday evenings and weekends fill first; reserve 3 to 5 days ahead) 18:00 to 22:00 · Walk-Ins (subject to availability; mornings are quietest) Welcome · Reservations (online, or by phone) Up to 14 days.

### 5.4 Mockup notes (home v22)
1. The News & Offers entries are sample content. In production the section is CMS-driven (§4.2) and renders nothing when empty.
2. The announcement bar (§4.2) is not in the mockup; build it from the spec.
3. All pricing, the address, the phone number, and reservation windows are placeholders.
4. The outro Book a Table link points at `greentee-dining.html#reserve`; the production target is `/dining/reserve`.
5. The panel 05 second plate and the hero and panorama renders carry baked-in deck typography handled by cropping (§11.6).
6. **Section order deviates from the mockup by decision.** The mockup places the Spaces head and journey directly after the marquee; production places Rates & Hours, News & Offers, and the Dining preview first, with the journey (S6 + S7) between the Dining preview and the outro. The §5.1 table is the order of record; each section still matches its mockup selector internally.

---

## 6. The Spaces page

**Mockup**: `greentee-spaces.html` (v3). Route `/spaces`: all nine zones on one long scrollable page with anchored sections. Per-zone detail routes are a later phase.

### 6.1 Layout and rail
- **Desktop (1025px and up)**: two-column shell, a 210px sticky left rail (`top` around 104px) beside the zone flow. The rail carries: a wordmark ("The Spaces" serif over "GreenTee Richmond") linking to the top, the zone nav grouped under small "1F" and "2F" labels, and a solid `sm` **Book a Bay** button. A champagne hairline runs down the rail's left edge. The active link turns ivory and gains a short champagne dash (about 20px) before the label.
- **Below 1024px**: the rail hides; a sticky, horizontally scrollable chip bar (`.zonechips`) sits beneath the header (flush to the top below 900px) with the same nine anchors on a blurred noir backdrop. The active chip is ivory with a champagne underline.
- **Scroll spy**: IntersectionObserver with `rootMargin: -25% 0px -65% 0px` drives both the rail and the chips; anchor scrolling is smooth. Extract as `useScrollSpy`, shared with nothing else in v1 but built to be reusable.
- Zone reveals (`.zr`) fire at 12 percent visibility; reduced motion shows everything immediately.
- Each zone closes with a prev/next zone pager (`.znav`); it stacks to one column below 560px.

### 6.2 Zone anatomy
Every zone follows the same skeleton:
1. **Zone hero** (`.zhero`): full-bleed render at `min(58vh, 560px)`, minimum 400px, with an irregular fractal-noise grain overlay (SVG `feTurbulence`, blend overlay, never a repeating tile), a placeholder tag ("Deck render · replace with final photography"), then the eyebrow ("1F · General At-Bat" pattern), the concept-title H1, and the concept subline (the poetic line from the deck).
2. **Zone body** (`.zbody`): a two-column grid of copy (lead + supporting paragraph) and a `dl` of fact rows (three label/value pairs), then a CTA. The grid stacks below 900px; fact rows stack below 560px.
3. **Vertical rhythm (deviates from the mockup by decision)**: zones get more air between each other than the mockup gives them. The mockup runs the zone body to a 36px bottom padding and starts the next zone hero flush against the pager; production widens both: zone body bottom padding 96px (64px below 900px), and 96px of clear space between the pager and the next zone hero (56px below 900px). These are first-pass values to be tuned by eye; the top padding (90px) and `scroll-margin-top` stay as mocked.

### 6.3 The nine zones

| Anchor | Floor · Name | Concept title (H1) |
|---|---|---|
| `#general-at-bat` | 1F · General At-Bat | The Vitality of a Swing |
| `#putting-zone` | 1F · Putting Zone | Sunlight Through a Forest |
| `#fitting-shop` | 1F · Fitting Shop | Balance and Proportion |
| `#pro-shop` | 1F · Pro Shop | Movements That Draw the Gaze |
| `#sauna` | 1F · Sauna | Breathing Alongside Nature |
| `#amenities` | 1F · Amenities | Harmony in the Details |
| `#dining` | 1F · Dining | Warm Sunshine on the Western River |
| `#vip-rooms` | 2F · Private Area | Iconic 15 |
| `#vvip-rooms` | 2F · Private Area | Beyond the Fifteen |

**Dining zone**: after the hero, a jade-washed panel introduces Crystal Jade Palace (H2 "Cantonese fine dining, on the promenade.") with two CTAs: "Crystal Jade Palace" to `/dining` and "Book a Table" to `/dining/reserve`. Jade appears on `/spaces` only inside this panel. **The panel's internal layout deviates from the mockup by decision**: the mockup centers a fixed 16/10 photo plate inside the padded panel with a 5vw gulf to the copy, so image and text read as two separate objects. Production builds it as a unified split card: keep the jade gradient surface, gold hairline border, and the roughly 1.05fr / 1fr split, but the photo plate stretches to the full panel height and bleeds flush to the panel's outer edge on its side (no panel padding on the image side, `align-items: stretch`, the copy column's height sets the minimum), while the copy column keeps the 54px-class padding and the column gap tightens to about 44px. Below 900px the card stacks: image full-width on top, flush to the panel edges, copy padded beneath. Image and copy must share edges so the panel reads as one object.

**VIP Rooms (Iconic 15)**: intro copy ("fifteen VIP rooms, each translating a property of nature into a room-scale landscape"), fact rows (Rooms: fifteen on the second floor · Motifs: sprout, grain, leaf, crystal · Booking: by the room, hourly), a motif legend (Sprout · Grain · Leaf · Crystal), then "The fifteen rooms": a card grid of thirteen render cards plus two "Render pending" placeholders (Rooms 14 and 15). Rooms 9 & 10 and 11 & 12 are combined cards and carry a one-line description; every card shows its motif label and room name. Grid: 2 columns below 900px, 1 below 560px. CTA: Book a Room (`/#contact`).

**VVIP Rooms (Beyond the Fifteen)**: "Renders to be revealed" hero placeholder, copy ("four VVIP suites, each a singular commission... revealed to members first" reads as access framing, not membership sales; keep it), fact rows (Suites: four, all different · Status: designs to be revealed · Access: by arrangement), four "To be revealed" cards, CTA Enquire.

### 6.4 Mockup notes (spaces v3)
1. The mockup footer is the older layout; build the canonical footer (§3.4, §15.9).
2. Book a Bay and Book a Room CTAs land on the Home `#contact` anchor until booking exists.
3. VIP Rooms 14 and 15 and all four VVIP suites are placeholder cards by design; the empty-render state is part of the spec, not a gap to fill with stock imagery.
4. **Inter-zone spacing deviates from the mockup by decision**: production adds air between zones per §6.2 item 3; match the spec values, not the mockup's.
5. **The dining zone panel deviates from the mockup by decision**: the mockup's centered floating photo plate is replaced by the unified split card in §6.3; everything else about the panel (surface, border, copy, CTAs) still matches the mockup.

---

## 7. News & Offers page

**Mockup**: `greentee-news.html` (v1). Route `/news`.

**Structure**
1. **Page head**: H1 "What's on at the Center." with supporting line.
2. **Filter bar**: sticky-adjacent chip row: All · Offers · Events · News (`data-filter`: all / offer / event / news). Client-side filter toggles visibility of every entry, including the featured one; the active chip is highlighted. Chips are buttons, minimum 44px touch targets.
3. **Featured entry** (`.nfeat`): the latest entry as a large split preview: wide image, meta ("News · This Fall" plus a Featured badge), serif title, one line, "Read the story" link.
4. **Card grid** (`.ngrid`): nine cards (`.ncard`): photo, meta "Category · Timing", title, one line. Three columns, collapsing to one below 900px.

**Data**: the index is the union of `promotion`, `event`, and `newsPost` documents (§4.1), newest first; the featured slot is simply the latest entry. Category chips map to the three types. In v1 the mockup content is static sample copy; card links are stubs pending `/news/[slug]` detail routes, so cards may render without links until then. The page renders the head and filter bar even when the CMS is empty, with a quiet empty state beneath.

---

## 8. Dining · Crystal Jade Palace (tenant restaurant)

**Mockups**: `greentee-dining.html` plus the five page files (v6). Source: the tenant's website framework proposal (soft opening Aug 15, grand opening Sep 9). The former one-page layout is replaced by a landing page plus five independent pages; the tenant proposal's nav items map one-to-one onto routes.

### 8.1 Brand rules (inherited, enforced in our copy)
- Understated luxury: refined, unhurried, confident
- No promotional language, no exclamation points, no discount messaging
- Never an em dash or en dash; ranges written "2022 to 2025"
- Colors: deep jade green + warm gold on our noir canvas (`--color-jade`, `--color-jade-text`, `--color-champagne`). Jade and gold are foregrounded on these pages: jade-washed panels and rail hairline, gold hairline frames and rules, jade rail states, gold italic accents and champagne periods in display headings
- Photography: professional, warm, textured; craft over portion size
- Chinese strings (dish names, future 中文 content) set in the `--zh` system stack (§2.2)

### 8.2 Shell: `<DiningLayout>` with `<DiningRail>`
Every `/dining` route renders inside a shared shell beneath the global header.

- **Desktop (1025px and up)**: two-column grid, a 220px sticky left rail (`top` around 120px) beside the page content. The rail carries: the Crystal Jade mark ("Crystal Jade" serif over "Palace") linking to `/dining`, the five page links (**Our Story · The Chef · Menu · Banquet · Reserve**), a solid `sm` **Book a Table** button to `/dining/reserve`, and the **EN / 中文** language toggle. A jade hairline runs down the rail's left edge. The active page link turns jade-text and gains a short gold dash (about 22px) before the label.
- **Below 1024px**: the rail hides; a sticky, horizontally scrollable chip bar (`.dinechips`) beneath the header carries the five page links on a blurred jade-noir backdrop; the active chip is jade-text with a champagne underline. The Crystal Jade mark moves into each page hero.
- **Language toggle**: EN is active (champagne); 中文 is rendered but inert, pending final human translation (§15.4). Present it as a static indicator, not a broken control.
- The rail exists only on `/dining` routes and carries only restaurant items, preserving the dual-brand hierarchy (center first, tenant second). Active state is route-driven, not scroll spy.
- On these pages the FullMenu appends the Crystal Jade entries (§3.4).

### 8.3 Pages

**`/dining` · Home**
1. Hero: full-screen visual slot ("photo or video loop"), eyebrow "Cantonese Fine Dining · GreenTee Richmond Center", H1 Crystal Jade Palace, credential line "A Michelin dining experience · The first in North America".
2. Intro: lede "One of Asia's most respected Cantonese kitchens arrives in Richmond." + supporting copy closing on "Lunch and dinner daily, within GreenTee Richmond Center."
3. Signature Dishes: "From the kitchen." with three dish photos (Signature Crispy Roast Duck · Wok-Seared Lobster · Crystal Har Gow), CTAs Book a Table and "View the Full Menu".
4. Private Dining preview: "Rooms for the occasions that matter." + fact rows (Private Rooms: eight rooms, count to confirm · Capacity: from six guests to full banquet tables · Booking: separate enquiry channel) + CTA "Banquet & Private Dining" to `/dining/banquet`.

**`/dining/story` · Our Story**
1. Hero band: "From a single kitchen to the world." over brand imagery placeholder.
2. Heritage: "Carried across the region's great cities." + narrative + footprint list (Singapore · Hong Kong · Shanghai · Across Asia · Now, Richmond) beside a map placeholder (footprint list to confirm against the brand guide).
3. Why Richmond, Why Now: "Not an introduction. A homecoming." + narrative.
4. Kitchen Philosophy: "Three ideas, held quietly." + three concept cards: Classical Technique · Premium Ingredients · Quiet Creativity, each with a line.

**`/dining/chef` · The Chef**
1. Chef intro: kitchen-setting portrait slot (explicitly not a studio headshot) + "A journey measured in quiet decades."
2. Credential rail: three gold-gradient emblem bars with SVG line-art crests: Vancouver Michelin Star (four consecutive years, 2022 to 2025) · World Championship of Chinese Cuisine (Individual Supreme Gold Award, 2024) · North America's Best Chinese Cuisine Restaurant (2025). Emblems are placeholders until official award assets arrive.
3. His Story: "Twenty-three years across five-star kitchens, from Banyan Tree and Marriott to InterContinental and Pan Pacific. A culinary journey that began in China and now settles in Vancouver."
4. In His Own Words: quote block ("Cantonese cuisine rewards patience. My work is to let the ingredient speak first, and to speak second."), placeholder pending the chef interview.

**`/dining/menu` · Menu**
1. Hero band: "Signature dishes." + "Dishes that change with the seasons. Technique that does not." over an editorial dish-photography slot.
2. Dish grid: category chips (All Dishes · Dim Sum · Roasted Meats · Seafood · Mains · Desserts) filtering the grid client-side; 11 sample dish cards in the mockup, 8 to 12 `dish` documents in production. Each card: large-format photo, category label, EN name + 中文 name, one line. Inline display, no PDF.

**`/dining/banquet` · Banquet**
1. Hero band: "Rooms for the occasions that matter." + "Private rooms, dedicated service, and menus composed for the table."
2. Banquet Services: "Composed around the table." + fact rows (Private Rooms: eight rooms, count to confirm · Capacity: from six guests to full banquet tables · Service: dedicated service team for every room) + occasions list (Corporate dining · Celebrations · Ceremonies) beside a banquet-table photo slot.
3. Bespoke Menus: "Two ways to compose." Per Person (individually plated set menus) and Per Table (traditional banquet menus, shared), both "Pricing on enquiry". CTA **Enquire Now**.

**`/dining/reserve` · Reserve**
1. Reserve block: "A table awaits." + contact rows: Telephone (+1 000 000 0000, placeholder) · WeChat (CrystalJadeYVR, placeholder) · Hours (Lunch 11:00 to 14:30 · Dinner 17:30 to 22:00, placeholder, daily) · Address (GreenTee Richmond Center, 0000 Garden Way, Richmond). Primary CTA Book a Table; crosslink "Planning a private event? Banquet & Private Dining".
2. Online Reservations: OpenTable embed placeholder until the account is live (§15.3).

**Content dependencies** (tenant checklist): chef portrait in kitchen setting, 8 to 10 editorial dish photos, interior and private room photography, banquet-table photography, brand imagery per the Crystal Jade brand guide, footprint list confirmation, private-room count confirmation, chef biography and interview, award visual assets, hero photo or video loop.

### 8.4 Sanity: `restaurant` singleton
name, tagline, lede, heroMedia, credentials[] {label, value, detail}, story {heritage (portable text), footprint[], richmond (portable text), philosophy[] {title, line, image}}, chef {portrait, intro, awards[] {title, detail, years}, bio, quote}, banquet {copy, facts[], occasions[], menus[] {label, line}, enquiryTarget}, reserve {openTableUrl, phone, wechat, hours[], address}, seo. Dishes live as separate `dish` documents (§4.1) for frequent updates.

---

## 9. Motion system

### 9.1 Library roles
| Library | Owns |
|---|---|
| native scroll | site-wide; `scroll-behavior: smooth` for anchors. **No Lenis, no smooth-scroll library**: the journey needs real scroll positions and gesture capture, and the mockup pattern (suspend CSS smooth scrolling during GSAP window tweens, restore after) is the contract |
| `motion` (Framer Motion) | component enter/exit, FullMenu, micro-interactions |
| `gsap` core + ScrollTrigger + Observer + ScrollToPlugin | intro and hero timeline, the journey (§9.3), parallax, programmatic window scrolls |
| IntersectionObserver | reveal system, counters, scroll spy, canvas pause |
| plain Canvas 2D | HeroParticles; no WebGL |

### 9.2 Motion presets (`src/components/motion`, the only allowed entry points)
- `<Reveal>`: the `[data-reveal]` system: opacity + rise in, optional `delay`, fired by a shared IntersectionObserver (threshold .16 on Home, .12 on `/spaces`), each element observed once.
- `<SplitHeading>`: per-letter hero bloom (y + blur release, .03 stagger).
- `<ParallaxImage>`: inner y-parallax, yPercent -5 to 5, scrubbed over the element's viewport transit (panorama band and large photo plates outside the journey).
- `<StatCounter>`: 0 to target over 1.4s, cubic ease-out, starts at 50 percent visibility, supports a suffix ("200+"); reduced motion renders the final value.
- `<IntroCurtain>`: the S0 timeline.
No ad-hoc keyframes or inline GSAP timelines in sections. There is no magnetic-hover preset in this iteration; buttons use plain hover states.

### 9.3 The Spaces Journey contract (parameters are the spec; match the mockup)
Desktop (901px and up, GSAP + Observer + ScrollToPlugin available, no reduced motion):
- The section adds a `js-pin` mode: the panel track moves by transform; panels are sized to the exact viewport width on init and on every ScrollTrigger refresh so each landing is flush.
- **Engage**: a ScrollTrigger window (`start: top 62%`, `end: bottom 38%`) engages the journey on enter (at panel 01) or on enter-back (at the last panel), auto-centering the section with a .55s power2.inOut window scroll. While engaged, a gesture Observer (wheel + touch, `wheelSpeed: -1` so wheel and swipe agree, `tolerance: 12`, `preventDefault: true`, `allowClicks: true`) captures input.
- **Step**: one gesture turns exactly one page: track tween 1.05s power2.inOut (TURN), then a .5s dwell (DWELL) before the next gesture is accepted. Keyboard steps while engaged: ArrowDown / PageDown / Space forward, ArrowUp / PageUp back.
- **Per-panel rise**: each panel owns a paused timeline: large plate from y 110 / opacity 0 over 1.05s, small plate from y 150 over 1.15s at +.18s, info block from y 44 over .85s at +.32s, all power3.out. Stepping forward plays the incoming panel's rise; stepping back reverses the outgoing panel's. Panel 01 rises once on approach (`top 72%`).
- **Directional kick**: on every turn the incoming index numeral slides from xPercent 22 in the travel direction and the photo plates from xPercent 7, both easing out slightly longer than the turn.
- **Release**: a gesture past either end disengages the Observer and hands control back to the page with a .8s window scroll of about .9 viewport heights in the travel direction. Leaving the trigger window also hard-releases. The journey must never trap the user.
- **Progress UI**: champagne fill bar scaled to `index / (N - 1)` with a .9s `cubic-bezier(.22, .61, .36, 1)` transition in js-pin mode, plus a zero-padded counter ("01 / 05").
- Panels are anchor links in DOM order (`allowClicks: true` keeps them tappable), so the section linearizes correctly for screen readers and remains keyboard-escapable via Tab.

Fallback (below 901px, reduced motion, or GSAP unavailable): the viewport is a native horizontal scroller with `scroll-snap-type: x mandatory`, hidden scrollbars, and touch momentum; `scrollLeft` drives the same progress UI. No pinning, no gesture capture, vertical page scroll is never hijacked.

### 9.4 Canvas module: HeroParticles (parameters are the contract)
Calm rising seeds of light behind the hero copy:
- 56 particles in the mockup; production reduces to about 40 below 768px per the performance budget
- radius .6 to 2.2 · rise speed .00016 to .00054 of height per frame · sine sway 8 to 28px · slow twinkle (.55 base, .45 amplitude)
- roughly a third champagne-gold `rgba(216,180,122)`, the rest ivory, soft glow (shadowBlur = 4r)
- seeds spawn just below the fold (y 1.04 to 1.12) and recycle when they clear the top (y < -.04)
- devicePixelRatio capped at 2; the loop pauses when the canvas leaves the viewport (IntersectionObserver, 80px rootMargin) and on hidden tabs; hidden entirely under reduced motion; `aria-hidden`

The AuroraRibbons module from earlier iterations is retired; v22 carries no ambient ribbon canvas.

### 9.5 Global guards
- `prefers-reduced-motion` adds an `rm` state: the intro curtain is skipped, hero copy renders settled, all reveals show immediately, the marquee and scroll cue stop, counters print final values, the journey uses the snap fallback, and programmatic scrolls are instant.
- Fail safe on import: if gsap or any motion module fails to load (or has not compiled yet in dev), the intro curtain skips and sections render settled. The page never blocks on a failed or pending dynamic import.
- GSAP-driven and canvas components are client leaves, dynamically imported, initialized near viewport; a font-ready ScrollTrigger refresh prevents layout drift after webfont swap.

---

## 10. Responsive and device requirements

**Reference widths**: 390 (mobile baseline) · 768 · 1024 · 1440. Layouts are fluid between them; type uses clamp throughout. Every UI task is verified at 1440 and 390 minimum (see CLAUDE.md definition of done).

**Breakpoints in play**: 1024 (rails collapse to chip bars) · 900 (header hamburger, grid stacks, journey fallback) · 760 (dining internals) · 560 (fine grids, fact rows).

**Viewport and layout**
- Hero and full-height sections use `100svh` (not `100vh`) with a sensible min-height, so mobile URL bars never clip content
- Sticky elements (header, chip bars, announcement bar) respect `env(safe-area-inset-*)`
- No horizontal overflow at any width; the journey re-measures panel widths on resize and refresh

**Touch and input**
- Touch targets at least 44x44px (chips, rail links, room cards)
- Hover-dependent effects are gated behind `(hover: hover) and (pointer: fine)` and do nothing on touch
- The journey never hijacks vertical touch scrolling on mobile; below 901px it is a native horizontal snap strip inside normal page flow

**Per-surface mobile behavior**
| Surface | Below 900px (unless noted) |
|---|---|
| Header | nav collapses to hamburger; FullMenu overlay with focus trap |
| Hero | type scales via clamp; buttons wrap; particles reduced (§9.4) |
| Panorama band | height 320px, tighter art-directed crop via Sanity hotspot |
| Journey | snap strip; plates stack inside each panel (large above, small below; solo full-width), panel line and Explore cue hidden, numeral scales to 24vw, progress UI compacts |
| Rates & Hours | columns stack; stats 2 columns (560px: 1) |
| News teaser + `/news` grid | single column |
| Dining preview | grid stacks, image first |
| `/spaces` rail | chip bar beneath the header below 1024px (flush top below 900px); zone grids stack; rooms 2 columns (560px: 1) |
| `/dining` rail | chip bar beneath the header below 1024px; Crystal Jade mark moves into page heroes |
| Footer | columns stack; visit line wraps |

**Media**
- Every image declares `sizes`; art direction through Sanity hotspot rather than separate assets where possible
- Hero render keeps the entrance portal in frame at portrait crops

**Mobile performance**
- LCP under 2.5s on a mid-tier device over 4G; the canvas never blocks first paint
- Canvas DPR cap and particle reduction per §9.4; all loops pause offscreen and on hidden tabs
- Reserve explicit heights for bands and canvases to keep CLS under 0.1

**QA matrix**: iOS Safari and Android Chrome at 390 and 768; desktop Chrome, Safari, Firefox at 1024 and 1440; one landscape-phone sanity pass. The journey gets an extra pass: trackpad, mouse wheel, touch, and keyboard at 1440; snap strip at 390.

---

## 11. Technical architecture

### 11.1 Stack
| Area | Choice |
|---|---|
| Framework | Next.js latest stable, App Router, RSC by default |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens) + minimal plain CSS |
| CMS | Sanity, embedded Studio, `next-sanity` |
| Images | `next/image` + Sanity Image CDN (lqip placeholders, hotspot) |
| Motion | motion (Framer), gsap (+ ScrollTrigger, Observer, ScrollToPlugin); native scroll, no Lenis (§9.1) |
| Fonts | `next/font`: Cormorant Garamond, Inter; zh via system stack |
| Forms | Resend (banquet enquiry and contact, when those flows ship) |
| Analytics | Vercel Analytics (+ GA4 if required) |
| Hosting | Vercel · SSG + ISR + on-demand revalidation |

### 11.2 Repository layout
```
docs/
├─ design.md                          # this document
└─ mockups/                           # read-only reference (see header table)
   ├─ greentee-home.html
   ├─ greentee-spaces.html
   ├─ greentee-news.html
   ├─ greentee-dining.html
   ├─ greentee-dining-story.html
   ├─ greentee-dining-chef.html
   ├─ greentee-dining-menu.html
   ├─ greentee-dining-banquet.html
   └─ greentee-dining-reserve.html
src/
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx                   # Header/Footer + announcement bar
│  │  ├─ page.tsx                     # Home                        v1
│  │  ├─ spaces/page.tsx              # The Spaces                  v1
│  │  ├─ news/page.tsx                # News & Offers               v1
│  │  ├─ dining/
│  │  │  ├─ layout.tsx                # DiningLayout + rail         v1
│  │  │  ├─ page.tsx                  # Crystal Jade home           v1
│  │  │  ├─ story/page.tsx · chef/page.tsx · menu/page.tsx
│  │  │  ├─ banquet/page.tsx · reserve/page.tsx        # all v1
│  │  ├─ news/[slug] · spaces/[slug] · golf/… · events · shop · contact   # planned
│  ├─ studio/[[...tool]]/page.tsx
│  ├─ api/revalidate/route.ts
│  └─ layout.tsx · globals.css · sitemap.ts · robots.ts
├─ components/
│  ├─ layout/    SiteHeader, SiteFooter, FullMenu, AnnouncementBar, BackToTop
│  ├─ motion/    Reveal, SplitHeading, ParallaxImage, StatCounter, IntroCurtain
│  ├─ canvas/    HeroParticles
│  ├─ sections/  home/, spaces/, news/, dining/
│  └─ ui/        Button, Eyebrow, SectionHeading, PhotoFrame, SanityImage, Chip, FactRows
├─ sanity/       schemaTypes/, lib/ (client, image, queries, fetch), structure.ts
├─ lib/          fonts.ts, utils.ts, seo.ts, mock/
├─ hooks/        useScrollSpy, usePrefersReducedMotion, useCanvasLoop
└─ types/        domain types consumed by sections
```

### 11.3 Component map (mockup to implementation)

| Mockup selector | Component | Kind |
|---|---|---|
| `.intro` | `<IntroCurtain>` | client |
| `header` + `.fullmenu` | `<SiteHeader>` + `<FullMenu>` | client |
| announcement bar (not in mockups) | `<AnnouncementBar>` | server + client dismiss |
| `.hero` | `<HomeHero>` with `<SplitHeading>`, `<HeroParticles>`, `<Button>` | server shell + client leaves |
| `.manifesto` | `<Manifesto>` | server + `<Reveal>` |
| `.mani-media` | `<PanoramaBand>` | client parallax leaf |
| `.marquee` | `<ConceptMarquee items>` | CSS only |
| `#spaces` (sec-head) | `<SpacesIntro>` | server |
| `#spacesScroll` | `<SpacesJourney panels>` + `<JourneyPanel>` | client (GSAP + Observer) |
| `#rates` | `<RatesHours>` with `<RateList>`, `<HourList>`, `<StatCounter>` | server + client counters |
| `#news` (home) | `<NewsOffersTeaser>` + `<NewsFeature>` / `<NewsCard>` | server |
| `#dining` (home) | `<DiningPreview>` | server |
| `#outro` | `<Outro>` | server |
| `#toTop` | `<BackToTop>` | client |
| `footer` | `<SiteFooter>` (`id="contact"`, canonical §3.4) | server |
| `.spcrail` + `.zonechips` | `<SpacesRail>` + `<ZoneChips>` (shared `useScrollSpy`) | client |
| `section.zone` | `<ZoneSection>` with `<ZoneHero>`, `<FactRows>` | server + `<Reveal>` |
| `.rooms` (VIP/VVIP grids) | `<RoomGrid>` + `<RoomCard>` | server |
| `.znav` | `<ZonePager>` | server |
| `.pagehead` + `.filterbar` (news) | `<NewsIndexHead>` + `<FilterChips>` | client filter |
| `.nfeat` / `.ngrid` | `<NewsFeature>` / `<NewsGrid>` + `<NewsCard>` | server |
| `.dine-shell` + `.dinerail` + `.dinechips` | `<DiningLayout>` + `<DiningRail>` + `<DiningChips>` | server shell, route-driven active state |
| dining page sections | `<DiningHero>`, `<SignatureTrio>`, `<PrivatePreview>`, `<StoryHeritage>`, `<StoryRichmond>`, `<KitchenPhilosophy>`, `<ChefIntro>`, `<CredBars>`, `<ChefQuote>`, `<MenuChips>` + `<DishGrid>` / `<DishCard>`, `<BanquetFacts>`, `<BespokeMenus>`, `<ReserveBlock>` | server + client filter on menu |
| `.ph` | `<PhotoFrame tint label tag>`, later `<SanityImage>` | server |

### 11.4 Sanity schemas
| Type | Purpose | Key fields |
|---|---|---|
| `siteSettings` (singleton) | globals | logo, phone, address, hours, email, socials, bookingUrl, careersUrl, familyLinks[], networkLinks[], default SEO |
| `homePage` (singleton) | home content | hero {eyebrow, titleLines[2], italicLine, supportLine, media}, manifesto {lines[] {text, emphasis}, caption}, panoramaBand {image, caption}, marqueeItems[], rates {eyebrow, title, sub, rateRows[] {name, detail, price, unit}, hourRows[] {name, detail, value}, footnote, stats[] {value, suffix, label}} (column labels "Bays & Rooms" / "Hours & Availability" are static UI), newsTeaser {eyebrow, title, sub}, journeyPanels[] {name, conceptTitle, floorLabel, anchor, line, accent, layout (two, twoFlipped, solo), plates[]} (§5.2), spacesIntro {eyebrow, title, sub, linkLabel}, outro {eyebrow, title, line} (the visit line renders from `siteSettings`) |
| `zone` x9 | `/spaces` zones | slug/anchor, floor, name, conceptTitle, conceptLine, lead, body, facts[], heroImage, order, rooms[] (VIP/VVIP only: name, motif, line, image, pending), seo. Journey panels live on `homePage` (§5.2) |
| `restaurant` (singleton) | Crystal Jade Palace | §8.4 |
| `dish` | dining menu items | §4.1 (name, zhName, line, image, category, seasonal, available, order) |
| `event` / `promotion` / `newsPost` | content operations | §4.1 (all carry the timing label) |

### 11.5 Data and rendering
- SSG + ISR everywhere; `sanityFetch` with cache tags (`home`, `zone`, `restaurant`, `dish`, `event`, `promotion`, `news`, `settings`)
- Sanity webhook to `/api/revalidate` calling `revalidateTag()`
- Draft Mode + Presentation tool for editor preview
- Env: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`

### 11.6 Asset pipeline
- Current renders carry baked-in presentation typography (JKVG lockups, slide titles). Production should request clean exports from JKWG.
- Interim technique (as used in the mockups, keep documented): bottom-anchored zoom (scale 1.12, bottom origin) + top gradient occlusion for the hero; precise crops elsewhere.
- Known placeholder slots that ship as designed placeholders: VIP Rooms 14 and 15, all four VVIP suites, the dining hero photo or video loop, chef portrait, dish and interior photography, award emblems, Crystal Jade brand imagery and footprint map.
- Base64 embeds exist only in the mockups. Production images are Sanity assets served through the CDN.

---

## 12. Performance · SEO · Accessibility

**Budgets**: LCP under 2.5s (desktop and mid-tier mobile), CLS under 0.1, initial JS under 200KB gzip (motion and canvas lazy).
- Hero: `next/image` with `priority` + lqip; if a walkthrough video is sourced later, poster first then deferred `muted loop playsinline`
- All imagery through `<SanityImage>`; fonts via `next/font` subsets with `display: swap`

**SEO**
- `generateMetadata` per route, including every `/dining` page; per-page OG images; sitemap and robots
- JSON-LD: `SportsActivityLocation` (the center, `openingHours` year-round) on `/`, `Restaurant` on `/dining` (`servesCuisine: Cantonese`, awards), `Event` on future event detail pages
- Keywords lead with indoor golf: "indoor golf Richmond", "golf simulator Richmond", "private golf simulator rooms Vancouver"
- `/studio` noindex

**Accessibility**
- Body text is ivory on noir; mist for captions only; champagne text at display sizes only
- Focus-visible champagne outline; FullMenu focus trap; decorative canvas and index numerals `aria-hidden`
- The journey remains keyboard-operable while engaged (arrows, PageUp/Down, Space), always releasable at both ends, Tab-navigable through its panel links, and linear in the DOM for screen readers
- Chip bars and rails are `nav` elements with labels; active states never rely on color alone (dash, underline, and weight accompany the color)
- Reduced-motion handling built into presets, the journey fallback, and the canvas module, not per page

---

## 13. Roadmap

| Phase | Scope | Output |
|---|---|---|
| 0 | Bootstrap | Next + TS + Tailwind, Sanity embed, fonts, tokens, Vercel, `docs/` populated (this doc, mockups, CLAUDE.md) |
| 1 | Design system | tokens, type scale, `Button` (solid/ghost/light + sm), `Eyebrow`, `SectionHeading`, `PhotoFrame`, `Chip`, `FactRows`, motion presets (§9.2), `HeroParticles`, `SiteHeader` + `FullMenu` + `SiteFooter` (canonical), `/styleguide` demo route |
| 2 | Port Home | all S0 to S9 sections from `greentee-home.html` with static data, including the journey (§9.3) and its fallback, and the News teaser empty state |
| 3 | Port The Spaces | `SpacesRail` + chips + `useScrollSpy`, nine `ZoneSection`s, VIP/VVIP grids with pending states |
| 4 | Port News & Offers | index head, filter chips, featured + grid with static data |
| 5 | Port Dining | `DiningLayout` + rail + chips, six pages per §8.3, dish-driven menu (content-gated by tenant assets) |
| 6 | Sanity wiring | all schemas (§11.4), GROQ, every surface bound, announcement bar, webhook, seed content |
| | **v1 launch** | `/` + `/spaces` + `/news` + `/dining` (six routes) live |
| 7 | Content surfaces | `/news/[slug]`, `/events`, `/golf/rates`, `/golf/lessons`, `/spaces/[slug]`, `/shop`, `/contact` |
| 8 | Polish | journey feel tuning across input devices, a11y pass, perf audit, cross-browser, motion fail-safe audit (§9.5: IntroCurtain skips when GSAP fails or lags) |

---

## 14. Working with Claude Code

`CLAUDE.md` at the repo root is the operating contract: the mockup-porting rules (including the per-page mockup notes), hard design rules, SOLID and reuse conventions, definition of done, and prompt templates. Keep task requests scoped to one section or component, reference this document's section plus the mockup file and selector, and state done-criteria explicitly.

---

## 15. Open issues
1. **Bay booking**: siblings run tee-time booking (Chronogolf app at Westwood). Decide the indoor equivalent: third-party bay booking, owned form, or phone-first. Until then, Book a Bay and Book a Room land on `#contact`
2. **Rates confirmation**: the Rates & Hours numbers ($60 / $75 / $120 / from $200, 22:30 last tee, 14-day window) are opening placeholders; confirm real pricing and policies before launch
3. **Restaurant reservation**: OpenTable account and link timing; the reserve page ships with phone and WeChat placeholders and an embed slot
4. **Bilingual dining**: the EN / 中文 toggle is designed into the rail but inert; Chinese content is pending final human translation. Decide `next-intl` scoped to `/dining` versus linking out to a tenant-run bilingual site
5. **Clean renders and photography**: typography-free, full-resolution exports from JKWG (the interim hero render is about 1200px wide and reads soft at full-bleed); VIP Rooms 14 and 15 renders; VVIP suite reveal timing; the full Crystal Jade photo checklist (§8.3)
6. **Hero video**: a facade walkthrough loop for the Home hero, and the "photo or video loop" slot on the dining hero
7. **Timeline alignment**: Crystal Jade soft opening Aug 15, grand opening Sep 9; decide when `/dining` goes live relative to the center's site
8. **Brand and facts**: logo SVG, final address and phone, domain, GreenTee Golf Shop and Academy link handoffs, Crystal Jade private-room count ("eight rooms" is a placeholder), Crystal Jade global footprint list
9. **Footer drift in mockups**: only `greentee-home.html` (v22) shows the canonical footer (§3.4). The spaces, news, and dining mockups still carry an older footer (Golf · Events · Careers · Contact links); build the canonical footer everywhere and treat those as stale. Likewise the Home outro Book a Table href (`#reserve` on the dining file) predates the sub-pages; the target is `/dining/reserve`
10. **News card destinations**: `/news` cards link nowhere until `/news/[slug]` ships; decide interim behavior (unlinked cards versus anchor to the featured story)
