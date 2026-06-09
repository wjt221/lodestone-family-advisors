// ─────────────────────────────────────────────────────────────────────────────
// Centralized derived metrics. Pages should read from here rather than
// recomputing portfolio math inline. All inputs are illustrative mock data.
// ─────────────────────────────────────────────────────────────────────────────

import {
  HOLDINGS,
  ENTITIES,
  POLICY_RANGES,
  LIQUIDITY_NEEDS,
  LIQUIDITY_SOURCES,
  LIQUIDITY_RESERVE_POLICY,
  PRIVATE_MARKETS_CEILING,
  classColor,
  type AssetClass,
  type LiquidityBucket,
  type Holding,
} from "./mock-data";

// ── Formatters ───────────────────────────────────────────────────────────────
export function fmtMillions(value: number, digits = 1): string {
  return `$${(value / 1_000_000).toFixed(digits)}M`;
}

export function fmtFullUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function fmtPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function fmtSignedPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

// ── Totals ───────────────────────────────────────────────────────────────────
export const TOTAL_AUM = HOLDINGS.reduce((sum, h) => sum + h.value, 0);

export function pctOfAum(value: number): number {
  return (value / TOTAL_AUM) * 100;
}

// ── Allocation by asset class ────────────────────────────────────────────────
export interface ClassAllocation {
  assetClass: AssetClass;
  value: number;
  pct: number;
  color: string;
}

export function allocationByClass(): ClassAllocation[] {
  const map = new Map<AssetClass, number>();
  for (const h of HOLDINGS) {
    map.set(h.assetClass, (map.get(h.assetClass) ?? 0) + h.value);
  }
  // Preserve the order in which classes appear in POLICY_RANGES for stable charts.
  return POLICY_RANGES.map((p) => {
    const value = map.get(p.assetClass) ?? 0;
    return {
      assetClass: p.assetClass,
      value,
      pct: pctOfAum(value),
      color: classColor(p.assetClass),
    };
  }).filter((c) => c.value > 0);
}

// ── Allocation vs policy range ───────────────────────────────────────────────
export type RangeStatus = "Within range" | "Below range" | "Above range";

export interface PolicyVariance {
  assetClass: AssetClass;
  current: number;
  min: number;
  target: number;
  max: number;
  status: RangeStatus;
  varianceFromTarget: number;
}

export function policyVariance(): PolicyVariance[] {
  const byClass = new Map(allocationByClass().map((c) => [c.assetClass, c.pct]));
  return POLICY_RANGES.map((p) => {
    const current = byClass.get(p.assetClass) ?? 0;
    let status: RangeStatus = "Within range";
    if (current < p.min) status = "Below range";
    else if (current > p.max) status = "Above range";
    return {
      assetClass: p.assetClass,
      current,
      min: p.min,
      target: p.target,
      max: p.max,
      status,
      varianceFromTarget: current - p.target,
    };
  });
}

// ── Public vs private mix ────────────────────────────────────────────────────
export function marketMix() {
  const publicValue = HOLDINGS.filter((h) => h.market === "Public").reduce(
    (s, h) => s + h.value,
    0,
  );
  const privateValue = TOTAL_AUM - publicValue;
  return {
    publicValue,
    privateValue,
    publicPct: pctOfAum(publicValue),
    privatePct: pctOfAum(privateValue),
    ceiling: PRIVATE_MARKETS_CEILING,
    overCeiling: pctOfAum(privateValue) > PRIVATE_MARKETS_CEILING,
  };
}

// ── Liquidity buckets ────────────────────────────────────────────────────────
const BUCKET_ORDER: LiquidityBucket[] = [
  "Daily",
  "Quarterly",
  "Annual",
  "Multi-Year",
  "Illiquid",
];

export function allocationByLiquidity() {
  const map = new Map<LiquidityBucket, number>();
  for (const h of HOLDINGS) {
    map.set(h.liquidity, (map.get(h.liquidity) ?? 0) + h.value);
  }
  return BUCKET_ORDER.map((bucket) => {
    const value = map.get(bucket) ?? 0;
    return { bucket, value, pct: pctOfAum(value) };
  }).filter((b) => b.value > 0);
}

