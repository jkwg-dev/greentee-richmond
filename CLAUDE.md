# CLAUDE.md · GreenTee Richmond Center Web

Next.js (App Router) + TypeScript + Tailwind v4 + Sanity + Vercel. Premium **indoor golf club** site in the GreenTee Country Club family. English only (the Crystal Jade 中文 toggle is inert until translation lands). v1 ships `/`, `/spaces`, `/news`, and `/dining` with its five sub-pages (`story`, `chef`, `menu`, `banquet`, `reserve`).

## Sources of truth, in order
1. `docs/design.md` (architecture and page specs)
2. `docs/booking.md` (the booking track: `/book`, phases B1 to B4)
3. `docs/mockups/*.html` (nine page mockups, table below)
4. This file (working rules)

If code and docs disagree, docs win. If the two docs disagree, ask before proceeding.

## The mockup contract
The nine files in `docs/mockups/` define the look, motion, and copy tone of their routes. Treat them as the spec, not as source code. `/book` has no mockup; `docs/booking.md` §5 plays the mockup's role for that route.

| Mockup | Route | Version |
|---|---|---|
| `greentee-home.html` | `/` | Homepage v22 |
| `greentee-spaces.html` | `/spaces` | The Spaces v3 |
| `greentee-news.html` | `/news` | News & Offers v1 |
| `greentee-dining.html` | `/dining` | Crystal Jade Palace v6 |
| `greentee-dining-story.html` | `/dining/story` | v6 |
| `greentee-dining-chef.html` | `/dining/chef` | v6 |
| `greentee-dining-menu.html` | `/dining/menu` | v6 |
| `greentee-dining-banquet.html` | `/dining/banquet` | v6 |
| `greentee-dining-reserve.html` | `/dining/reserve` | v6 |

Cross-links between mockup files stand in for real routes; anchors carry over (`greentee-spaces.html#sauna` means `/spaces#sauna`).

- **Port, never paste.** Rebuild as typed React components following the component map in `docs/design.md` §11.3. Never import, iframe, or copy a mockup wholesale.
- **Match exactly**: design tokens, spacing rhythm, easing curves and durations, gradient recipes, the journey contract in §9.3, and the canvas parameters in §9.4.
- **Improve freely**: accessibility, performance, semantics, decomposition. No approval needed.
- **Ask first** before any other visible visual or copy change.
- Mockup copy is production copy unless it is an obvious placeholder (pricing, address, phone, WeChat handle, hours, "Replace with final photography" tags, "confirm count" notes).
- Base64 images inside the mockups are mockup-only. Production images go through Sanity CDN via `<SanityImage>`.
- Never edit any file under `docs/mockups/` as a form of implementation. They are read-only reference.

### Mockup notes (home v22 · spaces v3 · news v1 · dining v6)
- **Footer**: only home v22 shows the canonical footer (mirrors the header: The Spaces · News & Offers · Dining, per docs §3.4). The spaces, news, and dining mockup footers are an older layout (Golf · Events · Careers · Contact); build the canonical footer everywhere and ignore the stale ones.
- The home outro "Book a Table" href (`greentee-dining.html#reserve`) predates the dining sub-pages; the production target is `/dining/reserve`. All Book a Table CTAs route there.
- News & Offers entries (home teaser and `/news` grid) are sample content. Production is CMS-driven; the home teaser renders nothing when empty (docs §4.2). `/news` card links are stubs until detail routes ship.
- The announcement bar is not in the mockups; build it from docs §4.2.
- All pricing in Rates & Hours, the address, phone, reservation windows, Crystal Jade hours, WeChat handle, and the "eight private rooms" count are placeholders.
- VIP Rooms 14 and 15, the four VVIP suites, the chef portrait, dish and interior photography, and award emblems are placeholder slots by design. Ship the styled pending states; never fill them with stock imagery.
- The EN / 中文 toggle on `/dining` is a static indicator (Chinese pending human translation), not a working control.
- On `/dining` pages the FullMenu appends the Crystal Jade entries (Crystal Jade Palace · Menu & Reserve).

