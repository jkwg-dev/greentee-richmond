# Booking track · Book a Bay

Status date: 2026-07-10. This document is the authoritative spec for the booking track. It resolves design.md §15.1. `/book` has no mockup; §5 of this document plays the mockup's role. Where this document and design.md overlap, design.md governs global rules (tokens, motion, copy) and this document governs booking behavior.

---

## 1. Context and decisions

Bookings are served by the vendor's Green Tee middleware, a proxy in front of the screen_golf_web system (Supabase and Postgres behind it). The same middleware serves the club's existing Green Tee mobile app, so app users and web users share one account pool and one reservation history.

Decided and locked:
- Reservation creation is login required. The web adopts the same Supabase project as the app, matching the app's sign in method (email and password), via `@supabase/ssr`. This lands in B2, not now.
- The browser never calls the vendor middleware or Supabase for booking data. Everything flows through our own `/api/booking/*` route handlers.
- Presentation is ours: room imagery and descriptions come from our side, not from the vendor's `photoUrls` or `description` fields. Vendor data supplies inventory, capacity, time, and price.
- All money is integer cents in CAD. All slot times are ISO 8601 strings with the venue offset and are passed through verbatim, never recomputed.

Pending vendor answers (full list in §6): guest access to read endpoints, slot range semantics, price tax basis, hold expiry, confirmation trigger, payment. Every pending item has a hedge in the code so the answer swaps in without reshaping the UI.

---

## 2. Architecture

```
Browser (client island)
  -> /api/booking/*        Next.js Route Handlers, our server
    -> BookingProvider     src/lib/booking, server only
      -> B1: fixture provider (deterministic, no network)
      -> B3: middleware provider (vendor API, user JWT relayed per request)
        -> Green Tee middleware -> screen_golf_web
```

- Domain types live in `src/types/booking.ts`. UI components import domain types only. Vendor DTO shapes and their mapping live inside `src/lib/booking/` and never leak past it. This mirrors the Sanity rule (sections never see raw GROQ).
- Availability responses are never cached (`no-store`); rooms may cache briefly.
- Auth (B2 and later): `@supabase/ssr` cookie session; route handlers read the session server side and forward the user's JWT to the middleware per request. The JWT's `sub` claim owns the reservation. No service credentials, no shared identities.
- No secrets exist in this repo at any phase. The vendor's `sgsk_` key lives only inside their middleware. Supabase publishable keys arrive in B2 as env vars.

Decisions of record:
1. Login-required reservations; browsing gates at the browse step in live mode (vendor declined guest reads, §6).
2. **Range reservations (vendor confirmed).** Availability stays 30 minute slots, but creation accepts one reservation spanning contiguous same-room slots: the first slot's `startsAt` and the last slot's `endsAt`, with the server summing the 30 minute prices. The vendor app's one-button-per-slot UI was an app choice, not an API limit. The web selects contiguous slots and creates one reservation; a range may never span an unavailable slot. `src/lib/booking/selection.ts` holds the range model.

---

## 3. Track phases

The booking track runs beside roadmap Phases 7 and 8 and carries its own numbering to avoid collision.

| Phase | Scope | Depends on |
|---|---|---|
| **B1 · Browse** | `/book`: rooms, date, party size, time slot grid with prices, selection summary, hold by phone CTA. Fixture backed. Book a Bay CTA switches to `/book`. | Nothing external |
| B2 · Auth | Supabase sign in and sign up in the site's design language, session handling, gate placement per the vendor's guest access answer | Vendor: project URL and publishable key |
| B3a | Live reads: middleware provider behind the seam, per-user JWT relay, the /book gate, header and FullMenu sign-in entry points, housekeeping (PageHead extraction, bookingUrl removal, seed CTA fix) | verified against the local stub (§10.6); the vendor base URL only flips the env value |
| B3b | Range selection on /book (multi-slot, contiguous, same room), the master-detail browse layout, and sign-up and profile metadata (full name, optional phone, profile editing on /account) | vendor answers received 2026-07; no external gate |
| B3c | Reserve flow (create, 409 and timeout handling), confirmation screen, my reservations list, detail, and cancel | staging base URL for live; the stub can be extended for build if the URL is late |
| B4 · Payment | Payment step inserted between summary and confirmation | Vendor: payment proxy |

---

## 4. Vendor API contract (summary)

Normative source: the vendor spec v0.1 (Korean, delivered 2026-07). This summary carries everything B1 and B2 need. B3 must re-verify reservation payloads against the vendor document before integrating.

