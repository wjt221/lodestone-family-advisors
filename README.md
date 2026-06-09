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

## Run it locally

```bash
cd lfa-investment-os
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — `/` redirects to the Command Center.

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

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts.

See [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md) for the full spec, [`UX_REVIEW.md`](UX_REVIEW.md)
for the refactor rationale, and [`CLAUDE.md`](CLAUDE.md) for build conventions.
