"use client";

// The Advisor-Facilitated IPS Draft: a clean, editable, print/export-ready
// summary, the IPS lifecycle/approval controls, and the compliance disclaimer.

import { Loader2, Printer, RefreshCw, Pencil, Check } from "lucide-react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/form-controls";
import { cn } from "@/lib/utils";
import { IPSStatusBadge } from "./primitives";
import type { IPSProfile, IPSSummaryData, IPSStatus } from "@/lib/ips/ipsTypes";

const FIELDS: { key: keyof IPSSummaryData; label: string }[] = [
  { key: "executiveSummary", label: "Executive summary" },
  { key: "purposeOfCapitalSummary", label: "Purpose of capital" },
  { key: "objectivesSummary", label: "Objectives" },
  { key: "riskSummary", label: "Risk" },
  { key: "liquiditySummary", label: "Liquidity" },
  { key: "timeHorizonSummary", label: "Time horizon" },
  { key: "allocationSummary", label: "Allocation philosophy" },
  { key: "constraintsSummary", label: "Constraints (concentration, tax, estate)" },
  { key: "governanceSummary", label: "Governance" },
  { key: "reportingSummary", label: "Reporting" },
  { key: "openQuestionsSummary", label: "Open questions" },
  { key: "followUpSummary", label: "Follow-up items" },
];

export function IPSComplianceDisclaimer() {
  return (
    <p className="rounded-lg border border-hairline bg-secondary/40 px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted">
      This tool is designed to help organize investment objectives, constraints, preferences, and
      advisor-facilitated discussion notes. It does not provide legal, tax, or investment advice.
      Final investment policy decisions should be reviewed with the client&apos;s advisors.
    </p>
  );
}

const STATUS_ACTIONS: { status: IPSStatus; label: string; variant?: "default" | "secondary" }[] = [
  { status: "advisor_review", label: "Mark Advisor Review", variant: "secondary" },
  { status: "client_follow_up_needed", label: "Mark Client Follow-Up Needed", variant: "secondary" },
  { status: "client_reviewed", label: "Mark Client Reviewed", variant: "secondary" },
];

export function IPSSummaryView({
  profile,
  editing,
  saving,
  onToggleEdit,
  onChange,
  onSave,
  onGenerate,
  onSetStatus,
  onApprove,
}: {
  profile: IPSProfile;
  editing: boolean;
  saving: boolean;
  onToggleEdit: () => void;
  onChange: (summary: IPSSummaryData) => void;
  onSave: () => void;
  onGenerate: () => void;
  onSetStatus: (status: IPSStatus) => void;
  onApprove: () => void;
}) {
  const summary = profile.summary;
  const generated = Boolean(summary.generatedAt || summary.executiveSummary);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-[22px] font-medium leading-tight text-ink">Advisor-Facilitated IPS Draft</h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            A client-specific investment policy strategy profile, prepared with the advisor.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <IPSStatusBadge status={profile.status} />
          <span className="text-[11px] text-ink-muted">{profile.completionPercentage}% complete</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onGenerate} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {generated ? "Regenerate draft" : "Generate draft"}
        </Button>
        {generated && (
          <Button variant="ghost" onClick={onToggleEdit}>
            {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "Done editing" : "Edit summary"}
          </Button>
        )}
        {generated && (
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print / Export
          </Button>
        )}
        {editing && (
          <Button onClick={onSave} disabled={saving}>
            Save summary
          </Button>
        )}
      </div>

      {!generated ? (
        <Panel className="px-6 py-10 text-center">
          <p className="text-[13.5px] text-ink-muted">
            Generate the Advisor-Facilitated IPS Draft to assemble the captured decisions, notes,
            open questions, and follow-up items into a clean client-specific summary.
          </p>
        </Panel>
      ) : (
        <article className="space-y-4 rounded-xl border border-hairline bg-card px-6 py-7 lg:px-9">
          {FIELDS.map((f) => {
            const val = (summary[f.key] as string) ?? "";
            if (!editing && !val) return null;
            return (
              <section key={f.key as string}>
                <p className="eyebrow mb-1.5">{f.label}</p>
                {editing ? (
                  <textarea
                    className={cn(inputClass, "min-h-[64px] resize-y")}
                    value={val}
                    onChange={(e) => onChange({ ...summary, [f.key]: e.target.value })}
                  />
                ) : (
                  <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink/85">{val}</p>
                )}
              </section>
            );
          })}
        </article>
      )}

      {/* Approval / lifecycle actions */}
      <Panel className="p-5">
        <p className="eyebrow mb-3">Status &amp; next steps</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.map((a) => (
            <Button
              key={a.status}
              variant={profile.status === a.status ? "default" : "secondary"}
              onClick={() => onSetStatus(a.status)}
              disabled={saving}
            >
              {a.label}
            </Button>
          ))}
          <Button
            variant={profile.status === "approved_for_internal_use" ? "default" : "secondary"}
            onClick={onApprove}
            disabled={saving}
          >
            Approve for Internal Use
          </Button>
        </div>
        {profile.status === "approved_for_internal_use" && profile.approvedAt && (
          <p className="mt-3 text-[12px] text-positive">
            Approved for internal use on {new Date(profile.approvedAt).toLocaleDateString()}.
          </p>
        )}
      </Panel>

      <IPSComplianceDisclaimer />
    </div>
  );
}
