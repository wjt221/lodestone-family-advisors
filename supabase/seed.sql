-- ════════════════════════════════════════════════════════════════════════════
-- LFA Investment OS — demo seed: Atwater Family Office
--
-- Run AFTER 001_initial_schema.sql. Seeds illustrative client data only. It does
-- NOT create auth users (those come from Supabase Auth). To exercise RLS, create
-- users in the dashboard, then link them with the snippet at the bottom.
--
-- Idempotent: fixed UUIDs + `on conflict do nothing`.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Client ──────────────────────────────────────────────────────────────────
insert into public.clients (id, name, short_name, relationship_since, reporting_currency, as_of)
values ('11111111-1111-1111-1111-111111111111', 'Atwater Family Office', 'Atwater', '2018', 'USD', 'May 31, 2026')
on conflict (id) do nothing;

-- ── Entities ──────────────────────────────────────────────────────────────────
insert into public.entities (id, client_id, name, type, value, purpose) values
  ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Atwater Holdings LLC', 'Operating / Holding Company', 21400000, 'Core liquid portfolio and operating-business interests.'),
  ('e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Atwater Family Trust', 'Irrevocable Dynasty Trust', 18700000, 'Multi-generational growth and legacy capital.'),
  ('e3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Atwater Investment Partnership LP', 'Family Limited Partnership', 7200000, 'Private markets commitments and co-investments.')
on conflict (id) do nothing;

-- ── Holdings ──────────────────────────────────────────────────────────────────
insert into public.holdings
  (client_id, entity_id, name, asset_class, market, liquidity, value, allocation_pct, manager, vintage, commitment, unfunded, mgmt_fee_pct, carry_pct, note)
