// ─────────────────────────────────────────────────────────────────────────────
// LFA Investment OS — Mock data for the Atwater Family Office
//
// All figures are ILLUSTRATIVE and for demonstration only. Nothing in this file
// is investment advice. The application frames every analytical output as a
// review item, discussion point, or proposed framework requiring advisor sign-off.
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENT = {
  name: "Atwater Family Office",
  shortName: "Atwater",
  advisor: "Sarah Chen, CFA",
  advisorTitle: "Lead Advisor, Lodestone Family Advisors",
  relationshipSince: "2018",
  aum: 47_300_000,
  asOf: "May 31, 2026",
  reportingCurrency: "USD",
};

// ── Legal entities ───────────────────────────────────────────────────────────
export const ENTITIES = [
  {
    id: "holdings",
    name: "Atwater Holdings LLC",
    type: "Operating / Holding Company",
    value: 21_400_000,
    purpose: "Core liquid portfolio and operating-business interests.",
  },
  {
    id: "trust",
    name: "Atwater Family Trust",
    type: "Irrevocable Dynasty Trust",
    value: 18_700_000,
    purpose: "Multi-generational growth and legacy capital.",
  },
  {
    id: "partnership",
    name: "Atwater Investment Partnership LP",
    type: "Family Limited Partnership",
    value: 7_200_000,
    purpose: "Private markets commitments and co-investments.",
  },
] as const;

export type EntityId = (typeof ENTITIES)[number]["id"];

// ── Asset classes & chart palette ────────────────────────────────────────────
export type AssetClass =
  | "Cash & Reserves"
  | "Fixed Income"
  | "Public Equity"
  | "Private Credit"
  | "Real Assets"
  | "Private Equity & Venture"
  | "Direct / Operating";

export type LiquidityBucket =
  | "Daily"
  | "Quarterly"
  | "Annual"
  | "Multi-Year"
  | "Illiquid";

export type Market = "Public" | "Private";

const CLASS_COLORS: Record<AssetClass, string> = {
  "Cash & Reserves": "#8A94A6",
  "Fixed Income": "#3E5C82",
  "Public Equity": "#2C3E54",
  "Private Credit": "#8A6D3B",
  "Real Assets": "#5C7A6B",
  "Private Equity & Venture": "#6B5B7B",
  "Direct / Operating": "#A8763E",
};

export function classColor(c: AssetClass): string {
  return CLASS_COLORS[c];
}

// ── Holdings ─────────────────────────────────────────────────────────────────
export interface Holding {
  id: string;
  name: string;
  assetClass: AssetClass;
  market: Market;
  entity: EntityId;
  value: number;
  allocationPct: number;
  liquidity: LiquidityBucket;
  manager: string;
  vintage: string;
  commitment?: number;
  unfunded?: number;
  mgmtFeePct: number;
  carryPct?: number;
  note: string;
}

