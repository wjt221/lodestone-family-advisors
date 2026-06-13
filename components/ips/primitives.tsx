"use client";

// Shared, controlled building blocks for the Advisor-Led IPS Workbench:
// status/confidence badges, the config-driven decision-capture fields, notes
// blocks, open-question and follow-up editors, and section status controls.

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "@/components/form-controls";
import { StatusPill, type Tone } from "@/components/status-pill";
import type { FieldSpec } from "@/lib/ips/ipsDefaults";
import {
  SECTION_STATUS_LABELS,
  CONFIDENCE_LABELS,
  STATUS_LABELS,
} from "@/lib/ips/ipsDefaults";
import type {
  SectionStatus,
  SectionConfidence,
  FollowUpItem,
  IPSStatus,
} from "@/lib/ips/ipsTypes";

// ── Badges ───────────────────────────────────────────────────────────────────
const SECTION_TONE: Record<SectionStatus, Tone> = {
  not_started: "neutral",
  in_progress: "info",
  complete: "positive",
  skipped: "neutral",
  not_applicable: "neutral",
  needs_follow_up: "caution",
};

const CONFIDENCE_TONE: Record<SectionConfidence, Tone> = {
  clear_decision: "positive",
  directionally_clear: "info",
  needs_follow_up: "caution",
  advisor_review_required: "critical",
};

const STATUS_TONE: Record<IPSStatus, Tone> = {
  not_started: "neutral",
  in_advisor_session: "info",
  draft_generated: "info",
  advisor_review: "caution",
  client_follow_up_needed: "caution",
  client_reviewed: "info",
  approved_for_internal_use: "positive",
  archived: "neutral",
};

export function IPSStatusBadge({ status }: { status: IPSStatus }) {
  return <StatusPill tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</StatusPill>;
}

export function SectionStatusBadge({ status }: { status: SectionStatus }) {
  return (
    <StatusPill tone={SECTION_TONE[status]} dot>
      {SECTION_STATUS_LABELS[status]}
    </StatusPill>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: SectionConfidence }) {
  return (
    <StatusPill tone={CONFIDENCE_TONE[confidence]} dot={false}>
      {CONFIDENCE_LABELS[confidence]}
    </StatusPill>
  );
}

// ── Small labelled wrapper ─────────────────────────────────────────────────────
function Labelled({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="eyebrow mb-1 block">{label}</span>
      {children}
    </label>
  );
}

