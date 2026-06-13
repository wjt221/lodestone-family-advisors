// ─────────────────────────────────────────────────────────────────────────────
// Advisor-Led IPS Workbench — defaults & declarative section configuration
//
// The eleven sections are driven by a single declarative config (prompts,
// advisor guidance, and field specs). One generic renderer consumes this, so
// adding/adjusting a field is a data change, not a new component.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IPSProfile,
  IPSSectionBase,
  IPSSectionKey,
  SectionConfidence,
  SectionStatus,
} from "./ipsTypes";

// ── Field specs consumed by the generic decision-capture renderer ────────────
export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "percent"
  | "currency"
  | "toggle"
  | "select"
  | "multiselect"
  | "stringList"
  | "objectList";

export type FieldOption = { value: string; label: string };

export type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  options?: FieldOption[];
  placeholder?: string;
  hint?: string;
  /** sub-fields for objectList rows */
  itemFields?: FieldSpec[];
  /** singular noun for an objectList "Add" affordance */
  itemLabel?: string;
  /** render across the full width */
  full?: boolean;
};

export type SectionConfig = {
  key: IPSSectionKey;
  title: string;
  shortTitle: string;
  purpose: string;
  prompts: string[];
  guidance: string;
  fields: FieldSpec[];
};

const opt = (pairs: [string, string][]): FieldOption[] =>
  pairs.map(([value, label]) => ({ value, label }));

// labels stored as their own value (multiselect of human-readable strings)
const labels = (...xs: string[]): FieldOption[] => xs.map((x) => ({ value: x, label: x }));

// ── Shared option lists ──────────────────────────────────────────────────────
export const ASSET_CLASS_OPTIONS = labels(
  "Cash",
  "Fixed income",
  "Public equities",
  "Private equity",
  "Private credit",
  "Real estate",
  "Hedge funds",
  "Venture capital",
  "Direct investments",
  "Operating businesses",
  "Commodities / real assets",
  "Crypto / digital assets",
  "Philanthropic capital",
  "Other",
);

const SCALE_LMHV = opt([
  ["low", "Low"],
  ["moderate", "Moderate"],
  ["high", "High"],
  ["very_high", "Very high"],
]);

const CADENCE = opt([
  ["monthly", "Monthly"],
  ["quarterly", "Quarterly"],
  ["semiannual", "Semi-annual"],
  ["annual", "Annual"],
  ["ad_hoc", "Ad hoc"],
]);

