// Pure portfolio aggregations over data-layer holdings. Unlike lib/calculations.ts
// (which is bound to the demo mock data), every function here takes its inputs as
// arguments, so pages render correctly from whatever the data layer returns.

import type { HoldingView } from "@/lib/data/holdings";

const PALETTE: Record<string, string> = {
  // demo classes
  "Cash & Reserves": "#8A94A6",
  "Fixed Income": "#3E5C82",
  "Public Equity": "#2C3E54",
  "Private Credit": "#8A6D3B",
  "Real Assets": "#5C7A6B",
  "Private Equity & Venture": "#6B5B7B",
  "Direct / Operating": "#A8763E",
  // live classes
  "Cash & Fixed Income": "#8A94A6",
  "Public Market Equities": "#2C3E54",
  "Private Equity": "#6B5B7B",
  "Real Estate": "#5C7A6B",
  Infrastructure: "#3E5C82",
  "Hedge Funds": "#A8763E",
};
const FALLBACK_COLORS = ["#8A94A6", "#3E5C82", "#2C3E54", "#8A6D3B", "#5C7A6B", "#6B5B7B", "#A8763E"];

export function colorFor(label: string): string {
  if (PALETTE[label]) return PALETTE[label];
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

export interface BreakdownRow {
  label: string;
  value: number;
  pct: number;
  count: number;
  color: string;
}

export function totalValue(holdings: HoldingView[]): number {
  return holdings.reduce((s, h) => s + h.value, 0);
}

export function breakdownBy(
  holdings: HoldingView[],
  key: (h: HoldingView) => string | null | undefined,
): BreakdownRow[] {
  const total = totalValue(holdings) || 1;
  const map = new Map<string, { value: number; count: number }>();
  for (const h of holdings) {
    const label = key(h) || "Unclassified";
    const cur = map.get(label) ?? { value: 0, count: 0 };
    cur.value += h.value;
    cur.count += 1;
    map.set(label, cur);
  }
  return [...map.entries()]
    .map(([label, { value, count }]) => ({
      label,
      value,
      count,
      pct: (value / total) * 100,
      color: colorFor(label),
    }))
    .sort((a, b) => b.value - a.value);
}

export function marketMixOf(holdings: HoldingView[]) {
  const total = totalValue(holdings) || 1;
  const publicValue = holdings.filter((h) => h.market === "Public").reduce((s, h) => s + h.value, 0);
  return {
    publicValue,
    privateValue: total - publicValue,
    publicPct: (publicValue / total) * 100,
    privatePct: ((total - publicValue) / total) * 100,
  };
}

export function illiquidPctOf(holdings: HoldingView[]): number {
  const total = totalValue(holdings) || 1;
  const illiquid = holdings
    .filter((h) => h.liquidity === "Multi-Year" || h.liquidity === "Illiquid")
    .reduce((s, h) => s + h.value, 0);
  return (illiquid / total) * 100;
}

export function totalUnfundedOf(holdings: HoldingView[]): number {
  return holdings.reduce((s, h) => s + (h.unfunded ?? 0), 0);
}

export function totalCommitmentOf(holdings: HoldingView[]): number {
  return holdings.reduce((s, h) => s + (h.commitment ?? 0), 0);
}

export interface OwnerExposure {
  owner: string;
  value: number;
  pct: number;
  positions: number;
  byClass: BreakdownRow[];
  color: string;
}

/**
 * Look-through exposure per owner: each holding's value is attributed to its
 * owners at their ownership percentages (e.g. a Scorpio holding contributes
 * 70% of its value to Kim and 30% to Cindy).
 */
export function ownerLookThrough(holdings: HoldingView[]): OwnerExposure[] {
  const total = totalValue(holdings) || 1;
  const map = new Map<string, { value: number; positions: number; classes: Map<string, number> }>();
  for (const h of holdings) {
    const owners = h.owners.length ? h.owners : [{ name: "Unattributed", pct: 100 }];
    for (const o of owners) {
      const slice = (h.value * o.pct) / 100;
      const cur = map.get(o.name) ?? { value: 0, positions: 0, classes: new Map() };
      cur.value += slice;
      cur.positions += 1;
      cur.classes.set(h.assetClass, (cur.classes.get(h.assetClass) ?? 0) + slice);
      map.set(o.name, cur);
    }
  }
  return [...map.entries()]
    .map(([owner, { value, positions, classes }]) => ({
      owner,
      value,
      positions,
      pct: (value / total) * 100,
      color: colorFor(owner),
      byClass: [...classes.entries()]
        .map(([label, v]) => ({
          label,
          value: v,
          count: 0,
          pct: value ? (v / value) * 100 : 0,
          color: colorFor(label),
        }))
        .sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);
}

export interface RangeRow {
  assetClass: string;
  current: number;
  min: number;
  target: number;
  max: number;
  varianceFromTarget: number;
  status: "Within range" | "Below range" | "Above range";
}

export function rangeRows(
  holdings: HoldingView[],
  ranges: { assetClass: string; min: number; target: number; max: number }[],
): RangeRow[] {
  const total = totalValue(holdings) || 1;
  return ranges.map((r) => {
    const value = holdings.filter((h) => h.assetClass === r.assetClass).reduce((s, h) => s + h.value, 0);
    const current = (value / total) * 100;
    const status: RangeRow["status"] =
      current < r.min ? "Below range" : current > r.max ? "Above range" : "Within range";
    return { assetClass: r.assetClass, current, min: r.min, target: r.target, max: r.max, varianceFromTarget: current - r.target, status };
  });
}
