# UX & Product Review — LFA Investment OS

A full product, UX, and design refactor of the Lodestone Family Advisors Investment OS.
The goal was to move the app from a generic SaaS dashboard to something that reads like
a real, premium family-office portal — an *Investment Operating System*, not a portfolio
tracker.

---

## 1. What was wrong with the prior version

The first build was functional but generic — "AI slop." Specifically:

- **Generic SaaS visual language.** Bright `blue-600` accents, drop-shadowed cards,
  emoji document icons, and a cold `slate-50` background. It looked like a startup
  template, not a private wealth portal.
- **Badge spam.** Coloured pills scattered everywhere with no hierarchy, so nothing
  read as important.
- **Numbers without meaning.** The dashboard showed AUM, returns, and a donut — but
  never told the advisor or family *what needed attention*.
- **Filler copy.** "Track your investments," "Manage your portfolio," "All active
  investments." Language that could belong to any fintech app.
- **Toy analytics.** Single-target allocation comparisons, an arbitrary 0–100 "risk
  score," and a liquidity tier table that didn't connect to actual obligations.
- **No product thesis.** Nothing expressed *how Lodestone improves outcomes* —
  through process, governance, and discipline rather than market prediction.
- **Thin data model.** Eight holdings with a colour and a percent; no entities,
  liquidity buckets, commitments, fees, policy ranges, pipeline, or decisions.

---

## 2. The new product / UX thesis

**Lodestone improves outcomes by improving process — not by predicting markets.**

The app is organised around the nine questions a serious family office should be able
to answer at any time:

1. Are we clear on the family's objectives? → **Strategy**
2. Do we have the right liquidity reserve? → **Liquidity**
3. Are we taking risk intentionally? → **Risk Register**
4. Is the portfolio aligned with the family's goals? → **Portfolio / Allocation**
5. Are we avoiding avoidable mistakes? → **Risk + Liquidity + Governance**
6. Are we making better capital-allocation decisions? → **Pipeline**
7. Are we tracking commitments, managers, risks, and follow-ups? → **Diligence / Portfolio**
8. Are decisions documented and reviewed with discipline? → **Meetings / Documents**
9. Where can Lodestone help improve after-tax, risk-adjusted outcomes? → surfaced as
   *Opportunities to Evaluate* throughout.

Every analytical output is framed as a **review item**, never a recommendation:
*Advisor Review Required · Risk to Review · Decision for Investment Committee ·
Discussion Point · Proposed Framework · Governance Improvement · Opportunity to Evaluate.*

---

## 3. Key design changes

**Visual system (`app/globals.css`)**
- Warm **paper** background and **ink** text instead of cold slate — a printed
  board-deck feel.
- A single restrained **brass/heritage accent**; bright blue removed entirely.
- **Editorial typography**: Fraunces serif for titles, section heads, and key figures;
  Geist sans for UI and tabular financial data (`font-variant-numeric: tabular-nums`).
- **Hairline borders** replace heavy shadows. More whitespace, stronger hierarchy.
- A small **semantic status palette** (positive / caution / critical / info) — muted,
  board-grade, used only where it carries meaning.

**Component library (new)**
- `PageHeader` — editorial eyebrow + serif title + lede + a single status pill.
- `Panel` / `PanelHeader` — calm hairline surface, the base container.
- `SectionHeading` — gives every page editorial rhythm.
- `StatusPill` — one restrained pill with a vocabulary→tone map (replaces badge spam).
- `ReviewFlag` — the core "what needs attention" unit; an observation, never a trade.
- `Stat` / `MetricRow` — labelled figures with tabular alignment.
- `PolicyRangeBar` — shows current positioning inside a min–target–max band.
- Refined `AllocationChart` (donut with centred AUM) and `NetWorthChart` (area trend).

**Information architecture / navigation**
- Sidebar regrouped into **Overview · Strategy & Policy · Portfolio · Governance**.
- Renamed to product language: Dashboard → *Command Center*, IPS → *Policy Statement*,
  Investments → *Pipeline*, Risk → *Risk Register*.

**Deeper data + centralized calculations**
- `lib/mock-data.ts` expanded into a real model: entities with values, holdings with
  market/liquidity/entity/commitments/fees, asset-class **policy ranges**, a
  private-markets ceiling, a liquidity-reserve policy, forward **liquidity needs**
  (12/24/36-mo), **capital-call** schedule, an 8-factor **risk register**, a structured
  **discovery** process, a full **IPS document** model with approval workflow, an
  **IC pipeline** with stages, a **decision log**, meetings with agendas, and a
  prioritized **review queue**.
- `lib/calculations.ts` centralizes all derived metrics (allocation by class / liquidity
  / entity, policy variance, public-private mix, liquidity coverage, concentration,
  blended fees) so pages render from one source of truth.

---

## 4. How the app now communicates LFA's return-improvement process

The product makes the *value of process* visible rather than implying market timing:

- **Allocation discipline** — positions shown against policy *ranges* (not a single
  "perfect" target); out-of-range classes become discussion points.
- **Liquidity discipline** — forward obligations mapped against sources by reliability
  of access, so the family can see exactly when meeting needs would require selling
  equities. This is framed as how Lodestone *prevents forced selling*.
- **Intentional risk** — a standing, family-office-specific risk register with a review
  queue, replacing a meaningless score.
- **Better capital allocation** — a disciplined IC pipeline (sourced → … → invested),
  each opportunity carrying merits, risks, fees, liquidity terms, alignment, and tax
  considerations.
- **Manager rigor** — a diligence tracker with standardized workstreams and explicit
  decision gates.
- **Governance & documentation** — a meeting cadence with agendas and a written
  decision log; an IPS with a visible approval workflow.
- **Fee transparency & tax awareness** — blended fee surfaced on the portfolio page;
  tax considerations on pipeline items and an *Opportunity to Evaluate* on the
  low-basis legacy position.

Crucially, every page ends with a disclosure and frames findings as review flags —
reinforcing advisor-led, not automated, decision-making.

---

## 5. Remaining design / product gaps

- **No persistence or interactivity beyond the wizard.** Inputs, approvals, and filters
  are static mock data.
- **Charts are intentionally minimal.** No drill-down, date-range, or attribution views.
- **Entity-level drill-down** is summarized, not navigable (no per-entity page).
- **Accessibility pass pending** — colour contrast on muted tones, focus-visible states,
  and full keyboard nav for the stepper/tables need an audit.
- **No mobile sidebar** — navigation is hidden below `md`; a drawer is needed.
- **Numbers are hand-tuned**, not generated from a consistent transaction ledger, so a
  few derived figures are illustrative rather than internally reconciled to the cent.
- **Document vault links are inert** (download buttons are placeholders).

---

## 6. Recommended next tickets

See the "Next 5 Linear tickets" in the build summary. In priority order:

1. **Mobile navigation drawer** + responsive audit of tables and the stage rail.
2. **Accessibility pass** — contrast, focus-visible, keyboard nav, ARIA on the wizard
   and data tables.
3. **Entity drill-down** — a per-entity view reusing the portfolio lenses.
4. **Liquidity scenario tool** — adjust distributions / call timing and re-derive
   coverage (labeled "Proposed Framework").
5. **Advisor review workflow** — make review flags and IPS approval steps stateful
   (assign, comment, mark reviewed) with an activity trail.
