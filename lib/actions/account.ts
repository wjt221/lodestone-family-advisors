"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/data/session";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Update the signed-in user's own display name. RLS limits this to self. */
export async function updateOwnName(fullName: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Editing your profile requires secure mode." };
  }
  const ctx = await getSessionContext();
  if (!ctx.userId) return { ok: false, error: "You are not signed in." };

  const name = fullName.trim();
  if (!name) return { ok: false, error: "Name cannot be empty." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name })
    .eq("id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
