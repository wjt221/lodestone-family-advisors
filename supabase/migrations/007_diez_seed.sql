-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — Diez Family Office seed data
--
-- Creates the Diez Family Office client with entities and sample holdings.
-- Run this once against the target Supabase project after the initial schema
-- migrations have been applied.
--
-- IMPORTANT: No personally-identifiable data; all figures are illustrative.
-- ════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  diez_id          uuid := gen_random_uuid();
  entity_trust_id  uuid := gen_random_uuid();
  entity_llc_id    uuid := gen_random_uuid();
  entity_joint_id  uuid := gen_random_uuid();
BEGIN

  -- ── Client ──────────────────────────────────────────────────────────────
  INSERT INTO public.clients (
    id, name, short_name, relationship_since, reporting_currency, as_of
  ) VALUES (
    diez_id,
    'Diez Family Office',
    'Diez',
    '2021',
    'USD',
    '2026-05-19'
  );

  -- ── Entities ────────────────────────────────────────────────────────────
  INSERT INTO public.entities (id, client_id, name, type, value, purpose) VALUES
    (entity_trust_id, diez_id, 'Diez Family Trust',       'Trust',    32000000, 'Primary investment vehicle'),
    (entity_llc_id,   diez_id, 'Diez Holdings LLC',       'LLC',      18500000, 'Operating company holdings'),
    (entity_joint_id, diez_id, 'Carlos & Maria Joint',    'Joint',     9800000, 'Liquid accounts');

  -- ── Holdings ────────────────────────────────────────────────────────────
  INSERT INTO public.holdings (
    client_id, entity_id, name, asset_class, market, liquidity,
    value, allocation_pct, manager, vintage,
    commitment, unfunded, contributions, distributions,
    account, structure, strategy, status, owners, oversight
  ) VALUES
    -- Cash & Fixed Income — Morgan Stanley managed account
    (diez_id, entity_joint_id,
     'Cash & Fixed Income — Managed Account', 'Cash & Fixed Income', 'Public', 'Daily',
     8200000, 13.5, 'Morgan Stanley', NULL,
     NULL, NULL, 8200000, 310000,
     'Managed Account', 'SMA', 'Aggregate Bond', 'Open',
     '[{"name":"Carlos & Maria","pct":100}]', 'External'),

    -- Public Equities — diversified managed account
    (diez_id, entity_joint_id,
     'Public Market Equities — Managed Account', 'Public Market Equities', 'Public', 'Daily',
     6400000, 10.5, 'Morgan Stanley', NULL,
     NULL, NULL, 5100000, 220000,
     'Managed Account', 'SMA', 'Large Cap Blend', 'Open',
     '[{"name":"Carlos & Maria","pct":100}]', 'External'),

    -- Private Equity — Blackstone fund
    (diez_id, entity_trust_id,
     'Blackstone Capital Partners IX', 'Private Equity', 'Private', 'Illiquid',
     7800000, 12.8, 'Blackstone', '2020',
     10000000, 1800000, 8200000, 950000,
     'LP Interest', 'Limited Partnership', 'Buyout', 'Open',
     '[{"name":"Diez Family Trust","pct":100}]', 'External'),

    -- Real Estate — direct property
    (diez_id, entity_trust_id,
     'Coral Gables Residence LLC', 'Real Estate', 'Private', 'Illiquid',
     9500000, 15.6, 'Direct', '2019',
     NULL, NULL, 6200000, 0,
     'Direct', 'LLC', 'Residential Real Estate', 'Open',
     '[{"name":"Diez Family Trust","pct":100}]', 'Internal'),

    -- Real Estate — commercial
    (diez_id, entity_llc_id,
     'Brickell Commerce Center LP', 'Real Estate', 'Private', 'Multi-Year',
     5900000, 9.7, 'Redfearn Capital', '2021',
     7500000, 800000, 5200000, 480000,
     'LP Interest', 'Limited Partnership', 'Commercial Real Estate', 'Open',
     '[{"name":"Diez Holdings LLC","pct":100}]', 'External'),

    -- Private Credit
    (diez_id, entity_trust_id,
     'Blue Owl Credit Opportunities III', 'Private Credit', 'Private', 'Multi-Year',
     4200000, 6.9, 'Blue Owl', '2022',
     5000000, 600000, 3800000, 520000,
     'LP Interest', 'Limited Partnership', 'Direct Lending', 'Open',
     '[{"name":"Diez Family Trust","pct":100}]', 'External'),

    -- Venture Capital
    (diez_id, entity_llc_id,
     'Andreessen Horowitz Fund VI', 'Venture Capital', 'Private', 'Illiquid',
     3800000, 6.2, 'a16z', '2021',
     4000000, 400000, 3600000, 0,
     'LP Interest', 'Limited Partnership', 'Growth / VC', 'Open',
     '[{"name":"Diez Holdings LLC","pct":100}]', 'External'),

    -- Infrastructure
    (diez_id, entity_trust_id,
     'Brookfield Infrastructure Fund IV', 'Infrastructure', 'Private', 'Illiquid',
     3100000, 5.1, 'Brookfield', '2020',
     4000000, 700000, 2900000, 360000,
     'LP Interest', 'Limited Partnership', 'Core Infrastructure', 'Open',
     '[{"name":"Diez Family Trust","pct":100}]', 'External'),

    -- Hedge Funds
    (diez_id, entity_trust_id,
     'Two Sigma Spectrum Fund', 'Hedge Funds', 'Private', 'Quarterly',
     2200000, 3.6, 'Two Sigma', NULL,
     NULL, NULL, 2000000, 85000,
     'LP Interest', 'Limited Partnership', 'Quantitative Multi-Strategy', 'Open',
     '[{"name":"Diez Family Trust","pct":100}]', 'External'),

    -- Business interest
    (diez_id, entity_llc_id,
     'Diez & Sons Construction, LLC', 'Private Equity', 'Private', 'Illiquid',
     9700000, 16.0, 'Internal', '2008',
     NULL, NULL, 1200000, 4800000,
     'Direct', 'Operating Company', 'Construction / Operating Business', 'Open',
     '[{"name":"Carlos","pct":60},{"name":"Maria","pct":40}]', 'Internal');

END $$;