// ── Section configuration ────────────────────────────────────────────────────
export const SECTION_CONFIG: SectionConfig[] = [
  {
    key: "clientProfile",
    title: "Client Profile & Purpose of Capital",
    shortTitle: "Client Profile",
    purpose: "Define what this capital is for and who is involved in decisions.",
    prompts: [
      "What is the purpose of this pool of capital?",
      "Is this capital meant to preserve wealth, replace income, fund lifestyle, support philanthropy, or compound for future generations?",
      "Who needs to be involved in decisions?",
      "What would make this strategy successful over the next 3, 5, and 10 years?",
    ],
    guidance:
      "Help the client distinguish between capital with different jobs. If the client has multiple goals, suggest using sleeves rather than forcing one objective.",
    fields: [
      { key: "clientName", label: "Client name", kind: "text" },
      { key: "familyName", label: "Family name", kind: "text" },
      { key: "familyOfficeEntityName", label: "Family office / entity name", kind: "text" },
      { key: "primaryDecisionMaker", label: "Primary decision maker", kind: "text" },
      {
        key: "additionalStakeholders",
        label: "Additional stakeholders",
        kind: "stringList",
        itemLabel: "stakeholder",
        full: true,
      },
      {
        key: "capitalType",
        label: "Capital type",
        kind: "select",
        options: opt([
          ["personal", "Personal"],
          ["family_office", "Family office"],
          ["trust", "Trust"],
          ["foundation", "Foundation"],
          ["operating_company", "Operating company"],
          ["retirement", "Retirement"],
          ["other", "Other"],
        ]),
      },
      {
        key: "purposeOfCapital",
        label: "Purpose of capital",
        kind: "multiselect",
        full: true,
        options: labels(
          "Preserve multigenerational wealth",
          "Replace operating business income",
          "Fund lifestyle needs",
          "Support philanthropy",
          "Prepare for succession",
          "Invest after a business sale",
          "Compound capital aggressively",
          "Create flexibility for future opportunities",
          "Other",
        ),
      },
      { key: "otherPurpose", label: "Other purpose (detail)", kind: "text", full: true },
      { key: "successThreeYears", label: "What success looks like — 3 years", kind: "textarea", full: true },
      { key: "successFiveYears", label: "What success looks like — 5 years", kind: "textarea", full: true },
      { key: "successTenYears", label: "What success looks like — 10 years", kind: "textarea", full: true },
    ],
  },
  {
    key: "objectives",
    title: "Investment Objectives",
    shortTitle: "Objectives",
    purpose: "Define what the portfolio is trying to accomplish.",
    prompts: [
      "What is the primary objective of this capital?",
      "Do you need current income, long-term growth, preservation, or a combination?",
      "Is there a required return or preferred return?",
      "How should we measure success?",
    ],
    guidance:
      "Separate required return from desired return. If the client needs a high return to support spending, flag that risk capacity may be lower than desired risk tolerance.",
    fields: [
      {
        key: "primaryObjective",
        label: "Primary objective",
        kind: "select",
        options: opt([
          ["capital_preservation", "Capital preservation"],
          ["balanced_growth", "Balanced growth"],
          ["long_term_capital_appreciation", "Long-term capital appreciation"],
          ["income_generation", "Income generation"],
          ["tax_efficient_compounding", "Tax-efficient compounding"],
          ["opportunistic_asymmetric_return", "Opportunistic / asymmetric return"],
        ]),
      },
      {
        key: "incomeVsTotalReturn",
        label: "Income vs. total return",
        kind: "select",
        options: opt([
          ["income", "Income"],
          ["total_return", "Total return"],
          ["both", "Both"],
          ["not_sure", "Not sure"],
        ]),
      },
      { key: "requiredReturn", label: "Required return", kind: "percent" },
      { key: "preferredReturn", label: "Preferred return", kind: "percent" },
      { key: "inflationProtectionNeeded", label: "Inflation protection needed", kind: "toggle" },
      {
        key: "benchmarkType",
        label: "Benchmark type",
        kind: "select",
        options: opt([
          ["absolute_return", "Absolute return"],
          ["cpi_plus_spread", "CPI + spread"],
          ["sixty_forty", "60/40"],
          ["custom_blended_benchmark", "Custom blended benchmark"],
          ["peer_family_office_benchmark", "Peer family-office benchmark"],
          ["none_yet", "None yet"],
        ]),
      },
      {
        key: "secondaryObjectives",
        label: "Secondary objectives",
        kind: "stringList",
        itemLabel: "objective",
        full: true,
      },
    ],
  },
  {
    key: "riskProfile",
    title: "Risk Profile",
    shortTitle: "Risk Profile",
    purpose: "Separate emotional risk tolerance from actual financial risk capacity.",
    prompts: [
      "How much volatility can you emotionally tolerate?",
      "How much loss can the portfolio financially absorb without changing your life, plans, or obligations?",
      "What would you do if the portfolio declined by 10%, 20%, or 30%?",
      "Which risks bother you most: volatility, permanent loss, illiquidity, concentration, leverage, or complexity?",
    ],
    guidance:
      "Do not reduce risk to a single score. Capture the difference between emotional tolerance and financial capacity, and flag contradictions.",
    fields: [
      {
        key: "riskArchetype",
        label: "Risk archetype",
        kind: "select",
        options: opt([
          ["defensive", "Defensive"],
          ["conservative", "Conservative"],
          ["balanced", "Balanced"],
          ["growth", "Growth"],
          ["aggressive", "Aggressive"],
          ["opportunistic", "Opportunistic"],
        ]),
      },
      { key: "riskTolerance", label: "Risk tolerance (emotional)", kind: "select", options: SCALE_LMHV },
      { key: "riskCapacity", label: "Risk capacity (financial)", kind: "select", options: SCALE_LMHV },
      { key: "maxAcceptableDrawdown", label: "Max acceptable drawdown", kind: "percent" },
      {
        key: "primaryRiskConcerns",
        label: "Primary risk concerns",
        kind: "multiselect",
        full: true,
        options: labels(
          "Permanent loss of capital",
          "Volatility",
          "Illiquidity",
          "Concentration",
          "Complexity",
          "Leverage",
          "Manager risk",
          "Reputational risk",
          "Tax inefficiency",
          "Family conflict",
        ),
      },
      { key: "responseToTenPercentDecline", label: "Response to a 10% decline", kind: "textarea", full: true },
      { key: "responseToTwentyPercentDecline", label: "Response to a 20% decline", kind: "textarea", full: true },
      { key: "responseToThirtyPercentDecline", label: "Response to a 30% decline", kind: "textarea", full: true },
      { key: "volatilityComfort", label: "Volatility comfort (notes)", kind: "textarea", full: true },
    ],
  },
  {
    key: "liquidity",
    title: "Liquidity & Cash Needs",
    shortTitle: "Liquidity",
    purpose: "Define cash needs and liquidity constraints before making allocation decisions.",
    prompts: [
      "What cash needs must this portfolio support?",
      "What annual spending, tax payments, debt payments, capital calls, or major purchases should we plan for?",
      "How much of the portfolio can be illiquid?",
      "What lockups are acceptable?",
    ],
    guidance:
      "Liquidity should drive allocation constraints. If a client has near-term obligations, flag any mismatch with illiquid investing.",
    fields: [
      { key: "annualLifestyleSpendingNeed", label: "Annual lifestyle spending need", kind: "currency" },
      { key: "annualTaxReserveNeed", label: "Annual tax reserve need", kind: "currency" },
      { key: "minimumCashReserve", label: "Minimum cash reserve", kind: "currency" },
      { key: "emergencyReserve", label: "Emergency reserve", kind: "currency" },
      { key: "illiquidInvestmentsAcceptable", label: "Illiquid investments acceptable", kind: "toggle" },
      { key: "maxIlliquidPercentage", label: "Max illiquid %", kind: "percent" },
      {
        key: "lockupTolerance",
        label: "Lockup tolerance",
        kind: "select",
        options: opt([
          ["none", "None"],
          ["one_year", "One year"],
          ["three_years", "Three years"],
          ["five_years", "Five years"],
          ["ten_plus_years", "Ten-plus years"],
          ["not_sure", "Not sure"],
        ]),
      },
      {
        key: "majorCashNeeds",
        label: "Major cash needs",
        kind: "objectList",
        itemLabel: "cash need",
        full: true,
        itemFields: [
          { key: "description", label: "Description", kind: "text" },
          { key: "amount", label: "Amount", kind: "currency" },
          {
            key: "expectedTiming",
            label: "Timing",
            kind: "select",
            options: opt([
              ["less_than_1_year", "< 1 year"],
              ["1_to_3_years", "1–3 years"],
              ["3_to_5_years", "3–5 years"],
              ["5_to_10_years", "5–10 years"],
              ["10_plus_years", "10+ years"],
              ["unknown", "Unknown"],
            ]),
          },
          {
            key: "priority",
            label: "Priority",
            kind: "select",
            options: opt([
              ["low", "Low"],
              ["medium", "Medium"],
              ["high", "High"],
              ["required", "Required"],
            ]),
          },
        ],
      },
      { key: "upcomingTransactions", label: "Upcoming transactions", kind: "textarea", full: true },
      { key: "debtObligations", label: "Debt obligations", kind: "textarea", full: true },
      { key: "capitalCalls", label: "Capital calls", kind: "textarea", full: true },
    ],
  },
  {
    key: "timeHorizon",
    title: "Time Horizon & Capital Sleeves",
    shortTitle: "Time Horizon",
    purpose: "Determine whether the client has one pool of capital or multiple sleeves.",
    prompts: [
      "Is this one pool of capital or should we separate it into sleeves?",
      "What capital is short-term, what is long-term, and what is multigenerational?",
      "Should lifestyle, core growth, opportunistic investing, and philanthropy be managed separately?",
    ],
    guidance:
      "For many families, one blended portfolio is less useful than sleeves with different liquidity, risk, and return objectives.",
    fields: [
      {
        key: "primaryTimeHorizon",
        label: "Primary time horizon",
        kind: "select",
        options: opt([
          ["0_to_3_years", "0–3 years"],
          ["3_to_5_years", "3–5 years"],
          ["5_to_10_years", "5–10 years"],
          ["10_plus_years", "10+ years"],
          ["multigenerational", "Multigenerational"],
        ]),
      },
      { key: "useCapitalSleeves", label: "Use capital sleeves", kind: "toggle" },
      {
        key: "capitalSleeves",
        label: "Capital sleeves",
        kind: "objectList",
        itemLabel: "sleeve",
        full: true,
        itemFields: [
          {
            key: "name",
            label: "Sleeve",
            kind: "select",
            options: opt([
              ["operating_liquidity", "Operating liquidity"],
              ["lifestyle_reserve", "Lifestyle reserve"],
              ["core_portfolio", "Core portfolio"],
              ["growth_portfolio", "Growth portfolio"],
              ["opportunistic_direct_deals", "Opportunistic / direct deals"],
              ["philanthropy", "Philanthropy"],
              ["next_generation_capital", "Next-generation capital"],
              ["other", "Other"],
            ]),
          },
          { key: "description", label: "Description", kind: "text" },
          { key: "targetAmount", label: "Target amount", kind: "currency" },
          { key: "targetPercentage", label: "Target %", kind: "percent" },
          { key: "timeHorizon", label: "Time horizon", kind: "text" },
          { key: "riskLevel", label: "Risk level", kind: "text" },
          { key: "liquidityNeed", label: "Liquidity need", kind: "text" },
        ],
      },
    ],
  },
  {
    key: "allocationPreferences",
    title: "Asset Allocation Preferences",
    shortTitle: "Allocation",
    purpose: "Capture current allocation, preferred style, and asset classes to include, avoid, or limit.",
    prompts: [
      "How is the portfolio currently allocated?",
      "What type of allocation style feels appropriate?",
      "Which asset classes should be considered, avoided, or limited?",
      "Should the advisor later prepare a recommended allocation based on this IPS?",
    ],
    guidance:
      "Do not generate a final allocation here. Capture preferences and constraints that will later inform the allocation module — any allocation is advisor review required.",
    fields: [
      { key: "currentAllocationKnown", label: "Current allocation known", kind: "toggle" },
      { key: "currentAllocationNotes", label: "Current allocation notes", kind: "textarea", full: true },
      {
        key: "desiredAllocationStyle",
        label: "Desired allocation style",
        kind: "select",
        options: opt([
          ["traditional_public_markets", "Traditional public markets"],
          ["endowment_style", "Endowment style"],
          ["private_wealth_preservation", "Private wealth preservation"],
          ["founder_liquidity_portfolio", "Founder liquidity portfolio"],
          ["income_oriented", "Income oriented"],
          ["opportunistic_direct_investing", "Opportunistic direct investing"],
          ["custom", "Custom"],
        ]),
      },
      { key: "includedAssetClasses", label: "Asset classes to include", kind: "multiselect", options: ASSET_CLASS_OPTIONS, full: true },
      { key: "excludedAssetClasses", label: "Asset classes to avoid", kind: "multiselect", options: ASSET_CLASS_OPTIONS, full: true },
      { key: "limitedAssetClasses", label: "Asset classes to limit", kind: "multiselect", options: ASSET_CLASS_OPTIONS, full: true },
      {
        key: "targetRanges",
        label: "Target ranges (advisor review required)",
        kind: "objectList",
        itemLabel: "range",
        full: true,
        itemFields: [
          { key: "assetClass", label: "Asset class", kind: "select", options: ASSET_CLASS_OPTIONS },
          { key: "minPercentage", label: "Min %", kind: "percent" },
          { key: "targetPercentage", label: "Target %", kind: "percent" },
          { key: "maxPercentage", label: "Max %", kind: "percent" },
          { key: "notes", label: "Notes", kind: "text" },
        ],
      },
      {
        key: "advisorAllocationRecommendationNeeded",
        label: "Advisor allocation recommendation needed",
        kind: "toggle",
      },
    ],
  },
  {
    key: "concentrationAndRiskLimits",
    title: "Concentration & Risk Limits",
    shortTitle: "Concentration",
    purpose: "Capture portfolio guardrails that later feed risk alerts and approval workflows.",
    prompts: [
      "What concentration risks already exist?",
      "What limits should apply to a single manager, fund, company, asset class, or direct deal?",
      "Are there legacy assets that should not be sold?",
      "Are there holdings that are emotionally, tax, control, or family sensitive?",
    ],
    guidance: "Concentration limits should later feed risk alerts and investment approval workflows.",
    fields: [
      { key: "maxSingleManagerExposure", label: "Max single manager %", kind: "percent" },
      { key: "maxSingleFundExposure", label: "Max single fund %", kind: "percent" },
      { key: "maxSingleCompanyExposure", label: "Max single company %", kind: "percent" },
      { key: "maxSingleAssetClassExposure", label: "Max single asset class %", kind: "percent" },
      { key: "maxDirectDealExposure", label: "Max direct deal %", kind: "percent" },
      { key: "maxIlliquidExposure", label: "Max illiquid %", kind: "percent" },
      { key: "maxLeverageExposure", label: "Max leverage %", kind: "percent" },
      {
        key: "legacyConcentratedHoldings",
        label: "Legacy concentrated holdings",
        kind: "objectList",
        itemLabel: "holding",
        full: true,
        itemFields: [
          { key: "assetName", label: "Asset name", kind: "text" },
          { key: "assetType", label: "Asset type", kind: "text" },
          { key: "estimatedValue", label: "Estimated value", kind: "currency" },
          { key: "estimatedPercentageOfPortfolio", label: "% of portfolio", kind: "percent" },
          { key: "reasonForConcentration", label: "Reason for concentration", kind: "text" },
          {
            key: "desiredAction",
            label: "Desired action",
            kind: "select",
            options: opt([
              ["hold", "Hold"],
              ["reduce_over_time", "Reduce over time"],
              ["review", "Review"],
              ["sell_when_tax_efficient", "Sell when tax-efficient"],
              ["undecided", "Undecided"],
            ]),
          },
        ],
      },
      {
        key: "assetsNotToSell",
        label: "Assets not to sell",
        kind: "objectList",
        itemLabel: "asset",
        full: true,
        itemFields: [
          { key: "assetName", label: "Asset name", kind: "text" },
          {
            key: "reason",
            label: "Reason",
            kind: "select",
            options: opt([
              ["tax", "Tax"],
              ["family", "Family"],
              ["control", "Control"],
              ["emotional", "Emotional"],
              ["legal", "Legal"],
              ["illiquid", "Illiquid"],
              ["other", "Other"],
            ]),
          },
          { key: "notes", label: "Notes", kind: "text" },
        ],
      },
    ],
  },
  {
    key: "taxEstateAndStructure",
    title: "Tax, Estate & Structural Constraints",
    shortTitle: "Tax / Estate",
    purpose: "Capture constraints that require coordination with outside advisors.",
    prompts: [
      "How tax-sensitive should the strategy be?",
      "Are assets held personally, in trusts, foundations, LLCs, operating entities, or retirement accounts?",
      "Are there estate planning, cross-border, trustee, or compliance constraints?",
      "Who else needs to review this before implementation?",
    ],
    guidance:
      "The app should not provide tax or legal advice. It should flag coordination needs with the client's outside advisors.",
    fields: [
      { key: "taxSensitivity", label: "Tax sensitivity", kind: "select", options: SCALE_LMHV },
      {
        key: "holdingStructures",
        label: "Holding structures",
        kind: "multiselect",
        full: true,
        options: labels(
          "Personal",
          "Revocable trust",
          "Irrevocable trust",
          "LLC",
          "Partnership",
          "Foundation",
          "Donor-advised fund",
          "Retirement account",
          "Operating company",
          "Offshore entity",
          "Other",
        ),
      },
      { key: "taxLossHarvestingNeeded", label: "Tax-loss harvesting needed", kind: "toggle" },
      { key: "estatePlanningCoordinationNeeded", label: "Estate planning coordination needed", kind: "toggle" },
      { key: "stateTaxConsiderations", label: "State tax considerations", kind: "textarea", full: true },
      { key: "federalTaxConsiderations", label: "Federal tax considerations", kind: "textarea", full: true },
      { key: "internationalConsiderations", label: "International considerations", kind: "textarea", full: true },
      { key: "crossBorderConsiderations", label: "Cross-border considerations", kind: "textarea", full: true },
      { key: "outsideCPAName", label: "Outside CPA", kind: "text" },
      { key: "estateAttorneyName", label: "Estate attorney", kind: "text" },
      { key: "trusteeName", label: "Trustee", kind: "text" },
      { key: "familyOfficeCFOName", label: "Family office CFO", kind: "text" },
      { key: "restrictedInvestmentsDueToStructure", label: "Restricted investments due to structure", kind: "textarea", full: true },
    ],
  },
  {
    key: "valuesRestrictionsAndPreferences",
    title: "Values, Restrictions & Preferences",
    shortTitle: "Values",
    purpose: "Capture optional client-specific restrictions or preferences.",
    prompts: [
      "Are there industries, geographies, sectors, or strategies the family wants to avoid?",
      "Are there areas the family wants to emphasize?",
      "Are there mission, philanthropic, reputational, or family values considerations?",
      "Does the family want to invest alongside other families or operating partners?",
    ],
    guidance: "Keep this section neutral and optional. Do not assume values or political preferences.",
    fields: [
      { key: "industriesToAvoid", label: "Industries to avoid", kind: "stringList", itemLabel: "industry", full: true },
      { key: "industriesToEmphasize", label: "Industries to emphasize", kind: "stringList", itemLabel: "industry", full: true },
      { key: "geographicPreferences", label: "Geographic preferences", kind: "stringList", itemLabel: "geography", full: true },
      { key: "geographicRestrictions", label: "Geographic restrictions", kind: "stringList", itemLabel: "geography", full: true },
      { key: "missionAlignedGoals", label: "Mission-aligned goals", kind: "textarea", full: true },
      { key: "philanthropicGoals", label: "Philanthropic goals", kind: "textarea", full: true },
      { key: "reputationalConsiderations", label: "Reputational considerations", kind: "textarea", full: true },
      { key: "coInvestmentPreferences", label: "Co-investment preferences", kind: "textarea", full: true },
      { key: "notes", label: "Notes", kind: "textarea", full: true },
    ],
  },
  {
    key: "governance",
    title: "Governance & Decision Making",
    shortTitle: "Governance",
    purpose: "Define who approves investments and how decisions are made.",
    prompts: [
      "Who has authority to approve investment decisions?",
      "Who must be informed before decisions are made?",
      "Which decisions require formal approval?",
      "Should this client have an investment committee workflow?",
    ],
    guidance: "Governance rules should later feed approval workflows.",
    fields: [
      {
        key: "approvalAuthority",
        label: "Approval authority",
        kind: "objectList",
        itemLabel: "person",
        full: true,
        itemFields: [
          { key: "name", label: "Name", kind: "text" },
          { key: "role", label: "Role", kind: "text" },
          {
            key: "authorityLevel",
            label: "Authority",
            kind: "select",
            options: opt([
              ["approve", "Approve"],
              ["recommend", "Recommend"],
              ["review", "Review"],
              ["inform_only", "Inform only"],
              ["veto", "Veto"],
            ]),
          },
          { key: "notes", label: "Notes", kind: "text" },
        ],
      },
      {
        key: "informedParties",
        label: "Informed parties",
        kind: "objectList",
        itemLabel: "person",
        full: true,
        itemFields: [
          { key: "name", label: "Name", kind: "text" },
          { key: "role", label: "Role", kind: "text" },
          {
            key: "authorityLevel",
            label: "Authority",
            kind: "select",
            options: opt([
              ["approve", "Approve"],
              ["recommend", "Recommend"],
              ["review", "Review"],
              ["inform_only", "Inform only"],
              ["veto", "Veto"],
            ]),
          },
          { key: "notes", label: "Notes", kind: "text" },
        ],
      },
      {
        key: "decisionsRequiringApproval",
        label: "Decisions requiring approval",
        kind: "multiselect",
        full: true,
        options: labels(
          "New manager",
          "New direct deal",
          "Allocation change",
          "Sale of major asset",
          "Use of leverage",
          "Capital call",
          "Private investment commitment",
          "Distribution decision",
          "Tax-sensitive transaction",
          "Manager termination",
        ),
      },
      { key: "reviewCadence", label: "Review cadence", kind: "select", options: CADENCE },
      { key: "investmentCommitteeRequired", label: "Investment committee required", kind: "toggle" },
      { key: "approvalTrackingRequired", label: "Approval tracking required", kind: "toggle" },
      { key: "quorumOrConsentRules", label: "Quorum / consent rules", kind: "textarea", full: true },
    ],
  },
  {
    key: "reporting",
    title: "Reporting & Success Metrics",
    shortTitle: "Reporting",
    purpose: "Capture how the client wants to review the portfolio.",
    prompts: [
      "What should the client see each month or quarter?",
      "What questions should the report answer?",
      "Which metrics matter most?",
      "Who should receive reporting?",
    ],
    guidance: "Reporting preferences should later feed quarterly report templates.",
    fields: [
      { key: "reportingCadence", label: "Reporting cadence", kind: "select", options: CADENCE },
      {
        key: "preferredFormat",
        label: "Preferred format",
        kind: "select",
        options: opt([
          ["simple_summary", "Simple summary"],
          ["full_performance_report", "Full performance report"],
          ["capital_allocation_dashboard", "Capital allocation dashboard"],
          ["risk_dashboard", "Risk dashboard"],
          ["family_office_council_report", "Family-office council report"],
          ["custom", "Custom"],
        ]),
      },
      {
        key: "keyMetrics",
        label: "Key metrics",
        kind: "multiselect",
        full: true,
        options: labels(
          "Total return",
          "Income",
          "Volatility",
          "Drawdown",
          "Liquidity",
          "Tax efficiency",
          "Benchmark performance",
          "Exposure by asset class",
          "Concentration",
          "Capital calls",
          "Unfunded commitments",
          "Manager performance",
          "Direct investment performance",
          "Cash reserve",
          "Spending coverage",
        ),
      },
      { key: "quarterlyQuestions", label: "Quarterly questions", kind: "stringList", itemLabel: "question", full: true },
      { key: "reportRecipients", label: "Report recipients", kind: "stringList", itemLabel: "recipient", full: true },
    ],
  },
];

