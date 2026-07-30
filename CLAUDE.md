# CLAUDE.md · GreenTee Richmond Center Web

Next.js (App Router) + TypeScript + Tailwind v4 + Sanity + Vercel. Premium **indoor golf club** site in the GreenTee Country Club family. English only. v1 ships `/`, `/spaces`, and `/news`. Crystal Jade dining is a standalone external site; `/dining` 307-redirects to it (design.md §3.3, §15.11).

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

The six `greentee-dining*.html` mockups moved to the standalone Crystal Jade repo; the copies in `docs/mockups/` are read-only history.

Cross-links between mockup files stand in for real routes; anchors carry over (`greentee-spaces.html#sauna` means `/spaces#sauna`).

- **Port, never paste.** Rebuild as typed React components following the component map in `docs/design.md` §11.3. Never import, iframe, or copy a mockup wholesale.
- **Match exactly**: design tokens, spacing rhythm, easing curves and durations, gradient recipes, the journey contract in §9.3, and the canvas parameters in §9.4.
- **Improve freely**: accessibility, performance, semantics, decomposition. No approval needed.
- **Ask first** before any other visible visual or copy change.
- Mockup copy is production copy unless it is an obvious placeholder (pricing, address, phone, WeChat handle, hours, "Replace with final photography" tags, "confirm count" notes).
- Base64 images inside the mockups are mockup-only. Production images go through Sanity CDN via `<SanityImage>`.
- Never edit any file under `docs/mockups/` as a form of implementation. They are read-only reference.

### Mockup notes (home v22 · spaces v3 · news v1)
- **Footer**: only home v22 shows the canonical footer (mirrors the header: The Spaces · News & Offers · Dining, per docs §3.4). The spaces and news mockup footers are an older layout (Golf · Events · Careers · Contact); build the canonical footer everywhere and ignore the stale ones.
- All Book a Table CTAs link out to the standalone site's `/reserve` in a new tab (`BOOK_A_TABLE_HREF`).
- News & Offers entries (home teaser and `/news` grid) are sample content. Production is CMS-driven; the home teaser renders nothing when empty (docs §4.2). `/news` card links are stubs until detail routes ship.
- The announcement bar is not in the mockups; build it from docs §4.2.
- All pricing in Rates & Hours, the address, phone, and reservation windows are placeholders.
- VIP Rooms 14 and 15 and the four VVIP suites are placeholder slots by design. Their Sanity image fields may be wired and editable; while a field is empty the slot renders the styled pending state, never a stand-in image. Stock imagery stays banned regardless of who uploads it.

## Hard design rules
- **Indoor golf leads.** Page copy and structure surface bays, rates, putting, and year-round play before decor storytelling.
- Background `--color-noir`, primary text `--color-ivory`. Champagne is the only global accent.
- Jade + jade-text belongs to Crystal Jade Palace content only: the Dining zone on `/spaces`, the Dining journey panel, and the home dining preview. Journey panel accents are inline `--acc` values scoped to the journey (docs §5.2), never global tokens.
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
- Writing the Supabase top-level phone field, or any auth identity field, from sign-up or
profile forms (user metadata only)
- Storing a name any way other than the app's own shape: first_name and last_name as entered,
plus a derived display_name of first + a single space + last. Forms read the parts and write
all three keys; display_name is never an independent input and is never the prefill source
- Two vendor documents are normative for wire shapes: the v0.1 spec and the 2026-07-17
  middleware update, both under `docs/vendor/`. Where they conflict, the middleware update
  wins; booking.md §4 records the deltas.
- Every booking mutation (create, checkout session, checkout complete, cancel) carries a
  distinct client `Idempotency-Key`, 8 to 255 chars, generated server side, one per operation.
  A timed-out mutation retries only with the identical key and body, and only after reading
  status first. Keys are never logged.
- Payment is the only path to `confirmed`; the browser callback is never proof of payment.
  Success renders only after server-verified `succeeded`. While `processing` or
  `review_required`, never open a second checkout session or purchase.
- A cancel never claims a refund until `refundStatus` is `succeeded`; `review_required` and
  `processing` are shown as in-progress, not done. The refund adapter is fail-closed until
  Moneris QA, so `review_required` is the expected pre-QA outcome.
- Moneris Checkout renders through the Moneris JavaScript SDK inside our own payment page
  at /book/checkout. There is no vendor-supplied checkoutUrl and no redirect to a Moneris
  origin. The SDK script is the only third-party script a booking route may load. The SDK
  host and setMode value derive only from the session's environment field as mapped server
  side; a Moneris host or mode is never hardcoded in a component and never guessed for an
  unrecognized environment value. An unrecognized environment fails loudly. A single documented
  interim exception exists: the env-gated BOOKING_ASSUME_QA_IS_MOCK override defined in
  booking.md sections 4 and 8, which is staging-only and scheduled for removal.
