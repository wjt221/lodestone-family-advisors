-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — ownership model
--
-- `entity_owners`: who owns each entity and at what percentage.
-- `holdings.owners`: per-holding ownership splits as jsonb
--   [{"name": "Kim", "pct": 70}, ...] — account-level attribution beats
--   entity-level when an account clearly belongs to one person.
-- `holdings.oversight`: 'Internal' | 'External' per the schedule.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.entity_owners (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  entity_id   uuid not null references public.entities (id) on delete cascade,
  owner_name  text not null,
  pct         numeric(6,2) not null default 100,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.entity_owners enable row level security;
create policy entity_owners_select on public.entity_owners
  for select to authenticated using (public.has_client_access(client_id));
create policy entity_owners_insert on public.entity_owners
  for insert to authenticated with check (public.can_write_client(client_id));
create policy entity_owners_update on public.entity_owners
  for update to authenticated using (public.can_write_client(client_id)) with check (public.can_write_client(client_id));
create policy entity_owners_delete on public.entity_owners
  for delete to authenticated using (public.can_write_client(client_id));
create trigger entity_owners_set_updated_at
  before update on public.entity_owners
  for each row execute function public.set_updated_at();
grant select, insert, update, delete on public.entity_owners to authenticated;

alter table public.holdings
  add column if not exists owners jsonb not null default '[]'::jsonb,
  add column if not exists oversight text;