export const HOLDINGS: Holding[] = [
  {
    id: "cash",
    name: "Cash & Treasury Reserve",
    assetClass: "Cash & Reserves",
    market: "Public",
    entity: "holdings",
    value: 3_780_000,
    allocationPct: 8,
    liquidity: "Daily",
    manager: "Lodestone Treasury Sleeve",
    vintage: "Ongoing",
    mgmtFeePct: 0.0,
    note: "Operating cash and short Treasuries. Serves as the liquidity reserve buffer.",
  },
  {
    id: "muni",
    name: "Municipal Bond Portfolio",
    assetClass: "Fixed Income",
    market: "Public",
    entity: "holdings",
    value: 7_100_000,
    allocationPct: 15,
    liquidity: "Daily",
    manager: "Keystone Fixed Income",
    vintage: "2021",
    mgmtFeePct: 0.28,
    note: "Investment-grade, tax-exempt ladder aligned to the family's tax profile.",
  },
  {
    id: "equity",
    name: "Public Equity Portfolio",
    assetClass: "Public Equity",
    market: "Public",
    entity: "trust",
    value: 13_240_000,
    allocationPct: 28,
    liquidity: "Daily",
    manager: "Global Index + Active Blend",
    vintage: "2020",
    mgmtFeePct: 0.34,
    note: "Global diversified equity. Includes a low-basis legacy concentration under tax review.",
  },
  {
    id: "credit",
    name: "Private Credit Fund I",
    assetClass: "Private Credit",
    market: "Private",
    entity: "partnership",
    value: 5_680_000,
    allocationPct: 12,
    liquidity: "Multi-Year",
    manager: "Meridian Credit Partners",
    vintage: "2022",
    commitment: 7_000_000,
    unfunded: 1_320_000,
    mgmtFeePct: 1.25,
    carryPct: 15,
    note: "Senior secured direct lending. Quarterly income; limited redemption windows.",
  },
  {
    id: "industrial",
    name: "Industrial Services Direct Investment",
    assetClass: "Direct / Operating",
    market: "Private",
    entity: "holdings",
    value: 4_730_000,
    allocationPct: 10,
    liquidity: "Illiquid",
    manager: "Direct — family-controlled",
    vintage: "2023",
    mgmtFeePct: 0.0,
    note: "Majority interest in an industrial services operating business. Cyclical exposure.",
  },
  {
    id: "realestate",
    name: "Real Estate Partnership",
    assetClass: "Real Assets",
    market: "Private",
    entity: "partnership",
    value: 6_620_000,
    allocationPct: 14,
    liquidity: "Multi-Year",
    manager: "Cornerstone Real Assets",
    vintage: "2021",
    commitment: 7_500_000,
    unfunded: 880_000,
    mgmtFeePct: 1.0,
    carryPct: 20,
    note: "Diversified commercial real estate with property-level leverage.",
  },
  {
    id: "venture",
    name: "Venture Fund II",
    assetClass: "Private Equity & Venture",
    market: "Private",
    entity: "trust",
    value: 3_310_000,
    allocationPct: 7,
    liquidity: "Illiquid",
    manager: "Northlight Ventures",
    vintage: "2023",
    commitment: 4_000_000,
    unfunded: 690_000,
    mgmtFeePct: 2.0,
    carryPct: 20,
    note: "Early-stage venture. Manager track record currently under diligence review.",
  },
  {
    id: "roofing",
    name: "Roofing Platform Investment",
    assetClass: "Direct / Operating",
    market: "Private",
    entity: "holdings",
    value: 2_840_000,
    allocationPct: 6,
    liquidity: "Illiquid",
    manager: "Direct — co-control",
    vintage: "2024",
    mgmtFeePct: 0.0,
    note: "Buy-and-build roofing platform with an acquisition credit line. Operating leverage.",
  },
];

// ── Asset-class policy ranges (proposed framework, advisor-reviewed) ──────────
export interface PolicyRange {
  assetClass: AssetClass;
  min: number;
  target: number;
  max: number;
}

export const POLICY_RANGES: PolicyRange[] = [
  { assetClass: "Cash & Reserves", min: 3, target: 5, max: 10 },
  { assetClass: "Fixed Income", min: 12, target: 18, max: 25 },
  { assetClass: "Public Equity", min: 25, target: 32, max: 40 },
  { assetClass: "Private Credit", min: 8, target: 12, max: 16 },
  { assetClass: "Real Assets", min: 8, target: 12, max: 18 },
  { assetClass: "Private Equity & Venture", min: 5, target: 8, max: 12 },
  { assetClass: "Direct / Operating", min: 5, target: 10, max: 15 },
];

// Private-markets framework ceiling (illustrative governance guardrail)
export const PRIVATE_MARKETS_CEILING = 45; // % of AUM

// Liquidity reserve policy — dedicated cash buffer as % of AUM
export const LIQUIDITY_RESERVE_POLICY = { min: 10, target: 12, max: 15 };

// ── Performance (illustrative, net of fees) ──────────────────────────────────
export const PERFORMANCE = {
  ytd: 6.4,
  oneYear: 11.2,
  threeYearAnnualized: 9.1,
  inceptionCumulative: 54.7,
  benchmarkYtd: 5.1,
  benchmarkOneYear: 9.8,
  benchmarkLabel: "70/30 Blended Reference Index",
};

