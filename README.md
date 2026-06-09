# Lodestone Family Advisors — Investment OS

An advisor-led **investment strategy, governance, and portfolio oversight portal** for
Lodestone Family Advisors. It is designed to feel like a premium private family-office
portal — an *Investment Operating System*, not a portfolio tracker.

**Demo client:** Family Office — $47.3M illustrative AUM across three entities.

> **Not a robo-advisor.** The app never auto-recommends, buys, or sells. Every analytical
> output is framed as a review item for the advisor and Investment Committee. All figures
> are illustrative mock data — nothing here is investment advice.

## What it answers

The product is organised around the questions a serious family office should always be
able to answer: Are objectives clear? Is the liquidity reserve right? Is risk being taken
intentionally? Is the portfolio aligned? Are we avoiding avoidable mistakes? Are capital
decisions disciplined? Are commitments, managers, and risks tracked? Are decisions
documented and reviewed?

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- npm 9+
- (Optional, for secure mode) a Supabase project

## Run it locally

```bash
cd lfa-investment-os
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — `/` redirects to the Command Center.

With no environment variables set, the app runs in **demo mode** (mock data, no
login). To enable **secure mode** (Supabase auth + real data under RLS), see below.

## Data modes

| Mode | When | Behavior |
|------|------|----------|
| **Demo** | Supabase env vars absent | Mock data only, no auth. Default for local dev. |
| **Secure** | `NEXT_PUBLIC_SUPABASE_*` set | Supabase Auth required; data read under Row-Level Security. |

Pages read through a data-access layer (`lib/data/*`) that selects the source
automatically — they never branch on the mode themselves. See
[`SECURITY.md`](SECURITY.md) for the full security model.

## Supabase setup (secure mode)

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Apply the schema.** In the SQL editor (or `supabase db push`), run:
   - `supabase/migrations/001_initial_schema.sql` — tables, roles, RLS policies.
   - `supabase/seed.sql` — illustrative Atwater Family Office data.
3. **Create users** under Authentication → Users, then link them to roles/clients
   using the snippet at the bottom of `supabase/seed.sql` (make one `admin`, assign
   an `advisor`, add a `client` user).
4. **Configure local env.** Copy `.env.example` to `.env.local` and fill in the two
   public values from Project Settings → API:

   ```bash
   cp .env.example .env.local
   # NEXT_PUBLIC_SUPABASE_URL=...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   # SUPABASE_SERVICE_ROLE_KEY=  (leave blank unless running server-side admin tasks)
   ```

5. **Create private Storage buckets** (do **not** make them public):
   `client-documents`, `ips-documents`, `diligence-documents`. Add Storage RLS
   policies before uploading real files (see `SECURITY.md`).
6. `npm run dev` — you'll now be required to sign in at `/login`.

> ⚠️ **Do not load real client data until the [RLS test plan](supabase/RLS_TEST_PLAN.md)
> passes.** This build is security scaffolding and has not been penetration-tested.

## Deploying to Vercel

Set these in **Project → Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase | public, safe in browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase | public, protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase | **secret** — encrypted, server-only, un-prefixed; optional |

Never prefix the service-role key with `NEXT_PUBLIC_` and never use it in client
code. If it is not needed, leave it unset.

## Build & checks

```bash
npm run lint     # ESLint — must pass
npm run build    # production build — must pass
```

## Routes

| Path | Page | Purpose |
|------|------|---------|
| `/dashboard` | Command Center | What needs attention: review queue, alignment, liquidity, risk, decisions |
| `/strategy` | Strategy | Structured discovery & governance process with completion, open questions, missing inputs |
| `/strategy/wizard` | Discovery Workspace | Guided, multi-step discovery (drafts for advisor review) |
| `/ips` | Policy Statement | Document-style IPS draft with approval workflow and advisor notes |
| `/portfolio` | Portfolio | Oversight through four lenses: class, liquidity, market, entity + watch items |
| `/allocation` | Allocation | Positioning against policy *ranges* with variance and discussion points |
| `/liquidity` | Liquidity | 12/24/36-month obligation coverage and capital-call planning |
| `/risk` | Risk Register | Family-office risk factors with a prioritized review queue |
| `/investments` | Pipeline | Investment Committee pipeline with merits, risks, fees, terms, decisions |
| `/diligence` | Diligence | Manager/deal diligence tracker with workstreams and decision gates |
| `/meetings` | Meetings | Governance cadence and a documented decision log |
| `/documents` | Documents | Document vault grouped by category with review status |
| `/settings` | Settings | Relationship, advisory team, legal entities, disclosures |

## Mock data & calculations

- All demo data lives in [`lib/mock-data.ts`](lib/mock-data.ts) — the single source of truth.
- All derived metrics (allocation lenses, policy variance, liquidity coverage,
  concentration, fees) live in [`lib/calculations.ts`](lib/calculations.ts).
- No API keys, secrets, or backend required.

## Design system

- **Warm paper + ink** foundation with a single restrained **brass** accent.
- **Fraunces** serif for editorial headings and key figures; **Geist** sans for UI and
  tabular financial data.
- Hairline-bordered `Panel` surfaces, a restrained `StatusPill` vocabulary, and a
  `ReviewFlag` pattern for "what needs attention."

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Recharts · Supabase (Auth + Postgres + RLS, optional).

See [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md) for the full spec, [`UX_REVIEW.md`](UX_REVIEW.md)
for the refactor rationale, and [`CLAUDE.md`](CLAUDE.md) for build conventions.
