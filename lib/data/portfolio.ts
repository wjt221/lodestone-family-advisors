import "server-only";

// Portfolio-level reads. Composes holdings into the summary figures the UI shows.
// Derivations operate on whatever holdings the data layer returns, so they are
// correct in both demo and secure modes.

import type { Holding } from "@/lib/mock-data";
import { getHoldings } from "./holdings";

export interface PortfolioSummary {
  holdings: Holding[];
  totalValue: number;
  publicPct: number;
  privatePct: number;
  illiquidPct: number;
  unfundedTotal: number;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const holdings = await getHoldings();
  const totalValue = holdings.reduce((s, h) => s + h.value, 0) || 1;

  const publicValue = holdings
    .filter((h) => h.market === "Public")
    .reduce((s, h) => s + h.value, 0);
  const illiquidValue = holdings
    .filter((h) => h.liquidity === "Multi-Year" || h.liquidity === "Illiquid")
    .reduce((s, h) => s + h.value, 0);
  const unfundedTotal = holdings.reduce((s, h) => s + (h.unfunded ?? 0), 0);

  return {
    holdings,
    totalValue,
    publicPct: (publicValue / totalValue) * 100,
    privatePct: ((totalValue - publicValue) / totalValue) * 100,
    illiquidPct: (illiquidValue / totalValue) * 100,
    unfundedTotal,
  };
}
