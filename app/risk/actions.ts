"use server";

import { revalidatePath } from "next/cache";
import { createRisk } from "@/lib/data/risk";

export interface RiskActionResult {
  ok: boolean;
  error?: string;
}

export async function createRiskAction(formData: FormData): Promise<RiskActionResult> {
  const factor = String(formData.get("factor") ?? "").trim();
  if (!factor) return { ok: false, error: "Please enter a risk factor name." };

  try {
    await createRisk({
      factor,
      severity: String(formData.get("severity") ?? "Moderate"),
      status: String(formData.get("status") ?? "Discussion Point"),
      exposure: String(formData.get("exposure") ?? ""),
      observation: String(formData.get("observation") ?? ""),
      owner: String(formData.get("owner") ?? ""),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not add the risk factor." };
  }

  revalidatePath("/risk");
  return { ok: true };
}
