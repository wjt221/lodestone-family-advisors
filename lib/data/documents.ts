import "server-only";

// Documents reads + private-file access. Document files live in PRIVATE Supabase
// Storage buckets; access is brokered through short-lived signed URLs generated
// server-side. We never expose public object URLs.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { DocumentRow } from "@/lib/supabase/types";
import { DOCUMENTS as MOCK_DOCUMENTS } from "@/lib/mock-data";

export interface DocumentView {
  id: string;
  name: string;
  category: string;
  updated: string;
  owner: string;
  status: string;
  storageBucket?: string;
  storagePath?: string;
}

export async function getDocuments(): Promise<DocumentView[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_DOCUMENTS.map((d) => ({ ...d }));
  }

  const ctx = await getSessionContext();
  if (!ctx.clientId) return MOCK_DOCUMENTS.map((d) => ({ ...d }));

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("documents")
    .select("id, name, category, storage_bucket, storage_path, owner, status, updated_at")
    .eq("client_id", ctx.clientId)
    .order("updated_at", { ascending: false });
  const rows = (res.data ?? []) as DocumentRow[];

  return rows.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category ?? "General",
    updated: d.updated_at,
    owner: d.owner ?? "",
    status: d.status,
    storageBucket: d.storage_bucket ?? undefined,
    storagePath: d.storage_path ?? undefined,
  }));
}

/**
 * Returns a short-lived signed URL for a private document object, or null in demo
 * mode / when unavailable. RLS on the `documents` row plus a Storage access policy
 * on the bucket both gate access; the signed URL is the delivery mechanism, not
 * the authorization boundary.
 */
export async function getDocumentSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) return null;
  return data?.signedUrl ?? null;
}
