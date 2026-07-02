# CLAUDE.md · GreenTee Richmond Center Web

Next.js (App Router) + TypeScript + Tailwind v4 + Sanity + Vercel. Premium **indoor golf club** site in the GreenTee Country Club family. English only. v1 ships Home and `/dining`.

## Sources of truth, in order
1. `docs/design.md` (architecture and page specs)
2. `docs/mockups/home-v9.html` and `docs/mockups/dining-v2.html` (page mockups)
3. This file (working rules)

If code and docs disagree, docs win. If the two docs disagree, ask before proceeding.

## The mockup contract
`docs/mockups/home-v9.html` (Home) and `docs/mockups/dining-v2.html` (Crystal Jade Palace) define the look, motion, and copy tone of their pages. Treat them as the spec, not as source code.

- **Port, never paste.** Rebuild it as typed React components following the component map in `docs/design.md` §9.3. Never import, iframe, or copy the mockup wholesale.
- **Match exactly**: design tokens, spacing rhythm, easing curves and durations, gradient recipes, and the canvas parameters in `docs/design.md` §7.3.
- **Improve freely**: accessibility, performance, semantics, decomposition. No approval needed.
- **Ask first** before any other visible visual or copy change.
- Mockup copy is production copy unless it is an obvious placeholder (pricing, address, phone, "Replace with final photography" tags).
- Base64 images inside the mockup are mockup-only. Production images go through Sanity CDN via `<SanityImage>`.
- Never edit the mockup file as a form of implementation. It is read-only reference.

### Mockup notes (home v9 · dining v2)
- The mockups already reflect the docs: no membership, no "media art" wording, Book a Bay CTAs, the News & Offers editorial index, the mobile FullMenu, the family and network footer links, and the dining page with its left section rail, scroll spy, and dish filter.
- The header shows the v1 menu (News & Offers · Dining). The target IA of docs §3.4 joins as routes ship.
- The News & Offers entries are sample content. Production is CMS-driven and the section renders nothing when empty (docs §4.2).
- The announcement bar is not in the mockups; build it from docs §4.2.
- Cross-links between the two mockup files stand in for the real `/` and `/dining` routes.

## Hard design rules
- **Indoor golf leads.** Page copy and structure surface bays, coaching, putting, and year-round play before decor storytelling.
- Background `--color-noir`, primary text `--color-ivory`. Champagne is the only global accent.
- Space accent colors are scoped to their own section or page. Jade + gold belongs to Crystal Jade Palace content only.
- Type: Cormorant Garamond for display, Inter for body and UI. No other fonts.
- Buttons only via `<Button variant="solid" | "ghost" | "light">`. No new button styles.
- All entrance motion via `src/components/motion` presets; generative visuals only via `src/components/canvas`. No ad-hoc keyframes or inline GSAP timelines in sections.
- No literal flower, petal, or leaf illustrations. No regular repeating decorative patterns; organic curves must be irregular (incommensurate frequencies).
- English only. Never use the em dash in copy. No exclamation points anywhere in Crystal Jade Palace copy.
- Every image renders through `<SanityImage>` (production) or `<PhotoFrame>` (placeholder). Never a bare `<img>`.

## Responsive rules (summary of docs §8)
- Verify every UI task at 1440 and 390. Reference widths: 390 / 768 / 1024 / 1440.
- Full-height sections use `100svh`; sticky elements respect safe-area insets; no horizontal overflow at any width.
- Touch targets at least 44px. Hover effects (magnetic, zoom, previews) gated behind `(hover: hover) and (pointer: fine)`.
- Journey stacks vertically on mobile; `/dining` rail becomes a chip bar below 1024px; header collapses to hamburger + FullMenu.
- Canvas modules cap devicePixelRatio and reduce particle counts on small screens per docs §7.3.

## Clean code principles

### SOLID, as it applies here
- **Single responsibility**: one component, one job. Pages compose sections, sections compose primitives. Presentational components never fetch data.
- **Open/closed**: extend through props and variants (discriminated unions, or cva for class variants). Never duplicate a component to tweak it.
- **Liskov substitution**: every variant is a drop-in substitute; a variant may not add required props or change the semantics of the base contract.
- **Interface segregation**: small, purpose-built prop interfaces. No god config objects, no boolean-flag explosions; split the component instead.
- **Dependency inversion**: sections depend on domain types in `src/types`, never on raw GROQ shapes. Query-to-domain mapping lives in `src/sanity/lib/queries.ts` only.

### Reuse rules
- Search `src/components` before creating anything. Extend what exists.
- The same JSX pattern appearing twice gets extracted. Distinct section layouts are still built from shared primitives (`PhotoFrame`, `Eyebrow`, hairline rules).
- A component past roughly 150 lines, or holding three or more responsibilities, gets split.
- Shared behavior becomes a hook: `usePrefersReducedMotion`, `useCanvasLoop` (IntersectionObserver + visibilitychange pause), `useMagnetic`, `useScrollSpy` (dining rail).
- No repeated hand-written class strings for the same pattern; tokens only, no magic hex in components.

## Conventions
- Server Components by default. `'use client'` only at leaves that need interaction, motion, or canvas.
- TypeScript strict, no `any`. Named exports. One component per file.
- Data flows through `src/sanity/lib/fetch.ts` with cache tags (`home`, `space`, `restaurant`, `dish`, `event`, `promotion`, `news`, `settings`). Never call Sanity from a client component. No secrets in client bundles.
- Time-boxed content (`promotion`) is filtered by `activeFrom` / `activeTo` in the query, never in the component.
- Tailwind class order via prettier-plugin-tailwindcss.
- Commit gate: `pnpm lint && pnpm typecheck` must pass.

## Definition of done, for every UI task
- Matches the mockup at 1440 and 390.
- Reduced-motion path verified; canvases hidden or static.
- Keyboard focus visible; FullMenu focus trap works; decorative canvases `aria-hidden`.
- No console errors or warnings; no layout shift on load; Home hero LCP unaffected.
- Empty states handled (News & Offers renders nothing when there is no content).
- Lint and typecheck pass.

## Prompting playbook
Scope every request to one section or component. Reference the spec (doc section + mockup selector). State done-criteria.

Template:
```
Implement <ComponentName> per docs/design.md §<n> and mockup <selector>.
- <key behaviors, desktop and mobile>
- Data: <static mock path | Sanity query + tag>
Done: matches spec, 1440 + 390 verified, reduced-motion fallback, lint/typecheck pass.
```

Examples:
```
Implement <SpacesJourney> per docs/design.md §5.1 (S3) and mockup #journey.
- Desktop: pinned horizontal scrub, snap per panel, tint crossfade, progress bar + index label
- Mobile: vertical stack, no pin
- Data: static from src/lib/mock/spaces.ts for now
Done: matches spec, 1440 + 390 verified, reduced-motion fallback, lint/typecheck pass.
```
```
Port the Home page shell per docs/design.md §5 and the mockup, stubbing <NewsOffersTeaser>
so it renders the sample cards now and an empty state when the CMS returns nothing.
Done: section order matches §5.1, 1440 + 390 verified, lint/typecheck pass.
```

## Never
- Membership sections, tiers, or membership language
- The term "media art" in UI copy
- White background sections, card shadows, gradient buttons, emojis in UI
- New colors, fonts, easing curves, or button styles outside the tokens and presets
- Regular repeating decorative patterns or literal florals
- Editing `docs/mockups/home-v5.html`
- Client-side Sanity calls; fetching inside presentational components
- Shipping a section without its reduced-motion, mobile, and empty-state paths
