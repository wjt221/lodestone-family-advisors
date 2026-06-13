// ─────────────────────────────────────────────────────────────────────────────
// Advisor-Led IPS Workbench — types
//
// A client-specific investment policy strategy profile. Structured so each
// section can later be consumed by the allocation, risk, liquidity, tax,
// governance, reporting, and approval modules. One profile per clientId.
// ─────────────────────────────────────────────────────────────────────────────

export type IPSStatus =
  | "not_started"
  | "in_advisor_session"
  | "draft_generated"
  | "advisor_review"
  | "client_follow_up_needed"
  | "client_reviewed"
  | "approved_for_internal_use"
  | "archived";

export type SectionConfidence =
  | "clear_decision"
  | "directionally_clear"
  | "needs_follow_up"
  | "advisor_review_required";

export type SectionStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "skipped"
  | "not_applicable"
  | "needs_follow_up";

export type FollowUpItem = {
  id: string;
  item: string;
  owner?: string;
  dueDate?: string;
  relatedSection: string;
  status: "open" | "in_progress" | "completed" | "deferred";
  visibility: "internal" | "client_facing";
};

export type IPSSectionBase = {
  sectionStatus: SectionStatus;
  confidence: SectionConfidence;
  clientFacingNotes?: string;
  advisorNotes?: string;
  internalNotes?: string;
  openQuestions?: string[];
  followUpItems?: FollowUpItem[];
};

// ── Section 1: Client Profile and Purpose of Capital ─────────────────────────
export type IPSClientProfileSection = IPSSectionBase & {
  clientName?: string;
  familyName?: string;
  familyOfficeEntityName?: string;
  primaryDecisionMaker?: string;
  additionalStakeholders: string[];
  capitalType:
    | "personal"
    | "family_office"
    | "trust"
    | "foundation"
    | "operating_company"
    | "retirement"
    | "other"
    | "";
  purposeOfCapital: string[];
  otherPurpose?: string;
  successThreeYears?: string;
  successFiveYears?: string;
  successTenYears?: string;
};

// ── Section 2: Investment Objectives ─────────────────────────────────────────
export type IPSObjectivesSection = IPSSectionBase & {
  primaryObjective:
    | "capital_preservation"
    | "balanced_growth"
    | "long_term_capital_appreciation"
    | "income_generation"
    | "tax_efficient_compounding"
    | "opportunistic_asymmetric_return"
    | "";
  secondaryObjectives: string[];
  requiredReturn?: number;
  preferredReturn?: number;
  inflationProtectionNeeded?: boolean;
  benchmarkType:
    | "absolute_return"
    | "cpi_plus_spread"
    | "sixty_forty"
    | "custom_blended_benchmark"
    | "peer_family_office_benchmark"
    | "none_yet"
    | "";
  incomeVsTotalReturn: "income" | "total_return" | "both" | "not_sure" | "";
};

// ── Section 3: Risk Profile ──────────────────────────────────────────────────
export type IPSRiskProfileSection = IPSSectionBase & {
  riskArchetype:
    | "defensive"
    | "conservative"
    | "balanced"
    | "growth"
    | "aggressive"
    | "opportunistic"
    | "";
  riskTolerance: "low" | "moderate" | "high" | "very_high" | "";
  riskCapacity: "low" | "moderate" | "high" | "very_high" | "";
  maxAcceptableDrawdown?: number;
  responseToTenPercentDecline?: string;
  responseToTwentyPercentDecline?: string;
  responseToThirtyPercentDecline?: string;
  primaryRiskConcerns: string[];
  volatilityComfort?: string;
  permanentLossConcern?: boolean;
  concentrationConcern?: boolean;
  illiquidityConcern?: boolean;
  complexityConcern?: boolean;
  leverageConcern?: boolean;
};

// ── Section 4: Liquidity and Cash Needs ──────────────────────────────────────
export type MajorCashNeed = {
  id: string;
  description: string;
  amount?: number;
  expectedTiming:
    | "less_than_1_year"
    | "1_to_3_years"
    | "3_to_5_years"
    | "5_to_10_years"
    | "10_plus_years"
    | "unknown";
  priority: "low" | "medium" | "high" | "required";
};

