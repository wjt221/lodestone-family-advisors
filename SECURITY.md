# Security Model — LFA Investment OS

This application is designed to hold sensitive family-office data: investments,
entities, liquidity, diligence, documents, and private advisor notes. Security is
a first-class concern. This document describes the controls that exist today and,
critically, **what must still be reviewed before any real client data is loaded.**

> Status: scaffolding. The data layer, schema, and RLS policies exist and the app
> builds, but they have **not** been deployed against a live Supabase project or
> penetration-tested. Treat everything here as "ready to review," not "production
> hardened." See [Before loading real client data](#before-loading-real-client-data).

---

## Operating modes

The app runs in one of two modes, selected automatically by environment:

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Demo** | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` absent | Mock data only, no authentication, no network. For local development and demos. |
| **Secure** | Both public vars present | Supabase Auth required; data read under Row-Level Security. |

Mode is detected by `isSupabaseConfigured()` (`lib/supabase/config.ts`), which reads
only the public env vars and is safe on both client and server.

---

## Auth model

- Authentication is handled by **Supabase Auth** (email/password in this build).
- Sessions are stored in cookies and refreshed in `proxy.ts` →
  `lib/supabase/middleware.ts` (`updateSession`) on every matched request.
- Route protection: in secure mode, unauthenticated requests to any non-public
  path are redirected to `/login`. Public paths are `/login` and `/auth/*`.
- Authorization decisions use `supabase.auth.getUser()` (which revalidates the JWT
  with Supabase), **never** `getSession()` alone.
- Sign-out posts to `/auth/signout`, which calls `auth.signOut()` server-side.

### Clients used

| Client | Key | RLS in force? | Where |
|--------|-----|---------------|-------|
| `lib/supabase/client.ts` | anon (public) | ✅ yes | Browser components |
| `lib/supabase/server.ts` | anon (public) + user session | ✅ yes | Server components, actions, route handlers |
| `lib/supabase/admin.ts` | **service role (secret)** | ❌ **bypasses RLS** | Server-only admin tasks; not used by default |

---

## Role model

Roles live on `profiles.role` (`user_role` enum):

- **client** — a family member. May **read** only their assigned client's rows.
  Read-only; cannot write. Cannot see advisor-private notes.
- **advisor** — a Lodestone advisor. May **read and write** only the clients they
  are assigned to (`advisor_client_assignments`). Sees advisor-private notes.
- **admin** — Lodestone operations. May read and write **all** rows.

A new auth user is bootstrapped to `client` by `handle_new_user()`. Promotion to
advisor/admin is an explicit, privileged action. A `prevent_role_escalation`
trigger blocks non-admins from changing any profile's role.

---

## RLS model

Row-Level Security is enabled on **every** table. Access is computed by
`SECURITY DEFINER` helper functions so policies never recurse:

- `current_user_role()` — the caller's role.
- `is_admin()` — admin shortcut.
- `has_client_access(client_id)` — admin, the client's own users, or an assigned advisor.
- `can_write_client(client_id)` — admin or an assigned advisor (clients are read-only).

Standard client-scoped tables use:

- `SELECT` → `has_client_access(client_id)`
- `INSERT` / `UPDATE` / `DELETE` → `can_write_client(client_id)`

Special cases:

- **advisor_notes** and **meeting_notes**: clients only see rows where
  `client_visible = true`; advisors/admins see all for their clients.
- **clients**: readable by anyone with access to it; writable by admins only.
- **client_users / advisor_client_assignments**: the access map itself — readable
  by admins, the member, or (for memberships) assigned advisors; writable by admins.
- **profiles**: a user sees their own profile; admins see all.
- **audit_log**: append-only — `INSERT` allowed (actor must be self), **no** update
  or delete policies, so rows are immutable for clients/advisors.

The `anon` (unauthenticated) role is granted no table privileges and matches no
policy (all policies target `authenticated`), so unauthenticated access yields
nothing.

---

## Environment variable rules

| Variable | Exposure | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser) | Safe; identifies the project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser) | Safe **only because RLS is enabled.** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret, server-only** | Bypasses RLS. Optional. |

### ⚠️ Service-role key warning

The service-role key can read and write **every client's data** and ignores RLS.

- **Never** import `lib/supabase/admin.ts` from a client component or any
  browser-reachable code. The `import "server-only"` guard turns such an import
  into a build error.
- **Never** prefix the key with `NEXT_PUBLIC_`, log it, or return it in a response.
- In Vercel, store it as an **encrypted, un-prefixed** environment variable, scoped
  to Production/Preview as appropriate.
- The app does not need it for normal operation; leave it unset unless you are
  running trusted server-side admin tooling.

---

## Document storage security

Documents are **metadata-only** in Postgres (`documents` table); the files belong
in **private** Supabase Storage buckets:

- `client-documents`
- `ips-documents`
- `diligence-documents`

Rules:

- Buckets must be **private** (never public). No public object URLs are used.
- File access is brokered server-side via short-lived **signed URLs**
  (`getDocumentSignedUrl` in `lib/data/documents.ts`, default 60s expiry).
- Storage object paths should be namespaced per client (e.g. `atwater/…`) and a
  Storage RLS policy should restrict each object to users with access to the
  owning client. (Storage policies are **not** included in this migration yet —
  see below.)

---

## Data isolation assumptions

- Every client-scoped table carries `client_id`; isolation depends entirely on RLS
  policies keyed off it. There is no application-level tenant filter to fall back on
  — **if RLS is misconfigured or disabled, isolation is lost.**
- The data layer also filters by the resolved `client_id`, but treats RLS as the
  real boundary, not a convenience.
- `resolveClientId()` returns the first accessible client. This is correct for the
  single-client demo; a multi-client deployment must add explicit client selection
  and must not assume one client per user.

---

## Before loading real client data

This build is **not** cleared for real data. At minimum, complete all of the
following first:

1. **Apply and verify the migration** against a real Supabase project; confirm RLS
   is `enabled` on every table (`select relname, relrowsecurity from pg_class`).
2. **Run the full [RLS test plan](supabase/RLS_TEST_PLAN.md)** with at least one
   user per role and two distinct clients. All cross-tenant tests must fail closed.
3. **Add Storage RLS policies** for the three private buckets and verify no public
   URLs resolve.
4. **Review the service-role key handling** — confirm it is unset in the browser
   bundle and only present in trusted server contexts.
5. **Add audit logging** at write sites (the table exists; wiring is TODO).
6. **Wire the remaining pages** (dashboard, allocation, risk, liquidity, strategy,
   ips, investments, diligence) through the data layer — several still read mock
   data directly and would show mock data to an authenticated user.
7. **Harden auth**: enforce email confirmation / SSO / MFA per policy, set password
   rules, and configure session lifetimes in Supabase Auth.
8. **Add rate limiting / abuse protection** on auth endpoints.
9. **Penetration test** the RLS boundary, ideally with an independent reviewer.
10. **Backups & retention**: confirm Supabase PITR/backups and a data-retention
    policy appropriate for the data's sensitivity.

Until these are complete, run in demo mode only.
