# Crystal Jade Palace

Standalone website for Crystal Jade Palace, the Cantonese fine dining
restaurant at GreenTee Richmond Center. Next.js (App Router), TypeScript
strict, Tailwind v4.

This folder is temporarily nested inside the GreenTee repo but is fully
self-contained: it has its own `package.json`, npm lockfile, and configs, and
imports nothing from outside the folder. It will move to its own repository,
its own Vercel deployment, and its own Sanity project. The extraction test:
move this folder anywhere and `npm install && npm run build` succeeds
unchanged.

## Scripts

```
npm run dev          # local dev server
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier --write .
```

## Environment

None required today. `.env.example` documents the two Sanity placeholders
(`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`); they stay
unused until the separate Crystal Jade Sanity project is wired into
`lib/content.ts`.

## Architecture notes

- All content flows through typed getters in `lib/content.ts`; components
  never hold copy or see CMS types. See `CLAUDE.md` for the working rules
  (standalone rule, content accessor, Sanity-later, OpenTable-later, GSAP,
  accessibility).
