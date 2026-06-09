-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — initial schema, roles, and Row-Level Security
--
-- Run in the Supabase SQL editor or via `supabase db push`. This migration:
--   1. defines a user_role enum (client / advisor / admin)
--   2. creates profiles + tenant/access tables + all client-scoped tables
--   3. defines SECURITY DEFINER access helpers (no RLS recursion)
--   4. enables RLS on every table and applies role-aware policies
--
-- Security model (see SECURITY.md):
--   • client  → may READ only their assigned client's rows
--   • advisor → may READ/WRITE only their assigned clients' rows
--   • admin   → may READ/WRITE everything
--   • advisor_notes / meeting_notes are hidden from clients unless client_visible
--   • unauthenticated (anon) has no table access — policies target `authenticated`
-- ════════════════════════════════════════════════════════════════════════════

-- ── Roles ────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('client', 'advisor', 'admin');
  end if;
end $$;

-- ── updated_at helper ─────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Core identity + tenant tables ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        public.user_role not null default 'client',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  short_name          text,
  relationship_since  text,
  reporting_currency  text not null default 'USD',
  as_of               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- maps client-role users to the client (family office) they belong to
create table if not exists public.client_users (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (client_id, user_id)
);

-- maps advisor-role users to the clients they serve
create table if not exists public.advisor_client_assignments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  advisor_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (client_id, advisor_id)
);

