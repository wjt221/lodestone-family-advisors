import "server-only";

// Performance reads (performance_summaries): asset-class, entity, and total
// level returns vs benchmarks/expectations. In demo mode, returns a small
// illustrative set so the page renders without a database.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { PerformanceSummaryRow } from "@/lib/supabase/types";

export interface PerformanceView {
  scope: string; // 'asset_class' | 'internal_asset_class' | 'entity' | 'total' | 'other'
  label: string;
  amount: number | null;
  actualPct: number | null;
  targetPct: number | null;
  returnNet: number | null;
  benchmarkReturn: number | null;
  excessReturn: number | null;
  expectedReturn: number | null;
  asOf: string;
}

const MOCK_PERFORMANCE: PerformanceView[] = [
  { scope: "asset_class", label: "Cash & Reserves", amount: 3_780_000, actualPct: 0.08, targetPct: 0.05, returnNet: 0.045, benchmarkReturn: null, excessReturn: null, expectedReturn: 0.045, asOf: "May 31, 2026" },
  { scope: "asset_class", label: "Fixed Income", amount: 7_100_000, actualPct: 0.15, targetPct: 0.18, returnNet: 0.041, benchmarkReturn: null, excessReturn: null, expectedReturn: 0.043, asOf: "May 31, 2026" },
  { scope: "asset_class", label: "Public Equity", amount: 13_240_000, actualPct: 0.28, targetPct: 0.32, returnNet: 0.082, benchmarkReturn: null, excessReturn: null, expectedReturn: 0.076, asOf: "May 31, 2026" },
  { scope: "asset_class", label: "Private Credit", amount: 5_680_000, actualPct: 0.12, targetPct: 0.12, returnNet: 0.086, benchmarkReturn: null, excessReturn: null, expectedReturn: 0.08, asOf: "May 31, 2026" },
  { scope: "asset_class", label: "Real Assets", amount: 6_620_000, actualPct: 0.14, targetPct: 0.12, returnNet: 0.094, benchmarkReturn: null, excessReturn: null, expectedReturn: 0.082, asOf: "May 31, 2026" },
  { scope: "total", label: "Total Investments", amount: 47_300_000, actualPct: 1, targetPct: 1, returnNet: 0.078, benchmarkReturn: 0.071, excessReturn: 0.007, expectedReturn: 0.074, asOf: "May 31, 2026" },
];

export async function getPerformance(): Promise<PerformanceView[]> {
  if (!isSupabaseConfigured()) return MOCK_PERFORMANCE;

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("performance_summaries")
    .select(
      "scope, label, amount, actual_pct, target_pct, return_net, benchmark_return, excess_return, expected_return, as_of, sort_order",
    )
    .eq("client_id", ctx.clientId)
    .order("sort_order", { ascending: true });
  const rows = (res.data ?? []) as PerformanceSummaryRow[];

  return rows.map((r) => ({
    scope: r.scope,
    label: r.label,
    amount: r.amount != null ? Number(r.amount) : null,
    actualPct: r.actual_pct != null ? Number(r.actual_pct) : null,
    targetPct: r.target_pct != null ? Number(r.target_pct) : null,
    returnNet: r.return_net != null ? Number(r.return_net) : null,
    benchmarkReturn: r.benchmark_return != null ? Number(r.benchmark_return) : null,
    excessReturn: r.excess_return != null ? Number(r.excess_return) : null,
    expectedReturn: r.expected_return != null ? Number(r.expected_return) : null,
    asOf: r.as_of ?? "",
  }));
}
