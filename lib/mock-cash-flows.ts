// ─────────────────────────────────────────────────────────────────────────────
// LFA Investment OS — illustrative cash-flow history for the Atwater demo portfolio.
//
// All figures are FICTIONAL and for demonstration only. They correspond to the
// holdings in lib/mock-data.ts and are used exclusively in demo mode.
// Real client cash-flow data lives in Supabase behind RLS and is never stored here.
// ─────────────────────────────────────────────────────────────────────────────

export interface MockCashFlow {
  id: string;
  holdingId: string;
  date: string; // YYYY-MM-DD
  amount: number; // negative = capital out, positive = distribution / receipt
  label: string;
  notes: string;
}

export const MOCK_CASH_FLOWS: MockCashFlow[] = [
  // ── Municipal Bond Portfolio (muni) ─────────────────────────────────────────
  { id: "cf-muni-1", holdingId: "muni", date: "2021-04-01", amount: -7_100_000, label: "Initial purchase", notes: "Investment-grade tax-exempt ladder at inception." },
  { id: "cf-muni-2", holdingId: "muni", date: "2021-10-15", amount: 99_400,    label: "Coupon income",    notes: "Semi-annual interest." },
  { id: "cf-muni-3", holdingId: "muni", date: "2022-04-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-4", holdingId: "muni", date: "2022-10-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-5", holdingId: "muni", date: "2023-04-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-6", holdingId: "muni", date: "2023-10-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-7", holdingId: "muni", date: "2024-04-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-8", holdingId: "muni", date: "2024-10-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-9", holdingId: "muni", date: "2025-04-15", amount: 99_400,    label: "Coupon income",    notes: "" },
  { id: "cf-muni-10", holdingId: "muni", date: "2025-10-15", amount: 99_400,   label: "Coupon income",    notes: "" },
  { id: "cf-muni-11", holdingId: "muni", date: "2026-04-15", amount: 99_400,   label: "Coupon income",    notes: "" },

  // ── Public Equity Portfolio (equity) ────────────────────────────────────────
  { id: "cf-eq-1", holdingId: "equity", date: "2020-08-15", amount: -10_500_000, label: "Initial investment",  notes: "Global index + active blend at inception." },
  { id: "cf-eq-2", holdingId: "equity", date: "2022-05-01", amount: -2_740_000,  label: "Add-on equity",       notes: "Opportunistic addition during 2022 drawdown." },
  { id: "cf-eq-3", holdingId: "equity", date: "2023-12-15", amount: 355_000,     label: "Dividend / income",   notes: "Annual dividend reinvestment option passed." },
  { id: "cf-eq-4", holdingId: "equity", date: "2024-12-15", amount: 420_000,     label: "Dividend / income",   notes: "" },
  { id: "cf-eq-5", holdingId: "equity", date: "2025-12-15", amount: 465_000,     label: "Dividend / income",   notes: "" },

  // ── Private Credit Fund I (credit) ──────────────────────────────────────────
  { id: "cf-cr-1", holdingId: "credit", date: "2022-04-01",  amount: -2_500_000, label: "Capital call — 1st",  notes: "Initial drawdown." },
  { id: "cf-cr-2", holdingId: "credit", date: "2022-10-15",  amount: -1_800_000, label: "Capital call — 2nd",  notes: "" },
  { id: "cf-cr-3", holdingId: "credit", date: "2023-04-01",  amount: -1_380_000, label: "Capital call — 3rd",  notes: "Final funded tranche." },
  { id: "cf-cr-4", holdingId: "credit", date: "2023-09-15",  amount:  185_000,   label: "Income distribution", notes: "Quarterly current income." },
  { id: "cf-cr-5", holdingId: "credit", date: "2024-03-15",  amount:  225_000,   label: "Income distribution", notes: "" },
  { id: "cf-cr-6", holdingId: "credit", date: "2024-09-15",  amount:  275_000,   label: "Income distribution", notes: "" },
  { id: "cf-cr-7", holdingId: "credit", date: "2025-03-15",  amount:  315_000,   label: "Income distribution", notes: "" },
  { id: "cf-cr-8", holdingId: "credit", date: "2025-09-15",  amount:  330_000,   label: "Income distribution", notes: "" },
  { id: "cf-cr-9", holdingId: "credit", date: "2026-03-15",  amount:  345_000,   label: "Income distribution", notes: "" },

  // ── Industrial Services Direct Investment (industrial) ───────────────────────
  { id: "cf-ind-1", holdingId: "industrial", date: "2023-02-01", amount: -4_730_000, label: "Initial investment", notes: "Majority interest acquired." },

  // ── Real Estate Partnership (realestate) ────────────────────────────────────
  { id: "cf-re-1", holdingId: "realestate", date: "2021-08-01",  amount: -2_500_000, label: "Capital call — 1st",  notes: "Initial drawdown." },
  { id: "cf-re-2", holdingId: "realestate", date: "2022-02-15",  amount: -2_000_000, label: "Capital call — 2nd",  notes: "" },
  { id: "cf-re-3", holdingId: "realestate", date: "2022-11-01",  amount: -2_120_000, label: "Capital call — 3rd",  notes: "" },
  { id: "cf-re-4", holdingId: "realestate", date: "2024-06-15",  amount:  280_000,   label: "Income distribution", notes: "Property-level cash flow." },
  { id: "cf-re-5", holdingId: "realestate", date: "2025-01-15",  amount:  320_000,   label: "Income distribution", notes: "" },
  { id: "cf-re-6", holdingId: "realestate", date: "2025-10-15",  amount:  340_000,   label: "Income distribution", notes: "" },

  // ── Venture Fund II (venture) ────────────────────────────────────────────────
  { id: "cf-vc-1", holdingId: "venture", date: "2023-05-01",  amount: -1_800_000, label: "Capital call — 1st", notes: "Initial drawdown." },
  { id: "cf-vc-2", holdingId: "venture", date: "2024-03-15",  amount: -1_510_000, label: "Capital call — 2nd", notes: "" },

  // ── Roofing Platform Investment (roofing) ────────────────────────────────────
  { id: "cf-rf-1", holdingId: "roofing", date: "2024-04-01", amount: -2_840_000, label: "Initial investment", notes: "Buy-and-build platform acquisition." },
];