-- ── Client-scoped tables ────────────────────────────────────────────────────────
create table if not exists public.entities (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  name        text not null,
  type        text,
  value       numeric(16,2) not null default 0,
  purpose     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.holdings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  entity_id       uuid references public.entities (id) on delete set null,
  name            text not null,
  asset_class     text not null,
  market          text not null default 'Private',
  liquidity       text not null default 'Illiquid',
  value           numeric(16,2) not null default 0,
  allocation_pct  numeric(6,2) not null default 0,
  manager         text,
  vintage         text,
  commitment      numeric(16,2),
  unfunded        numeric(16,2),
  mgmt_fee_pct    numeric(6,3) not null default 0,
  carry_pct       numeric(6,2),
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.asset_allocations (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  asset_class text not null,
  min_pct     numeric(6,2) not null default 0,
  target_pct  numeric(6,2) not null default 0,
  max_pct     numeric(6,2) not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.liquidity_needs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  label       text not null,
  description text,
  m12         numeric(16,2) not null default 0,
  m24         numeric(16,2) not null default 0,
  m36         numeric(16,2) not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.risk_profiles (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  factor      text not null,
  severity    text not null default 'Moderate',
  status      text not null default 'Discussion Point',
  exposure    text,
  observation text,
  owner       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.ips_documents (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  title           text not null,
  status          text not null default 'Draft for Advisor Review',
  version         text not null default 'v0.1',
  prepared_by     text,
  review_cadence  text,
  next_review     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.ips_versions (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients (id) on delete cascade,
  ips_document_id  uuid not null references public.ips_documents (id) on delete cascade,
  version          text not null,
  status           text not null default 'Draft',
  content          jsonb not null default '{}'::jsonb,
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.diligence_items (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients (id) on delete cascade,
  name                text not null,
  sponsor             text,
  asset_class         text,
  stage               text not null default 'Sourced',
  target_commitment   numeric(16,2),
  merits              jsonb not null default '[]'::jsonb,
  risks               jsonb not null default '[]'::jsonb,
  fees                text,
  liquidity_terms     text,
  alignment           text,
  tax_considerations  text,
  open_questions      jsonb not null default '[]'::jsonb,
  decision_status     text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.meetings (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  title         text not null,
  meeting_date  text,
  meeting_time  text,
  type          text,
  attendees     jsonb not null default '[]'::jsonb,
  status        text not null default 'Scheduled',
  agenda        jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.meeting_notes (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  meeting_id      uuid not null references public.meetings (id) on delete cascade,
  body            text not null,
  author          text,
  client_visible  boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  name            text not null,
  category        text,
  storage_bucket  text,
  storage_path    text,
  owner           text,
  status          text not null default 'Draft for Advisor Review',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.action_items (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'Open',
  due_date     text,
  assigned_to  text,
  meeting_id   uuid references public.meetings (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.advisor_notes (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  body            text not null,
  author          text,
  client_visible  boolean not null default false,
  related_type    text,
  related_id      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients (id) on delete set null,
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  table_name  text,
  row_id      uuid,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ── Access helper functions (SECURITY DEFINER → bypass RLS, no recursion) ───────
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- read access: admin, the client's own users, or an assigned advisor
create or replace function public.has_client_access(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.client_users cu
      where cu.client_id = cid and cu.user_id = auth.uid()
    )
    or exists (
      select 1 from public.advisor_client_assignments a
      where a.client_id = cid and a.advisor_id = auth.uid()
    );
$$;

-- write access: admin or an assigned advisor (clients are read-only)
create or replace function public.can_write_client(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.advisor_client_assignments a
      where a.client_id = cid and a.advisor_id = auth.uid()
    );
$$;

grant execute on function
  public.current_user_role(), public.is_admin(),
  public.has_client_access(uuid), public.can_write_client(uuid)
to authenticated;

-- ── Auth triggers: profile bootstrap + role-escalation guard ────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins may change a profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ── updated_at triggers (identity / access / notes tables) ──────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','clients','client_users','advisor_client_assignments',
    'meeting_notes','advisor_notes'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at();',
      t || '_set_updated_at', t
    );
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Row-Level Security
-- ════════════════════════════════════════════════════════════════════════════

-- Standard client-scoped tables: read = access, write = write-access, + updated_at.
do $$
declare t text;
begin
  foreach t in array array[
    'entities','holdings','asset_allocations','liquidity_needs','risk_profiles',
    'ips_documents','ips_versions','diligence_items','meetings','documents','action_items'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.has_client_access(client_id));',
      t || '_select', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.can_write_client(client_id));',
      t || '_insert', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.can_write_client(client_id)) with check (public.can_write_client(client_id));',
      t || '_update', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.can_write_client(client_id));',
      t || '_delete', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at();',
      t || '_set_updated_at', t);
  end loop;
end $$;

-- profiles
alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- clients (tenant root; scoped by id, not client_id)
alter table public.clients enable row level security;
create policy clients_select on public.clients for select to authenticated
  using (public.has_client_access(id));
create policy clients_insert on public.clients for insert to authenticated
  with check (public.is_admin());
create policy clients_update on public.clients for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy clients_delete on public.clients for delete to authenticated
  using (public.is_admin());

-- client_users (membership) — visible to admins, the member, or assigned advisors
alter table public.client_users enable row level security;
create policy client_users_select on public.client_users for select to authenticated
  using (public.is_admin() or user_id = auth.uid() or public.can_write_client(client_id));
create policy client_users_insert on public.client_users for insert to authenticated
  with check (public.is_admin());
create policy client_users_update on public.client_users for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy client_users_delete on public.client_users for delete to authenticated
  using (public.is_admin());

-- advisor_client_assignments — visible to admins or the advisor themselves
alter table public.advisor_client_assignments enable row level security;
create policy aca_select on public.advisor_client_assignments for select to authenticated
  using (public.is_admin() or advisor_id = auth.uid());
create policy aca_insert on public.advisor_client_assignments for insert to authenticated
  with check (public.is_admin());
create policy aca_update on public.advisor_client_assignments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy aca_delete on public.advisor_client_assignments for delete to authenticated
  using (public.is_admin());

-- meeting_notes — clients only see client_visible = true
alter table public.meeting_notes enable row level security;
create policy meeting_notes_select on public.meeting_notes for select to authenticated
  using (
    public.has_client_access(client_id)
    and (public.current_user_role() in ('advisor', 'admin') or client_visible = true)
  );
create policy meeting_notes_insert on public.meeting_notes for insert to authenticated
  with check (public.can_write_client(client_id));
create policy meeting_notes_update on public.meeting_notes for update to authenticated
  using (public.can_write_client(client_id)) with check (public.can_write_client(client_id));
create policy meeting_notes_delete on public.meeting_notes for delete to authenticated
  using (public.can_write_client(client_id));

-- advisor_notes — hidden from clients unless client_visible = true; writes advisor/admin
alter table public.advisor_notes enable row level security;
create policy advisor_notes_select on public.advisor_notes for select to authenticated
  using (
    public.has_client_access(client_id)
    and (public.current_user_role() in ('advisor', 'admin') or client_visible = true)
  );
create policy advisor_notes_insert on public.advisor_notes for insert to authenticated
  with check (public.can_write_client(client_id));
create policy advisor_notes_update on public.advisor_notes for update to authenticated
  using (public.can_write_client(client_id)) with check (public.can_write_client(client_id));
create policy advisor_notes_delete on public.advisor_notes for delete to authenticated
  using (public.can_write_client(client_id));

-- audit_log — append-only; readable by admins (all) and users with client access
alter table public.audit_log enable row level security;
create policy audit_select on public.audit_log for select to authenticated
  using (public.is_admin() or (client_id is not null and public.has_client_access(client_id)));
create policy audit_insert on public.audit_log for insert to authenticated
  with check (actor_id = auth.uid());
-- intentionally NO update/delete policies → audit rows are immutable to clients/advisors

-- ── Table privileges (RLS still governs row visibility) ─────────────────────────
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- anon (unauthenticated) is granted nothing on app tables → no access.
