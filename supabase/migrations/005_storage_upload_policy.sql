-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — in-app document upload policy
--
-- Allows advisors/admins to upload into the three private buckets. Objects must
-- be namespaced by client id (<client_id>/<filename>) and the caller must have
-- write access to that client (can_write_client). Clients remain read-only;
-- cross-tenant writes are impossible. No UPDATE/DELETE policies — uploaded
-- objects are immutable from the app.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "lfa_docs_write" on storage.objects;
create policy "lfa_docs_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('client-documents', 'ips-documents', 'diligence-documents')
    and array_length(storage.foldername(name), 1) >= 1
    and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.can_write_client(((storage.foldername(name))[1])::uuid)
  );
