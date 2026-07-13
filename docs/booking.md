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

---

## 3. Track phases

The booking track runs beside roadmap Phases 7 and 8 and carries its own numbering to avoid collision.

| Phase | Scope | Depends on |
|---|---|---|
| **B1 · Browse** (this) | `/book`: rooms, date, party size, time slot grid with prices, selection summary, hold by phone CTA. Fixture backed. Book a Bay CTA switches to `/book`. | Nothing external |
| B2 · Auth | Supabase sign in and sign up in the site's design language, session handling, gate placement per the vendor's guest access answer | Vendor: project URL and publishable key |
| B3 · Reserve | Middleware provider behind the same interface, reservation creation, confirmation screen, my bookings, cancel | Vendor: staging URL, slot model answer, expiry semantics |
| B4 · Payment | Payment step inserted between summary and confirmation | Vendor: payment proxy |

---

## 4. Vendor API contract (summary)

Normative source: the vendor spec v0.1 (Korean, delivered 2026-07). This summary carries everything B1 and B2 need. B3 must re-verify reservation payloads against the vendor document before integrating.

Conventions:
- JSON, camelCase fields.
- Times: ISO 8601 with the venue offset, for example `2026-07-10T18:00:00-07:00`. The venue is America/Vancouver. Never recompute or construct slot boundaries; render and echo the strings the API returned.
- Money: integer cents. Currency: `CAD`. Taxes at reservation time: GST 5 percent and PST 7 percent, itemized in the reservation response (`subtotalCents`, `gstCents`, `pstCents`, `totalCents`). Slot `priceCents` is treated as pre tax pending confirmation (§6).
- Errors: `{ "error": { "code", "message" } }`. `x-request-id` is supported for tracing.
- Auth today: every endpoint requires a Supabase user JWT (`Authorization: Bearer`). Guest access to the three read endpoints has been requested; the fallback is a login gate at the browse step (§6).

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

### 5.2 Layout
1. **Head** (server): mirrors the `/news` index head proportions. `Eyebrow` "Book a Bay", serif H1 "Choose your *time*." through `RichHeading` (champagne italic em), support line per §7. Standard reveals.
2. **Booking panel**: at 1024px and above, a two column grid `[minmax(0,1fr)_360px]` with about 5vw gap. Left: controls and slots. Right: the summary, sticky with a top offset that clears the fixed header (about 110px). Below 1024px: one column; the summary renders after the slots as a normal block, not sticky, not an overlay.
3. **Notes band**: `FactRows` beneath the panel with placeholder policy rows (§7), each carrying a `detail` marking it placeholder. Follows the Rates and Hours placeholder convention.
4. **Timezone line**: "All times Pacific." in small mist type near the panel.

### 5.3 Controls
- **Date strip**: the next 14 days as `Chip`s in a single row; horizontally scrollable with a hidden scrollbar below 900px, matching the existing chip bar patterns. Labels: "Today", "Tomorrow", then short weekday plus day ("Sat 18"). Each chip's `aria-label` carries the full date. Single select, default today. The strip is generated in venue time (America/Vancouver), so a visitor in another timezone sees the club's calendar, not their own.
- **Party size**: `Chip`s from 1 to the maximum room capacity in the data (not hardcoded), single select, default 2. Group label "Party".
- **Space**: "All spaces" plus one `Chip` per room from the provider, in `order`. Single select, default All. Group label "Space". (The label is Space, not Bay, because rooms include VIP rooms.)
- Small tracked uppercase group labels (mist) above each control row.
- Changing any control refetches availability from `/api/booking/availability`. Rooms arrive with the server render and do not refetch.

### 5.4 Slots
- With All spaces selected: group slots by room, each group under a small tracked room heading (mist, uppercase), then that room's slot chips. With one space selected: a flat grid.
- **SlotChip**: a booking scoped composite on the `Chip` recipe (border, tracking, 44px minimum target, champagne active fill with ink text). Content: the start time ("2:30 PM") with the price ("$32.00") right aligned on the same line; below 560px the price moves beneath the time. Only open slots render; the API returns open slots only, so there is no disabled slot state.
- Selection is a single slot. No duration control in B1 (§6.2). Selecting updates the summary.
- Grid: `repeat(auto-fill, minmax(150px, 1fr))` with about 10px gap.
- When controls change, the slot container swaps content with a short opacity fade (about 200ms) using existing transition utilities. Reveals do not re-run on data swaps. No new keyframes.