Conventions:
- JSON, camelCase fields.
- Times: ISO 8601 with the venue offset, for example `2026-07-10T18:00:00-07:00`. The venue is America/Vancouver. Never recompute or construct slot boundaries; render and echo the strings the API returned.
- Money: integer cents. Currency: `CAD`. Taxes at reservation time: GST 5 percent and PST 7 percent, itemized in the reservation response (`subtotalCents`, `gstCents`, `pstCents`, `totalCents`). Slot `priceCents` is treated as pre tax pending confirmation (§6).
- Errors: `{ "error": { "code", "message" } }`. `x-request-id` is supported for tracing.
- Auth today: every endpoint requires a Supabase user JWT (`Authorization: Bearer`). Guest access to the three read endpoints was declined; the login gate sits at the browse step (§6, §10.4).
- Vendor-confirmed policy values (2026-07): booking window 14 days from now; creation cutoff 60 minutes before the slot start, enforced per reservation, in venue time. Both are operational settings enforced server side twice: non-conforming slots are excluded from availability, and creation re-validates and rejects violations. Client-side limits are courtesy only.
- Reservation creation accepts a spanning `startsAt` to `endsAt` across contiguous same-room slots; the server sums the 30 minute prices into one reservation. Idempotency keys and a customer-facing OpenAPI document arrive with the vendor's staging schedule.

Read endpoints (the B1 surface, faked by fixtures until B3):

| Endpoint | Returns |
|---|---|
| `GET /api/v1/simulator/rooms` | `id`, `name`, `maxCapacity`, `description`, `photoUrls`, `displayOrder`. The domain type keeps `id`, `name`, `maxCapacity`, `order` and drops the rest by design. |
| `GET /api/v1/pricing` | Rate periods and tax config (`stripeTaxEnabled` currently false). Not consumed in B1; slot prices arrive on the slots themselves. |
| `GET /api/v1/simulator/availability?date&partySize[&roomId]` | `{ date, slots[], reasons[] }`. Slot: `roomId`, `startsAt`, `endsAt`, `priceCents`, `currency`. Empty `slots` with empty `reasons` means fully booked. `reasons` enum: `closed_today`, `no_rooms`, `no_pricing_configured`, `pricing_gaps`. |

Reservation endpoints (B3 scope, listed for planning): create (`roomId`, `startsAt`, `endsAt`, `partySize`, optional `customerNotes`, echoing slot values verbatim), list with cursor pagination, detail, cancel with refund fields. Statuses: `pending`, `confirmed`, `cancelled`, `no_show`, `completed`. A `pending` reservation carries `expiresAt`; its exact semantics are pending (§6). There is no payment endpoint and no client idempotency key yet; on a create timeout, check the reservation list before retrying.

---

## 5. `/book` page spec

This section is the spec; there is no mockup. Build entirely from existing system primitives (`Button`, `Chip`, `Eyebrow`, `FactRows`, `Reveal`, hairline rules) in the established visual language: noir ground, ivory text, champagne accent, Cormorant display, Inter UI. No jade anywhere on this page (it is not Crystal Jade content). No new tokens, easings, or button styles.

### 5.1 Route and status
- `src/app/(site)/book/page.tsx`, inheriting the site header and footer from the `(site)` layout. Indexable, present in the sitemap, not a `primaryNav` item; the page is reached through the Book a Bay CTA.
- `BOOK_A_BAY_HREF` in `src/lib/site.ts` becomes `"/book"`. Every existing consumer (header, FullMenu, outro, zone CTAs) follows automatically.
- Feature flag: `src/lib/booking/config.ts` exports `bookingCreateEnabled = false`. B1 renders the hold by phone CTA in the summary; B3 flips the flag and replaces it with the reserve flow.
- Gate behavior in live mode is defined in §10.4; the route remains indexable in every mode (the gate is an inline panel, never a redirect).

### 5.2 Layout
1. **Head** (server): mirrors the `/news` index head proportions. `Eyebrow` "Book a Bay", serif H1 "Choose your *time*." through `RichHeading` (champagne italic em), support line per §7. Standard reveals.
2. **Booking panel**: the master-detail layout of §11 governs this area (space cards and a per-space timeline). At 1024px and above it is two panes; below 1024px the cards stack and a tapped card expands its timeline as an accordion. The summary is sticky in the detail pane on desktop and a fixed bottom bar on mobile.
3. **Notes band**: `FactRows` beneath the panel with placeholder policy rows (§7), each carrying a `detail` marking it placeholder. Follows the Rates and Hours placeholder convention.
4. **Timezone line**: "All times Pacific." in small mist type near the panel.