// ── Chips multiselect ──────────────────────────────────────────────────────────
function Chips({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
              on
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-hairline bg-card text-ink-muted hover:border-brand/30 hover:text-ink",
            )}
          >
            {on && <Check className="h-3 w-3" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── String list (add/remove text rows) ─────────────────────────────────────────
function StringList({
  values,
  itemLabel,
  onChange,
}: {
  values: string[];
  itemLabel?: string;
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={v}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="shrink-0 rounded-md border border-hairline p-1.5 text-ink-muted hover:text-critical"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add {itemLabel ?? "item"}
      </button>
    </div>
  );
}

type Obj = Record<string, unknown>;

// ── Object list (repeatable structured rows) ────────────────────────────────────
function ObjectList({
  items,
  itemFields,
  itemLabel,
  onChange,
}: {
  items: Obj[];
  itemFields: FieldSpec[];
  itemLabel?: string;
  onChange: (next: Obj[]) => void;
}) {
  function newItem(): Obj {
    const o: Obj = { id: crypto.randomUUID() };
    for (const f of itemFields) {
      if (f.kind === "multiselect" || f.kind === "stringList") o[f.key] = [];
      else if (f.kind === "toggle") o[f.key] = false;
      else o[f.key] = f.kind === "select" ? (f.options?.[0]?.value ?? "") : "";
    }
    return o;
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={(item.id as string) ?? i} className="rounded-lg border border-hairline bg-secondary/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">{itemLabel ?? "Item"} {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="rounded-md p-1 text-ink-muted hover:text-critical"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {itemFields.map((f) => (
              <DecisionField
                key={f.key}
                spec={f}
                value={item[f.key]}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...next[i], [f.key]: v };
                  onChange(next);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add {itemLabel ?? "item"}
      </button>
    </div>
  );
}

// ── Generic field driven by a FieldSpec ─────────────────────────────────────────
export function DecisionField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (spec.kind) {
    case "text":
      return (
        <Labelled label={spec.label} full={spec.full}>
          <input className={inputClass} placeholder={spec.placeholder} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Labelled>
      );
    case "textarea":
      return (
        <Labelled label={spec.label} full={spec.full}>
          <textarea className={cn(inputClass, "min-h-[68px] resize-y")} placeholder={spec.placeholder} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Labelled>
      );
    case "number":
    case "percent":
    case "currency":
      return (
        <Labelled label={spec.label + (spec.kind === "percent" ? " (%)" : spec.kind === "currency" ? " ($)" : "")} full={spec.full}>
          <input
            type="number"
            className={inputClass}
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </Labelled>
      );
    case "toggle":
      return (
        <div className={cn("flex items-center justify-between rounded-md border border-hairline bg-card px-3 py-2", spec.full && "sm:col-span-2")}>
          <span className="text-[13px] text-ink">{spec.label}</span>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              value ? "bg-brand" : "bg-hairline",
            )}
            aria-pressed={Boolean(value)}
          >
            <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", value ? "left-[1.125rem]" : "left-0.5")} />
          </button>
        </div>
      );
    case "select":
      return (
        <Labelled label={spec.label} full={spec.full}>
          <select className={inputClass} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {spec.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Labelled>
      );
    case "multiselect": {
      const selected = (value as string[]) ?? [];
      return (
        <Labelled label={spec.label} full={spec.full}>
          <Chips
            options={spec.options ?? []}
            selected={selected}
            onToggle={(v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])}
          />
        </Labelled>
      );
    }
    case "stringList":
      return (
        <Labelled label={spec.label} full={spec.full}>
          <StringList values={(value as string[]) ?? []} itemLabel={spec.itemLabel} onChange={onChange} />
        </Labelled>
      );
    case "objectList":
      return (
        <Labelled label={spec.label} full={spec.full}>
          <ObjectList items={(value as Obj[]) ?? []} itemFields={spec.itemFields ?? []} itemLabel={spec.itemLabel} onChange={onChange} />
        </Labelled>
      );
    default:
      return null;
  }
}

// ── Notes blocks ────────────────────────────────────────────────────────────────
export function NotesBlock({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      <textarea
        className={cn(inputClass, "min-h-[60px] resize-y")}
        placeholder={hint}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// ── Open questions editor ────────────────────────────────────────────────────────
export function OpenQuestions({
  values,
  onChange,
}: {
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return <StringList values={values} itemLabel="question" onChange={onChange} />;
}

// ── Follow-up items editor ────────────────────────────────────────────────────────
export function FollowUpEditor({
  items,
  relatedSection,
  onChange,
}: {
  items: FollowUpItem[];
  relatedSection: string;
  onChange: (next: FollowUpItem[]) => void;
}) {
  function add() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        item: "",
        relatedSection,
        status: "open",
        visibility: "internal",
      },
    ]);
  }
  function patch(i: number, p: Partial<FollowUpItem>) {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  }
  return (
    <div className="space-y-2.5">
      {items.map((f, i) => (
        <div key={f.id} className="rounded-lg border border-hairline bg-secondary/30 p-3">
          <div className="mb-2 flex items-start gap-2">
            <input
              className={inputClass}
              placeholder="Follow-up item"
              value={f.item}
              onChange={(e) => patch(i, { item: e.target.value })}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="shrink-0 rounded-md border border-hairline p-1.5 text-ink-muted hover:text-critical" aria-label="Remove">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input className={inputClass} placeholder="Owner" value={f.owner ?? ""} onChange={(e) => patch(i, { owner: e.target.value })} />
            <input className={inputClass} type="date" value={f.dueDate ?? ""} onChange={(e) => patch(i, { dueDate: e.target.value })} />
            <select className={inputClass} value={f.status} onChange={(e) => patch(i, { status: e.target.value as FollowUpItem["status"] })}>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="deferred">Deferred</option>
            </select>
            <select className={inputClass} value={f.visibility} onChange={(e) => patch(i, { visibility: e.target.value as FollowUpItem["visibility"] })}>
              <option value="internal">Internal</option>
              <option value="client_facing">Client-facing</option>
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
        <Plus className="h-3.5 w-3.5" /> Add follow-up item
      </button>
    </div>
  );
}

// ── Confidence selector ──────────────────────────────────────────────────────────
const CONFIDENCE_ORDER: SectionConfidence[] = [
  "clear_decision",
  "directionally_clear",
  "needs_follow_up",
  "advisor_review_required",
];

export function ConfidenceSelector({
  value,
  onChange,
}: {
  value: SectionConfidence;
  onChange: (v: SectionConfidence) => void;
}) {
  return (
    <div>
      <span className="eyebrow mb-1.5 block">Section confidence</span>
      <div className="flex flex-wrap gap-1.5">
        {CONFIDENCE_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
              value === c ? "border-brand/40 bg-brand/10 text-brand" : "border-hairline text-ink-muted hover:text-ink",
            )}
          >
            {CONFIDENCE_LABELS[c]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section status controls ──────────────────────────────────────────────────────
const STATUS_BUTTONS: { status: SectionStatus; label: string }[] = [
  { status: "complete", label: "Mark Complete" },
  { status: "needs_follow_up", label: "Mark Needs Follow-Up" },
  { status: "not_applicable", label: "Mark Not Applicable" },
  { status: "skipped", label: "Skip" },
];

export function SectionStatusControls({
  value,
  onChange,
}: {
  value: SectionStatus;
  onChange: (v: SectionStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_BUTTONS.map((b) => (
        <button
          key={b.status}
          type="button"
          onClick={() => onChange(b.status)}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
            value === b.status
              ? "border-brand/40 bg-brand/10 text-brand"
              : "border-hairline text-ink-muted hover:border-brand/30 hover:text-ink",
          )}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
