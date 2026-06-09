# RLS Test Plan — LFA Investment OS

Manual tests that must pass before real client data is loaded. The goal is to prove
that Row-Level Security **fails closed**: users only ever see what their role and
client assignment permit.

Run these against a real Supabase project after applying
`migrations/001_initial_schema.sql` and `seed.sql`.

---

## Test fixtures

Create two clients and several users.

1. **Client A** = the seeded Atwater Family Office (`11111111-…`).
2. **Client B** — insert a second client + a holding for it:

   ```sql
   insert into public.clients (id, name) values
     ('22222222-2222-2222-2222-222222222222', 'Test Family B');
   insert into public.holdings (client_id, name, asset_class, value, allocation_pct)
   values ('22222222-2222-2222-2222-222222222222', 'B Equity', 'Public Equity', 1000000, 100);
   ```

3. Create five auth users (Authentication → Users), note their UUIDs, then:

   ```sql
   -- admin
   update public.profiles set role = 'admin' where id = '<ADMIN>';

   -- advisor assigned to A only
   update public.profiles set role = 'advisor' where id = '<ADVISOR_A>';
   insert into public.advisor_client_assignments (client_id, advisor_id)
   values ('11111111-1111-1111-1111-111111111111', '<ADVISOR_A>');

   -- advisor assigned to B only
   update public.profiles set role = 'advisor' where id = '<ADVISOR_B>';
   insert into public.advisor_client_assignments (client_id, advisor_id)
   values ('22222222-2222-2222-2222-222222222222', '<ADVISOR_B>');

   -- client user of A
   insert into public.client_users (client_id, user_id)
   values ('11111111-1111-1111-1111-111111111111', '<CLIENT_A>');
   ```

Run each test **as the named user** — either by signing into the app, or in the
SQL editor using `set role authenticated;` plus a `request.jwt.claims` setting that
carries the user's `sub`. The most reliable check is via the app or the REST API
with that user's access token, because that exercises the real `auth.uid()`.

---

## Tests

> Expected results assume RLS is enabled. Any test that returns *more* than
> expected is a **failure** and a blocker.

### 1. Client A cannot see Client B's holdings
- **As:** `CLIENT_A`
- **Action:** `select * from holdings;` (or load `/portfolio`).
- **Pass:** only Client A holdings returned; **zero** Client B rows.

### 2. Advisor cannot see an unassigned client
- **As:** `ADVISOR_B` (assigned to B only)
- **Action:** `select * from holdings where client_id = '1111…';`
- **Pass:** zero rows. `ADVISOR_B` sees only Client B.

### 3. Client cannot see private advisor notes
- **As:** `CLIENT_A`
- **Action:** `select * from advisor_notes where client_id = '1111…';`
- **Pass:** only rows with `client_visible = true` (1 seeded). The two private
  notes (`client_visible = false`) must **not** appear.

### 4. Advisor sees private advisor notes for their client
- **As:** `ADVISOR_A`
- **Action:** same query as #3.
- **Pass:** all advisor notes for Client A (including private) appear.

### 5. Admin can see everything
- **As:** `ADMIN`
- **Action:** `select client_id, count(*) from holdings group by 1;`
- **Pass:** both Client A and Client B appear.

### 6. Unauthenticated user cannot access protected data
- **As:** no session (anon key only, no token).
- **Action:** REST `GET /rest/v1/holdings`.
- **Pass:** empty array / no rows. Visiting any app route (other than `/login`)
  redirects to `/login`.

### 7. Client cannot write
- **As:** `CLIENT_A`
- **Action:** `update holdings set value = 0 where client_id = '1111…';`
- **Pass:** `0` rows updated (blocked by `can_write_client`). Likewise `insert`
  and `delete` affect 0 rows / error.

### 8. Advisor cannot write to an unassigned client
- **As:** `ADVISOR_B`
- **Action:** `update holdings set value = 0 where client_id = '1111…';`
- **Pass:** 0 rows affected.

### 9. Role escalation is blocked
- **As:** `CLIENT_A`
- **Action:** `update profiles set role = 'admin' where id = '<CLIENT_A>';`
- **Pass:** error `Only admins may change a profile role` (from the
  `prevent_role_escalation` trigger).

### 10. Audit log is immutable to non-admins
- **As:** `ADVISOR_A`
- **Action:** `update audit_log set action = 'x';` and `delete from audit_log;`
- **Pass:** 0 rows affected / denied (no update/delete policy exists).

### 11. Private documents are not public URLs
- **As:** anyone with the object path.
- **Action:** request the public Storage URL
  `…/storage/v1/object/public/ips-documents/atwater/ips-v0.9.pdf`.
- **Pass:** `400/404` — the bucket is private. Access must only succeed via a
  server-generated signed URL.

### 12. Cross-client document metadata isolation
- **As:** `CLIENT_A`
- **Action:** `select * from documents;`
- **Pass:** only Client A documents; no Client B rows.

---

## Sign-off

Record the run before loading real data:

| Test | Result | Tester | Date |
|------|--------|--------|------|
| 1 Client A ⊄ B holdings | ☐ pass | | |
| 2 Advisor ⊄ unassigned | ☐ pass | | |
| 3 Client ⊄ private notes | ☐ pass | | |
| 4 Advisor ⊇ private notes | ☐ pass | | |
| 5 Admin ⊇ all | ☐ pass | | |
| 6 Anon blocked | ☐ pass | | |
| 7 Client read-only | ☐ pass | | |
| 8 Advisor write isolation | ☐ pass | | |
| 9 No role escalation | ☐ pass | | |
| 10 Audit immutable | ☐ pass | | |
| 11 No public file URLs | ☐ pass | | |
| 12 Document isolation | ☐ pass | | |

All twelve must pass before production data is loaded.
