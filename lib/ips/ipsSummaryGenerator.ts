// ─────────────────────────────────────────────────────────────────────────────
// Advisor-Facilitated IPS Draft — summary generation (pure, deterministic)
//
// Produces a structured, human-readable draft from advisor-entered data. It does
// NOT recommend investments or assign a model portfolio. Any allocation is
// framed as advisor review required.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IPSProfile,
  IPSSectionBase,
  IPSSummaryData,
  FollowUpItem,
  IPSSectionKey,
} from "./ipsTypes";
import { IPS_SECTION_KEYS } from "./ipsTypes";
import { SECTION_CONFIG_BY_KEY } from "./ipsDefaults";

/** Resolve an enum value to its human label from the section config. */
function labelFor(sectionKey: IPSSectionKey, fieldKey: string, value: unknown): string {
  if (value == null || value === "") return "—";
  const field = SECTION_CONFIG_BY_KEY[sectionKey]?.fields.find((f) => f.key === fieldKey);
  const match = field?.options?.find((o) => o.value === value);
  return match?.label ?? String(value);
}

const list = (xs?: string[]): string => (xs && xs.length ? xs.join(", ") : "—");
const money = (n?: number): string =>
  n == null ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n?: number): string => (n == null ? "—" : `${n}%`);

/** Fraction (0–100) of sections that carry a deliberate status. */
export function computeCompletion(profile: IPSProfile): number {
  const done: ReadonlyArray<string> = ["complete", "not_applicable", "skipped"];
  const counted = IPS_SECTION_KEYS.filter((k) => {
    const section = profile[k] as IPSSectionBase;
    return done.includes(section.sectionStatus);
  }).length;
  return Math.round((counted / IPS_SECTION_KEYS.length) * 100);
}

/** Collect every open question across sections, prefixed with the section title. */
function allOpenQuestions(profile: IPSProfile): string[] {
  const out: string[] = [];
  for (const key of IPS_SECTION_KEYS) {
    const s = profile[key] as IPSSectionBase;
    for (const q of s.openQuestions ?? []) {
      if (q.trim()) out.push(`${SECTION_CONFIG_BY_KEY[key].shortTitle}: ${q}`);
    }
  }
  return out;
}

/** Collect every follow-up item across sections. */
function allFollowUps(profile: IPSProfile): FollowUpItem[] {
  const out: FollowUpItem[] = [];
  for (const key of IPS_SECTION_KEYS) {
    const s = profile[key] as IPSSectionBase;
    for (const f of s.followUpItems ?? []) out.push(f);
  }
  return out;
}