### 5.3 Controls
- **Date strip**: the next 14 days as `Chip`s in a single row; horizontally scrollable with a hidden scrollbar below 900px, matching the existing chip bar patterns. Labels: "Today", "Tomorrow", then short weekday plus day ("Sat 18"). Each chip's `aria-label` carries the full date. Single select, default today. The strip is generated in venue time (America/Vancouver), so a visitor in another timezone sees the club's calendar, not their own.
- **Party size**: `Chip`s from 1 to the maximum room capacity in the data (not hardcoded), single select, default 2. Group label "Party".
- **Type filter** (replaces the per-room space chips; see §11.2): `All Spaces` plus one chip per category present in the data. Selecting narrows the space cards.
- Small tracked uppercase group labels (mist) above each control row.
- Changing any control refetches availability from `/api/booking/availability`. Rooms arrive with the server render and do not refetch.

### 5.4 Selection

The grid presentation and the single-slot rule that stood in B1 are superseded by §11 (the master-detail layout and the vertical timeline). The range rules here are authoritative and operate on the §11.4 timeline cells.

**Selection is a contiguous same-room range** (one or more slots). Interaction rules, in order, first match wins:

1. No selection: a tap selects that slot.
2. Tap in a different room: the selection becomes that slot.
3. Tap on a slot already at an edge of the range: that edge slot leaves the range (a range of one deselects entirely, preserving the B1 toggle).
4. Tap on an interior slot of the range: the selection resets to that slot.
5. Tap beyond an edge in the same room: if every slot between the range and the tapped slot is present and available, the range extends to include the tapped slot; if the run is broken, the selection resets to the tapped slot (the vendor rule: a range may never span an unavailable slot).

Adjacency is exact string equality: `next.startsAt === previous.endsAt`. No date arithmetic on slot strings, ever; the mapper guarantees per-room chronological order so the equality walk is sufficient. All selected cells render the active treatment; the aria-live region announces the full range ("6:00 to 7:30 PM, 90 minutes, $96").

### 5.5 Summary
- `FactRows`: Date, Time (the range rendered from the first slot's `startsAt` and the last slot's `endsAt` strings), Space, Party, Price (formatted CAD with `detail` "Before GST and PST").
- Empty selection: a single mist line per §7.
- The primary action is a solid `Button` labeled "Reserve This Time", gated by `bookingCreateEnabled`:
  - `false` (B1 through B3b): rendered disabled. `aria-disabled="true"`, no action on click or Enter, reduced opacity through an opacity utility on the existing solid variant (not a new button style), still 44px and in the tab order.
  - `true` (B3c and later): the same button becomes the reserve flow entry point; specified with B3c.
- Beneath it, the mist note per §7. The phone number inside the note renders from the settings phone as a `tel:` link; the rest of the note is plain text.
- The summary region is `aria-live="polite"` so selection changes are announced.

With a range selected, the Time row shows the span (first `startsAt` to last `endsAt` through `formatSlotRange`), and the Price row shows the sum of the selected slots' `priceCents` (display only; the authoritative total is computed by the server at creation). The price detail line becomes "`{duration} · Before GST and PST`", where duration is the slot count times 30 minutes rendered as "30 minutes", "1 hour", "1 hour 30 minutes", and so on. Duration is always derived from the count, never from date math.

### 5.6 States
- **Loading**: pulse placeholders (Tailwind `animate-pulse` on hairline bordered blocks) holding the grid's approximate height. No spinners, no layout shift.
- **Error**: one short line plus a ghost "Try Again" `Button`. No toasts.
- **Empty**, keyed by `reasons` (copy in §7): `closed_today`; `no_rooms`; `no_pricing_configured` and `pricing_gaps` share one message; empty slots with empty reasons is the sold out message.
- **Reduced motion**: reveals settle instantly through the global system; the fade swap is skipped.

