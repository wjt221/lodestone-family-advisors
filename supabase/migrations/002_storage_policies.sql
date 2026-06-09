-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — Storage security for private document buckets
--
-- Run AFTER 001_initial_schema.sql, and AFTER creating these buckets as PRIVATE
-- (Storage → New bucket → Public = OFF):
--   • client-documents
--   • ips-documents
--   • diligence-documents
--
-- Model:
--   • Buckets are private — no public object URLs. Files are delivered only via
--     short-lived signed URLs generated server-side (lib/data/documents.ts).
--   • READ is allowed only when a `documents` row exists for that exact
--     bucket+path AND the caller has client access (reusing has_client_access).
--     This ties object visibility to the same RLS boundary as the metadata.
--   • There is NO authenticated INSERT/UPDATE/DELETE policy. Uploads/changes must
--     go through trusted server-side tooling using the service-role key. The app
--     has no upload path, so no file can be written insecurely from the browser.
--
-- Supabase enables RLS on storage.objects by default; we only add policies.
-- ════════════════════════════════════════════════════════════════════════════

-- Remove any prior versions of these policies (safe to re-run).
drop policy if exists "lfa_docs_read" on storage.objects;
drop policy if exists "lfa_docs_no_write" on storage.objects;

-- READ: only via an accessible documents row pointing at this object.
create policy "lfa_docs_read" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('client-documents', 'ips-documents', 'diligence-documents')
    and exists (
      select 1
      from public.documents d
      where d.storage_bucket = storage.objects.bucket_id
        and d.storage_path = storage.objects.name
        and public.has_client_access(d.client_id)
    )
  );

-- No INSERT / UPDATE / DELETE policies for `authenticated` are defined, so RLS
-- denies all writes from the anon/authenticated roles. Only the service role
-- (which bypasses RLS) can write objects — and only from trusted server code.
--
-- If/when in-app uploads are added, introduce a write policy that (1) restricts
-- the object path to a client the caller can WRITE (can_write_client) and
-- (2) is covered by the RLS_TEST_PLAN before enabling. Until then, treat
-- document upload as NOT production-ready.