export function generateIPSSummary(profile: IPSProfile, generatedByAdvisorId?: string): IPSSummaryData {
  const cp = profile.clientProfile;
  const obj = profile.objectives;
  const risk = profile.riskProfile;
  const liq = profile.liquidity;
  const th = profile.timeHorizon;
  const alloc = profile.allocationPreferences;
  const conc = profile.concentrationAndRiskLimits;
  const tax = profile.taxEstateAndStructure;
  const gov = profile.governance;
  const rep = profile.reporting;
  const session = profile.advisorSession;

  const name =
    cp.familyOfficeEntityName || cp.familyName || cp.clientName || "This family";

  const openQuestions = allOpenQuestions(profile);
  const followUps = allFollowUps(profile).filter((f) => f.status !== "completed");

  const purposeOfCapitalSummary = [
    cp.purposeOfCapital.length ? `Purpose of capital: ${list(cp.purposeOfCapital)}.` : "",
    cp.primaryDecisionMaker ? `Primary decision maker: ${cp.primaryDecisionMaker}.` : "",
    cp.additionalStakeholders.length ? `Stakeholders: ${list(cp.additionalStakeholders)}.` : "",
    cp.capitalType ? `Capital type: ${labelFor("clientProfile", "capitalType", cp.capitalType)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const objectivesSummary = [
    obj.primaryObjective ? `Primary objective: ${labelFor("objectives", "primaryObjective", obj.primaryObjective)}.` : "",
    obj.incomeVsTotalReturn ? `Orientation: ${labelFor("objectives", "incomeVsTotalReturn", obj.incomeVsTotalReturn)}.` : "",
    obj.requiredReturn != null ? `Required return: ${pct(obj.requiredReturn)}.` : "",
    obj.preferredReturn != null ? `Preferred return: ${pct(obj.preferredReturn)}.` : "",
    obj.benchmarkType ? `Benchmark: ${labelFor("objectives", "benchmarkType", obj.benchmarkType)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const toleranceCapacityNote =
    risk.riskTolerance && risk.riskCapacity && risk.riskTolerance !== risk.riskCapacity
      ? ` Note the gap between emotional tolerance (${labelFor("riskProfile", "riskTolerance", risk.riskTolerance)}) and financial capacity (${labelFor("riskProfile", "riskCapacity", risk.riskCapacity)}) — advisor review required.`
      : "";

  const riskSummary =
    [
      risk.riskArchetype ? `Risk archetype: ${labelFor("riskProfile", "riskArchetype", risk.riskArchetype)}.` : "",
      risk.riskTolerance ? `Tolerance: ${labelFor("riskProfile", "riskTolerance", risk.riskTolerance)}.` : "",
      risk.riskCapacity ? `Capacity: ${labelFor("riskProfile", "riskCapacity", risk.riskCapacity)}.` : "",
      risk.maxAcceptableDrawdown != null ? `Max acceptable drawdown: ${pct(risk.maxAcceptableDrawdown)}.` : "",
      risk.primaryRiskConcerns.length ? `Primary concerns: ${list(risk.primaryRiskConcerns)}.` : "",
    ]
      .filter(Boolean)
      .join(" ") + toleranceCapacityNote;

  const liquiditySummary = [
    liq.annualLifestyleSpendingNeed != null ? `Annual lifestyle spending: ${money(liq.annualLifestyleSpendingNeed)}.` : "",
    liq.annualTaxReserveNeed != null ? `Tax reserve: ${money(liq.annualTaxReserveNeed)}.` : "",
    liq.minimumCashReserve != null ? `Minimum cash reserve: ${money(liq.minimumCashReserve)}.` : "",
    liq.maxIlliquidPercentage != null ? `Max illiquid: ${pct(liq.maxIlliquidPercentage)}.` : "",
    liq.lockupTolerance ? `Lockup tolerance: ${labelFor("liquidity", "lockupTolerance", liq.lockupTolerance)}.` : "",
    liq.majorCashNeeds.length ? `${liq.majorCashNeeds.length} major cash need(s) identified.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const timeHorizonSummary = [
    th.primaryTimeHorizon ? `Primary horizon: ${labelFor("timeHorizon", "primaryTimeHorizon", th.primaryTimeHorizon)}.` : "",
    th.useCapitalSleeves
      ? `Capital organized into ${th.capitalSleeves.length} sleeve(s): ${list(
          th.capitalSleeves.map((s) => labelFor("timeHorizon", "name", s.name)),
        )}.`
      : "Single blended pool of capital.",
  ]
    .filter(Boolean)
    .join(" ");

  const allocationSummary = [
    alloc.desiredAllocationStyle ? `Style: ${labelFor("allocationPreferences", "desiredAllocationStyle", alloc.desiredAllocationStyle)}.` : "",
    alloc.includedAssetClasses.length ? `Include: ${list(alloc.includedAssetClasses)}.` : "",
    alloc.excludedAssetClasses.length ? `Avoid: ${list(alloc.excludedAssetClasses)}.` : "",
    alloc.limitedAssetClasses.length ? `Limit: ${list(alloc.limitedAssetClasses)}.` : "",
    alloc.advisorAllocationRecommendationNeeded
      ? "A recommended allocation is to be prepared by the advisor (advisor review required)."
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const constraintsSummary = [
    conc.maxSingleManagerExposure != null ? `Max single manager ${pct(conc.maxSingleManagerExposure)}.` : "",
    conc.maxSingleCompanyExposure != null ? `Max single company ${pct(conc.maxSingleCompanyExposure)}.` : "",
    conc.maxIlliquidExposure != null ? `Max illiquid ${pct(conc.maxIlliquidExposure)}.` : "",
    conc.legacyConcentratedHoldings.length ? `${conc.legacyConcentratedHoldings.length} legacy concentrated holding(s).` : "",
    conc.assetsNotToSell.length ? `${conc.assetsNotToSell.length} asset(s) flagged not to sell.` : "",
    tax.taxSensitivity ? `Tax sensitivity: ${labelFor("taxEstateAndStructure", "taxSensitivity", tax.taxSensitivity)}.` : "",
    tax.holdingStructures.length ? `Holding structures: ${list(tax.holdingStructures)}.` : "",
    tax.estatePlanningCoordinationNeeded ? "Estate planning coordination needed." : "",
  ]
    .filter(Boolean)
    .join(" ");

  const governanceSummary = [
    gov.approvalAuthority.length ? `${gov.approvalAuthority.length} approval authority contact(s).` : "",
    gov.decisionsRequiringApproval.length ? `Decisions requiring approval: ${list(gov.decisionsRequiringApproval)}.` : "",
    gov.reviewCadence ? `Review cadence: ${labelFor("governance", "reviewCadence", gov.reviewCadence)}.` : "",
    gov.investmentCommitteeRequired ? "Investment committee workflow required." : "",
  ]
    .filter(Boolean)
    .join(" ");

  const reportingSummary = [
    rep.reportingCadence ? `Cadence: ${labelFor("reporting", "reportingCadence", rep.reportingCadence)}.` : "",
    rep.preferredFormat ? `Format: ${labelFor("reporting", "preferredFormat", rep.preferredFormat)}.` : "",
    rep.keyMetrics.length ? `Key metrics: ${list(rep.keyMetrics)}.` : "",
    rep.reportRecipients.length ? `Recipients: ${list(rep.reportRecipients)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const executiveSummary =
    `${name} — Advisor-Facilitated IPS Draft. ` +
    [
      purposeOfCapitalSummary && `Capital is intended to ${cp.purposeOfCapital.length ? list(cp.purposeOfCapital).toLowerCase() : "serve defined objectives"}.`,
      obj.primaryObjective && `The primary objective is ${labelFor("objectives", "primaryObjective", obj.primaryObjective).toLowerCase()}.`,
      risk.riskArchetype && `Risk posture is ${labelFor("riskProfile", "riskArchetype", risk.riskArchetype).toLowerCase()}.`,
      th.primaryTimeHorizon && `Time horizon is ${labelFor("timeHorizon", "primaryTimeHorizon", th.primaryTimeHorizon)}.`,
    ]
      .filter(Boolean)
      .join(" ") +
    " This draft organizes advisor-facilitated discussion notes; final investment policy decisions should be reviewed with the client's advisors.";

  return {
    generatedAt: undefined, // stamped by the service when persisted (Date unavailable in pure layer callers vary)
    generatedByAdvisorId,
    executiveSummary,
    purposeOfCapitalSummary: purposeOfCapitalSummary || "—",
    objectivesSummary: objectivesSummary || "—",
    riskSummary: riskSummary.trim() || "—",
    liquiditySummary: liquiditySummary || "—",
    timeHorizonSummary: timeHorizonSummary || "—",
    allocationSummary: allocationSummary || "—",
    constraintsSummary: constraintsSummary || "—",
    governanceSummary: governanceSummary || "—",
    reportingSummary: reportingSummary || "—",
    openQuestionsSummary: openQuestions.length ? openQuestions.join("\n") : "No open questions recorded.",
    followUpSummary: followUps.length
      ? followUps.map((f) => `• ${f.item}${f.owner ? ` (${f.owner})` : ""}`).join("\n")
      : "No open follow-up items.",
    nextSteps: session.nextSteps && session.nextSteps.length ? session.nextSteps : undefined,
  };
}
