# CLAUDE.md · Crystal Jade Palace Web

Standalone Next.js (App Router) + TypeScript strict + Tailwind v4 site for
Crystal Jade Palace, the Cantonese fine dining restaurant at GreenTee Richmond
Center. Split out of the GreenTee site to live on its own domain, its own
Vercel project, and eventually its own Sanity project. English only; the
EN / 中文 indicator stays inert until human translation lands.

Routes: `/` (landing), `/story`, `/chef`, `/menu`, `/banquet`, `/reserve`.
These map one-to-one to the former GreenTee `/dining` and `/dining/*` pages.

## The standalone rule

This folder is a complete, self-contained project. It may temporarily sit
inside the GreenTee repo, but nothing in here may reference anything outside
this folder: no imports, no symlinks, no shared config, no workspace
membership. The extraction test is the contract: moving this folder anywhere
and running `npm install && npm run build` inside it must succeed unchanged.

- Package manager is **npm** with `package-lock.json`. Never pnpm or a
  workspace file in here, even though the parent repo uses pnpm.
- Code shared with the GreenTee site (tokens, primitives, motion) exists here
  as intentional duplication. Never "fix" that by importing across the
  boundary; copy and adapt.
- While nested, the parent repo excludes this folder from its tsconfig,
  eslint, and prettier. Keep it that way.

## Content accessor rule

All content flows through typed getters in `lib/content.ts` (backed by local
typed config for now). Components never hold copy, nav items, hours, prices,
or menu data inline, and never see a CMS type.

- **Sanity later**: a separate Sanity project (never the GreenTee one) will
  back `lib/content.ts` eventually. `NEXT_PUBLIC_SANITY_PROJECT_ID` and
  `NEXT_PUBLIC_SANITY_DATASET` are documented in `.env.example` and unused
  until then. When Sanity lands, only `lib/content.ts` changes; getter
  signatures hold, and no Sanity client or CMS type appears outside it.
- Client components never import from `lib/content.ts` directly; content and
  nav reach client leaves as props from a Server Component, so a future
  server-only CMS client inside the accessor can never break the client
  boundary.
- No database. No secrets in client bundles. No env vars beyond the two
  documented placeholders without a ruling.

## Reservations: OpenTable later

- `ReservationCta` is the single component for every reservation action
  (header button, hero, footer, contact). No ad-hoc reservation links.
- `lib/reservations.ts` defines a `ReservationProvider` interface; the current
  implementation is a simple link provider (tel: or contact anchor, from
  config). An OpenTable provider replaces it later.
- No component outside `lib/reservations.ts` may know which provider is
  active. Do not install any OpenTable SDK, embed, or script until that phase
  is explicitly opened.

## Design rules

The GreenTee dining mockups v6 (`docs/mockups/greentee-dining*.html`) define
the look, motion, and copy tone. They are read-only reference: port, never
paste, never edit them as a form of implementation. Mockup base64 images are
mockup-only. Cross-links between mockup files stand in for this site's routes
(`greentee-dining-story.html` means `/story`); links to other GreenTee pages
stand in for the main site's domain.

- Background `--color-noir`, primary text `--color-ivory`. Jade and jade-text
  are first-class accents here (the whole site is Crystal Jade content);
  champagne carries CTAs and hairlines as in the mockups.
- Type: Cormorant Garamond for display, Inter for body and UI. Chinese
  strings use the system `--zh` stack. No other fonts.
- Buttons only via the copied `Button` variants (`solid` | `ghost` | `light`,
  plus `sm`). No new button styles, no gradient buttons, no card shadows, no
  white background sections.
- Every image renders through the placeholder frame (`PhotoFrame`) until the
  Sanity image pipeline is wired; never a bare `<img>`, never stock imagery
  in a designed pending slot (chef portrait, dishes, private rooms).
- No literal florals, no regular repeating decorative patterns; grain only
  via the irregular fractal-noise overlay recipe.
- Copy: English only. Never an em dash or an en dash anywhere; write ranges
  as "2022 to 2025" and times as "6:00 to 6:30 PM". No exclamation points
  anywhere on this site. No membership language, no "media art".

## GSAP rules

- All GSAP work inside `useGSAP` (from `@gsap/react`) for scoped cleanup.
- `once: true` only inside the `scrollTrigger` config object, never as a
  tween-level property.
- Animate transforms and opacity, not `clip-path`, not layout properties.
- Pinned ScrollTriggers are a last resort; keep them minimal and always set
  `invalidateOnRefresh: true`.
- Call `ScrollTrigger.refresh()` after fonts load.
- `prefers-reduced-motion` disables entrance motion and scroll effects; the
  reduced path renders final values and is part of done for every section.

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`); exactly one `h1`
  per page.
- Nav and mobile menu fully keyboard operable: focus trap while the drawer is
  open, close on Escape and on route change, `aria-expanded` on the toggle.
- Visible focus states everywhere; decorative visuals `aria-hidden`.
- Touch targets at least 44px; hover effects gated behind
  `(hover: hover) and (pointer: fine)`.

## Conventions

- Server Components by default; `'use client'` only at leaves that need
  interaction or motion. TypeScript strict, no `any`. Named exports, one
  component per file. Components past roughly 150 lines or three
  responsibilities get split. Search `components/` before creating anything.
- Verify every UI task at 1440 and 390. No horizontal overflow at any width.
- Commit gate: `npm run lint && npm run typecheck` must pass.
