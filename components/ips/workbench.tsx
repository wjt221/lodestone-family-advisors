"use client";

// Advisor-Led IPS Workbench — orchestrator. Holds the working IPS profile,
// drives section navigation, and persists via server actions (secure mode) or
// localStorage (demo mode). The profile is always scoped to one clientId.

import { useEffect, useState, useTransition } from "react";
import { Play, FilePlus2, Clock } from "lucide-react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { IPSStatusBadge } from "./primitives";
import { IPSSectionNav, type NavTarget } from "./section-nav";
import { IPSSectionCard, type SectionValue } from "./section-card";
import { IPSAdvisorSessionPanel } from "./session-panel";
import { IPSSummaryView, IPSComplianceDisclaimer } from "./summary";
import { SECTION_CONFIG, SECTION_CONFIG_BY_KEY, emptyIPSProfile } from "@/lib/ips/ipsDefaults";
import { computeCompletion, generateIPSSummary } from "@/lib/ips/ipsSummaryGenerator";
import { IPS_SECTION_KEYS } from "@/lib/ips/ipsTypes";
import type {
  IPSProfile,
  IPSSectionKey,
  SectionStatus,
  IPSStatus,
  IPSSummaryData,
  AdvisorSessionData,
} from "@/lib/ips/ipsTypes";
import {
  startStrategySessionAction,
  createDraftIPSAction,
  saveSectionAction,
  saveAdvisorSessionAction,
  saveSummaryAction,
  generateSummaryAction,
  setStatusAction,
  approveForInternalUseAction,
} from "@/lib/actions/ips";

function statusMap(profile: IPSProfile): Record<IPSSectionKey, SectionStatus> {
  const out = {} as Record<IPSSectionKey, SectionStatus>;
  for (const k of IPS_SECTION_KEYS) out[k] = profile[k].sectionStatus;
  return out;
}

