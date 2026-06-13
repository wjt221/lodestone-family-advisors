-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — client-specific IPS strategy profiles
--
-- One Advisor-Led IPS Workbench record per client (family office). Holds the
-- full structured IPS (ips_data), the live advisor-session state
-- (advisor_session_data), and the generated Advisor-Facilitated IPS Draft
-- (summary_data). Each record is scoped to a single client_id and is never
-- shared across clients.
--
-- Security: same RLS pattern as the rest of the app — read = has_client_access,
-- write = can_write_client (advisor/admin). Real client IPS content lives only
-- in this table, never in the codebase.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.client_ips_profiles (
  id                          uuid primary key default gen_random_uuid(),
  client_id                   uuid not null unique references public.clients (id) on delete cascade,
  status                      text not null default 'not_started',
  completion_percentage       integer not null default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  created_by_advisor_id       uuid references public.profiles (id) on delete set null,
  last_updated_by_advisor_id  uuid references public.profiles (id) on delete set null,
  approved_at                 timestamptz,
  approved_by_advisor_id      uuid references public.profiles (id) on delete set null,
  ips_data                    jsonb not null default '{}'::jsonb,
  advisor_session_data        jsonb not null default '{}'::jsonb,
  summary_data                jsonb not null default '{}'::jsonb
);

create index if not exists client_ips_profiles_client_idx on public.client_ips_profiles (client_id);

alter table public.client_ips_profiles enable row level security;

create policy client_ips_profiles_select on public.client_ips_profiles
  for select to authenticated
  using (public.has_client_access(client_id));

create policy client_ips_profiles_insert on public.client_ips_profiles
  for insert to authenticated
  with check (public.can_write_client(client_id));

create policy client_ips_profiles_update on public.client_ips_profiles
  for update to authenticated
  using  (public.can_write_client(client_id))
  with check (public.can_write_client(client_id));

create policy client_ips_profiles_delete on public.client_ips_profiles
  for delete to authenticated
  using (public.can_write_client(client_id));

create trigger client_ips_profiles_set_updated_at
  before update on public.client_ips_profiles
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.client_ips_profiles to authenticated;