export const NETWORTH_TREND = [
  { period: "2021", value: 34.1 },
  { period: "2022", value: 33.8 },
  { period: "2023", value: 38.9 },
  { period: "2024", value: 42.6 },
  { period: "2025", value: 45.2 },
  { period: "2026 YTD", value: 47.3 },
];

// ── Liquidity planning ───────────────────────────────────────────────────────
// Forward obligations by horizon — the engine that prevents forced selling.
export const LIQUIDITY_NEEDS = [
  {
    id: "calls",
    label: "Expected capital calls",
    description: "Drawdowns against unfunded private-markets commitments.",
    m12: 2_500_000,
    m24: 2_890_000,
    m36: 2_890_000,
  },
  {
    id: "tax",
    label: "Tax reserve",
    description: "Estimated federal and state liabilities, including K-1 income.",
    m12: 900_000,
    m24: 1_850_000,
    m36: 2_800_000,
  },
  {
    id: "lifestyle",
    label: "Lifestyle distributions",
    description: "Planned distributions to family members.",
    m12: 1_200_000,
    m24: 2_400_000,
    m36: 3_650_000,
  },
  {
    id: "debt",
    label: "Debt service",
    description: "Scheduled principal and interest on entity-level borrowings.",
    m12: 600_000,
    m24: 1_200_000,
    m36: 1_800_000,
  },
];

// Sources available to meet obligations, by reliability of access.
export const LIQUIDITY_SOURCES = [
  {
    id: "reserve",
    label: "Cash & Treasury reserve",
    value: 3_780_000,
    access: "Immediate",
    note: "Dedicated liquidity buffer.",
  },
  {
    id: "fixed",
    label: "Municipal bond portfolio",
    value: 7_100_000,
    access: "Days",
    note: "Sellable without material market impact.",
  },
  {
    id: "equity",
    label: "Public equity (discretionary)",
    value: 13_240_000,
    access: "Days",
    note: "Available, but selling into weakness is a behavioral risk to manage.",
  },
];

// Forward capital-call schedule by fund.
export const CAPITAL_CALLS = [
  {
    fund: "Private Credit Fund I",
    commitment: 7_000_000,
    called: 5_680_000,
    unfunded: 1_320_000,
    expectedWindow: "Next 6–12 months",
  },
  {
    fund: "Real Estate Partnership",
    commitment: 7_500_000,
    called: 6_620_000,
    unfunded: 880_000,
    expectedWindow: "Next 12–18 months",
  },
  {
    fund: "Venture Fund II",
    commitment: 4_000_000,
    called: 3_310_000,
    unfunded: 690_000,
    expectedWindow: "Next 12–24 months",
  },
];

// ── Risk register — family-office specific ───────────────────────────────────
export type RiskSeverity = "Low" | "Moderate" | "Elevated";
export type RiskStatus =
  | "Advisor Review Required"
  | "Risk to Review"
  | "Discussion Point"
  | "Proposed Framework"
  | "Diligence in Progress"
  | "Monitoring"
  | "Governance Improvement"
  | "Opportunity to Evaluate";

export interface RiskItem {
  id: string;
  factor: string;
  severity: RiskSeverity;
  status: RiskStatus;
  exposure: string;
  observation: string;
  owner: string;
}