export function IPSWorkbench({
  initialProfile,
  clientId,
  clientName,
  clientAsOf,
  demoMode,
  canEdit,
}: {
  initialProfile: IPSProfile | null;
  clientId: string;
  clientName: string;
  clientAsOf: string;
  demoMode: boolean;
  canEdit: boolean;
}) {
  const storageKey = `lfa_ips_${clientId}`;
  const [profile, setProfile] = useState<IPSProfile | null>(initialProfile);
  const [active, setActive] = useState<NavTarget>("clientProfile");
  const [editingSummary, setEditingSummary] = useState(false);
  const [pending, startTransition] = useTransition();

  // Demo mode: hydrate from localStorage (client-scoped) when there is no record.
  useEffect(() => {
    if (!demoMode || initialProfile) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setProfile(JSON.parse(raw) as IPSProfile);
    } catch {
      /* ignore */
    }
  }, [demoMode, initialProfile, storageKey]);

  function persistLocal(next: IPSProfile) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  // Run a server action (secure) or a local mutation (demo), syncing state.
  function run(serverFn: () => Promise<IPSProfile>, localNext: () => IPSProfile) {
    if (demoMode) {
      const next = localNext();
      next.completionPercentage = computeCompletion(next);
      next.updatedAt = new Date().toISOString();
      setProfile(next);
      persistLocal(next);
      return;
    }
    startTransition(async () => {
      const updated = await serverFn();
      setProfile(updated);
    });
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div>
        <WorkbenchHeader clientName={clientName} clientAsOf={clientAsOf} status="not_started" completion={0} updatedAt={null} />
        <Panel className="flex flex-col items-center justify-center px-8 py-14 text-center">
          <h3 className="font-serif text-[18px] font-medium text-ink">No IPS strategy profile yet</h3>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-ink-muted">
            This client does not yet have an IPS strategy profile. Start an advisor-led IPS session
            to define objectives, risk, liquidity, allocation preferences, governance, and reporting.
          </p>
          {canEdit ? (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                disabled={pending}
                onClick={() =>
                  run(
                    () => startStrategySessionAction(true),
                    () => {
                      const p = emptyIPSProfile(clientId);
                      p.status = "in_advisor_session";
                      p.advisorSession.meetingModeActive = true;
                      p.advisorSession.sessionDate = new Date().toISOString();
                      return p;
                    },
                  )
                }
              >
                <Play className="h-3.5 w-3.5" /> Start IPS Strategy Session
              </Button>
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  run(
                    () => createDraftIPSAction(),
                    () => {
                      const p = emptyIPSProfile(clientId);
                      p.status = "in_advisor_session";
                      return p;
                    },
                  )
                }
              >
                <FilePlus2 className="h-3.5 w-3.5" /> Create Draft IPS
              </Button>
            </div>
          ) : (
            <p className="mt-5 text-[12.5px] text-ink-muted">An advisor will prepare this client&apos;s IPS.</p>
          )}
        </Panel>
        <div className="mt-8">
          <IPSComplianceDisclaimer />
        </div>
      </div>
    );
  }

  const sessionStarted = profile.status !== "not_started";
  const completion = computeCompletion(profile);
  const statuses = statusMap(profile);

  // ── Section editing helpers ──────────────────────────────────────────────────
  function changeSection(key: IPSSectionKey, value: SectionValue) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  function saveSection(key: IPSSectionKey) {
    const current = profile!;
    run(
      () => saveSectionAction(key, current[key]),
      () => {
        const section = { ...current[key] };
        if (section.sectionStatus === "not_started") section.sectionStatus = "in_progress";
        return { ...current, [key]: section, status: current.status === "not_started" ? "in_advisor_session" : current.status };
      },
    );
  }

  function markStatus(key: IPSSectionKey, status: SectionStatus) {
    const current = profile!;
    const next = { ...current, [key]: { ...current[key], sectionStatus: status } };
    setProfile(next);
    run(
      () => saveSectionAction(key, next[key]),
      () => next,
    );
  }

  function saveAndContinue(key: IPSSectionKey) {
    saveSection(key);
    const idx = IPS_SECTION_KEYS.indexOf(key);
    const nextKey = IPS_SECTION_KEYS[idx + 1];
    setActive(nextKey ?? "summary");
  }

  function changeSession(next: AdvisorSessionData) {
    setProfile((p) => (p ? { ...p, advisorSession: next } : p));
  }
  function saveSession() {
    const current = profile!;
    run(
      () => saveAdvisorSessionAction(current.advisorSession),
      () => current,
    );
  }
  function startSession(meetingMode: boolean) {
    const current = profile!;
    run(
      () => startStrategySessionAction(meetingMode),
      () => ({
        ...current,
        status: current.status === "not_started" ? "in_advisor_session" : current.status,
        advisorSession: { ...current.advisorSession, meetingModeActive: meetingMode, sessionDate: current.advisorSession.sessionDate ?? new Date().toISOString() },
      }),
    );
  }

  function changeSummary(summary: IPSSummaryData) {
    setProfile((p) => (p ? { ...p, summary } : p));
  }
  function saveSummary() {
    const current = profile!;
    run(
      () => saveSummaryAction(current.summary),
      () => current,
    );
  }
  function generate() {
    const current = profile!;
    run(
      () => generateSummaryAction(),
      () => {
        const summary = generateIPSSummary(current);
        summary.generatedAt = new Date().toISOString();
        return {
          ...current,
          summary,
          status: current.status === "not_started" || current.status === "in_advisor_session" ? "draft_generated" : current.status,
        };
      },
    );
    setActive("summary");
  }
  function changeStatus(status: IPSStatus) {
    const current = profile!;
    run(
      () => setStatusAction(status),
      () => ({ ...current, status }),
    );
  }
  function approve() {
    const current = profile!;
    run(
      () => approveForInternalUseAction(),
      () => ({ ...current, status: "approved_for_internal_use", approvedAt: new Date().toISOString() }),
    );
  }

  return (
    <div>
      <WorkbenchHeader
        clientName={clientName}
        clientAsOf={clientAsOf}
        status={profile.status}
        completion={completion}
        updatedAt={profile.updatedAt}
      />

      {demoMode && (
        <p className="mb-5 rounded-md border border-info/25 bg-info-soft px-3 py-2 text-[12px] text-info">
          Demo mode — this IPS is saved to your browser only. Sign in to persist it to the client record.
        </p>
      )}

      <div className="mb-6">
        <IPSAdvisorSessionPanel
          session={profile.advisorSession}
          started={sessionStarted}
          saving={pending}
          onStart={startSession}
          onChange={changeSession}
          onSave={saveSession}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Panel className="p-3">
            <p className="eyebrow px-2.5 pb-2">Sections</p>
            <IPSSectionNav active={active} statuses={statuses} onSelect={setActive} />
          </Panel>
        </aside>

        <div>
          {active === "summary" ? (
            <IPSSummaryView
              profile={profile}
              editing={editingSummary}
              saving={pending}
              onToggleEdit={() => setEditingSummary((e) => !e)}
              onChange={changeSummary}
              onSave={saveSummary}
              onGenerate={generate}
              onSetStatus={changeStatus}
              onApprove={approve}
            />
          ) : (
            <IPSSectionCard
              config={SECTION_CONFIG_BY_KEY[active]}
              value={profile[active] as unknown as SectionValue}
              saving={pending}
              hasNext={IPS_SECTION_KEYS.indexOf(active) < IPS_SECTION_KEYS.length - 1}
              onChange={(v) => changeSection(active, v)}
              onSave={() => saveSection(active)}
              onSaveAndContinue={() => saveAndContinue(active)}
              onMarkStatus={(s) => markStatus(active, s)}
            />
          )}
          <div className="mt-8">
            <IPSComplianceDisclaimer />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkbenchHeader({
  clientName,
  clientAsOf,
  status,
  completion,
  updatedAt,
}: {
  clientName: string;
  clientAsOf: string;
  status: IPSStatus;
  completion: number;
  updatedAt: string | null;
}) {
  return (
    <header className="mb-6 border-b border-hairline pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Advisor-Led IPS Workbench</p>
          <h1 className="mt-2 font-serif text-[28px] font-medium leading-[1.15] tracking-tight text-ink">
            {clientName}
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">
            Facilitate, document, and maintain a client-specific investment policy strategy.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <IPSStatusBadge status={status} />
          <div className="text-right">
            <p className="tnum text-[13px] font-medium text-ink">{completion}% complete</p>
            <p className="flex items-center gap-1 text-[11px] text-ink-muted">
              <Clock className="h-3 w-3" />
              {updatedAt ? `Updated ${new Date(updatedAt).toLocaleDateString()}` : `As of ${clientAsOf}`}
            </p>
          </div>
        </div>
      </div>
      {/* Completion bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${completion}%` }} />
      </div>
    </header>
  );
}
