# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npm run format       # Prettier (writes in place)
npm run typecheck    # tsc --noEmit
npm run preview      # preview production build
```

No test suite exists yet on the frontend.

## Architecture

This is a React 19 + TypeScript frontend for an ecommerce store, scaffolded with Vite. The backend API is documented in `API.md` — it runs on `http://localhost:3000` and uses `X-User-Id` / `X-Admin-Key` headers for auth (no cookies/tokens).

**Entry point:** `src/main.tsx` wraps `<App>` in `<ThemeProvider>`, which handles dark/light/system theme via `localStorage` and a `d` keyboard shortcut to toggle.

**UI stack:**
- shadcn/ui (style: `radix-vega`, base color: `neutral`) — add components with `npx shadcn add <component>`
- Tailwind CSS v4 via `@tailwindcss/vite` — configured through CSS variables in `src/index.css`, not `tailwind.config.js`
- `lucide-react` for icons
- `cn()` utility at `src/lib/utils.ts` (`clsx` + `tailwind-merge`)

**Path alias:** `@/` resolves to `src/`.

**Theme:** CSS variables are defined in `src/index.css` under `@theme inline`. Dark mode is applied by toggling `.dark` on `<html>` (custom variant: `&:is(.dark *)`).

## Design spec

`DESIGN.md` defines the visual language for this project — dark background (`#050505`), white primary text, Inter for display/body, JetBrains Mono for labels/metadata. Follow those color tokens and typography rules when building new UI.

## Backend

The backend (separate repo/process) exposes a REST API at `localhost:3000`. Seeded products are p1–p5 (T-Shirt, Jeans, Sneakers, Cap, Hoodie). See `API.md` for full endpoint reference including cart, checkout, discount validation, and admin routes.