export const RISK_REGISTER: RiskItem[] = [
  {
    id: "concentration",
    factor: "Concentration risk",
    severity: "Elevated",
    status: "Advisor Review Required",
    exposure: "Direct / Operating at 16% vs 15% ceiling",
    observation:
      "Two operating businesses (industrial services, roofing platform) sit above the proposed Direct / Operating ceiling. Single-decision exposure to operational and cyclical outcomes.",
    owner: "Sarah Chen, CFA",
  },
  {
    id: "illiquidity",
    factor: "Illiquidity risk",
    severity: "Elevated",
    status: "Advisor Review Required",
    exposure: "Private markets at 49% vs 45% framework",
    observation:
      "Combined private and direct exposure is above the private-markets framework ceiling. Evaluate before new illiquid commitments to preserve flexibility.",
    owner: "Sarah Chen, CFA",
  },
  {
    id: "manager",
    factor: "Manager risk",
    severity: "Moderate",
    status: "Diligence in Progress",
    exposure: "Venture Fund II",
    observation:
      "Northlight Ventures track record and key-person provisions are in active diligence ahead of the next capital call.",
    owner: "Investment Committee",
  },
  {
    id: "leverage",
    factor: "Leverage risk",
    severity: "Moderate",
    status: "Monitoring",
    exposure: "Real estate + roofing acquisition line",
    observation:
      "Property-level debt and an acquisition credit facility introduce refinancing sensitivity in a higher-rate environment.",
    owner: "Sarah Chen, CFA",
  },
  {
    id: "operating",
    factor: "Operating-business exposure",
    severity: "Elevated",
    status: "Discussion Point",
    exposure: "16% of AUM in two operating businesses",
    observation:
      "Direct operating interests carry company-specific and management-execution risk distinct from market beta. Consider governance and reporting cadence.",
    owner: "Investment Committee",
  },
  {
    id: "tax",
    factor: "Tax risk",
    severity: "Moderate",
    status: "Opportunity to Evaluate",
    exposure: "Low-basis legacy equity position",
    observation:
      "A concentrated, low-basis public-equity position creates embedded gains and K-1 timing complexity. Tax-aware planning window to evaluate.",
    owner: "Sarah Chen, CFA",
  },
  {
    id: "governance",
    factor: "Governance risk",
    severity: "Moderate",
    status: "Governance Improvement",
    exposure: "IPS in draft; IC cadence not formalized",
    observation:
      "The Investment Policy Statement remains in draft and the Investment Committee meeting cadence is not yet documented. Formalize decision rights and review schedule.",
    owner: "Investment Committee",
  },
  {
    id: "behavioral",
    factor: "Behavioral risk",
    severity: "Low",
    status: "Proposed Framework",
    exposure: "No documented drawdown protocol",
    observation:
      "No pre-agreed protocol for decision-making during market drawdowns. A written framework reduces the risk of emotionally driven selling.",
    owner: "Investment Committee",
  },
];

// ── Strategic alignment / discovery process ──────────────────────────────────
export type DiscoveryState = "Complete" | "In Review" | "Draft" | "Not Started";

export interface DiscoverySection {
  id: string;
  title: string;
  state: DiscoveryState;
  summary: string;
  openQuestions: string[];
  missingInputs: string[];
}

export const DISCOVERY: DiscoverySection[] = [
  {
    id: "objectives",
    title: "Objectives clarity",
    state: "Complete",
    summary:
      "Preserve and grow multi-generational capital while funding current lifestyle and philanthropic intent.",
    openQuestions: [
      "How should philanthropic commitments be ring-fenced from growth capital?",
    ],
    missingInputs: [],
  },
  {
    id: "horizon",
    title: "Time-horizon mapping",
    state: "Complete",
    summary:
      "Capital segmented across reserve, stability, growth, and legacy horizons.",
    openQuestions: [],
    missingInputs: [],
  },
  {
    id: "liquidity",
    title: "Liquidity policy",
    state: "In Review",
    summary:
      "Reserve sizing and forward-obligation coverage drafted; reserve floor sits below the proposed range.",
    openQuestions: [
      "Confirm the dedicated reserve floor (currently proposed at 10–15% of AUM).",
      "Should unfunded commitments be pre-funded into the reserve?",
    ],
    missingInputs: ["Updated 36-month distribution plan from the family"],
  },
  {
    id: "risk",
    title: "Risk capacity vs. willingness",
    state: "In Review",
    summary:
      "Capacity supports the current growth orientation; stated willingness around illiquidity is being calibrated.",
    openQuestions: [
      "Is the family comfortable with private markets near the 45% framework ceiling?",
    ],
    missingInputs: ["Signed risk-tolerance questionnaire (2026 refresh)"],
  },
  {
    id: "governance",
    title: "Governance model",
    state: "Draft",
    summary:
      "Investment Committee composition and decision rights drafted; cadence not yet adopted.",
    openQuestions: [
      "Confirm IC quorum and voting thresholds.",
      "Adopt a standing quarterly review calendar.",
    ],
    missingInputs: ["Family sign-off on IC charter"],
  },
];

