"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/data/session";

export async function switchClient(clientId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const ctx = await getSessionContext();
  if (ctx.role !== "advisor" && ctx.role !== "admin") return;

  // RLS enforces that only accessible clients are returned
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();
  if (!data?.id) return;

  const cookieStore = await cookies();
  cookieStore.set("lfa_active_client", clientId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/", "layout");
}
