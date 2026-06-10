"use server";

import { revalidatePath } from "next/cache";
import { updateHolding } from "@/lib/data/holdings";

export interface HoldingActionResult {
  ok: boolean;
  error?: string;
}

export async function updateHoldingAction(formData: FormData): Promise<HoldingActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing holding id." };

  const rawValue = String(formData.get("value") ?? "").replace(/[$,\s]/g, "");
  const value = rawValue === "" ? undefined : Number(rawValue);
  if (value != null && (!Number.isFinite(value) || value < 0)) {
    return { ok: false, error: "Enter a valid value (USD)." };
  }

  try {
    await updateHolding(id, {
      value,
      assetClass: String(formData.get("assetClass") ?? ""),
      strategy: String(formData.get("strategy") ?? ""),
      liquidity: String(formData.get("liquidity") ?? ""),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not update the holding." };
  }

  // Every derived view recomputes from holdings.
  for (const path of ["/portfolio", "/allocation", "/dashboard", "/entities", "/liquidity", "/risk"]) {
    revalidatePath(path);
  }
  return { ok: true };
}