// ── Investment Policy Statement (document model) ─────────────────────────────
export const IPS = {
  version: "v0.9 — Draft",
  status: "Draft prepared for discussion" as const,
  preparedBy: "Sarah Chen, CFA · Lodestone Family Advisors",
  preparedDate: "May 18, 2026",
  reviewCadence: "Annual, with interim review on material change",
  nextReview: "Target adoption at the Q3 2026 Investment Committee",
  approvalWorkflow: [
    { step: "Drafted by advisor", state: "complete" },
    { step: "Advisor internal review", state: "complete" },
    { step: "Family review", state: "current" },
    { step: "Investment Committee approval", state: "pending" },
    { step: "Adopted", state: "pending" },
  ],
  sections: [
    {
      id: "purpose",
      heading: "Purpose & Scope",
      body: "This Investment Policy Statement establishes the framework, objectives, and governance under which the Atwater Family Office capital is managed across its legal entities. It is a working document prepared for discussion with Lodestone Family Advisors and is not a recommendation to buy or sell any security.",
    },
    {
      id: "objectives",
      heading: "Investment Objectives",
      body: "Preserve the real (after-inflation, after-tax) value of family capital across generations while funding current lifestyle distributions and philanthropic intent. Growth is pursued through disciplined diversification rather than market timing.",
    },
    {
      id: "horizon",
      heading: "Time Horizon",
      body: "Primary horizon is multi-generational (20+ years). Capital is segmented into reserve (0–2y), stability (2–7y), growth (7–15y), and legacy (15y+) horizons, each matched to appropriate liquidity.",
    },
    {
      id: "return",
      heading: "Return Orientation",
      body: "The portfolio is oriented toward long-term, after-tax, risk-adjusted outcomes relative to a blended reference index. No specific return is promised or guaranteed; the emphasis is on process discipline and avoiding unforced errors.",
    },
    {
      id: "risk",
      heading: "Risk Parameters",
      body: "Risk is governed through asset-class policy ranges, a private-markets exposure ceiling, a liquidity-reserve floor, and a standing risk register reviewed each quarter. Concentration in any single operating business is monitored against a proposed ceiling.",
    },
    {
      id: "allocation",
      heading: "Asset Allocation Policy",
      body: "Capital is allocated across asset classes within the policy ranges set out in the Allocation framework. Ranges — not single point targets — govern positioning, acknowledging that no single allocation is optimal in all environments.",
    },
    {
      id: "liquidity",
      heading: "Liquidity Policy",
      body: "A dedicated liquidity reserve is maintained to meet forward obligations (capital calls, taxes, distributions, debt service) without forced sales of long-horizon assets. Proposed reserve floor: 10–15% of AUM in cash and near-cash.",
    },
    {
      id: "rebalancing",
      heading: "Rebalancing Review Guidelines",
      body: "Allocations are reviewed against policy ranges quarterly. When an asset class moves outside its range, the variance is flagged for advisor review and discussed at the Investment Committee — rebalancing is a governance decision, not an automatic trade.",
    },
    {
      id: "permitted",
      heading: "Permitted Investments",
      body: "Cash and Treasuries, investment-grade municipal and taxable fixed income, diversified public equity, private credit, real assets, private equity and venture funds, and direct operating investments approved by the Investment Committee.",
    },
    {
      id: "restricted",
      heading: "Restricted Investments",
      body: "Tobacco and controversial-weapons manufacturing are excluded. Public equity is subject to an ESG screen. New single-name concentrations above 5% of AUM require Investment Committee approval. Use of portfolio leverage requires advisor and IC sign-off.",
    },
    {
      id: "governance",
      heading: "Decision Rights & Governance",
      body: "The Investment Committee holds approval authority for new commitments, rebalancing outside policy ranges, and changes to this policy. The advisor prepares analysis and recommendations for review; the family retains ultimate decision authority.",
    },
    {
      id: "monitoring",
      heading: "Monitoring & Review",
      body: "Performance, liquidity coverage, the risk register, and manager diligence are reviewed quarterly. This IPS is reviewed annually and upon any material change in family circumstances or market regime.",
    },
  ],
  advisorNotes: [
    "Reserve floor of 10–15% is a starting proposal — confirm against the family's comfort with selling liquid assets to meet calls.",
    "Recommend documenting the IC charter before adopting the rebalancing guidelines so decision rights are unambiguous.",
  ],
};

