# Spend — Personal Expense Tracker

A local-first, dark-glass expense tracker built with **Next.js 16**, **Tailwind CSS 4** and **Framer Motion**. Every number, chart and card is animated; all data stays in your browser.

![stack](https://img.shields.io/badge/Next.js-16-black) ![style](https://img.shields.io/badge/Tailwind-4-38bdf8) ![motion](https://img.shields.io/badge/Framer_Motion-14-8b7cff)

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

> The app seeds ~100 realistic demo expenses on first launch so the dashboard is alive immediately. Clear them anytime in **Settings → Clear everything**.

## Features

- **Dashboard** — animated stat cards with count-ups and month-over-month deltas, a hand-rolled 14-day "spending pulse" SVG area chart with hover tooltips, budget health ring, recent activity, auto-written insight summary and an at-a-glance metrics card.
- **Transactions** — searchable, filterable (category / method), sortable history grouped by day with day totals; tap any row to edit; press <kbd>N</kbd> anywhere to log an expense.
- **Analytics** — interactive category donut (hover segments, animated legend bars), six-month rhythm bars, weekday spending pattern, five largest expenses.
- **Budgets** — overall monthly limit with pace tracking ("spending ahead of pace") plus per-category envelopes with animated progress, over-budget states and inline editing.
- **Settings** — instant currency switching (USD / EUR / GBP / INR / AED / JPY via `Intl.NumberFormat`), sample data, JSON export, full wipe.

## Architecture — module-driven

Feature modules own their domain; `app/` is a thin routing shell; `shared/` holds the design system and cross-cutting utilities. Dependencies only ever point inward: `app → modules → shared`.

```
src/
├── app/                      # Next.js App Router — routing shell only
│   ├── layout.tsx            #   fonts, metadata, providers
│   ├── app-frame.tsx         #   composition root (chrome + sheet + shortcuts)
│   ├── providers.tsx         #   store rehydration + first-run seeding
│   └── <route>/page.tsx      #   5 pages, each composing modules
├── modules/
│   ├── expenses/             # domain core: types, zustand store (persisted),
│   │   ├── components/       #   add/edit sheet, list, rows, filters
│   │   └── utils/            #   aggregation engine, demo generator
│   ├── dashboard/components/ # stat cards, pulse chart, rings, insight
│   ├── analytics/components/ # donut, trend, weekday, top expenses
│   ├── budgets/components/   # envelope board, pacing
│   ├── categories/           # category registry (icon + color per id)
│   └── settings/components/  # currency, data management
└── shared/
    ├── components/           # glass cards, sidebar, topbar, month switcher,
    │                         # animated numbers, boot screen, dialogs
    ├── lib/                  # money (Intl), dates, motion presets, nav, cn
    └── store/                # UI state (selected month, sheet)
```

**State** — one persisted Zustand store (`modules/expenses/store.ts`) with `skipHydration` + explicit rehydrate to stay SSR-safe; a boot screen covers the hydration gap.

**Design system** — dark glassmorphism tuned for finance: layered aurora backdrop with film grain, frosted cards (`backdrop-blur` + 1px light borders), Inter for UI and JetBrains Mono with tabular numerals for every figure. Motion follows one language: expo-out entrances, springs for interactive state, `prefers-reduced-motion` respected globally.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