### 5.7 Data layer
- `src/types/booking.ts`: `BookingRoom { id, name, maxCapacity, order, category }` · `BookingSlot { roomId, startsAt, endsAt, priceCents, currency }` · `Availability { date, slots, reasons }` · `AvailabilityReason` union of the four reason strings · `BookingSelection { kind: "range"; slots: BookingSlot[] }` (non-empty, contiguous, single room).
- `src/lib/booking/provider.ts` (server only): the `BookingProvider` interface, `getRooms(): Promise<BookingRoom[]>` and `getAvailability({ date, partySize, roomId? }): Promise<Availability>`, plus an `activeProvider` export. Live mode selects the middleware provider, fixture mode the fixture provider; nothing above this module changes.
- `src/lib/booking/fixtures.ts`: a deterministic fixture provider. Rooms: Bay 01 · Practice (capacity 4), Bay 02 · Play (4), Bay 05 · Play (4), VIP Room 12 (8). Slots: 30 minute blocks from 10:00 to 22:00 venue time, emitted as ISO strings with the `-07:00` offset. Prices in cents, all placeholders: standard 3200, peak (17:00 to 21:00) 4800; VIP 6400 standard and 9000 peak. Availability thins by a small deterministic hash of date, room id, and start time; never `Math.random`, so the same query always returns the same slots. Scripted states: today plus 3 days returns `closed_today`; today plus 5 days returns empty slots with empty reasons (sold out). A party size above a room's capacity drops that room; if nothing remains, return `no_rooms`. Empty-state precedence: closed_today, then no_rooms, then sold out.
- `src/lib/booking/format.ts`: `formatCad(cents)` via `Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })`; `formatSlotTime(iso)` and `formatSlotRange(startIso, endIso)` via `Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" })` for the "2:30 PM" form; `formatDateChip(date)` for the strip labels; the duration formatter (slot count times 30 minutes). All formatting reads the ISO strings; no manual time arithmetic anywhere.
- Route handlers: `GET /api/booking/rooms` (revalidate about 300 seconds) and `GET /api/booking/availability` (`no-store`; validates `date`, `partySize`, optional `roomId`; 400 with the error envelope shape on bad input). Both call `activeProvider`. The client island fetches only these routes and never imports the provider.
- The page (server component) awaits `getRooms()` and today's availability from the provider directly, plus `getSiteSettings()` for the phone, and passes them to the island as initial data, so first paint is populated without a client fetch.

Cutoff rule (vendor answer 5): for today, slots starting within 60 minutes of venue-time now are dropped, replacing the past-slots-only rule. The mapper sorts each room's slots chronologically as a guarantee (adjacency checks depend on it).

### 5.8 Responsive and accessibility
- Verified at 1440 and 390. The detail pane summary stacks below the timeline under 1280px and becomes a fixed bottom bar below 1024px; strips scroll horizontally below 900px; the timeline scrolls internally.
- All chips and cells are buttons with `aria-pressed`; date chips carry full date `aria-label`s; the summary is `aria-live="polite"`; every target is at least 44px; the whole panel is keyboard reachable in DOM order.
- Standard definition of done from CLAUDE.md applies (reduced motion, no console errors, no layout shift, dash check, lint and typecheck).

---

## 6. Open questions and hedges

| # | Question (with the vendor) | Working assumption in code | Hedge location |
|---|---|---|---|
| 1 | Guest access to rooms, pricing, availability without login | Declined; the gate sits at the browse step in live mode | §10.4 |
| 2 | One reservation per slot versus a spanning range | Closed: ranges allowed and recommended (see Answered below) | §2, §5.4 |
| 3 | Slot `priceCents` is pre tax | Show the price with the "Before GST and PST" detail | Two strings (summary detail, notes band); trivially removable |
| 4 | `expiresAt` semantics, what triggers `confirmed`, payment plans | Out of B1 to B3b scope | B3c, B4 |
| 5 | Booking window and same day cutoff | Closed: 14 days, 60 minute cutoff, server enforced (see Answered below) | §4, §5.7 |
| 6 | A room type field (bay versus VIP versus VVIP) | Category derived by name heuristic in the mapper | §11.3 |
| 7 | Sign-up metadata the vendor app expects | Closed: email and password only; display_name optional (see Answered below) | §9.4 |
| 8 | Forgot password (vendor app shows coming soon; SMTP and redirect registration pending) | No recovery flow yet | A recovery route slots beside sign in when the vendor enables it |
| 9 | The vendor will enable email confirmation in their production environment; when it flips, signUp stops returning an immediate session and our §9.2 config error becomes wrong | Advance notice requested; parity holds today | A confirmation wait screen and redirect coordination land as their production launch approaches; tracked as B-later |
| 10 | Identity mapping key: the (provider, externalUserId) pair | Closed: provider stays green_tee_flutter for web, no green_tee_web planned, vendor commits to explicit linking if a provider is ever added | Closed; the remedy, if it ever recurs, is a vendor policy request, not code |
| 11 | No maximum range duration is stated by the vendor | We impose none in the UI; the server may reject at creation | If a maximum ever surfaces, it becomes a selection-rule constant beside the cutoff |

Answered (attachment of 2026-07-21, replies received): 1 slot model, ranges allowed and recommended (recorded in §2 and §5.4) · 3 sign-up metadata, email and password are the only requirements; `display_name`, `phone`, `preferred_locale` are optional metadata and a profile is auto-created with the email local part as the fallback display name (recorded in §9) · 4 identity key is the (provider, externalUserId) pair, the provider stays `green_tee_flutter` for web, no `green_tee_web` is planned, and any future provider addition will ship with an explicit linking step on the vendor side (hedge 10 closed) · 5 window 14 days, cutoff 60 minutes, server enforced (recorded in §4).
Open: the staging schedule itself (base URL, test data, customer OpenAPI arrive together); the date has been asked and remains the single external gate, for B3c live only.

