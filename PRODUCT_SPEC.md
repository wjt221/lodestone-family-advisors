# LFA Investment OS — Product Specification

## Vision

LFA Investment OS is a premium, advisor-led investment strategy and portfolio oversight portal for Lodestone Family Advisors. It provides ultra-high-net-worth family office clients with a centralized view of their investment strategy, portfolio holdings, and advisory relationship — all under the direct guidance of their advisor.

**This is NOT a robo-advisor.** Every piece of content is a discussion framework that requires advisor review and approval before any action is taken.

---

## Routes & Descriptions

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Main overview: AUM summary, asset allocation donut, performance metrics, upcoming meetings, activity feed |
| `/strategy` | Investment strategy overview with advisor-drafted framework |
| `/strategy/wizard` | Multi-step guided wizard to draft a strategy framework for advisor review |
| `/ips` | Investment Policy Statement viewer: objectives, risk tolerance, target allocation, restrictions |
| `/portfolio` | Full holdings table with values, allocation percentages, and categories |
| `/allocation` | Allocation analysis: current vs. IPS target, visual bar charts |
| `/liquidity` | Liquidity analysis: tiered liquidity profile (T0–T4) per holding |
| `/risk` | Risk assessment: factor scores across market, liquidity, concentration, credit, manager risk |
| `/investments` | Investment tracking table: vintage, current value, status per holding |
| `/diligence` | Due diligence tracker: status, analyst, notes per investment |
| `/meetings` | Meeting schedule: upcoming and past advisory meetings |
| `/documents` | Document vault: IPS, reports, diligence memos, planning documents |
| `/settings` | Account settings, entity list, compliance notice |

---

## Compliance Rules (CRITICAL)

1. **Not a robo-advisor.** The system never auto-recommends investments.
2. All actionable or analytical content must carry one of these labels:
   - `Draft for Advisor Review`
   - `Discussion Point`
   - `Proposed Framework`
   - `Requires Advisor Approval`
3. No investment advice language. No buy/sell recommendations.
4. All figures are labeled "illustrative" or "mock data."
5. Footer on every page: reminder that content requires advisor review.

---

## Demo Client: Atwater Family Office

**AUM:** $47.3M (illustrative)  
**Advisor:** Sarah Chen, CFA  

**Entities:**
- Atwater Holdings LLC
- Atwater Family Trust
- Atwater Investment Partnership LP

**Holdings (must sum to 100% / $47.30M):**

| Holding | Category | % | Value |
|---------|----------|---|-------|
| Cash Reserve | Liquid | 8% | $3.78M |
| Municipal Bond Portfolio | Fixed Income | 15% | $7.10M |
| Public Equity Portfolio | Public Equity | 28% | $13.24M |
| Private Credit Fund I | Private Credit | 12% | $5.68M |
| Industrial Services Direct Investment | Direct Investment | 10% | $4.73M |
| Real Estate Partnership | Real Assets | 14% | $6.62M |
| Venture Fund II | Venture / PE | 7% | $3.31M |
| Roofing Platform Investment | Direct Investment | 6% | $2.84M |

---

## Roadmap

### Phase 1: Shell & Mock Data (Complete)
- Next.js App Router + TypeScript + Tailwind + shadcn/ui + Recharts
- All routes with placeholder pages
- Centralized mock data (`lib/mock-data.ts`)
- Sidebar navigation with active state
- Dashboard with AUM card, donut chart, performance, meetings, activity feed
- Compliance badges throughout

### Phase 2: Strategy Tools
- Strategy wizard with save/draft workflow
- IPS editing with version history
- Allocation rebalancing scenario tool (labeled "Proposed Framework")
- Risk attribution breakdown
- Liquidity waterfall chart

### Phase 3: Document Vault & Reporting
- Document upload and categorization
- PDF viewer
- Quarterly report generation (PDF export)
- Meeting notes editor with action items
- Advisor approval workflow for drafts
- Multi-entity consolidated view
