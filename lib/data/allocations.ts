import "server-only";

// Policy-range reads (asset_allocations). Dual-mode like the other modules.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import { POLICY_RANGES as MOCK_RANGES } from "@/lib/mock-data";

export interface PolicyRangeView {
  assetClass: string;
  min: number;
  target: number;
  max: number;
}

const mockRanges = (): PolicyRangeView[] =>
  MOCK_RANGES.map((r) => ({ assetClass: r.assetClass, min: r.min, target: r.target, max: r.max }));

export async function getPolicyRanges(): Promise<PolicyRangeView[]> {
  if (!isSupabaseConfigured()) return mockRanges();

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("asset_allocations")
    .select("asset_class, min_pct, target_pct, max_pct")
    .eq("client_id", ctx.clientId)
    .order("target_pct", { ascending: false });
  const rows = res.data ?? [];

  return rows.map((r) => ({
    assetClass: r.asset_class,
    min: Number(r.min_pct),
    target: Number(r.target_pct),
    max: Number(r.max_pct),
  }));
}