## Hard design rules
- **Indoor golf leads.** Page copy and structure surface bays, rates, putting, and year-round play before decor storytelling.
- Background `--color-noir`, primary text `--color-ivory`. Champagne is the only global accent.
- Jade + jade-text belongs to Crystal Jade Palace content only: the `/dining` pages, the Dining zone on `/spaces`, the Dining journey panel, and the home dining preview. Journey panel accents are inline `--acc` values scoped to the journey (docs §5.2), never global tokens.
- Type: Cormorant Garamond for display, Inter for body and UI. Chinese strings on `/dining` use the system `--zh` stack. No other fonts.
- Buttons only via `<Button variant="solid" | "ghost" | "light">` plus the `sm` size. No new button styles.
- All entrance motion via `src/components/motion` presets; the journey only via `<SpacesJourney>` per docs §9.3; generative visuals only via `src/components/canvas` (`HeroParticles` is the only canvas module). No ad-hoc keyframes or inline GSAP timelines in sections.
- No scroll-jacking outside `<SpacesJourney>`, and no Lenis or smooth-scroll library anywhere (docs §9.1). Native scroll + `scroll-behavior: smooth`; GSAP window tweens suspend it for the ride.
- No literal flower, petal, or leaf illustrations. No regular repeating decorative patterns; grain comes from the irregular fractal-noise overlay recipe (spaces zone heroes).
- English only. Never use an em dash or an en dash in copy; write ranges as "2022 to 2025". No exclamation points anywhere in Crystal Jade Palace copy.
- Every image renders through `<SanityImage>` (production) or `<PhotoFrame>` (placeholder). Never a bare `<img>`.

## Booking track rules (B phases)

- `docs/booking.md` is authoritative for `/book` and the booking data layer; its §5 is the page
  spec. The vendor's API spec (Korean) is read-only reference at
  `docs/vendor/customer-site-screen-golf-api-spec-ko.md`: wire shapes come from the vendor spec,
  conventions and behavior from booking.md.
- Vendor DTO shapes and their mapping live only inside `src/lib/booking/`. Components import
  domain types from `src/types/booking.ts` (plus the format and config helpers) and nothing else.
  This mirrors the Sanity rule: sections never see raw wire shapes.
- The browser talks only to our `/api/booking/*` Route Handlers. The provider module is
  server-only. The vendor middleware and Supabase are never called from a client component, at
  any phase.
- `BookingProvider` (booking.md §5.7) is the swap seam: the fixture provider in B1, the
  middleware provider in B3. Nothing above the provider changes when the binding swaps.
- Availability responses are never cached (`no-store`). Rooms may revalidate for about 300
  seconds.
- Money is integer cents end to end; formatting to dollars happens only at render through
  `src/lib/booking/format.ts`. No float arithmetic on prices, ever.
- Slot `startsAt` and `endsAt` strings render and echo verbatim. Display formatting is Intl with
  `timeZone: "America/Vancouver"`; never the browser timezone, never manual time arithmetic.
  Time ranges read "6:00 to 6:30 PM"; the dash rule applies to times too.
- Booking fixtures are deterministic. The scripted demo states in booking.md §5.7 are part of
  the contract; the same query always returns the same slots.
- Booking copy never uses member language. It is "sign in" and "your reservations". Jade never
  appears on `/book` (it is not Crystal Jade content).
- `bookingCreateEnabled` in `src/lib/booking/config.ts` gates the reserve flow. B1 ships it
  `false` with the call-to-hold CTA (booking.md §5.5).
- B1 adds no booking environment variables and no secrets. The B2 and B3 variables are listed in
  booking.md §8 and are not added early.
- Auth: Supabase code lives in `src/lib/supabase/` only. Every auth operation is a Server
  Action; no browser Supabase client is instantiated. In the session refresh helper, nothing
  runs between `createServerClient` and the user fetch.
