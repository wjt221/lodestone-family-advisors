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

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

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

export interface NewDocumentInput {
  name: string;
  category: string;
  status: string;
  owner: string;
}

/** Whether the current session may add/edit document records. */
export async function canWriteDocuments(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const ctx = await getSessionContext();
  return Boolean(ctx.clientId) && (ctx.role === "advisor" || ctx.role === "admin");
}

/**
 * Creates a document METADATA record. Files are not uploaded in-app (the buckets
 * are private and write-only via trusted server tooling — see SECURITY.md); this
 * registers the record so it appears in the vault. Write authority is enforced
 * here and, definitively, by RLS (`can_write_client`).
 */
export async function createDocument(input: NewDocumentInput): Promise<{ id: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Adding documents requires secure mode (Supabase is not configured).");
  }

  const ctx = await getSessionContext();
  const clientId = ctx.clientId;
  if (!clientId) throw new Error("No accessible client to attach this document to.");
  if (ctx.role !== "advisor" && ctx.role !== "admin") {
    throw new Error("Only advisors or admins may add documents.");
  }

  const name = input.name.trim();
  if (!name) throw new Error("A document name is required.");

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("documents")
    .insert({
      client_id: clientId,
      name,
      category: input.category.trim() || null,
      owner: input.owner.trim() || null,
      status: input.status.trim() || "Draft for Advisor Review",
    })
    .select("id")
    .single();

  if (res.error) throw new Error(res.error.message);
  return { id: (res.data as { id: string }).id };
}
