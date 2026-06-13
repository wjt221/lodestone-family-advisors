"use client";

// One IPS section: client discussion prompts, advisor guidance, config-driven
// structured decision capture, the three note streams, open questions,
// follow-up items, confidence, and section status — plus save controls.

import { useState } from "react";
import { MessageCircleQuestion, Lightbulb, ChevronRight, Loader2 } from "lucide-react";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import type { SectionConfig } from "@/lib/ips/ipsDefaults";
import type { IPSSectionBase, SectionStatus, SectionConfidence, FollowUpItem } from "@/lib/ips/ipsTypes";
import {
  DecisionField,
  NotesBlock,
  OpenQuestions,
  FollowUpEditor,
  ConfidenceSelector,
  SectionStatusControls,
  SectionStatusBadge,
} from "./primitives";

export type SectionValue = IPSSectionBase & Record<string, unknown>;

export function IPSSectionCard({
  config,
  value,
  saving,
  hasNext,
  onChange,
  onSave,
  onSaveAndContinue,
  onMarkStatus,
}: {
  config: SectionConfig;
  value: SectionValue;
  saving: boolean;
  hasNext: boolean;
  onChange: (next: SectionValue) => void;
  onSave: () => void;
  onSaveAndContinue: () => void;
  onMarkStatus: (status: SectionStatus) => void;
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[22px] font-medium leading-tight text-ink">{config.title}</h2>
          <SectionStatusBadge status={value.sectionStatus} />
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{config.purpose}</p>
      </div>

      {/* Discussion prompts + advisor guidance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="bg-secondary/40 p-5">
          <p className="eyebrow mb-3 flex items-center gap-1.5">
            <MessageCircleQuestion className="h-3.5 w-3.5 text-brand" /> Client discussion prompts
          </p>
          <ul className="space-y-2">
            {config.prompts.map((p, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink/85">
                <span className="text-brand">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="border-brand/20 bg-brand/[0.04] p-5">
          <p className="eyebrow mb-3 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-brand" /> Advisor guidance
          </p>
          <p className="text-[13px] leading-relaxed text-ink/85">{config.guidance}</p>
        </Panel>
      </div>

      {/* Structured decision capture */}
      <Panel className="p-5">
        <p className="eyebrow mb-4">Structured decision capture</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {config.fields.map((f) => (
            <DecisionField key={f.key} spec={f} value={value[f.key]} onChange={(v) => set(f.key, v)} />
          ))}
        </div>
      </Panel>

      {/* Notes */}
      <Panel className="p-5">
        <p className="eyebrow mb-4">Notes</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <NotesBlock label="Advisor notes" hint="Advisor's working notes" value={(value.advisorNotes as string) ?? ""} onChange={(v) => set("advisorNotes", v)} />
          <NotesBlock label="Internal notes" hint="Not shared with the client" value={(value.internalNotes as string) ?? ""} onChange={(v) => set("internalNotes", v)} />
          <NotesBlock label="Client-facing notes" hint="May be shared with the client" value={(value.clientFacingNotes as string) ?? ""} onChange={(v) => set("clientFacingNotes", v)} />
        </div>
      </Panel>

      {/* Open questions + follow-ups */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="eyebrow mb-3">Open questions</p>
          <OpenQuestions values={(value.openQuestions as string[]) ?? []} onChange={(v) => set("openQuestions", v)} />
        </Panel>
        <Panel className="p-5">
          <p className="eyebrow mb-3">Follow-up items</p>
          <FollowUpEditor
            items={(value.followUpItems as FollowUpItem[]) ?? []}
            relatedSection={config.key}
            onChange={(v) => set("followUpItems", v)}
          />
        </Panel>
      </div>

      {/* Confidence + status */}
      <Panel className="p-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ConfidenceSelector value={value.confidence} onChange={(c: SectionConfidence) => set("confidence", c)} />
          <div>
            <span className="eyebrow mb-1.5 block">Section status</span>
            <SectionStatusControls value={value.sectionStatus} onChange={onMarkStatus} />
          </div>
        </div>
      </Panel>

      {/* Save controls */}
      <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Save Section
        </Button>
        {hasNext && (
          <Button variant="secondary" onClick={onSaveAndContinue} disabled={saving}>
            Save &amp; Continue <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