// ── Investment Committee pipeline ────────────────────────────────────────────
export type PipelineStage =
  | "Sourced"
  | "Initial Screen"
  | "Diligence"
  | "IC Review"
  | "Approved for Advisor Discussion"
  | "Declined"
  | "Invested"
  | "Monitoring";

export const PIPELINE_STAGES: PipelineStage[] = [
  "Sourced",
  "Initial Screen",
  "Diligence",
  "IC Review",
  "Approved for Advisor Discussion",
  "Declined",
  "Invested",
  "Monitoring",
];

export interface PipelineItem {
  id: string;
  name: string;
  sponsor: string;
  assetClass: AssetClass;
  stage: PipelineStage;
  targetCommitment: number;
  merits: string[];
  risks: string[];
  fees: string;
  liquidityTerms: string;
  alignment: string;
  taxConsiderations: string;
  openQuestions: string[];
  decisionStatus: string;
}

export const PIPELINE: PipelineItem[] = [
  {
    id: "p1",
    name: "Infrastructure Debt Fund III",
    sponsor: "Granite Infrastructure Partners",
    assetClass: "Private Credit",
    stage: "IC Review",
    targetCommitment: 3_000_000,
    merits: [
      "Contracted, inflation-linked cash flows",
      "Low correlation to existing private credit book",
    ],
    risks: ["Adds to private-markets exposure already above framework ceiling"],
    fees: "1.10% management · 12.5% carried interest over a 7% preferred return",
    liquidityTerms: "10-year fund life, 3-year investment period, no early redemption",
    alignment: "GP commitment of 3%; fits the stability horizon",
    taxConsiderations: "Generates K-1 income; modest UBTI screening required for the trust",
    openQuestions: [
      "Does this commitment fit before resolving the private-markets ceiling?",
      "Confirm capacity in the partnership entity.",
    ],
    decisionStatus: "Scheduled for the Q3 Investment Committee",
  },
  {
    id: "p2",
    name: "Direct Multifamily — Sunbelt",
    sponsor: "Cornerstone Real Assets (co-invest)",
    assetClass: "Real Assets",
    stage: "Approved for Advisor Discussion",
    targetCommitment: 2_000_000,
    merits: [
      "Co-invest with an existing, known manager",
      "No incremental management fee on the co-invest sleeve",
    ],
    risks: ["Property-level leverage; concentrated geographic exposure"],
    fees: "No management fee on co-invest · 15% carry over an 8% preferred return",
    liquidityTerms: "5–7 year hold, refinancing optionality at year 3",
    alignment: "Deepens an existing manager relationship with aligned terms",
    taxConsiderations: "Depreciation shelter; potential 1031 optionality at exit",
    openQuestions: ["Confirm reserve coverage before committing new illiquid capital."],
    decisionStatus: "Ready for advisor discussion with the family",
  },
  {
    id: "p3",
    name: "Secondary PE Portfolio",
    sponsor: "Harbor Lane Secondaries",
    assetClass: "Private Equity & Venture",
    stage: "Diligence",
    targetCommitment: 2_500_000,
    merits: ["Diversification across vintages", "Shorter J-curve via secondaries"],
    risks: ["Pricing opacity", "Adds to illiquid exposure"],
    fees: "1.00% management · 10% carry",
    liquidityTerms: "8-year fund life with earlier expected distributions",
    alignment: "Complements Venture Fund II with later-stage exposure",
    taxConsiderations: "Layered K-1 reporting across underlying funds",
    openQuestions: [
      "Validate underlying NAV marks.",
      "Assess overlap with the existing venture position.",
    ],
    decisionStatus: "Diligence in progress — analyst review underway",
  },
  {
    id: "p4",
    name: "Healthcare Royalty Fund",
    sponsor: "Meridian Life Sciences",
    assetClass: "Private Credit",
    stage: "Initial Screen",
    targetCommitment: 1_500_000,
    merits: ["Cash-yielding, non-correlated royalty streams"],
    risks: ["Single-sector concentration", "Patent-cliff exposure"],
    fees: "1.25% management · 15% carry",
    liquidityTerms: "9-year fund life",
    alignment: "Income orientation fits the stability horizon",
    taxConsiderations: "Ordinary income character on royalty distributions",
    openQuestions: ["Is sector concentration acceptable within private credit?"],
    decisionStatus: "Initial screen — not yet in formal diligence",
  },
  {
    id: "p5",
    name: "Lower Middle-Market Buyout Co-Invest",
    sponsor: "Ridgeline Capital",
    assetClass: "Private Equity & Venture",
    stage: "Sourced",
    targetCommitment: 2_000_000,
    merits: ["Direct co-invest economics", "Established operating partner"],
    risks: ["Single-company concentration", "Adds illiquidity"],
    fees: "No fee on co-invest sleeve · 10% carry",
    liquidityTerms: "4–6 year expected hold",
    alignment: "Opportunity to evaluate; not yet screened",
    taxConsiderations: "To be assessed",
    openQuestions: ["Initial screen pending."],
    decisionStatus: "Newly sourced — awaiting initial screen",
  },
  {
    id: "p6",
    name: "Special Situations Credit Fund",
    sponsor: "Blackford Distressed",
    assetClass: "Private Credit",
    stage: "Declined",
    targetCommitment: 0,
    merits: ["Attractive headline yield"],
    risks: ["Strategy drift", "Liquidity terms inconsistent with the IPS"],
    fees: "1.75% management · 20% carry",
    liquidityTerms: "Gated redemptions; long lockups",
    alignment: "Poor fit with the liquidity policy",
    taxConsiderations: "n/a",
    openQuestions: [],
    decisionStatus: "Declined at IC review — documented in the decision log",
  },
];

