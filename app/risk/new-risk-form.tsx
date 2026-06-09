"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import { Field, FormError, inputClass } from "@/components/form-controls";
import { createRiskAction } from "./actions";

const SEVERITIES = ["Elevated", "Moderate", "Low"];
const STATUSES = [
  "Advisor Review Required",
  "Risk to Review",
  "Diligence in Progress",
  "Governance Improvement",
  "Discussion Point",
  "Monitored",
];

export function NewRiskForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createRiskAction(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not add the risk factor.");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Add risk factor
      </Button>
    );
  }

  return (
    <Panel className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-[15px] font-medium text-ink">Add a risk factor</h3>
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
        <Field label="Factor">
          <input
            name="factor"
            required
            placeholder="e.g. Interest-rate / leverage risk"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Severity">
            <select name="severity" defaultValue="Moderate" className={inputClass}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="Discussion Point" className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Exposure" hint="What/where the exposure sits">
          <input
            name="exposure"
            placeholder="e.g. Real assets with property-level leverage"
            className={inputClass}
          />
        </Field>

        <Field label="Observation">
          <textarea
            name="observation"
            rows={3}
            placeholder="What the committee should consider about this risk."
            className={inputClass}
          />
        </Field>

        <Field label="Owner">
          <input name="owner" placeholder="Owner or preparer" className={inputClass} />
        </Field>

        {error ? <FormError message={error} /> : null}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={pending}>
            <Check className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Save risk factor"}
          </Button>
          <span className="text-[11px] text-ink-muted">
            Added to the standing register for committee review.
          </span>
        </div>
      </form>
    </Panel>
  );
}
