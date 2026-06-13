"use client";

// Advisor session panel: start/continue an IPS Strategy Session, meeting mode,
// attendees, documents needed, and outside advisors to consult.

import { useState } from "react";
import { Play, Radio, Loader2, Plus, X } from "lucide-react";
import { Panel, PanelHeader } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/form-controls";
import { cn } from "@/lib/utils";
import type { AdvisorSessionData, SessionAttendee, OutsideAdvisor } from "@/lib/ips/ipsTypes";

export function IPSAdvisorSessionPanel({
  session,
  started,
  saving,
  onStart,
  onChange,
  onSave,
}: {
  session: AdvisorSessionData;
  started: boolean;
  saving: boolean;
  onStart: (meetingMode: boolean) => void;
  onChange: (next: AdvisorSessionData) => void;
  onSave: () => void;
}) {
  const set = (p: Partial<AdvisorSessionData>) => onChange({ ...session, ...p });

  return (
    <Panel className="p-5">
      <PanelHeader
        title="IPS Strategy Session"
        description="Facilitate the discussion live, or continue a saved session."
        action={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              session.meetingModeActive
                ? "border-positive/30 bg-positive-soft text-positive"
                : "border-hairline bg-secondary text-ink-muted",
            )}
          >
            <Radio className="h-3 w-3" /> {session.meetingModeActive ? "Meeting mode on" : "Meeting mode off"}
          </span>
        }
      />

      {!started ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onStart(true)} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Start IPS Strategy Session
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-1 block">Session date</span>
              <input
                type="date"
                className={inputClass}
                value={(session.sessionDate ?? "").slice(0, 10)}
                onChange={(e) => set({ sessionDate: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">Advisor</span>
              <input className={inputClass} value={session.advisorName ?? ""} onChange={(e) => set({ advisorName: e.target.value })} />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-md border border-hairline bg-card px-3 py-2">
            <span className="text-[13px] text-ink">Meeting mode</span>
            <button
              type="button"
              onClick={() => set({ meetingModeActive: !session.meetingModeActive })}
              className={cn("relative h-5 w-9 rounded-full transition-colors", session.meetingModeActive ? "bg-brand" : "bg-hairline")}
              aria-pressed={session.meetingModeActive}
            >
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", session.meetingModeActive ? "left-[1.125rem]" : "left-0.5")} />
            </button>
          </div>

          {/* Attendees */}
          <div>
            <span className="eyebrow mb-1.5 block">Attendees</span>
            <div className="space-y-2">
              {session.attendees.map((a, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input className={inputClass} placeholder="Name" value={a.name} onChange={(e) => {
                    const next = [...session.attendees]; next[i] = { ...a, name: e.target.value }; set({ attendees: next });
                  }} />
                  <input className={inputClass} placeholder="Role" value={a.role ?? ""} onChange={(e) => {
                    const next = [...session.attendees]; next[i] = { ...a, role: e.target.value }; set({ attendees: next });
                  }} />
                  <div className="flex gap-2">
                    <select className={inputClass} value={a.attendanceType} onChange={(e) => {
                      const next = [...session.attendees]; next[i] = { ...a, attendanceType: e.target.value as SessionAttendee["attendanceType"] }; set({ attendees: next });
                    }}>
                      <option value="in_person">In person</option>
                      <option value="video">Video</option>
                      <option value="phone">Phone</option>
                      <option value="not_present">Not present</option>
                    </select>
                    <button type="button" onClick={() => set({ attendees: session.attendees.filter((_, j) => j !== i) })} className="shrink-0 rounded-md border border-hairline p-1.5 text-ink-muted hover:text-critical" aria-label="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => set({ attendees: [...session.attendees, { name: "", attendanceType: "in_person" }] })} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add attendee
              </button>
            </div>
          </div>

          {/* Documents needed */}
          <SimpleList label="Documents needed" itemLabel="document" values={session.documentsNeeded} onChange={(v) => set({ documentsNeeded: v })} />

          {/* Outside advisors */}
          <div>
            <span className="eyebrow mb-1.5 block">Outside advisors to consult</span>
            <div className="space-y-2">
              {session.outsideAdvisorsToConsult.map((o, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input className={inputClass} placeholder="Name" value={o.name ?? ""} onChange={(e) => {
                    const next = [...session.outsideAdvisorsToConsult]; next[i] = { ...o, name: e.target.value }; set({ outsideAdvisorsToConsult: next });
                  }} />
                  <select className={inputClass} value={o.role} onChange={(e) => {
                    const next = [...session.outsideAdvisorsToConsult]; next[i] = { ...o, role: e.target.value as OutsideAdvisor["role"] }; set({ outsideAdvisorsToConsult: next });
                  }}>
                    <option value="CPA">CPA</option>
                    <option value="estate_attorney">Estate attorney</option>
                    <option value="trustee">Trustee</option>
                    <option value="family_office_CFO">Family office CFO</option>
                    <option value="investment_consultant">Investment consultant</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex gap-2">
                    <select className={inputClass} value={o.status} onChange={(e) => {
                      const next = [...session.outsideAdvisorsToConsult]; next[i] = { ...o, status: e.target.value as OutsideAdvisor["status"] }; set({ outsideAdvisorsToConsult: next });
                    }}>
                      <option value="not_contacted">Not contacted</option>
                      <option value="pending">Pending</option>
                      <option value="consulted">Consulted</option>
                    </select>
                    <button type="button" onClick={() => set({ outsideAdvisorsToConsult: session.outsideAdvisorsToConsult.filter((_, j) => j !== i) })} className="shrink-0 rounded-md border border-hairline p-1.5 text-ink-muted hover:text-critical" aria-label="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => set({ outsideAdvisorsToConsult: [...session.outsideAdvisorsToConsult, { role: "CPA", status: "not_contacted" }] })} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add outside advisor
              </button>
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <Button variant="secondary" onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save session
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function SimpleList({
  label,
  itemLabel,
  values,
  onChange,
}: {
  label: string;
  itemLabel: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <span className="eyebrow mb-1.5 block">{label}</span>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className={inputClass} value={v} onChange={(e) => { const next = [...values]; next[i] = e.target.value; onChange(next); }} />
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="shrink-0 rounded-md border border-hairline p-1.5 text-ink-muted hover:text-critical" aria-label="Remove">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...values, ""])} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
          <Plus className="h-3.5 w-3.5" /> Add {itemLabel}
        </button>
      </div>
    </div>
  );
}