values
  ('11111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Cash & Treasury Reserve', 'Cash & Reserves', 'Public', 'Daily', 3780000, 8, 'Lodestone Treasury Sleeve', 'Ongoing', null, null, 0.0, null, 'Operating cash and short Treasuries. Serves as the liquidity reserve buffer.'),
  ('11111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Municipal Bond Portfolio', 'Fixed Income', 'Public', 'Daily', 7100000, 15, 'Keystone Fixed Income', '2021', null, null, 0.28, null, 'Investment-grade, tax-exempt ladder aligned to the family''s tax profile.'),
  ('11111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Public Equity Portfolio', 'Public Equity', 'Public', 'Daily', 13240000, 28, 'Global Index + Active Blend', '2020', null, null, 0.34, null, 'Global diversified equity. Includes a low-basis legacy concentration under tax review.'),
  ('11111111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'Private Credit Fund I', 'Private Credit', 'Private', 'Multi-Year', 5680000, 12, 'Meridian Credit Partners', '2022', 7000000, 1320000, 1.25, 15, 'Senior secured direct lending. Quarterly income; limited redemption windows.'),
  ('11111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Industrial Services Direct Investment', 'Direct / Operating', 'Private', 'Illiquid', 4730000, 10, 'Direct — family-controlled', '2023', null, null, 0.0, null, 'Majority interest in an industrial services operating business. Cyclical exposure.'),
  ('11111111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'Real Estate Partnership', 'Real Assets', 'Private', 'Multi-Year', 6620000, 14, 'Cornerstone Real Assets', '2021', 7500000, 880000, 1.0, 20, 'Diversified commercial real estate with property-level leverage.'),
  ('11111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Venture Fund II', 'Private Equity & Venture', 'Private', 'Illiquid', 3310000, 7, 'Northlight Ventures', '2023', 4000000, 690000, 2.0, 20, 'Early-stage venture. Manager track record currently under diligence review.'),
  ('11111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Roofing Platform Investment', 'Direct / Operating', 'Private', 'Illiquid', 2840000, 6, 'Direct — co-control', '2024', null, null, 0.0, null, 'Buy-and-build roofing platform with an acquisition credit line. Operating leverage.')
on conflict do nothing;

-- ── Policy ranges ──────────────────────────────────────────────────────────────
insert into public.asset_allocations (client_id, asset_class, min_pct, target_pct, max_pct) values
  ('11111111-1111-1111-1111-111111111111', 'Cash & Reserves', 3, 5, 10),
  ('11111111-1111-1111-1111-111111111111', 'Fixed Income', 12, 18, 25),
  ('11111111-1111-1111-1111-111111111111', 'Public Equity', 25, 32, 40),
  ('11111111-1111-1111-1111-111111111111', 'Private Credit', 8, 12, 16),
  ('11111111-1111-1111-1111-111111111111', 'Real Assets', 8, 12, 18),
  ('11111111-1111-1111-1111-111111111111', 'Private Equity & Venture', 5, 8, 12),
  ('11111111-1111-1111-1111-111111111111', 'Direct / Operating', 5, 10, 15)
on conflict do nothing;

-- ── Liquidity needs ──────────────────────────────────────────────────────────────
insert into public.liquidity_needs (client_id, label, description, m12, m24, m36) values
  ('11111111-1111-1111-1111-111111111111', 'Expected capital calls', 'Drawdowns against unfunded private-markets commitments.', 2500000, 2890000, 2890000),
  ('11111111-1111-1111-1111-111111111111', 'Tax reserve', 'Estimated federal and state liabilities, including K-1 income.', 900000, 1850000, 2800000),
  ('11111111-1111-1111-1111-111111111111', 'Lifestyle distributions', 'Planned distributions to family members.', 1200000, 2400000, 3650000),
  ('11111111-1111-1111-1111-111111111111', 'Debt service', 'Scheduled principal and interest on entity-level borrowings.', 600000, 1200000, 1800000)
on conflict do nothing;

-- ── Risk register ──────────────────────────────────────────────────────────────
insert into public.risk_profiles (client_id, factor, severity, status, exposure, observation, owner) values
  ('11111111-1111-1111-1111-111111111111', 'Concentration risk', 'Elevated', 'Advisor Review Required', 'Direct / Operating at 16% vs 15% ceiling', 'Two operating businesses sit above the proposed Direct / Operating ceiling.', 'Sarah Chen, CFA'),
  ('11111111-1111-1111-1111-111111111111', 'Illiquidity risk', 'Elevated', 'Advisor Review Required', 'Private markets at 49% vs 45% framework', 'Combined private and direct exposure is above the framework ceiling.', 'Sarah Chen, CFA'),
  ('11111111-1111-1111-1111-111111111111', 'Manager risk', 'Moderate', 'Diligence in Progress', 'Venture Fund II', 'Northlight Ventures track record in active diligence ahead of the next call.', 'Investment Committee'),
  ('11111111-1111-1111-1111-111111111111', 'Governance risk', 'Moderate', 'Governance Improvement', 'IPS in draft; IC cadence not formalized', 'Formalize decision rights and the review schedule.', 'Investment Committee')
on conflict do nothing;

-- ── IPS document + version ────────────────────────────────────────────────────────
insert into public.ips_documents (id, client_id, title, status, version, prepared_by, review_cadence, next_review)
values ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', '11111111-1111-1111-1111-111111111111',
        'Atwater Family Office — Investment Policy', 'Draft for Advisor Review', 'v0.9 — Draft',
        'Sarah Chen, CFA · Lodestone Family Advisors', 'Annual, with interim review on material change',
        'Target adoption at the Q3 2026 Investment Committee')
on conflict (id) do nothing;

insert into public.ips_versions (client_id, ips_document_id, version, status, content)
values ('11111111-1111-1111-1111-111111111111', 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'v0.9', 'Draft',
        '{"note": "Draft prepared for discussion with Lodestone Family Advisors."}'::jsonb)
on conflict do nothing;

-- ── Diligence / pipeline ────────────────────────────────────────────────────────
insert into public.diligence_items
  (client_id, name, sponsor, asset_class, stage, target_commitment, merits, risks, fees, liquidity_terms, alignment, tax_considerations, open_questions, decision_status)
values
  ('11111111-1111-1111-1111-111111111111', 'Infrastructure Debt Fund III', 'Granite Infrastructure Partners', 'Private Credit', 'IC Review', 3000000,
   '["Contracted, inflation-linked cash flows","Low correlation to existing private credit"]'::jsonb,
   '["Adds to private-markets exposure already above the framework ceiling"]'::jsonb,
   '1.10% management · 12.5% carry over a 7% preferred return', '10-year fund life, no early redemption',
   'GP commitment of 3%; fits the stability horizon', 'Generates K-1 income; UBTI screening for the trust',
   '["Does this fit before resolving the private-markets ceiling?"]'::jsonb, 'Scheduled for the Q3 Investment Committee'),
  ('11111111-1111-1111-1111-111111111111', 'Direct Multifamily — Sunbelt', 'Cornerstone Real Assets (co-invest)', 'Real Assets', 'Approved for Advisor Discussion', 2000000,
   '["Co-invest with a known manager","No incremental management fee"]'::jsonb,
   '["Property-level leverage; concentrated geography"]'::jsonb,
   'No fee on co-invest · 15% carry over an 8% preferred return', '5–7 year hold',
   'Deepens an existing manager relationship', 'Depreciation shelter; potential 1031 optionality',
   '["Confirm reserve coverage before committing illiquid capital."]'::jsonb, 'Ready for advisor discussion with the family')
on conflict do nothing;

-- ── Meetings + action items ──────────────────────────────────────────────────────
insert into public.meetings (id, client_id, title, meeting_date, meeting_time, type, attendees, status, agenda) values
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Q2 Portfolio & Governance Review', 'Jun 20, 2026', '10:00 AM ET', 'Investment Committee',
   '["Sarah Chen, CFA","Jonathan Atwater","Eleanor Atwater"]'::jsonb, 'Scheduled',
   '["Liquidity reserve below policy range","Private-markets exposure vs. framework","Pipeline: Infrastructure Debt Fund III"]'::jsonb),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'IPS Adoption Working Session', 'Jul 15, 2026', '2:00 PM ET', 'Family Review',
   '["Sarah Chen, CFA","Jonathan Atwater"]'::jsonb, 'Scheduled',
   '["Walk through draft IPS v0.9","Confirm liquidity reserve floor","Adopt IC charter and cadence"]'::jsonb),
  ('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Private Credit Follow-On Discussion', 'Jun 5, 2026', '11:00 AM ET', 'Advisor Discussion',
   '["Sarah Chen, CFA","Jonathan Atwater"]'::jsonb, 'Completed',
   '["Reviewed Meridian follow-on","Deferred pending liquidity review"]'::jsonb)
