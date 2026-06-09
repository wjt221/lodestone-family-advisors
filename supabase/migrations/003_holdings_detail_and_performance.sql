-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — holdings detail columns + performance summaries
--
-- Extends `holdings` with the columns a real schedule of alternative
-- investments carries (account, structure, strategy, cashflows, status), and
-- adds `performance_summaries` for asset-class / entity / total-level returns
-- vs benchmarks and the expected-return framework.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.holdings
  add column if not exists account text,
  add column if not exists structure text,
  add column if not exists strategy text,
  add column if not exists status text not null default 'Open',
  add column if not exists contributions numeric(16,2),
  add column if not exists distributions numeric(16,2);

create table if not exists public.performance_summaries (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients (id) on delete cascade,
  scope            text not null, -- 'asset_class' | 'internal_asset_class' | 'entity' | 'total' | 'other'
  label            text not null,
  amount           numeric(16,2),
  actual_pct       numeric(8,5),
  target_pct       numeric(8,5),
  return_net       numeric(8,5),
  benchmark_return numeric(8,5),
  excess_return    numeric(8,5),
  expected_return  numeric(8,5),
  as_of            text,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.performance_summaries enable row level security;
create policy performance_summaries_select on public.performance_summaries
  for select to authenticated using (public.has_client_access(client_id));
create policy performance_summaries_insert on public.performance_summaries
  for insert to authenticated with check (public.can_write_client(client_id));
create policy performance_summaries_update on public.performance_summaries
  for update to authenticated using (public.can_write_client(client_id)) with check (public.can_write_client(client_id));
create policy performance_summaries_delete on public.performance_summaries
  for delete to authenticated using (public.can_write_client(client_id));
create trigger performance_summaries_set_updated_at
  before update on public.performance_summaries
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.performance_summaries to authenticated;