---

## 7. B1 copy (exact strings)

All copy is dash free per the global rule. Placeholders are marked in their `detail` fields.

- Eyebrow: `Book a Bay`
- H1: `Choose your *time*.`
- Support: `Pick a date and party size to see open bays and times.`
- Timezone line: `All times Pacific.`
- Control labels: `Date` · `Party` · type filter `All Spaces`
- Summary empty state: `Select a time to see the details here.`
- Summary price detail: `Before GST and PST`
- Summary CTA: `Reserve This Time`
- Summary note: `Online reservations are opening soon. To hold a time today, call +1 000 000 0000.` (the number substitutes the settings phone and is tel: linked; the sentence is otherwise verbatim)
- Empty, closed_today: `The club is closed on this date.`
- Empty, no_rooms: `No spaces fit this party size. Try a smaller group or another date.`
- Empty, pricing pending: `Times for this date are still being finalized. Call us and we will set you up.`
- Empty, sold out: `Fully booked on this date. Try another date.`
- Error line: `Something went wrong while loading times.` · button `Try Again`
- Notes band rows: `Session length` / `30 minutes per block` / detail `Placeholder, confirming with the booking system` · `Booking window` / `Up to 14 days ahead` / detail `Placeholder, confirming with the booking system` · `Cancellation` / `Policy to be confirmed` / detail `Placeholder, confirming with the booking system`

---

## 8. Environment and security posture

B1 introduces no environment variables, no external calls, and no secrets. The vendor middleware and Supabase are never called from the browser at any phase, and the vendor's `sgsk_` key never appears in this repository in any form.

