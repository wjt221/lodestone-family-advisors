-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — cash flows per holding (XIRR / MOIC source)
--
-- Each row is a dated cash-flow event for a single holding:
--   amount < 0  → capital out  (purchase, capital call, add-on equity)
--   amount > 0  → capital in   (distribution, return of capital, proceeds)
--
-- The current market value is NOT stored here; it lives on the holdings row
-- and is treated as the terminal positive cash flow when computing XIRR.
--
-- Security: same RLS pattern as holdings — client_id scoped, advisor/admin write.
-- Real data is populated via the Supabase dashboard or a server-side seed script
-- that runs outside this codebase. It is never stored in mock-data files.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.cash_flows (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients  (id) on delete cascade,
  holding_id   uuid not null references public.holdings (id) on delete cascade,
  flow_date    date not null,
  amount       numeric(18, 2) not null,
  label        text not null,
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists cash_flows_holding_idx on public.cash_flows (holding_id);
create index if not exists cash_flows_client_idx  on public.cash_flows (client_id);

alter table public.cash_flows enable row level security;

create policy cash_flows_select on public.cash_flows
  for select to authenticated
  using (public.has_client_access(client_id));

create policy cash_flows_insert on public.cash_flows
  for insert to authenticated
  with check (public.can_write_client(client_id));

create policy cash_flows_update on public.cash_flows
  for update to authenticated
  using  (public.can_write_client(client_id))
  with check (public.can_write_client(client_id));

create policy cash_flows_delete on public.cash_flows
  for delete to authenticated
  using (public.can_write_client(client_id));

create trigger cash_flows_set_updated_at
  before update on public.cash_flows
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.cash_flows to authenticated;