on conflict (id) do nothing;

insert into public.action_items (client_id, title, description, status, due_date, assigned_to, meeting_id) values
  ('11111111-1111-1111-1111-111111111111', 'Propose liquidity reserve floor', 'Bring a 10–15% reserve recommendation to the family.', 'Open', 'Jun 20, 2026', 'Sarah Chen, CFA', 'aaaa3333-3333-3333-3333-333333333333'),
  ('11111111-1111-1111-1111-111111111111', 'Complete Infrastructure Debt III diligence', 'Finish operational + tax review before the IC vote.', 'Open', 'Jun 18, 2026', 'Investment Committee', null)
on conflict do nothing;

-- ── Documents (metadata only; files live in private Storage buckets) ───────────────
insert into public.documents (client_id, name, category, storage_bucket, storage_path, owner, status) values
  ('11111111-1111-1111-1111-111111111111', 'Investment Policy Statement v0.9 (Draft)', 'Policy', 'ips-documents', 'atwater/ips-v0.9.pdf', 'Sarah Chen, CFA', 'Draft for Advisor Review'),
  ('11111111-1111-1111-1111-111111111111', 'Q1 2026 Portfolio & Liquidity Report', 'Reporting', 'client-documents', 'atwater/q1-2026-report.pdf', 'Lodestone Family Advisors', 'Final'),
  ('11111111-1111-1111-1111-111111111111', 'Infrastructure Debt Fund III — Diligence Memo', 'Diligence', 'diligence-documents', 'atwater/infra-debt-iii.pdf', 'Investment Committee', 'In Review'),
  ('11111111-1111-1111-1111-111111111111', 'Investment Committee Charter (Draft)', 'Governance', 'client-documents', 'atwater/ic-charter.pdf', 'Sarah Chen, CFA', 'Draft for Advisor Review')
on conflict do nothing;

-- ── Advisor notes (private to advisors/admins unless client_visible) ───────────────
insert into public.advisor_notes (client_id, body, author, client_visible, related_type) values
  ('11111111-1111-1111-1111-111111111111', 'Reserve floor of 10–15% is a starting proposal — confirm comfort with selling liquid assets to meet calls.', 'Sarah Chen, CFA', false, 'ips'),
  ('11111111-1111-1111-1111-111111111111', 'Recommend documenting the IC charter before adopting rebalancing guidelines.', 'Sarah Chen, CFA', false, 'governance'),
  ('11111111-1111-1111-1111-111111111111', 'Summary shared with the family ahead of the Q2 review.', 'Sarah Chen, CFA', true, 'meeting')
on conflict do nothing;

-- ════════════════════════════════════════════════════════════════════════════
-- LINK AUTH USERS (run after creating users in Supabase Auth)
-- Replace the UUIDs with real auth.users ids, then uncomment.
--
--   -- make a user an admin
--   update public.profiles set role = 'admin' where id = '<admin-user-uuid>';
--
--   -- assign an advisor to the Atwater client
--   update public.profiles set role = 'advisor' where id = '<advisor-user-uuid>';
--   insert into public.advisor_client_assignments (client_id, advisor_id)
--   values ('11111111-1111-1111-1111-111111111111', '<advisor-user-uuid>');
--
--   -- add a client (family member) user to the Atwater client
--   insert into public.client_users (client_id, user_id)
--   values ('11111111-1111-1111-1111-111111111111', '<client-user-uuid>');
-- ════════════════════════════════════════════════════════════════════════════