- The only Supabase env vars are `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never a secret or service key, in env or code.
- Account routes are noindex, out of the sitemap, and out of the header and nav until a docs
  ruling adds entry points.
- `Field` (booking.md §9.6) is the only text input primitive; form errors render champagne.
- Live mode is the presence of `BOOKING_API_BASE_URL`; it arms the middleware provider, the
  route handler auth requirement, and the /book gate together. The stub in `scripts/` is dev
  only: never deployed, never imported by app code.

## Responsive rules (summary of docs §10)
- Verify every UI task at 1440 and 390. Reference widths: 390 / 768 / 1024 / 1440. Working breakpoints: 1024 (rails to chip bars), 900 (hamburger, stacks, journey fallback), 760 (dining internals), 560 (fine grids).
- Full-height sections use `100svh`; sticky elements respect safe-area insets; no horizontal overflow at any width.
- Touch targets at least 44px. Hover effects gated behind `(hover: hover) and (pointer: fine)`.
- The journey is gesture-gated on desktop and a native horizontal `scroll-snap` strip below 901px, under reduced motion, or without GSAP; it must always release at both ends and never trap vertical scrolling.
- `/spaces` and `/dining` rails collapse into sticky chip bars below 1024px; the header collapses to hamburger + FullMenu below 900px.
- HeroParticles caps devicePixelRatio at 2 and reduces particle count on small screens per docs §9.4.

## Clean code principles

### SOLID, as it applies here
- **Single responsibility**: one component, one job. Pages compose sections, sections compose primitives. Presentational components never fetch data.
- **Open/closed**: extend through props and variants (discriminated unions, or cva for class variants). Never duplicate a component to tweak it.
- **Liskov substitution**: every variant is a drop-in substitute; a variant may not add required props or change the semantics of the base contract.
- **Interface segregation**: small, purpose-built prop interfaces. No god config objects, no boolean-flag explosions; split the component instead.
- **Dependency inversion**: sections depend on domain types in `src/types`, never on raw GROQ shapes. Query-to-domain mapping lives in `src/sanity/lib/queries.ts` only.

### Reuse rules
- Search `src/components` before creating anything. Extend what exists.
- The same JSX pattern appearing twice gets extracted. The rails (`SpacesRail`, `DiningRail`), chip bars, fact rows, and news cards are shared-primitive territory; distinct layouts are still built from `PhotoFrame`, `Eyebrow`, `Chip`, `FactRows`, and hairline rules.
- A component past roughly 150 lines, or holding three or more responsibilities, gets split.
- Shared behavior becomes a hook: `usePrefersReducedMotion`, `useCanvasLoop` (IntersectionObserver + visibilitychange pause), `useScrollSpy` (spaces rail + chips).
- No repeated hand-written class strings for the same pattern; tokens only, no magic hex in components (journey `--acc` values come from data, not hardcoded classes).

## Conventions
- Server Components by default. `'use client'` only at leaves that need interaction, motion, or canvas.
- TypeScript strict, no `any`. Named exports. One component per file.
- Data flows through `src/sanity/lib/fetch.ts` with cache tags (`home`, `zone`, `restaurant`, `dish`, `event`, `promotion`, `news`, `settings`). Never call Sanity from a client component. No secrets in client bundles.
- Time-boxed content (`promotion`) is filtered by `activeFrom` / `activeTo` in the query, never in the component.
- Tailwind class order via prettier-plugin-tailwindcss.
- Commit gate: `pnpm lint && pnpm typecheck` must pass.

## Definition of done, for every UI task
- Matches the mockup at 1440 and 390.
- Reduced-motion path verified; the canvas hidden; the journey on its snap fallback; counters printing final values.
- Journey tasks additionally verify: keyboard stepping, release at both ends, wheel and touch parity, flush panel landings after resize.
- Rail and chip tasks verify: correct active state (scroll spy on `/spaces`, route-driven on `/dining`), sticky behavior, 44px targets.
- Keyboard focus visible; FullMenu focus trap works; decorative canvas and numerals `aria-hidden`.
- No console errors or warnings; no layout shift on load; Home hero LCP unaffected.
- Empty states handled (News & Offers teaser renders nothing when there is no content; VIP/VVIP pending cards render as designed).
- Copy passes the dash check (no em or en dashes) and, on dining pages, the no-exclamation check.
- Lint and typecheck pass.

## Prompting playbook
Scope every request to one section or component. Reference the spec (doc section + mockup file and selector). State done-criteria.

Template:
```
Implement <ComponentName> per docs/design.md §<n> and mockup <file> <selector>.
- <key behaviors, desktop and mobile>
- Data: <static mock path | Sanity query + tag>
Done: matches spec, 1440 + 390 verified, reduced-motion fallback, lint/typecheck pass.
```

Examples:
```
Implement <SpacesJourney> per docs/design.md §9.3 and mockup greentee-home.html #spacesScroll.
- Desktop: gesture-gated page turns (TURN 1.05s, DWELL .5s), per-panel rises, directional kick,
  progress bar + zero-padded counter, engage/release per the contract