B2 adds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (dev project values until the vendor's arrive; §9.2). The publishable key is public by design; no secret or service key exists in this repo in any form.

`BOOKING_API_BASE_URL` (B3a): its presence is live mode. One variable arms both the middleware provider and the /book gate, so real data and the sign-in wall appear together; absent, the site runs fixture mode with the open browse experience (local dev and preview deployments). No trailing slash; validated on first use with a clear error when malformed.

---

## 9. B2 · Auth spec

This section is the spec for the account surfaces; there is no mockup. Build from existing primitives plus the one new primitive defined in §9.6, in the established language: noir ground, ivory text, champagne accent, Cormorant display, Inter UI. No jade. No new tokens, easings, or button styles.

### 9.1 Scope and posture

B2 ships auth infrastructure and the account pages with zero visible change to the existing site: no header or nav edits, no `/book` changes, no gate anywhere. Gate placement waits on the vendor's guest access answer and lands with B3. Until the vendor's project credentials arrive, the app points at our own dev Supabase project configured for parity with the vendor app (email and password provider on, Confirm email off); the swap to the vendor project is an env value change plus the §9.9 smoke test, nothing more.

### 9.2 Environment

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, added to `.env.local` (dev project values now, vendor values later) and documented in `.env.local.example` (the repo's example-file convention). When the two values are absent, the session interceptor passes through untouched and any actual auth use throws a clear error referencing this section; the site never hard-depends on these values at build time. The publishable key is public by design. No other Supabase variable is ever added; no secret or service key exists in this repo in any form.

Parity assumptions from the vendor app: password sign in enabled, no email confirmation at sign up. If `signUp` returns a user without a session, treat it as project misconfiguration: surface the §9.7 config error and log the cause; do not build a confirmation wait screen.

### 9.3 Modules

- `src/lib/supabase/server.ts`: the server client factory on `cookies()`, plus a `getUser()` helper. The only place a Supabase client is created for request handling.
- `src/lib/supabase/session.ts`: `updateSession(request)` for the root request interceptor (Next names it `proxy.ts` on 16, `middleware.ts` before; use what the installed major documents). Inside it, nothing runs between `createServerClient` and the user fetch; code in that gap causes random sign outs (documented Supabase footgun).
- No browser Supabase client exists in B2. Every auth operation is a Server Action; the browser talks to our server only, for auth exactly as for booking data.
- Server Actions live in `src/app/(site)/account/actions.ts`: `signIn`, `signUp`, `signOut`, returning mapped errors per §9.7, redirecting on success.

### 9.4 Routes

All three: inside `(site)` (header and footer render as everywhere), `robots: noindex`, absent from the sitemap, standard reveals, verified at 1440 and 390. Forms are narrow single-column blocks (max width about 420px) under a news-pagehead-proportioned head.

- `/account/sign-in`: Eyebrow, H1, support line, Email and Password fields, solid submit, cross link to sign up. Honors `?next=` (internal paths only: must start with a single `/`, reject `//` and anything with a scheme). Visited while signed in: redirect to `next`, else `/account`.
- `/account/sign-up`: same shell; the fields below, solid submit, cross link to sign in. Same `next` behavior, same signed-in redirect.
- `/account`: requires a session; signed out visitors redirect to `/account/sign-in?next=/account`. Head plus `FactRows` (Email, and Name when present), the Profile section below, the §9.7 reservations note line, and a ghost Sign Out button. B3c adds the reservations rows here.
- Cross links between sign in and sign up preserve `?next=` (URL encoded), so switching forms mid-flow never strands the return path.

Sign up collects, in order: Full Name, Email, Password. Full name is required (a reservation reaches the front desk under this name); phone is not collected at sign up. The value is trimmed with internal whitespace collapsed and sent as `options.data.display_name`, the one name key the shared ecosystem reads and writes. No `first_name` or `last_name` keys exist on our side: the app's own sign-up may split the name into two inputs, but `display_name` is the stored truth, and writing only it keeps app-created and web-created accounts symmetrical. Metadata only: the Supabase top-level phone identity field is never written.

/account gains a Profile section beneath the Email FactRow: a tracked "Profile" microlabel, Full Name and Phone Fields prefilled from user metadata (`display_name`, `phone`), and a solid Save button. Full name is required on save, phone optional (trimmed, no format enforcement). Saving runs a Server Action calling `updateUser`, writing `display_name` directly and `phone` when given; success renders the §9.7 confirmation line in place, errors reuse the §9.7 fallback. Because the form reads and writes `display_name` itself, an app-created account opens with its name already filled, and a web edit is visible in the app immediately; there is no derived state to fall out of sync. Email is identity and stays read only.

### 9.5 Behavior

- Actions use the `useActionState` pattern: pending disables the submit (`aria-disabled`, reduced opacity on the existing solid variant, mirroring the Reserve button treatment) and errors render in the §9.6 error slot without losing field values.
- Success: sign in and sign up redirect to `next`, else `/account`; sign out redirects to `/`.
- `/account` reads the session via `getUser()` server side; it is dynamic by nature of `cookies()` and must not be forced static.
- Errors route to a field: the existing-account error renders under Email; credentials, weak password, rate limit, config, and fallback render under Password. Pending submits are also guarded against double fire; aria-disabled alone leaves a button clickable.

### 9.6 Field, the first text input primitive

`src/components/ui/Field.tsx`: label (9.5px tracked uppercase, mist), input (transparent background, 1px `--hair` border, ivory 14px text, 44px minimum height, comfortable padding), focus state swaps the border to champagne (the global focus-visible outline still applies for keyboard), autofill repainted to noir-soft, and an error line beneath (champagne, 11.5px). Champagne is the error color by ruling: the palette has no red and gains none. Password inputs have no show toggle in B2 (backlog). Add a Field block to `/styleguide` alongside the other primitives.

### 9.7 B2 copy (exact strings)

- Eyebrow, all three pages: `Your Account`
- Sign in H1: `Sign in.` · support: `Reserve bays and manage your bookings with one account.`
- Field labels: `Email` · `Password` · password microcopy (sign up only): `At least 6 characters.`
- Sign in submit: `Sign In` · cross link: `New here? Create an account.`
- Sign up H1: `Create your account.` · support: `Set up once. Reserve bays and manage your bookings in one place.`
- Sign up submit: `Create Account` · cross link: `Already with us? Sign in.`
- Account H1: `Your account.` · reservations note: `Your reservations will appear here once online booking opens.` · sign out button: `Sign Out`
- Errors: invalid credentials `That email and password do not match. Try again.` · existing account `An account with this email already exists. Sign in instead.` · weak password `Passwords need at least 6 characters.` · rate limited `Too many attempts. Wait a moment and try again.` · config (no session after sign up) `Sign up is not available right now. Please try again later.` · fallback `Something went wrong. Please try again.`
- Page titles: Sign In · Create Account · Your Account.
- Field labels: `Full Name` · `Phone` with hint `Optional.`
- Name error (sign up and profile): `Please enter your name.`
- Profile microlabel: `Profile` · save button: `Save Changes` · success line: `Profile updated.`

### 9.8 Security posture

The `next` parameter is sanitized as in §9.4. Passwords never appear in logs, errors, or console output. Vendor confirmed: the password is consumed by Supabase Auth only and never reaches the middleware or the screen golf system; reservation calls carry only the access token. Rate limiting is Supabase's default. Cookie handling is `@supabase/ssr` default; do not override.

### 9.9 Done criteria and smoke test

CLAUDE.md definition of done, plus this walkthrough, which is also the smoke test rerun on the day the vendor credentials replace the dev values: sign up with a fresh email lands on `/account` showing that email; sign out lands on `/`; sign in with the wrong password shows the credentials error and keeps the email value; sign in succeeds; visiting a sign-in URL with `?next=/book` returns to `/book` after auth; visiting sign in while authed redirects away; both auth pages carry noindex and the sitemap is unchanged; session survives a reload and a dev server restart; the refresh helper matches the documented pattern (reviewed, since token expiry cannot be waited out in QA).

---

## 10. B3a · Live reads, the gate, and sign-in entry points

### 10.1 Mode

Live mode is the presence of `BOOKING_API_BASE_URL` (§8). `isBookingLive()` in `src/lib/booking/config.ts` is the single check; the provider binding, the route handler auth requirement, and the /book gate all read it. Fixture mode keeps today's open behavior everywhere.

### 10.2 The middleware provider

`src/lib/booking/middleware.ts` implements `BookingProvider` against the two read endpoints (wire shapes per §4; mapping stays in `map.ts`, the only DTO-aware file). Inside the request scope it obtains the current user's access token from the Supabase server client; with no session in live mode it throws a typed auth error. Nothing above the provider changes (the seam rule). Tokens are read per request and never cached or shared across requests.

Requests carry `Authorization: Bearer <token>`, `Accept: application/json`, and a generated `x-request-id` (crypto.randomUUID). Failures log the request id and the middleware error envelope. Vendor errors map: `UNAUTHORIZED` to our 401, `VALIDATION_FAILED` to 400, anything else to the §5.6 error state.

Caching: the rooms upstream fetch uses `next: { revalidate: 300 }` (room data is not user specific); availability is `no-store`. Handler level caching is removed (§10.3).

### 10.3 Route handlers

In live mode both `/api/booking/*` handlers require a session before touching the provider and answer 401 with the §4 envelope when there is none; in fixture mode they stay open. The handlers are dynamic; caching lives in the upstream fetch only. Middleware-backed data is never served from an unauthenticated path. The handler session check uses the local session (a politeness gate for clean 401s); the vendor middleware validating the relayed JWT is the security boundary. The /book page gate uses the verified user check.

### 10.4 The gate on /book

Live mode, signed out (amended 2026-07-20, superseding the inline-panel ruling above this date): the server render redirects to `/account/sign-in?next=/book`. The sign-in action honors the sanitized next, and the sign-in form propagates it to the sign-up link, so completing either flow lands the visitor back on /book. The signed-out route is never served in live mode, so the earlier indexability rationale no longer applies there; fixture mode stays open and serves the page to everyone, exactly as today. Signed in, the page behaves exactly as today. If a live fetch returns 401 mid session, the island navigates to `/account/sign-in?next=/book`.

Hardening (B3a finding, ruled into B3b, implemented with the 2026-07-20 amendment): the /book server render catches the provider's auth error thrown mid render and renders the §10.7 inline gate panel (head as always, the gate where the booking panel would sit, notes beneath, no timezone line) for that one case: the vendor rejects a token the local session still considers valid (clock skew, revocation, a forced 401 in QA). A redirect cannot answer it, because the sign-in page bounces signed-in visitors straight back to next and the pair would loop. The panel keeps the §10.7 line and both buttons with next=/book.

### 10.5 Sign-in entry points

Desktop header: a "Sign In" text link left of the Book a Bay CTA, nav-item type at reduced emphasis (mist, ivory on hover), static href `/account/sign-in`. The header never becomes session aware; B2's signed-in redirect makes the static destination correct in both states. FullMenu mirrors the same link in its utility area without touching the primary nav hierarchy. This section is the docs ruling that permits editing the header surface.

### 10.6 The local middleware stub

`scripts/booking-middleware-stub.mjs`: a dev-only, dependency-free server emulating the two read endpoints with spec-shaped payloads. It returns 401 without a Bearer token, serves deterministic rooms and slots, and has a switch for forcing an error response. It exists so the relay, the gate, and the error paths are verifiable end to end before the vendor URL exists, and it stays until vendor staging arrives. Never deployed, never imported by app code.

### 10.7 B3a copy

Gate line: `Sign in to see open times and reserve your bay.` Buttons: `Sign In` and `Create Account`. Header and FullMenu link label: `Sign In`.

### 10.8 Done criteria

Fixture mode is byte-for-byte today's behavior: open browse, no gate, handlers open. Live mode against the stub (amended 2026-07-20): signed out redirects to `/account/sign-in?next=/book`, and signing in (or signing up through the form's link) lands back on /book; the auth desync case (stub forced 401 while a local session holds) shows the inline gate with the head intact; slots render from the stub; stopping the stub yields the §5.6 error state; a forced 401 mid session redirects to sign in and returns. /news, /book, and /account render pixel identical after the PageHead extraction. Lint, typecheck, and the dash check pass.

---

## 11. B3b · Browse layout: space cards and the timeline

Supersedes the §5.3 space chip row and the §5.4 grid presentation. The five §5.4 interaction rules carry over unchanged and operate on timeline cells; §5.5 as amended renders inside the detail pane on desktop and the bottom bar on mobile. The head, page states (§5.6), formatting rules, and fixtures (§5.7 as amended) remain in force.

### 11.1 Layout

Desktop (1024 and up), beneath the head: the date strip and party picker keep their current full-width row. Below them, two panes. Left, a column of about 340px: a type filter chip row (`All Spaces` plus only the categories present in the data), then the space cards stacked vertically. Right, the detail pane for the selected space: a header (name, capacity line, category microlabel), the timeline, the helper line, then the selection summary (FactRows with the §5.5 Duration and summed Price, the disabled Reserve button, and its note, unchanged in role). At 1280 and up the timeline (with its helper line) and the summary sit side by side beneath the pane header, the timeline column about 420px wide; below 1280 they stack with the summary beneath. The first space is auto selected on desktop so the detail pane is never empty.

Below 1024: cards stack full width; tapping a card expands its timeline beneath it as an accordion, one open at a time, nothing expanded until a tap; the summary remains the existing fixed bottom bar, now carrying the condensed range.

### 11.2 Space cards

Each card: the space name (serif, about 18px), a mist capacity line ("Up to 4 guests"), a category microlabel (9.5px tracked uppercase), and a mist price line ("From $32 per 30 minutes", the minimum of that space's slot prices for the current query). States within existing tokens: rest carries the hair border; the selected card carries a champagne border. A space with no slots for the current query renders its card dimmed with "No times for this day." in place of the price line and stays selectable (its detail pane shows the same line). Party size above a space's capacity removes the card entirely; the §5.6 page states cover the all-empty cases.

### 11.3 Category

`BookingRoom` gains `category: "bay" | "vip" | "vvip" | "other"`, derived in the mapper by name heuristic for now: the name contains VVIP, then VIP, then Bay, case insensitive; else other. Interim by ruling until real room ids exist and the Sanity room mapping (decision 8) supplies curated categories. The filter renders only categories present in the data, so a wrong guess degrades to an unfiltered list, never a broken one. Filter chip labels: `All Spaces` · `Bays` · `VIP Rooms` · `VVIP Suites`.

### 11.4 The timeline

A vertical column of the selected space's day, earliest at the top, spanning from that space's earliest slot start to its latest slot end. Available cells (returned slots) are full-width rows on the hair chip recipe, at least 48px tall: start time on the left (11px tracked), price on the right (mist, 10px); champagne fill with ink text when in range; buttons with `aria-pressed`. A gap between returned slots renders as one collapsed divider row regardless of its length: about 32px, reduced opacity, not focusable, the microlabel `Unavailable` on the left and the gap's span on the right through `formatSlotRange` (its endpoints are the neighboring slots' verbatim strings). Dividers make occupied time visible and physically break ranges; the §5.4 rules need no change, because a divider cannot be tapped, and tapping an available cell beyond one resets the selection per rule 5.

The column scrolls vertically inside the sticky detail pane (a viewport-keyed max-height so the pane never outgrows the screen), with a subtle top and bottom fade when content overflows and momentum scroll on touch. On open it auto-scrolls to the first available cell (for today, the first cell at or after venue now). The mobile accordion uses the same internal scroll with a tighter max-height, about 320px.

Gap spans are computed by parsing the verbatim strings to epoch instants: layout math on parsed instants, confined to the pure timeline helper. Its outputs are runs, counts, and boundary slot references, never time strings; every displayed time remains Intl on the verbatim strings, and any future payload echoes the strings untouched.

### 11.5 B3b layout copy

Helper line: `Tap a start time, then an end time. Times in between must be open.` Card price line: `From {price} per 30 minutes`. Timeline divider microlabel: `Unavailable`. Everything else carries over from §7 and the amendments above.

### 11.6 Done additions

The §5.8 bar and the range criteria, plus: the filter shows only present categories; a gap-blocked reset demonstrated on the visible timeline; the timeline auto-scrolls to the first available cell and scrolls internally while the summary stays in view (side by side at 1280 and up, stacked below); divider spans match their neighboring slots' verbatim strings; auto select on desktop and the accordion on mobile verified at 1440 and 390; card dimming for a no-times space verified; the detail pane summary and the mobile bottom bar both carry the range, duration, and sum; the gate (§10.4) verified still in front of it all in live mode.