// ── Decision log (governance cadence) ────────────────────────────────────────
export const DECISION_LOG = [
  {
    id: "dl1",
    date: "May 14, 2026",
    topic: "Special Situations Credit Fund",
    decision: "Declined",
    rationale:
      "Gated redemption terms are inconsistent with the draft liquidity policy. Documented for the record.",
    body: "Investment Committee",
  },
  {
    id: "dl2",
    date: "Apr 28, 2026",
    topic: "Infrastructure Debt Fund III",
    decision: "Advanced to IC Review",
    rationale:
      "Merits warrant committee review; contingent on resolving the private-markets exposure question.",
    body: "Investment Committee",
  },
  {
    id: "dl3",
    date: "Mar 30, 2026",
    topic: "Liquidity reserve policy",
    decision: "Draft framework adopted for review",
    rationale:
      "Proposed a 10–15% reserve floor; flagged current reserve below range for family discussion.",
    body: "Advisor",
  },
  {
    id: "dl4",
    date: "Feb 11, 2026",
    topic: "Venture Fund II — next capital call",
    decision: "Diligence reopened",
    rationale:
      "Manager track record and key-person terms to be re-confirmed before the next drawdown.",
    body: "Investment Committee",
  },
];

// ── Meetings ─────────────────────────────────────────────────────────────────
export const MEETINGS = [
  {
    id: "m1",
    title: "Q2 Portfolio & Governance Review",
    date: "Jun 20, 2026",
    time: "10:00 AM ET",
    type: "Investment Committee",
    attendees: ["Sarah Chen, CFA", "Jonathan Atwater", "Eleanor Atwater"],
    status: "Scheduled",
    agenda: [
      "Liquidity reserve below policy range",
      "Private-markets exposure vs. framework",
      "Pipeline: Infrastructure Debt Fund III",
    ],
  },
  {
    id: "m2",
    title: "IPS Adoption Working Session",
    date: "Jul 15, 2026",
    time: "2:00 PM ET",
    type: "Family Review",
    attendees: ["Sarah Chen, CFA", "Jonathan Atwater"],
    status: "Scheduled",
    agenda: [
      "Walk through draft IPS v0.9",
      "Confirm liquidity reserve floor",
      "Adopt IC charter and cadence",
    ],
  },
  {
    id: "m3",
    title: "Private Credit Follow-On Discussion",
    date: "Jun 5, 2026",
    time: "11:00 AM ET",
    type: "Advisor Discussion",
    attendees: ["Sarah Chen, CFA", "Jonathan Atwater"],
    status: "Completed",
    agenda: ["Reviewed Meridian follow-on", "Deferred pending liquidity review"],
  },
];

