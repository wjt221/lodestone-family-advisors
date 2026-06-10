import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/data/session";
import { getDocumentSignedUrl } from "@/lib/data/documents";

// Brokered download: looks up the document row (RLS-scoped to the caller) and
// redirects to a short-lived signed URL. Never exposes a public object URL.
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 404 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ctx = await getSessionContext();
  if (!ctx.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const res = await supabase
    .from("documents")
    .select("storage_bucket, storage_path")
    .eq("id", id)
    .maybeSingle();
  const doc = res.data as { storage_bucket: string | null; storage_path: string | null } | null;

  if (!doc?.storage_bucket || !doc.storage_path) {
    return NextResponse.json({ error: "No file attached to this document" }, { status: 404 });
  }

  const url = await getDocumentSignedUrl(doc.storage_bucket, doc.storage_path, 60);
  if (!url) return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });

  return NextResponse.redirect(url);
}
