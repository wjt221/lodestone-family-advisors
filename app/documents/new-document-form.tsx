"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import { Field, FormError, inputClass } from "@/components/form-controls";
import { createDocumentAction } from "./actions";

const CATEGORIES = ["Policy", "Governance", "Diligence", "Reporting", "Planning"];
const STATUSES = ["Draft for Advisor Review", "In Review", "Final"];

export function NewDocumentForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createDocumentAction(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not create the document.");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Add document
      </Button>
    );
  }

  return (
    <Panel className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-[15px] font-medium text-ink">Register a document</h3>
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
        <Field label="Name">
          <input
            name="name"
            required
            placeholder="e.g. Q2 2026 Portfolio & Liquidity Report"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Category">
            <select name="category" defaultValue="Reporting" className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="Draft for Advisor Review" className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Owner" hint="Who prepared or owns this document">
          <input name="owner" placeholder="Sarah Chen, CFA" className={inputClass} />
        </Field>

        {error ? <FormError message={error} /> : null}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={pending}>
            <Check className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Save document"}
          </Button>
          <span className="text-[11px] text-ink-muted">
            Registers a vault record. File upload is not enabled in this build.
          </span>
        </div>
      </form>
    </Panel>
  );
}
