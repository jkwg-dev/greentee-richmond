# GreenTee Richmond Center
## Website Design & Architecture

> **Stack**: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Sanity · Vercel
> **Language**: English only
> **Visual reference**: `docs/mockups/home-v9.html` (Home) and `docs/mockups/dining-v2.html` (Crystal Jade Palace) are the references for look, motion, and copy tone. See `CLAUDE.md` for the porting contract.

---

## 1. Brand & design direction

**Identity anchor: indoor golf, first and always.** GreenTee Richmond Center is a premium indoor golf club in the GreenTee Country Club family. Every page must read, within seconds, as world-class golf played indoors: tour-grade simulators, honest practice surfaces, private rooms, year-round and weather-proof. The architecture and the dining are the stage; golf is the story. Copy leads with play, never with decor.

**Concept**: Botanical Luxury · a nocturnal garden. The building's own narrative (Blooming Buds → Seed to Blossom → Dynamism of Nature → Iconic Street) is the visual language of the site. Existing concept copy is promoted to the headline system rather than rewritten.

**Mood keywords**: Nocturnal Garden / Luminous / Organic Geometry / Quiet Luxury

**Principles**
1. **Indoor golf leads.** The Game content (bays, coaching, putting, year-round play) is never buried below brand storytelling on any page.
2. **Light on a dark canvas.** Background is near-black; images and type glow like blossoms.
3. **Whitespace is the luxury.** One message per screen, low density.
4. **Serif dignity.** Oversized serif display against small tracked sans captions.
5. **A single motion language: Bloom.** Every reveal is blur-release + subtle scale + mask expansion.
6. **Photography leads.** UI is a frame; renders and photography own the screen, full-bleed by default.

**Signature element**: the Spaces Journey. As the visitor moves through the pinned sequence, the page's lighting (background tint and accent) shifts per space: rosegold → iridescent → sage → champagne → iris → emerald. The web translation of walking the building.

**Hard bans**
- White background sections, card shadows, gradient buttons, emoji icons
- Literal flower, petal, or leaf illustrations of any kind
- Regular, repeating decorative patterns; organic curves must be irregular (incommensurate frequencies, §7)
- The term "media art" in UI copy, and any membership language (no membership program exists)

---

## 2. Design tokens

### 2.1 Color

```css
@theme {
  --color-noir: #0a0a0b;        /* base background */
  --color-noir-soft: #131315;   /* surfaces */
  --color-ivory: #f2ede2;       /* primary text */
  --color-mist: #8f8b82;        /* secondary text, captions */
  --color-champagne: #c9a66b;   /* global accent: CTA, hairlines, index */
  --color-rosegold: #b98d7a;    /* Lobby */
  --color-emerald: #2f5c49;     /* VIP Rooms accent (surface #16382b) */
  --color-sage: #9db18f;        /* Putting Zone */
  --color-iris: #4a79b8;        /* VIP Corridor */
  --color-jade: #1f6b4f;        /* Crystal Jade Palace (dining) */
  --hair: rgba(201,166,107,.16); /* champagne hairline */
}
```

**Usage rules**
- 90 percent of any screen is noir + ivory. Champagne is the only global accent.
- Space accents are scoped: a space's color appears only in its own section, panel, or page.
- Jade + gold belongs exclusively to Crystal Jade Palace content.
- The iridescent gradient (violet / blue / pink) exists only inside the Hall context.

### 2.2 Typography

| Role | Face | Notes |
|---|---|---|
| Display (EN) | Cormorant Garamond 400 to 600, italic for concept lines | Google Fonts. Upgrade path: Canela / Freight Display if licensed |
| Body / UI | Inter 300 / 400 / 500 | tracked uppercase for labels |

Scale: H1 `clamp(2.6rem, 9vw, 7.6rem)` in two stacked lines · H2 `clamp(2.1rem, 4.6vw, 3.5rem)` · body 15px / 1.85 · eyebrow 10px, tracking 0.34em, uppercase, champagne, 34px hairline lead-in.

