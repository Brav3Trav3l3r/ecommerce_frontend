# Ecommerce Frontend

React 19 + TypeScript + Vite frontend for an ecommerce store. This is the frontend layer for the [ecommerce-backend](https://github.com/Brav3Trav3l3r/ecommerce-backend).

## Tech stack

- **React 19** with TypeScript
- **Vite** for bundling and dev server
- **shadcn/ui** (radix-vega style, neutral base) for components
- **Tailwind CSS v4** via `@tailwindcss/vite` — configured through CSS variables, not `tailwind.config.js`
- **lucide-react** for icons

## Getting started

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
```

The backend API must be running at `http://localhost:3000`. See `API.md` for endpoint reference.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npm run format       # Prettier (writes in place)
npm run typecheck    # tsc --noEmit
npm run preview      # preview production build
```

## Adding UI components

```bash
npx shadcn add <component>
```

Components are placed in `src/components/ui/` and imported via the `@/` path alias:

```tsx
import { Button } from "@/components/ui/button"
```

## Project structure

```
src/
  components/    # shared and page-level components
  context/       # React context providers (auth, theme)
  lib/           # utilities (cn(), API helpers)
  pages/         # route-level page components
  main.tsx       # app entry point
```

## Auth

The backend uses header-based auth — no cookies or JWT tokens. Requests include `X-User-Id` for user actions and `X-Admin-Key` for admin routes.

## Theme

Dark/light/system theme is managed by `ThemeProvider` in `src/main.tsx`. Toggle with the `d` keyboard shortcut. Dark mode is applied by toggling `.dark` on `<html>`. CSS variables live in `src/index.css` under `@theme inline`.

Design tokens and typography rules are defined in `DESIGN.md`.