export function illiquidPct(): number {
  const value = HOLDINGS.filter(
    (h) => h.liquidity === "Multi-Year" || h.liquidity === "Illiquid",
  ).reduce((s, h) => s + h.value, 0);
  return pctOfAum(value);
}

// ── Allocation by entity ─────────────────────────────────────────────────────
export function allocationByEntity() {
  return ENTITIES.map((e) => {
    const holdings = HOLDINGS.filter((h) => h.entity === e.id);
    const value = holdings.reduce((s, h) => s + h.value, 0);
    return { ...e, holdingsValue: value, pct: pctOfAum(value) };
  });
}

// ── Liquidity reserve check ──────────────────────────────────────────────────
export function liquidityReserve() {
  const reserve = HOLDINGS.find((h) => h.id === "cash")?.value ?? 0;
  const pct = pctOfAum(reserve);
  const { min, target, max } = LIQUIDITY_RESERVE_POLICY;
  let status: RangeStatus = "Within range";
  if (pct < min) status = "Below range";
  else if (pct > max) status = "Above range";
  return { reserve, pct, min, target, max, status };
}

// ── Liquidity coverage by horizon ────────────────────────────────────────────
export interface HorizonCoverage {
  horizon: "12-month" | "24-month" | "36-month";
  need: number;
  reserveCover: number; // covered by cash reserve alone
  liquidCover: number; // covered by cash + fixed income
  totalLiquid: number; // cash + fixed income + public equity
  coverageRatio: number; // totalLiquid / need
}

export function liquidityCoverage(): HorizonCoverage[] {
  const reserve = LIQUIDITY_SOURCES.find((s) => s.id === "reserve")?.value ?? 0;
  const fixed = LIQUIDITY_SOURCES.find((s) => s.id === "fixed")?.value ?? 0;
  const equity = LIQUIDITY_SOURCES.find((s) => s.id === "equity")?.value ?? 0;

  const liquidExReserveEquity = reserve + fixed;
  const totalLiquid = reserve + fixed + equity;

  const keys: Array<{ k: "m12" | "m24" | "m36"; h: HorizonCoverage["horizon"] }> =
    [
      { k: "m12", h: "12-month" },
      { k: "m24", h: "24-month" },
      { k: "m36", h: "36-month" },
    ];

  return keys.map(({ k, h }) => {
    const need = LIQUIDITY_NEEDS.reduce((s, n) => s + n[k], 0);
    return {
      horizon: h,
      need,
      reserveCover: Math.min(reserve, need),
      liquidCover: Math.min(liquidExReserveEquity, need),
      totalLiquid,
      coverageRatio: totalLiquid / need,
    };
  });
}

export function totalUnfunded(): number {
  return HOLDINGS.reduce((s, h) => s + (h.unfunded ?? 0), 0);
}

// ── Fee transparency ─────────────────────────────────────────────────────────
export function blendedFeePct(): number {
  // Asset-weighted management fee across holdings.
  const weighted = HOLDINGS.reduce((s, h) => s + h.mgmtFeePct * h.value, 0);
  return weighted / TOTAL_AUM;
}

export function estAnnualFees(): number {
  return HOLDINGS.reduce((s, h) => s + (h.mgmtFeePct / 100) * h.value, 0);
}

// ── Concentration watchlist ──────────────────────────────────────────────────
export interface ConcentrationItem {
  name: string;
  pct: number;
  value: number;
  note: string;
}

export function concentrationWatchlist(): ConcentrationItem[] {
  const threshold = 8; // % of AUM flagged for monitoring
  return HOLDINGS.filter((h) => h.allocationPct >= threshold)
    .map((h: Holding) => ({
      name: h.name,
      pct: h.allocationPct,
      value: h.value,
      note:
        h.assetClass === "Direct / Operating"
          ? "Single-company operating exposure"
          : h.market === "Private"
            ? "Illiquid single-fund exposure"
            : "Large single mandate",
    }))
    .sort((a, b) => b.pct - a.pct);
}