export type IPSLiquiditySection = IPSSectionBase & {
  annualLifestyleSpendingNeed?: number;
  annualTaxReserveNeed?: number;
  minimumCashReserve?: number;
  emergencyReserve?: number;
  majorCashNeeds: MajorCashNeed[];
  illiquidInvestmentsAcceptable?: boolean;
  maxIlliquidPercentage?: number;
  lockupTolerance:
    | "none"
    | "one_year"
    | "three_years"
    | "five_years"
    | "ten_plus_years"
    | "not_sure"
    | "";
  upcomingTransactions?: string;
  debtObligations?: string;
  capitalCalls?: string;
};

// ── Section 5: Time Horizon and Capital Sleeves ──────────────────────────────
export type CapitalSleeve = {
  id: string;
  name:
    | "operating_liquidity"
    | "lifestyle_reserve"
    | "core_portfolio"
    | "growth_portfolio"
    | "opportunistic_direct_deals"
    | "philanthropy"
    | "next_generation_capital"
    | "other";
  description?: string;
  targetAmount?: number;
  targetPercentage?: number;
  timeHorizon?: string;
  riskLevel?: string;
  liquidityNeed?: string;
};

export type IPSTimeHorizonSection = IPSSectionBase & {
  primaryTimeHorizon:
    | "0_to_3_years"
    | "3_to_5_years"
    | "5_to_10_years"
    | "10_plus_years"
    | "multigenerational"
    | "";
  useCapitalSleeves?: boolean;
  capitalSleeves: CapitalSleeve[];
};

// ── Section 6: Asset Allocation Preferences ──────────────────────────────────
export type AllocationTargetRange = {
  assetClass: string;
  minPercentage?: number;
  targetPercentage?: number;
  maxPercentage?: number;
  notes?: string;
};

export type IPSAllocationPreferencesSection = IPSSectionBase & {
  currentAllocationKnown?: boolean;
  currentAllocationNotes?: string;
  desiredAllocationStyle:
    | "traditional_public_markets"
    | "endowment_style"
    | "private_wealth_preservation"
    | "founder_liquidity_portfolio"
    | "income_oriented"
    | "opportunistic_direct_investing"
    | "custom"
    | "";
  includedAssetClasses: string[];
  excludedAssetClasses: string[];
  limitedAssetClasses: string[];
  targetRanges: AllocationTargetRange[];
  advisorAllocationRecommendationNeeded?: boolean;
};

// ── Section 7: Concentration and Risk Limits ─────────────────────────────────
export type LegacyHolding = {
  id: string;
  assetName: string;
  assetType?: string;
  estimatedValue?: number;
  estimatedPercentageOfPortfolio?: number;
  reasonForConcentration?: string;
  desiredAction:
    | "hold"
    | "reduce_over_time"
    | "review"
    | "sell_when_tax_efficient"
    | "undecided";
};

export type RestrictedSaleAsset = {
  id: string;
  assetName: string;
  reason: "tax" | "family" | "control" | "emotional" | "legal" | "illiquid" | "other";
  notes?: string;
};

export type IPSConcentrationSection = IPSSectionBase & {
  maxSingleManagerExposure?: number;
  maxSingleFundExposure?: number;
  maxSingleCompanyExposure?: number;
  maxSingleAssetClassExposure?: number;
  maxDirectDealExposure?: number;
  maxIlliquidExposure?: number;
  maxLeverageExposure?: number;
  legacyConcentratedHoldings: LegacyHolding[];
  assetsNotToSell: RestrictedSaleAsset[];
};

// ── Section 8: Tax, Estate, and Structural Constraints ───────────────────────
export type IPSTaxEstateStructureSection = IPSSectionBase & {
  taxSensitivity: "low" | "moderate" | "high" | "very_high" | "";
  holdingStructures: string[];
  stateTaxConsiderations?: string;
  federalTaxConsiderations?: string;
  internationalConsiderations?: string;
  crossBorderConsiderations?: string;
  taxLossHarvestingNeeded?: boolean;
  estatePlanningCoordinationNeeded?: boolean;
  outsideCPAName?: string;
  estateAttorneyName?: string;
  trusteeName?: string;
  familyOfficeCFOName?: string;
  restrictedInvestmentsDueToStructure?: string;
};

// ── Section 9: Values, Restrictions, and Preferences ─────────────────────────
export type IPSValuesSection = IPSSectionBase & {
  industriesToAvoid: string[];
  industriesToEmphasize: string[];
  geographicPreferences: string[];
  geographicRestrictions: string[];
  missionAlignedGoals?: string;
  philanthropicGoals?: string;
  reputationalConsiderations?: string;
  coInvestmentPreferences?: string;
  notes?: string;
};