// ── Documents ────────────────────────────────────────────────────────────────
export const DOCUMENTS = [
  {
    id: "doc1",
    name: "Investment Policy Statement v0.9 (Draft)",
    category: "Policy",
    updated: "May 18, 2026",
    owner: "Sarah Chen, CFA",
    status: "Draft for Advisor Review",
  },
  {
    id: "doc2",
    name: "Q1 2026 Portfolio & Liquidity Report",
    category: "Reporting",
    updated: "Apr 10, 2026",
    owner: "Lodestone Family Advisors",
    status: "Final",
  },
  {
    id: "doc3",
    name: "Infrastructure Debt Fund III — Diligence Memo",
    category: "Diligence",
    updated: "Apr 25, 2026",
    owner: "Investment Committee",
    status: "In Review",
  },
  {
    id: "doc4",
    name: "Venture Fund II — Manager Diligence Update",
    category: "Diligence",
    updated: "May 2, 2026",
    owner: "Sarah Chen, CFA",
    status: "In Review",
  },
  {
    id: "doc5",
    name: "2026 Tax-Aware Planning Summary",
    category: "Planning",
    updated: "Mar 1, 2026",
    owner: "Lodestone × Family CPA",
    status: "Draft for Advisor Review",
  },
  {
    id: "doc6",
    name: "Investment Committee Charter (Draft)",
    category: "Governance",
    updated: "May 9, 2026",
    owner: "Sarah Chen, CFA",
    status: "Draft for Advisor Review",
  },
];

// ── Review queue / attention items ───────────────────────────────────────────
export type AttentionTone = "critical" | "caution" | "info";
export type AttentionLabel =
  | "Advisor Review Required"
  | "Risk to Review"
  | "Decision for Investment Committee"
  | "Discussion Point"
  | "Governance Improvement"
  | "Opportunity to Evaluate";

export interface AttentionItem {
  id: string;
  label: AttentionLabel;
  tone: AttentionTone;
  title: string;
  detail: string;
  href: string;
  cta: string;
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "att-liquidity",
    label: "Advisor Review Required",
    tone: "critical",
    title: "Liquidity reserve is below the proposed policy range",
    detail:
      "The dedicated cash reserve is 8.0% of AUM, below the proposed 10–15% range. Review before approving new illiquid commitments.",
    href: "/liquidity",
    cta: "Review liquidity",
  },
  {
    id: "att-private",
    label: "Advisor Review Required",
    tone: "critical",
    title: "Private-markets exposure is above the current framework",
    detail:
      "Combined private and direct exposure is 49% versus the 45% framework ceiling. Advisor review required before additional commitments.",
    href: "/allocation",
    cta: "Review allocation",
  },
  {
    id: "att-concentration",
    label: "Risk to Review",
    tone: "caution",
    title: "Direct / Operating exposure is above the proposed ceiling",
    detail:
      "Two operating businesses total 16% of AUM versus a 15% ceiling. Flagged on the risk register for committee discussion.",
    href: "/risk",
    cta: "Open risk register",
  },
  {
    id: "att-ic",
    label: "Decision for Investment Committee",
    tone: "caution",
    title: "Three pipeline items are awaiting an Investment Committee decision",
    detail:
      "Infrastructure Debt Fund III, the Sunbelt multifamily co-invest, and the secondary PE portfolio are in or near IC review.",
    href: "/investments",
    cta: "Open pipeline",
  },
  {
    id: "att-ips",
    label: "Governance Improvement",
    tone: "info",
    title: "The Investment Policy Statement is in draft status",
    detail:
      "IPS v0.9 should be reviewed and adopted before implementing the rebalancing guidelines. Family review is the current step.",
    href: "/ips",
    cta: "Open IPS",
  },
  {
    id: "att-tax",
    label: "Opportunity to Evaluate",
    tone: "info",
    title: "Tax-aware planning window on the legacy equity position",
    detail:
      "A low-basis public-equity concentration may warrant a tax-aware review ahead of year-end. Opportunity to evaluate with the family CPA.",
    href: "/risk",
    cta: "Review consideration",
  },
];
