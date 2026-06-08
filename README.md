# LFA Investment OS

Premium advisor-led investment strategy and portfolio oversight portal for Lodestone Family Advisors.

**Demo client:** Atwater Family Office — $47.3M AUM (illustrative data only)

> This is NOT a robo-advisor. All content requires advisor review. Mock data only.

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

```bash
cd lfa-investment-os
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the dashboard.

## Build

```bash
npm run build
npm run lint
```

## Mock Data

All demo data is in `lib/mock-data.ts`. No API keys or backend required.

## Routes

| Path | Page |
|------|------|
| `/dashboard` | Main dashboard |
| `/strategy` | Investment strategy |
| `/strategy/wizard` | Strategy wizard |
| `/ips` | Investment Policy Statement |
| `/portfolio` | Holdings table |
| `/allocation` | Allocation analysis |
| `/liquidity` | Liquidity analysis |
| `/risk` | Risk assessment |
| `/investments` | Investment tracking |
| `/diligence` | Due diligence tracker |
| `/meetings` | Meeting schedule |
| `/documents` | Document vault |
| `/settings` | Settings |

## Tech Stack

Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui · Recharts