// ── Section 10: Governance and Decision Making ───────────────────────────────
export type GovernancePerson = {
  id: string;
  name: string;
  role?: string;
  authorityLevel: "approve" | "recommend" | "review" | "inform_only" | "veto";
  notes?: string;
};

export type IPSGovernanceSection = IPSSectionBase & {
  approvalAuthority: GovernancePerson[];
  informedParties: GovernancePerson[];
  decisionsRequiringApproval: string[];
  reviewCadence: "monthly" | "quarterly" | "semiannual" | "annual" | "ad_hoc" | "";
  investmentCommitteeRequired?: boolean;
  approvalTrackingRequired?: boolean;
  quorumOrConsentRules?: string;
};

// ── Section 11: Reporting and Success Metrics ────────────────────────────────
export type IPSReportingSection = IPSSectionBase & {
  reportingCadence: "monthly" | "quarterly" | "semiannual" | "annual" | "ad_hoc" | "";
  preferredFormat:
    | "simple_summary"
    | "full_performance_report"
    | "capital_allocation_dashboard"
    | "risk_dashboard"
    | "family_office_council_report"
    | "custom"
    | "";
  keyMetrics: string[];
  quarterlyQuestions: string[];
  reportRecipients: string[];
};

// ── Advisor session ──────────────────────────────────────────────────────────
export type SessionAttendee = {
  name: string;
  role?: string;
  organization?: string;
  attendanceType: "in_person" | "video" | "phone" | "not_present";
};

export type OutsideAdvisor = {
  name?: string;
  role:
    | "CPA"
    | "estate_attorney"
    | "trustee"
    | "family_office_CFO"
    | "investment_consultant"
    | "other";
  organization?: string;
  reasonToConsult?: string;
  status: "not_contacted" | "pending" | "consulted";
};

export type AdvisorSessionData = {
  currentSessionId?: string;
  sessionDate?: string;
  advisorId?: string;
  advisorName?: string;
  attendees: SessionAttendee[];
  meetingModeActive: boolean;
  sectionsCompleted: string[];
  documentsNeeded: string[];
  outsideAdvisorsToConsult: OutsideAdvisor[];
  meetingSummary?: string;
  nextSteps?: string[];
};

// ── Summary ──────────────────────────────────────────────────────────────────
export type IPSSummaryData = {
  generatedAt?: string;
  generatedByAdvisorId?: string;
  executiveSummary?: string;
  purposeOfCapitalSummary?: string;
  objectivesSummary?: string;
  riskSummary?: string;
  liquiditySummary?: string;
  timeHorizonSummary?: string;
  allocationSummary?: string;
  constraintsSummary?: string;
  governanceSummary?: string;
  reportingSummary?: string;
  openQuestionsSummary?: string;
  followUpSummary?: string;
  nextSteps?: string[];
};

// ── Profile ──────────────────────────────────────────────────────────────────
export type IPSProfile = {
  id: string;
  clientId: string;
  status: IPSStatus;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  createdByAdvisorId?: string;
  lastUpdatedByAdvisorId?: string;
  approvedAt?: string;
  approvedByAdvisorId?: string;

  clientProfile: IPSClientProfileSection;
  objectives: IPSObjectivesSection;
  riskProfile: IPSRiskProfileSection;
  liquidity: IPSLiquiditySection;
  timeHorizon: IPSTimeHorizonSection;
  allocationPreferences: IPSAllocationPreferencesSection;
  concentrationAndRiskLimits: IPSConcentrationSection;
  taxEstateAndStructure: IPSTaxEstateStructureSection;
  valuesRestrictionsAndPreferences: IPSValuesSection;
  governance: IPSGovernanceSection;
  reporting: IPSReportingSection;

  advisorSession: AdvisorSessionData;
  summary: IPSSummaryData;
};

/** The eleven content section keys, in workbench order. */
export const IPS_SECTION_KEYS = [
  "clientProfile",
  "objectives",
  "riskProfile",
  "liquidity",
  "timeHorizon",
  "allocationPreferences",
  "concentrationAndRiskLimits",
  "taxEstateAndStructure",
  "valuesRestrictionsAndPreferences",
  "governance",
  "reporting",
] as const;

export type IPSSectionKey = (typeof IPS_SECTION_KEYS)[number];