- The Moneris browser callbacks (page_loaded, cancel_transaction, error_event,
  payment_receipt, payment_complete) are navigation signals only. The payment_complete
  payload and its response_code are never treated as payment proof and never branched on
  for outcome. The only path to a confirmed state remains the server-verified checkout
  complete call.
- Cap and window numbers in booking copy are never hardcoded; they render from the policy
  endpoint. Exceeding a cap rejects the new request; it never replaces an existing
  reservation, and copy never says it does. Until the vendor confirms consistent server
  side enforcement, policy caps are client side UX guidance only. Vendor error message
  strings are never parsed to classify a violation.
- No site origin is ever registered on the vendor CORS allowlist, for any environment.
  All vendor traffic is server to server through our route handlers.

## Responsive rules (summary of docs §10)
- Verify every UI task at 1440 and 390. Reference widths: 390 / 768 / 1024 / 1440. Working breakpoints: 1024 (rails to chip bars), 900 (hamburger, stacks, journey fallback), 760 (dining internals), 560 (fine grids).
- Full-height sections use `100svh`; sticky elements respect safe-area insets; no horizontal overflow at any width.
- Touch targets at least 44px. Hover effects gated behind `(hover: hover) and (pointer: fine)`.
- The journey is gesture-gated on desktop and a native horizontal `scroll-snap` strip below 901px, under reduced motion, or without GSAP; it must always release at both ends and never trap vertical scrolling.
- `/spaces` rails collapse into sticky chip bars below 1024px; the header collapses to hamburger + FullMenu below 900px.
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
- The same JSX pattern appearing twice gets extracted. The rails (`SpacesRail`), chip bars, fact rows, and news cards are shared-primitive territory; distinct layouts are still built from `PhotoFrame`, `Eyebrow`, `Chip`, `FactRows`, and hairline rules.
- A component past roughly 150 lines, or holding three or more responsibilities, gets split.
- Shared behavior becomes a hook: `usePrefersReducedMotion`, `useCanvasLoop` (IntersectionObserver + visibilitychange pause), `useScrollSpy` (spaces rail + chips).
- No repeated hand-written class strings for the same pattern; tokens only, no magic hex in components (journey `--acc` values come from data, not hardcoded classes).

## Conventions
- Server Components by default. `'use client'` only at leaves that need interaction, motion, or canvas.
- TypeScript strict, no `any`. Named exports. One component per file.
- Data flows through `src/sanity/lib/fetch.ts` with cache tags (`home`, `zone`, `event`, `promotion`, `news`, `settings`). Never call Sanity from a client component. No secrets in client bundles.
- Time-boxed content (`promotion`) is filtered by `activeFrom` / `activeTo` in the query, never in the component.
- Tailwind class order via prettier-plugin-tailwindcss.
- Commit gate: `pnpm lint && pnpm typecheck` must pass.

## Definition of done, for every UI task
- Matches the mockup at 1440 and 390.
- Reduced-motion path verified; the canvas hidden; the journey on its snap fallback; counters printing final values.
- Journey tasks additionally verify: keyboard stepping, release at both ends, wheel and touch parity, flush panel landings after resize.
- Rail and chip tasks verify: correct active state (scroll spy on `/spaces`), sticky behavior, 44px targets.
- Keyboard focus visible; FullMenu focus trap works; decorative canvas and numerals `aria-hidden`.
- No console errors or warnings; no layout shift on load; Home hero LCP unaffected.
- Empty states handled (News & Offers teaser renders nothing when there is no content; VIP/VVIP pending cards render as designed).
- Copy passes the dash check (no em or en dashes), and Crystal Jade copy (the home dining preview) the no-exclamation check.
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
- Logging or echoing an access token, checkout ticket, idempotency key, Moneris parameter, or
  any payment credential, in code, reports, or error messages
- Rendering a payment as successful before the server returns `succeeded`, or a refund as done
  before `refundStatus` is `succeeded`
- Wrapping the checkout flow in an iframe of our own construction, or loading any Moneris page
  URL directly in a frame we create. The only permitted embed is whatever the official Moneris
  SDK renders inside the container element we hand it.
- Issuing a new idempotency key to retry a timed-out mutation (reuse the same key and body)
- Treating a Moneris browser callback, its response_code, or any client side signal as
  payment success, or rendering a success state from one
- Hardcoding a cap count, a refund bracket, or any policy number in booking copy or logic
  when the policy endpoint supplies it
- Rendering the mock checkout completion surface outside mock mode, or shipping
  BOOKING_MOCK_CHECKOUT enabled in a production environment
- Constructing or guessing a Moneris URL, host, or mode from anything other than the
  vendor-documented constants selected by the session's environment field
