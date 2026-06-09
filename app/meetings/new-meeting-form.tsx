"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import { createMeetingAction } from "./actions";

const MEETING_TYPES = [
  "Investment Committee",
  "Family Review",
  "Advisor Discussion",
  "Annual Review",
  "Ad-hoc",
];

const inputClass =
  "w-full rounded-md border border-hairline bg-card px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span> : null}
    </label>
  );
}

export function NewMeetingForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createMeetingAction(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not create the meeting.");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Add meeting
      </Button>
    );
  }

  return (
    <Panel className="mb-4 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-[15px] font-medium text-ink">Schedule a meeting</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form ref={formRef} action={onSubmit} className="space-y-3.5">
        <Field label="Title">
          <input
            name="title"
            required
            placeholder="e.g. Q3 Portfolio & Governance Review"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Date" hint="Free text, e.g. Sep 18, 2026">
            <input name="date" placeholder="Sep 18, 2026" className={inputClass} />
          </Field>
          <Field label="Time" hint="e.g. 10:00 AM ET">
            <input name="time" placeholder="10:00 AM ET" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Type">
            <select name="type" defaultValue="Investment Committee" className={inputClass}>
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="Scheduled" className={inputClass}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
        </div>

        <Field label="Attendees" hint="One per line">
          <textarea
            name="attendees"
            rows={3}
            placeholder={"Sarah Chen, CFA\nJonathan Atwater"}
            className={inputClass}
          />
        </Field>

        <Field label="Agenda" hint="One item per line">
          <textarea
            name="agenda"
            rows={3}
            placeholder={"Review liquidity reserve\nPipeline: Infrastructure Debt Fund III"}
            className={inputClass}
          />
        </Field>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-critical/30 bg-critical/5 px-3 py-2 text-[12.5px] text-critical">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={pending}>
            <Check className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Save meeting"}
          </Button>
          <span className="text-[11px] text-ink-muted">
            Saved as a governance record for advisor review.
          </span>
        </div>
      </form>
    </Panel>
  );
}