### 5.5 Summary
- `FactRows`: Date, Time (the range rendered from the slot's `startsAt` and `endsAt` strings), Space, Party, Price (formatted CAD with `detail` "Before GST and PST").
- Empty selection: a single mist line per §7.
- The primary action is a solid `Button` labeled "Reserve This Time", gated by
  `bookingCreateEnabled`:
  - `false` (B1): rendered disabled. `aria-disabled="true"`, no action on click or Enter,
    reduced opacity through an opacity utility on the existing solid variant (not a new button
    style), still 44px and in the tab order.
  - `true` (B3 and later): the same button becomes the reserve flow entry point; specified
    with B3.
- Beneath it, the mist note per §7. The phone number inside the note renders from the settings
  phone as a `tel:` link; the rest of the note is plain text.
- The summary region is `aria-live="polite"` so selection changes are announced.

### 5.6 States
- **Loading**: pulse placeholders (Tailwind `animate-pulse` on hairline bordered blocks) holding the grid's approximate height. No spinners, no layout shift.
- **Error**: one short line plus a ghost "Try Again" `Button`. No toasts.
- **Empty**, keyed by `reasons` (copy in §7): `closed_today`; `no_rooms`; `no_pricing_configured` and `pricing_gaps` share one message; empty slots with empty reasons is the sold out message.
- **Reduced motion**: reveals settle instantly through the global system; the fade swap is skipped.

### 5.7 Data layer
- `src/types/booking.ts`: `BookingRoom { id, name, maxCapacity, order }` · `BookingSlot { roomId, startsAt, endsAt, priceCents, currency }` · `Availability { date, slots, reasons }` · `AvailabilityReason` union of the four reason strings · `BookingSelection { room, slot, partySize }`.
- `src/lib/booking/provider.ts` (server only): the `BookingProvider` interface, `getRooms(): Promise<BookingRoom[]>` and `getAvailability({ date, partySize, roomId? }): Promise<Availability>`, plus an `activeProvider` export currently bound to the fixture provider. B3 swaps the binding; nothing above this module changes.
- `src/lib/booking/fixtures.ts`: a deterministic fixture provider. Rooms: Bay 01 · Practice (capacity 4), Bay 02 · Play (4), Bay 05 · Play (4), VIP Room 12 (8). Slots: 30 minute blocks from 10:00 to 22:00 venue time, emitted as ISO strings with the `-07:00` offset. Prices in cents, all placeholders: standard 3200, peak (17:00 to 21:00) 4800; VIP 6400 standard and 9000 peak. Availability thins by a small deterministic hash of date, room id, and start time; never `Math.random`, so the same query always returns the same slots. Scripted states: today plus 3 days returns `closed_today`; today plus 5 days returns empty slots with empty reasons (sold out). A party size above a room's capacity drops that room; if nothing remains, return `no_rooms`. Empty-state precedence: closed_today, then no_rooms, then sold out.
- `src/lib/booking/format.ts`: `formatCad(cents)` via `Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })`; `formatSlotTime(iso)` and `formatSlotRange(startIso, endIso)` via `Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver" })` for the "2:30 PM" form; `formatDateChip(date)` for the strip labels. All formatting reads the ISO strings; no manual time arithmetic anywhere.
- Route handlers: `GET /api/booking/rooms` (revalidate about 300 seconds) and `GET /api/booking/availability` (`no-store`; validates `date`, `partySize`, optional `roomId`; 400 with the error envelope shape on bad input). Both call `activeProvider`. The client island fetches only these routes and never imports the provider.
- The page (server component) awaits `getRooms()` and today's availability from the provider directly, plus `getSiteSettings()` for the phone, and passes them to the island as initial data, so first paint is populated without a client fetch.

### 5.8 Responsive and accessibility
- Verified at 1440 and 390. The summary column stacks below 1024px; strips scroll horizontally below 900px; the slot grid narrows naturally; SlotChip price wraps beneath the time below 560px.
- All chips are buttons with `aria-pressed`; date chips carry full date `aria-label`s; the summary is `aria-live="polite"`; every target is at least 44px; the whole panel is keyboard reachable in DOM order.
- Standard definition of done from CLAUDE.md applies (reduced motion, no console errors, no layout shift, dash check, lint and typecheck).

---

## 6. Open questions and hedges

| # | Question (with the vendor) | Working assumption in code | Hedge location |
|---|---|---|---|
| 1 | Guest access to rooms, pricing, availability without login (asked 2026-07) | B1 needs no auth because data is fixture backed; the gate question only decides where B2 places the sign in wall | Gate placement is a page level concern; no component bakes in an auth state |
| 2 | One reservation per 30 minute slot versus one reservation spanning a range (asked; the app books per slot) | Single slot selection | `BookingSelection` and SlotChip isolate the model; a duration control would join §5.3 without reshaping the page |
| 3 | Slot `priceCents` is pre tax | Show the price with the "Before GST and PST" detail | Two strings (summary detail, notes band); trivially removable |
| 4 | `expiresAt` semantics, what triggers `confirmed`, payment plans | Out of B1 scope | B3 |
| 5 | Booking window and same day cutoff | 14 day strip as a placeholder | The strip length is one constant in the island |
| 6 | A room type field (bay versus VIP versus VVIP) | Rooms carry names only; grouping is by room | If a type field lands, map it in the provider; the UI already groups per room |
| 7 | User metadata the vendor app expects at sign up (name fields, profile trigger), queued for round 2 | Sign up collects email and password only | A metadata field joins the §9.4 sign up form and the signUp call without reshaping anything |
| 8 | Forgot password (vendor app shows coming soon; SMTP and redirect registration pending, A3) | No recovery flow in B2 | A recovery route slots beside sign in when the vendor enables it |

---

## 7. B1 copy (exact strings)

All copy is dash free per the global rule. Placeholders are marked in their `detail` fields.

- Eyebrow: `Book a Bay`
- H1: `Choose your *time*.`
- Support: `Pick a date and party size to see open bays and times.`
- Timezone line: `All times Pacific.`
- Control labels: `Date` · `Party` · `Space` · space chip `All spaces`
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

B1 introduces no environment variables, no external calls, and no secrets. For planning only, do not add now: B2 brings `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; B3 brings `BOOKING_API_BASE_URL`. The vendor middleware and Supabase are never called from the browser at any phase, and the vendor's `sgsk_` key never appears in this repository in any form.

B2 adds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (dev project
values until the vendor's arrive; §9.2). B3 brings `BOOKING_API_BASE_URL`.

---

## 9. B2 · Auth spec

This section is the spec for the account surfaces; there is no mockup. Build from existing
primitives plus the one new primitive defined in §9.6, in the established language: noir ground,
ivory text, champagne accent, Cormorant display, Inter UI. No jade. No new tokens, easings, or
button styles.

### 9.1 Scope and posture

B2 ships auth infrastructure and the account pages with zero visible change to the existing
site: no header or nav edits, no `/book` changes, no gate anywhere. Gate placement waits on the
vendor's guest access answer and lands with B3. Until the vendor's project credentials arrive,
the app points at our own dev Supabase project configured for parity with the vendor app
(email and password provider on, Confirm email off); the swap to the vendor project is an env
value change plus the §9.9 smoke test, nothing more.

### 9.2 Environment

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, added to `.env.local`
(dev project values now, vendor values later) and documented in `.env.local.example` (the
repo's example-file convention). When the two values are absent, the session interceptor
passes through untouched and any actual auth use throws a clear error referencing this
section; the site never hard-depends on these values at build time. The publishable
key is public by design. No other Supabase variable is ever added; no secret or service key
exists in this repo in any form.

Parity assumptions from the vendor app: password sign in enabled, no email confirmation at
sign up. If `signUp` returns a user without a session, treat it as project misconfiguration:
surface the §9.7 config error and log the cause; do not build a confirmation wait screen.

### 9.3 Modules

- `src/lib/supabase/server.ts`: the server client factory on `cookies()`, plus a `getUser()`
  helper. The only place a Supabase client is created for request handling.
- `src/lib/supabase/session.ts`: `updateSession(request)` for the root request interceptor
  (Next names it `proxy.ts` on 16, `middleware.ts` before; use what the installed major
  documents). Inside it, nothing runs between `createServerClient` and the user fetch; code in
  that gap causes random sign outs (documented Supabase footgun).
- No browser Supabase client exists in B2. Every auth operation is a Server Action; the browser
  talks to our server only, for auth exactly as for booking data.
- Server Actions live in `src/app/(site)/account/actions.ts`: `signIn`, `signUp`, `signOut`,
  returning mapped errors per §9.7, redirecting on success.

### 9.4 Routes

All three: inside `(site)` (header and footer render as everywhere), `robots: noindex`, absent
from the sitemap, standard reveals, verified at 1440 and 390. Forms are narrow single-column
blocks (max width about 420px) under a news-pagehead-proportioned head.

- `/account/sign-in`: Eyebrow, H1, support line, Email and Password fields, solid submit,
  cross link to sign up. Honors `?next=` (internal paths only: must start with a single `/`,
  reject `//` and anything with a scheme). Visited while signed in: redirect to `next`, else
  `/account`.
- `/account/sign-up`: same shell; Email and Password (single field, microcopy per §9.7), solid
  submit, cross link to sign in. Same `next` behavior, same signed-in redirect.
- `/account`: requires a session; signed out visitors redirect to
  `/account/sign-in?next=/account`. Head plus `FactRows` (one Email row in B2), the §9.7
  reservations note line, and a ghost Sign Out button. B3 adds the reservations rows here.
- Cross links between sign in and sign up preserve `?next=` (URL encoded), so switching forms
  mid-flow never strands the return path.

### 9.5 Behavior

- Actions use the `useActionState` pattern: pending disables the submit (`aria-disabled`,
  reduced opacity on the existing solid variant, mirroring the Reserve button treatment) and
  errors render in the §9.6 error slot without losing field values.
- Success: sign in and sign up redirect to `next`, else `/account`; sign out redirects to `/`.
- `/account` reads the session via `getUser()` server side; it is dynamic by nature of
  `cookies()` and must not be forced static.
- Errors route to a field: the existing-account error renders under Email; credentials, weak
  password, rate limit, config, and fallback render under Password. Pending submits are also
  guarded against double fire; aria-disabled alone leaves a button clickable.

### 9.6 Field, the first text input primitive

`src/components/ui/Field.tsx`: label (9.5px tracked uppercase, mist), input (transparent
background, 1px `--hair` border, ivory 14px text, 44px minimum height, comfortable padding),
focus state swaps the border to champagne (the global focus-visible outline still applies for
keyboard), autofill repainted to noir-soft, and an error line beneath (champagne, 11.5px).
Champagne is the error color by ruling: the palette has no red and gains none. Password inputs
have no show toggle in B2 (backlog). Add a Field block to `/styleguide` alongside the other
primitives.

### 9.7 B2 copy (exact strings)

- Eyebrow, all three pages: `Your Account`
- Sign in H1: `Sign in.` · support: `Reserve bays and manage your bookings with one account.`
- Field labels: `Email` · `Password` · password microcopy (sign up only): `At least 6 characters.`
- Sign in submit: `Sign In` · cross link: `New here? Create an account.`
- Sign up H1: `Create your account.` · support: `Set up once. Reserve bays and manage your
  bookings in one place.`
- Sign up submit: `Create Account` · cross link: `Already with us? Sign in.`
- Account H1: `Your account.` · reservations note: `Your reservations will appear here once
  online booking opens.` · sign out button: `Sign Out`
- Errors: invalid credentials `That email and password do not match. Try again.` · existing
  account `An account with this email already exists. Sign in instead.` · weak password
  `Passwords need at least 6 characters.` · rate limited `Too many attempts. Wait a moment and
  try again.` · config (no session after sign up) `Sign up is not available right now. Please
  try again later.` · fallback `Something went wrong. Please try again.`
- Page titles: Sign In · Create Account · Your Account.

### 9.8 Security posture

The `next` parameter is sanitized as in §9.4. Passwords never appear in logs, errors, or
console output. Rate limiting is Supabase's default. Cookie handling is `@supabase/ssr`
default; do not override.

### 9.9 Done criteria and smoke test

CLAUDE.md definition of done, plus this walkthrough, which is also the smoke test rerun on the
day the vendor credentials replace the dev values: sign up with a fresh email lands on
`/account` showing that email; sign out lands on `/`; sign in with the wrong password shows the
credentials error and keeps the email value; sign in succeeds; visiting a sign-in URL with
`?next=/book` returns to `/book` after auth; visiting sign in while authed redirects away;
both auth pages carry noindex and the sitemap is unchanged; session survives a reload and a
dev server restart; the refresh helper matches the documented pattern (reviewed, since token
expiry cannot be waited out in QA).