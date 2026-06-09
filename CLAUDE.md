@AGENTS.md

# LFA Investment OS — Build Instructions

## Tech Stack
- **Framework:** Next.js App Router (latest), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts
- **Icons:** lucide-react
- **No backend** — mock data only, no API keys required

## Commands
```bash
cd lfa-investment-os
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (must pass before committing)
npm run lint     # ESLint check (must pass before committing)
```

## Compliance Rules (NEVER SKIP)
1. This is NOT a robo-advisor — never add auto-recommendation language.
2. Every analytical/actionable page must show a `<ComplianceBadge>` variant:
   - `draft` → "Draft for Advisor Review"
   - `discussion` → "Discussion Point"
   - `proposed` → "Proposed Framework"
   - `requires-approval` → "Requires Advisor Approval"
3. All figures must be labeled "illustrative" or "mock data."
4. No investment advice language anywhere.

## Data Layer (Supabase + mock fallback)
The app has two modes, selected by `isSupabaseConfigured()` (`lib/supabase/config.ts`):
- **Demo mode** (no env vars): mock data, no auth.
- **Secure mode** (`NEXT_PUBLIC_SUPABASE_*` set): Supabase Auth + Postgres under RLS.

Rules:
- Pages must read through the data-access layer (`lib/data/*`), never branch on the
  mode themselves. Modules: `clients`, `holdings`, `portfolio`, `meetings`,
  `documents`, plus `session`. Each returns mock data in demo mode.
- Supabase clients: `lib/supabase/client.ts` (browser, anon), `server.ts` (server,
  anon + session), `admin.ts` (**service role, server-only, bypasses RLS — never
  import client-side**). All marked `server-only` where applicable.
- Auth: `/login`, `/auth/signout`; route protection in `proxy.ts` (Next 16 renamed
  `middleware` → `proxy`) via `lib/supabase/middleware.ts`.
- Schema + RLS: `supabase/migrations/001_initial_schema.sql`; demo data:
  `supabase/seed.sql`. Security model in `SECURITY.md`; tests in
  `supabase/RLS_TEST_PLAN.md`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or prefix it `NEXT_PUBLIC_`.
- Regenerate `lib/supabase/types.ts` with `supabase gen types` once a project exists.

## Mock Data Location
All demo data lives in `lib/mock-data.ts` (the source for demo mode):
- `CLIENT` — client name, advisor, AUM, entities
- `HOLDINGS` — 8 holdings with allocation %, value, color
- `PERFORMANCE` — YTD, 1Y, inception returns
- `MEETINGS` — upcoming and past meetings
- `DOCUMENTS` — document vault items
- `ACTIVITY_FEED` — recent activity
- `IPS_SUMMARY` — investment policy statement data

## Adding New Routes
1. Create `app/[route]/page.tsx`
2. Add a nav item to `components/sidebar.tsx` in the appropriate `NAV_GROUPS` entry
3. Use `<Header>` component for page titles
4. Add `<ComplianceBadge>` if the page contains analytical content

## Key Components
- `components/sidebar.tsx` — navigation sidebar (client component)
- `components/header.tsx` — page header with compliance badge
- `components/compliance-badge.tsx` — reusable compliance label
- `components/allocation-chart.tsx` — Recharts donut chart

## Project Structure
```
lfa-investment-os/
  app/
    layout.tsx          # Root layout with sidebar
    page.tsx            # Redirects to /dashboard
    dashboard/page.tsx  # Main dashboard
    strategy/page.tsx
    strategy/wizard/page.tsx
    ips/page.tsx
    portfolio/page.tsx
    allocation/page.tsx
    liquidity/page.tsx
    risk/page.tsx
    investments/page.tsx
    diligence/page.tsx
    meetings/page.tsx
    documents/page.tsx
    settings/page.tsx
  components/
    sidebar.tsx
    header.tsx
    compliance-badge.tsx
    allocation-chart.tsx
    ui/                 # shadcn/ui components
  lib/
    mock-data.ts        # All demo data
    utils.ts            # shadcn utility (cn)
```