export const SECTION_CONFIG_BY_KEY: Record<IPSSectionKey, SectionConfig> = Object.fromEntries(
  SECTION_CONFIG.map((s) => [s.key, s]),
) as Record<IPSSectionKey, SectionConfig>;

// ── Defaults ─────────────────────────────────────────────────────────────────
const baseSection = (): IPSSectionBase => ({
  sectionStatus: "not_started",
  confidence: "directionally_clear",
  clientFacingNotes: "",
  advisorNotes: "",
  internalNotes: "",
  openQuestions: [],
  followUpItems: [],
});

export function emptyIPSProfile(clientId: string): IPSProfile {
  const now = new Date().toISOString();
  return {
    id: "",
    clientId,
    status: "not_started",
    completionPercentage: 0,
    createdAt: now,
    updatedAt: now,
    clientProfile: { ...baseSection(), additionalStakeholders: [], capitalType: "", purposeOfCapital: [] },
    objectives: {
      ...baseSection(),
      primaryObjective: "",
      secondaryObjectives: [],
      benchmarkType: "",
      incomeVsTotalReturn: "",
    },
    riskProfile: {
      ...baseSection(),
      riskArchetype: "",
      riskTolerance: "",
      riskCapacity: "",
      primaryRiskConcerns: [],
    },
    liquidity: { ...baseSection(), majorCashNeeds: [], lockupTolerance: "" },
    timeHorizon: { ...baseSection(), primaryTimeHorizon: "", capitalSleeves: [] },
    allocationPreferences: {
      ...baseSection(),
      desiredAllocationStyle: "",
      includedAssetClasses: [],
      excludedAssetClasses: [],
      limitedAssetClasses: [],
      targetRanges: [],
    },
    concentrationAndRiskLimits: { ...baseSection(), legacyConcentratedHoldings: [], assetsNotToSell: [] },
    taxEstateAndStructure: { ...baseSection(), taxSensitivity: "", holdingStructures: [] },
    valuesRestrictionsAndPreferences: {
      ...baseSection(),
      industriesToAvoid: [],
      industriesToEmphasize: [],
      geographicPreferences: [],
      geographicRestrictions: [],
    },
    governance: {
      ...baseSection(),
      approvalAuthority: [],
      informedParties: [],
      decisionsRequiringApproval: [],
      reviewCadence: "",
    },
    reporting: {
      ...baseSection(),
      reportingCadence: "",
      preferredFormat: "",
      keyMetrics: [],
      quarterlyQuestions: [],
      reportRecipients: [],
    },
    advisorSession: {
      attendees: [],
      meetingModeActive: false,
      sectionsCompleted: [],
      documentsNeeded: [],
      outsideAdvisorsToConsult: [],
      nextSteps: [],
    },
    summary: {},
  };
}

// Labels for the IPS lifecycle status, used in badges and selectors.
export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_advisor_session: "In advisor session",
  draft_generated: "Draft generated",
  advisor_review: "Advisor review",
  client_follow_up_needed: "Client follow-up needed",
  client_reviewed: "Client reviewed",
  approved_for_internal_use: "Approved for internal use",
  archived: "Archived",
};

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
  skipped: "Skipped",
  not_applicable: "Not applicable",
  needs_follow_up: "Needs follow-up",
};

export const CONFIDENCE_LABELS: Record<SectionConfidence, string> = {
  clear_decision: "Clear decision",
  directionally_clear: "Directionally clear",
  needs_follow_up: "Needs follow-up",
  advisor_review_required: "Advisor review required",
};