### 2.3 Buttons

| Variant | Spec | Use |
|---|---|---|
| `solid` | champagne bg, near-black text (#141008) | primary CTA (Book a Bay) |
| `light` | ivory bg, near-black text, border matches bg (borderless look), hover to pure white | secondary CTA over bright imagery |
| `ghost` | transparent, champagne border and text | tertiary, dark surfaces only |

All buttons: uppercase 10.5px, tracking 0.22em, sharp corners, magnetic hover (fine pointers only, §8).

---

## 3. Information architecture

### 3.1 Scope at launch
v1 ships two routes: `/` (Home) and `/dining` (Crystal Jade Palace). Everything else in this section is the planned structure. Navigation, footer, and Sanity schemas are built from day one to grow into it without rework.

### 3.2 GreenTee network alignment
The center belongs to the GreenTee Country Club family (JK World Group), alongside GreenTee Country Club Westwood Plateau (gtccwestwoodplateau.com) and GreenTee Country Club Tobiano (gtcctobiano.com). The IA mirrors their proven structure, translated from outdoor course to indoor club. Key translation: there is no course, no tee time, and no membership program here; the bookable product is the simulator bay and the private room, available year-round.

| Sibling pattern (Westwood / Tobiano) | Richmond adaptation (indoor) |
|---|---|
| Golf: courses, simulator rooms, driving range, rates, lessons, academy | Golf: Simulator Bays, VIP Rooms, Putting Zone, Rates, Lessons (GreenTee Golf Academy link) |
| Book a Tee Time (persistent CTA) | **Book a Bay** (persistent CTA) |
| Events: weddings, corporate, banquets, tournaments, upcoming events | Events: corporate and private events, simulator tournaments and leagues, Upcoming Events (CMS) |
| Dining: Jess' restaurants | Dining: Crystal Jade Palace |
| Shop: GreenTee Golf Shop, promotions, gift cards | Shop: Pro Shop and Fitting Studio page, GreenTee Golf Shop (family link), gift cards; promotions live under News & Offers |
| News / weekly news | News & Offers (CMS-driven) |
| Membership (Tobiano) | none; no membership program at Richmond |
| Contact, careers | Contact page; Careers as footer link |
| Footer family sites | JK World Group · GreenTee Golf Shop · GreenTee Golf Academy · JKWG Design & Development · Jess' Restaurants, plus the GreenTee network (Westwood Plateau · Tobiano · Langley) |

### 3.3 Route map

| Route | Page | Status |
|---|---|---|
| `/` | Home | **v1** |
| `/dining` | Crystal Jade Palace | **v1** |
| `/spaces` · `/spaces/[slug]` | The Spaces index + six space pages; each space page doubles as the facility page (facts, rates link, Book a Bay) | planned |
| `/golf/rates` | Rates: bays, VIP rooms, lessons | planned |
| `/golf/lessons` | Lessons · GreenTee Golf Academy | planned |
| `/events` · `/events/[slug]` | Events hub: corporate and private, tournaments and leagues, upcoming events (CMS) | planned |
| `/news` · `/news/[slug]` | News & Offers (CMS) | planned |
| `/shop` | Pro Shop and Fitting Studio (+ external GreenTee Golf Shop link) | planned |
| `/contact` | Visit, enquiries | planned |
| `/studio` | Sanity Studio (noindex) | v1 |

### 3.4 Navigation
- **Header (v1)**: News & Offers · Dining, plus persistent solid **Book a Bay**. Only live destinations appear in the top menu.
- **Header (target)**: Golf (dropdown: Simulator Bays · VIP Rooms · Putting Zone · Rates · Lessons) / Events / Dining / News & Offers / Contact. Items join the menu as their routes ship, without layout change.
- **Mobile**: hamburger opens the FullMenu overlay: large serif top-level items, with the Golf sub-links as a small tracked-caps row beneath Golf. Required from Phase 1.
- **Footer**: mini nav mirroring the header, visit line (address · hours · phone), Careers, family site links and GreenTee network links per §3.2, credits.

---

## 4. Content operations (Sanity)

The site carries a steady stream of updates: events, promotions, news, and Crystal Jade menu changes. All are editor-managed in Sanity Studio with no deploys.

### 4.1 Content types
| Type | Fields (core) | Feeds |
|---|---|---|
| `event` | title, slug, start, end, category (tournament, league, junior, corporate, community), image, excerpt, body, cta | `/events`, Home News & Offers teaser |
| `promotion` | title, image, summary, body, activeFrom, activeTo, placement (banner, card), link | announcement bar, Home teaser, `/news` |
| `newsPost` | title, slug, date, image, excerpt, body | `/news`, Home teaser |
| `dish` | name, line, image, category (Dim Sum, Roasted Meats, Seafood, Mains, Desserts), seasonal, available, order | `/dining` Menu block |

### 4.2 Surfaces
- **Home · News & Offers teaser (§5, S5)**: the latest entry as a large featured preview, beside a denser index of the next five or so entries, drawn from active promotions, upcoming events, and news. The section renders nothing when empty.
- **Announcement bar**: optional slim bar beneath the header, driven by a single `promotion` with `placement: banner`, dismissible per session. At most one at a time.
- **`/dining` Menu**: the dish grid reads `dish` documents; seasonal menu updates are pure content edits.
- **`/events`, `/news`**: standard list + detail, newest first, category filters.

### 4.3 Workflow
Editors publish in Studio; a webhook revalidates the matching cache tags (`event`, `promotion`, `news`, `dish`). Time-boxed promotions use Sanity scheduled publishing plus `activeFrom` / `activeTo` guards in queries, so expired offers disappear without manual cleanup. All imagery uses Sanity hotspot cropping.

---

## 5. Home page specification

### 5.1 Sections

| # | Section | Content | Motion / behavior |
|---|---|---|---|
| S0 | Intro curtain | Brand mark on noir, curtain slides up | Once per load, about 2s, skipped under reduced motion |
| S1 | Hero | Facade nightscape render full-bleed. Eyebrow "Blooming Buds · Indoor Golf Club". H1 "GreenTee" / "Richmond Center". Italic concept line + support line "An indoor golf club where the game comes into bloom after dark." CTAs: solid **Book a Bay**, light "Explore the Spaces". Scroll cue | Render bottom-anchored, scaled 1.12 with bottom transform-origin so baked deck typography crops out; top-heavy gradient hides the rest. Radial scrim behind copy; soft text shadow. Letter-stagger bloom-in per line. Calm particle field (§7.3) |
| S2 | Manifesto | Centered eyebrow "Seed to Blossom" + two serif lines ("Every visit begins as a seed." / "Under ten thousand lights, your game blooms.") + caption | Line-by-line BloomReveal |
| S2b | Panorama band | Full-bleed panoramic render: the canopy and column (VIP Corridor crop, baked text removed). Caption bottom-left: "The canopy & column · VIP Corridor, 2F" | Scroll parallax on the inner image; top and bottom fades into noir |
| S2c | Marquee | Concept names loop: Blooming Buds · Seed to Blossom · Dynamism of Nature · Sunlight through a Forest · Iconic Street · Immersive World | CSS loop, hairline top and bottom, paused under reduced motion |
| S3 | Spaces Journey | Six panels, each: meta (index · name · floor), concept title (large serif), copy, link, photo slot | Desktop: pinned horizontal scroll, scrub 1, snap per panel, progress bar + "01 / 06 · Lobby" label, background tint crossfades per panel. Mobile: vertical stack, no pin. Panel 02 (The Hall) hosts the AuroraRibbons ambient canvas, labeled "Ambient light · concept motion"; panel copy: "A ceiling of living light in perpetual bloom above the central promenade and pro shop." |
| S4 | The Game | Heading "Built for serious play." Sub: "Tour-grade simulation, honest surfaces, and coaching that shows up on your scorecard. Rain or shine, the season never ends." Four feature cards (Tour-Grade Simulation, Private Coaching, Putting & Short Game, Fitting & Pro Shop) + stat counters: 4 Simulator Bays · 8 Private VIP Rooms · 200+ Championship Courses · 365 Days of Golf a Year | Card hover photo zoom; counters ease-out on first view |
| S5 | News & Offers | CMS teaser split in two columns: left, the latest entry as a large featured preview (16:10 image, meta, serif title, one line); right, a denser index of the next five recent entries (meta + serif title rows, hairline-divided) + "All news & offers" link. Renders nothing when empty (§4.2) | Featured image zooms on hover; titles shift to champagne; rows reveal with stagger |
| S6 | Dining | Crystal Jade Palace preview (§6.2) | Jade wash on section background, standard reveals |
| S7 | Footer | Logo, mini nav, visit line, Careers, family and network links, credits. `id="contact"` | Anchor target for Book a Bay until a booking flow exists |

### 5.2 Per-space accent and tint (Journey)

| Order | Space | Concept title | Accent | Panel tint |
|---|---|---|---|---|
| 01 | Lobby · 1F | Seed to Blossom | #b98d7a | #1a1210 |
| 02 | The Hall · 1F | Dynamism of Nature | #8a6fc9 | #151021 |
| 03 | Putting Zone · 1F | Sunlight through a Forest | #9db18f | #12160f |
| 04 | Simulator Area · 1F | Vitality & Focus | #c9a66b | #1a1510 |
| 05 | VIP Corridor · 2F | Iconic Street | #4a79b8 | #0f141d |
| 06 | VIP Rooms · 2F | Immersive World | #5f9e83 | #0e1713 |

### 5.3 Mockup notes (home v9 · dining v2)
The mockups fully reflect this document: no membership, no "media art" wording, Book a Bay CTAs, the News & Offers editorial index, the mobile FullMenu, the family and network footer links, and the dining page with its left section rail. Mockup-only conveniences:
1. The News & Offers entries are sample content. In production the section is CMS-driven (§4.2) and renders nothing when empty.
2. The announcement bar (§4.2) is not in the mockups; build it from the spec.
3. The header shows the v1 menu (News & Offers · Dining); the target IA (§3.4) joins as routes ship.
4. Cross-links between the two mockup files stand in for the real `/` and `/dining` routes.

**Photo slots**: until final photography arrives, every image position uses the `PhotoFrame` placeholder (tinted gradient, film grain, crosshair, label, replacement tag). The hero facade and the panorama band already use real renders.

---

## 6. Dining · Crystal Jade Palace (tenant restaurant)

Source: the tenant's website framework proposal (soft opening Aug 15, grand opening Sep 9).

### 6.1 Brand rules (inherited, enforced in our copy)
- Understated luxury: refined, unhurried, confident
- No promotional language, no exclamation points, no discount messaging
- Colors: deep jade green + warm gold on our noir canvas (`--color-jade`, `--color-champagne`)
- Photography: professional, warm, textured; craft over portion size
- On our site jade and gold are foregrounded, not just accents: jade-washed page background and panels, gold hairline frames and rules (hero frame, section dividers), jade section labels and rail states, gold italic accents in display headings

### 6.2 Home preview section
- Two-column grid: photo slot left (jade tint, "Crystal Jade Palace · Dining Room"), content right
- Eyebrow "Dining at the Center" · H2 "Crystal Jade Palace"
- Lede: "Cantonese fine dining on the promenade. The first Crystal Jade Palace in North America, led by a Michelin-starred kitchen."
- Credential rows: Michelin (Vancouver Michelin Star, four consecutive years, 2022 to 2025) · Accolades (North America's Best Chinese Cuisine Restaurant 2025; Supreme Gold, World Championship of Chinese Cuisine 2024) · Private Dining (private rooms, bespoke banquet menus, corporate dining by arrangement)
- CTAs: solid "Discover Crystal Jade" routes to `/dining`; ghost "Book a Table" opens the reservation channel (OpenTable when live)

### 6.3 The `/dining` page
**Mockup**: `docs/mockups/dining-v2.html`.

The tenant proposal assumes a standalone site with a top horizontal menu (Brand Story · The Chef · Menu · Banquet · Gallery · Contact). Since Crystal Jade Palace lives inside this site, that menu is absorbed into a **left vertical section rail**; the global GreenTee header remains the only top navigation. v1 renders the framework as one long page with anchored sections.

**Section rail · `<DiningSideNav>`**
- Desktop (1024px and up): sticky left column, about 220px. Restaurant wordmark at the top, anchor items **Story · The Chef · Menu · Banquet · Reserve**, and a small "Book a Table" CTA at the foot
- Scroll spy: active section marked in jade with a short gold hairline indicator; smooth anchor scrolling
- Tone: small tracked caps, generous vertical spacing, no hover gimmicks
- Below 1024px: the rail collapses into a sticky, horizontally scrollable chip bar beneath the global header; the wordmark moves into the page hero
- Scope: the rail exists only on `/dining` and carries only restaurant items, preserving the dual-brand hierarchy (center first, tenant second)
- The tenant menu's Gallery and Contact fold into Menu photography and the Reserve block

**Page blocks**
1. **Hero**: dining room photography, name overlay, credential line ("Michelin dining experience · First in North America"), Book a Table
2. **Story**: Crystal Jade heritage and global footprint · the Richmond chapter, narrative tone
3. **The Chef**: portrait in the kitchen, award rail (three credentials of §6.2), story (23 years across five-star hotel groups: Banyan Tree, Marriott, InterContinental, Pan Pacific), "in his own words" quote block
4. **Menu**: 8 to 12 signature dishes from `dish` documents (§4.1), large photography, name + one line, category chips, inline display (no PDF), seasonal note: "Our menu evolves with the seasons and the chef's current inspiration."
5. **Banquet**: private rooms and corporate dining, capacity and service outline, pricing on enquiry, Enquire CTA
6. **Reserve**: OpenTable embed or link + phone and WeChat alternatives

**Content dependencies** (tenant checklist): chef portrait in kitchen setting, 8 to 10 editorial dish photos, interior and private room photography, chef biography in narrative form, award visual assets.

### 6.4 Sanity: `restaurant` singleton
name, tagline, lede, heroImage, credentials[] {label, value, detail}, story (portable text + images), chef {portrait, bio, quote, awards[]}, banquet {copy, facts[], enquiryTarget}, reserve {openTableUrl, phone, wechat}, seo. Dishes live as separate `dish` documents for frequent updates.

---

## 7. Motion system

### 7.1 Library roles
| Library | Owns |
|---|---|
| `lenis` | inertial smooth scroll, site-wide |
| `motion` (Framer Motion) | component enter/exit, FullMenu, micro-interactions |
| `gsap` + ScrollTrigger | pinned sections, horizontal scrub, snap, split-text staggers |
| plain Canvas 2D | generative modules below; no WebGL needed |

### 7.2 Motion presets (`src/components/motion`, the only allowed entry points)
`<BloomReveal>` (opacity, scale .97 to 1, blur 6px to 0) · `<MaskImage>` (clip-path reveal) · `<SplitHeading>` (per-line, per-letter stagger) · `<ParallaxImage>` (inner y-parallax) · `<MagneticCTA>` (fine pointers only).

### 7.3 Canvas modules (parameters are the contract; match the mockup)
**HeroParticles** · calm rising seeds of light
- about 56 particles desktop, about 40 below 768px; radius .6 to 2.2; rise speed .00016 to .00054 of height per frame
- gentle sine sway (8 to 28px), slow twinkle, roughly one third champagne-gold, rest ivory, soft glow
- respawn below the fold; pause when offscreen and on hidden tab; hidden under reduced motion; devicePixelRatio capped at 2

**AuroraRibbons** · ambient light canvas (Journey panel 02, The Hall)
- 5 ribbons; each path sums three sine layers with incommensurate frequencies (4.1u, 9.7u, 17.3u) at different time speeds, so the curve never visibly repeats
- hues 262 / 206 / 318 / 184 / 288, horizontal alpha gradient fading at both ends
- stroke width 10 to 19 percent of canvas height, canvas blur about 5.5 percent of height, composite `lighter`, slow clock (t += .0042)
- same pause rules; devicePixelRatio capped at 1.5

### 7.4 Global guards
- `prefers-reduced-motion`: every preset degrades to a fade or static frame at the preset level; canvases render nothing or one static frame
- GSAP-driven and canvas components are client leaves, dynamically imported, initialized near viewport
- Mobile: no pinning; the Journey stacks vertically

---

## 8. Responsive and device requirements

**Reference widths**: 390 (mobile baseline) · 768 · 1024 · 1440. Layouts are fluid between them; type uses clamp throughout. Every UI task is verified at 1440 and 390 minimum (see CLAUDE.md definition of done).

**Viewport and layout**
- Hero and full-height sections use `100svh` (not `100vh`) with a sensible min-height, so mobile URL bars never clip content
- Sticky elements (header, dining chip bar, announcement bar) respect `env(safe-area-inset-*)`
- No horizontal overflow at any width; pinned sections release cleanly on resize (`invalidateOnRefresh`)

**Touch and input**
- Touch targets at least 44x44px
- Hover-dependent effects (magnetic CTA, card zoom, menu image preview) are gated behind `(hover: hover) and (pointer: fine)` and simply do nothing on touch
- The Journey never hijacks vertical touch scrolling; on mobile it is a plain vertical stack

**Per-section mobile behavior**
| Section | Below 900px (unless noted) |
|---|---|
| Header | nav collapses to hamburger; FullMenu overlay with focus trap |
| Hero | type scales via clamp; buttons wrap; particles reduced (§7.3) |
| Panorama band | height 320px, tighter art-directed crop via Sanity hotspot |
| Journey | vertical stack, per-panel hairline, no pin, no progress UI |
| The Game | cards 4 to 2 columns (560px: 1); stats 4 to 2 (560px: 1) |
| News & Offers | cards stack; horizontal swipe list acceptable |
| Dining preview | grid stacks, image first |
| `/dining` rail | chip bar beneath header, below 1024px (§6.3) |
| Footer | columns stack; visit line wraps |

**Media**
- Every image declares `sizes`; art direction through Sanity hotspot rather than separate assets where possible
- Hero render keeps the entrance portal in frame at portrait crops

**Mobile performance**
- LCP under 2.5s on a mid-tier device over 4G; canvases never block first paint
- Canvas DPR caps and particle reductions per §7.3; all loops pause offscreen and on hidden tabs
- Reserve explicit heights for bands and canvases to keep CLS under 0.1

**QA matrix**: iOS Safari and Android Chrome at 390 and 768; desktop Chrome, Safari, Firefox at 1024 and 1440; one landscape-phone sanity pass.

---

## 9. Technical architecture

### 9.1 Stack
| Area | Choice |
|---|---|
| Framework | Next.js latest stable, App Router, RSC by default |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens) + minimal plain CSS |
| CMS | Sanity, embedded Studio, `next-sanity` |
| Images | `next/image` + Sanity Image CDN (lqip placeholders, hotspot) |
| Motion | lenis, motion, gsap |
| Fonts | `next/font`: Cormorant Garamond, Inter |
| Forms | Resend (contact and enquiry, when those pages ship) |
| Analytics | Vercel Analytics (+ GA4 if required) |
| Hosting | Vercel · SSG + ISR + on-demand revalidation |

### 9.2 Repository layout
```
docs/
├─ design.md                     # this document
├─ mockups/home-v9.html          # homepage mockup (read-only reference)
└─ mockups/dining-v2.html        # Crystal Jade Palace mockup (read-only reference)
src/
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx              # Header/Footer + Lenis provider + announcement bar
│  │  ├─ page.tsx                # Home                        v1
│  │  ├─ dining/page.tsx         # Crystal Jade Palace         v1
│  │  ├─ spaces/…                # planned
│  │  ├─ golf/rates · golf/lessons · events · news · shop · contact   # planned
│  ├─ studio/[[...tool]]/page.tsx
│  ├─ api/revalidate/route.ts
│  └─ layout.tsx · globals.css · sitemap.ts · robots.ts
├─ components/
│  ├─ layout/    SiteHeader, SiteFooter, FullMenu, AnnouncementBar
│  ├─ motion/    BloomReveal, MaskImage, SplitHeading, ParallaxImage, MagneticCTA
│  ├─ canvas/    HeroParticles, AuroraRibbons
│  ├─ sections/  home/, dining/, spaces/
│  └─ ui/        Button, Eyebrow, SectionHeading, PhotoFrame, SanityImage, StatCounter, ContentCard
├─ sanity/       schemaTypes/, lib/ (client, image, queries, fetch), structure.ts
├─ lib/          fonts.ts, utils.ts, seo.ts, mock/
└─ types/        domain types consumed by sections
```

### 9.3 Component map (mockup to implementation)
| Mockup selector | Component | Kind |
|---|---|---|
| `.intro` | `<IntroCurtain>` | client |
| `header` + `.fullmenu` | `<SiteHeader>` + `<FullMenu>` | client |
| announcement bar (not in mockup) | `<AnnouncementBar>` | server + client dismiss |
| `.hero` | `<HomeHero>` with `<SplitHeading>`, `<HeroParticles>`, `<Button>` | server shell + client leaves |
| `.manifesto` | `<Manifesto>` | server + `<BloomReveal>` |
| `.mani-media` | `<PanoramaBand>` (image, caption, parallax, blend fades) | client parallax leaf |
| `.marquee` | `<ConceptMarquee items>` | CSS only |
| `#journey` | `<SpacesJourney spaces>` + `<JourneyPanel>` | client (GSAP) |
| `.ph` | `<PhotoFrame tint label tag>`, later `<SanityImage>` | server |
| `#aurora` | `<AuroraRibbons>` | client canvas |
| `.cards` / `.stats` | `<FeatureGrid>` + `<FeatureCard>` / `<StatCounters>` | server / client counter |
| `#news` | `<NewsOffersTeaser>` + `<NewsFeature>` / `<NewsListRow>` | server |
| `#dining` | `<DiningPreview>` | server |
| `/dining` section rail (no mockup) | `<DiningSideNav>` within `<DiningLayout>` | client (scroll spy) |
| `footer` | `<SiteFooter>` (`id="contact"`, visit line, family and network links) | server |

### 9.4 Sanity schemas
| Type | Purpose | Key fields |
|---|---|---|
| `siteSettings` (singleton) | globals | logo, phone, address, hours, email, socials, bookingUrl, careersUrl, familyLinks[], networkLinks[], default SEO |
| `homePage` (singleton) | home content | hero {eyebrow, titleLines[2], italicLine, supportLine, media}, manifesto {lines[2], caption}, panoramaBand {image, caption}, marqueeItems[] |
| `space` x6 | journey + facility pages | title, slug, conceptTitle, copy, floor, order, accent, tint, heroImage, gallery[], facts[], keymap, seo |
| `restaurant` (singleton) | Crystal Jade Palace | §6.4 |
| `dish` | dining menu items | §4.1 |
| `event` / `promotion` / `newsPost` | content operations | §4.1 |

### 9.5 Data and rendering
- SSG + ISR everywhere; `sanityFetch` with cache tags (`home`, `space`, `restaurant`, `dish`, `event`, `promotion`, `news`, `settings`)
- Sanity webhook to `/api/revalidate` calling `revalidateTag()`
- Draft Mode + Presentation tool for editor preview
- Env: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`

### 9.6 Asset pipeline
- Current renders carry baked-in presentation typography (JKVG lockups, slide titles). Production should request clean exports from JKWG.
- Interim technique (as used in the mockup, keep documented): bottom-anchored zoom + top gradient occlusion for the hero; precise crop for the panorama band (VIP Corridor render cropped to the canopy and column, 1204x386).
- Base64 embeds exist only in the mockup. Production images are Sanity assets served through the CDN.

---

## 10. Performance · SEO · Accessibility

**Budgets**: LCP under 2.5s (desktop and mid-tier mobile), CLS under 0.1, initial JS under 200KB gzip (motion and canvas lazy).
- Hero: `next/image` with `priority` + lqip; if a walkthrough video is sourced later, poster first then deferred `muted loop playsinline`
- All imagery through `<SanityImage>`; fonts via `next/font` subsets with `display: swap`

**SEO**
- `generateMetadata` per page, per-space and dining OG images, sitemap and robots
- JSON-LD: `SportsActivityLocation` (the center, with `openingHours` year-round), `Restaurant` on `/dining` (`servesCuisine: Cantonese`, awards), `Event` on event detail pages
- Keywords lead with indoor golf: "indoor golf Richmond", "golf simulator Richmond", "private golf simulator rooms Vancouver"
- `/studio` noindex

**Accessibility**
- Body text is ivory on noir; mist for captions only; champagne text at display sizes only
- Focus-visible champagne outline; FullMenu and dialog focus traps; decorative canvases `aria-hidden`
- Reduced-motion handling built into presets and canvas modules, not per page

---

## 11. Roadmap

| Phase | Scope | Output |
|---|---|---|
| 0 | Bootstrap | Next + TS + Tailwind, Sanity embed, fonts, tokens, Vercel, `docs/` populated (this doc, mockup, CLAUDE.md) |
| 1 | Design system | tokens, type scale, `Button` (solid/ghost/light), `Eyebrow`, `SectionHeading`, `PhotoFrame`, `NewsFeature`, `NewsListRow`, motion presets, canvas modules, `SiteHeader` + `FullMenu` + `SiteFooter`, `/styleguide` demo route |
| 2 | Port Home | sections from the mockup with static data: Hero, Manifesto + PanoramaBand, Marquee, Journey, The Game, NewsOffersTeaser (with empty state), DiningPreview, Footer |
| 3 | Sanity wiring | all schemas (§9.4), GROQ, home bound, content types + announcement bar, webhook, seed content |
| 4 | Dining | `/dining` per §6.3: DiningLayout + side rail + six blocks, dish-driven menu (content-gated by tenant assets) |
| | **v1 launch** | Home + Dining live |
| 5 | Spaces | index + detail template x6, doubling as facility pages |
| 6 | Content surfaces | `/events`, `/news`, `/golf/rates`, `/golf/lessons`, `/shop`, `/contact` |
| 7 | Polish | journey snap tuning, a11y pass, perf audit, cross-browser |

---

## 12. Working with Claude Code

`CLAUDE.md` at the repo root is the operating contract: the mockup-porting rules (including §5.3 deviations), hard design rules, SOLID and reuse conventions, definition of done, and prompt templates. Keep task requests scoped to one section or component, reference this document's section plus the mockup selector, and state done-criteria explicitly.

---

## 13. Open issues
1. **Bay booking**: siblings run tee-time booking (Chronogolf app at Westwood). Decide the indoor equivalent: third-party bay booking, owned form, or phone-first. Until then, Book a Bay lands on `#contact`
2. **Rates definition**: hourly bay and VIP room pricing, lesson pricing, peak and off-peak; needed before `/golf/rates`
3. **Restaurant reservation**: OpenTable account and link timing; interim phone and WeChat
4. **Bilingual dining**: tenant brief requires EN / 中文. Options: link out to the tenant's own bilingual site, `next-intl` scoped to `/dining` later, or full-site i18n in v2
5. **Clean renders**: typography-free exports from JKWG; final photography schedule
6. **Hero video**: a facade walkthrough loop remains the highest-impact upgrade if it exists
7. **Timeline alignment**: tenant site targets Aug 10, grand opening Sep 9; decide when `/dining` goes live relative to ours
8. **Brand assets**: logo SVG, final address, domain; GreenTee Golf Shop and Academy link handoffs