- Below 901px / reduced motion: native horizontal scroll-snap strip driving the same progress UI
- Data: static from src/lib/mock/zones.ts for now
Done: matches §9.3, 1440 + 390 verified, keyboard + release paths verified, lint/typecheck pass.
```
```
Implement <ZoneSection> per docs/design.md §6.2 and mockup greentee-spaces.html #putting-zone.
- Zone hero (min(58vh,560px), grain overlay, eyebrow + concept H1 + subline), body grid with
  FactRows and CTA; reveals at .12 threshold
- Mobile: grid stacks below 900px, fact rows stack below 560px
- Data: static from src/lib/mock/zones.ts
Done: matches spec, 1440 + 390 verified, reduced-motion fallback, lint/typecheck pass.
```
```
Implement <DiningLayout> with <DiningRail> and <DiningChips> per docs/design.md §8.2,
mockups greentee-dining*.html .dine-shell.
- Desktop: 220px sticky rail, jade hairline, route-driven active state with gold dash,
  Book a Table CTA, static EN/中文 indicator
- Below 1024px: sticky chip bar beneath the header
Done: matches spec on all six routes, 1440 + 390 verified, lint/typecheck pass.
```

## Never
- Membership sections, tiers, or membership language
- The term "media art" in UI copy
- Em dashes or en dashes in any copy; exclamation points in Crystal Jade Palace copy
- White background sections, card shadows, gradient buttons, emojis in UI
- New colors, fonts, easing curves, or button styles outside the tokens and presets
- Regular repeating decorative patterns or literal florals
- Lenis or any smooth-scroll library; scroll-jacking outside `<SpacesJourney>`
- Editing anything under `docs/mockups/`
- Filling designed pending states (VIP 14 and 15, VVIP suites) with stock imagery
- Client-side Sanity calls; fetching inside presentational components
- Shipping a section without its reduced-motion, mobile, and empty-state paths
- Vendor DTO types, or any booking fetch, outside `src/lib/booking/`
- Calling the booking middleware or Supabase from the browser or a client component
- Recomputing, constructing, or doing arithmetic on slot time strings
- `Math.random` or time-seeded randomness in booking fixtures
- A browser-side Supabase client, or any Supabase secret or service key
- Code between `createServerClient` and the user fetch in the session refresh helper
- Auth copy with member language, or account entry points in the header without a docs ruling
- Serving middleware-backed data from an unauthenticated route in live mode, or caching a
  user's access token across requests
- A session-aware header
- Creating any account in the shared Supabase pool other than the two approved QA accounts.
  Their identities and credentials live only in .env.local (SUPABASE_QA_EMAIL,
  SUPABASE_QA_PASSWORD), never in this file, a commit, or a report, and the password value
  is never printed, logged, or echoed. Signing in with those env values, or a manual
  sign-in by us, verifies authenticated flows; Claude Code never handles any credential
  other than these two env values. The Create Account entry point is verified by link
  destination only; a live sign-up is permitted solely against a development Supabase
  project, never the shared pool.