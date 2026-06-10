"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormError, inputClass } from "@/components/form-controls";
import { updateHoldingAction } from "./actions";

const ASSET_CLASSES = [
  "Cash & Fixed Income",
  "Public Market Equities",
  "Private Equity",
  "Venture Capital",
  "Real Estate",
  "Private Credit",
  "Infrastructure",
  "Hedge Funds",
];
const LIQUIDITY = ["Daily", "Quarterly", "Annual", "Multi-Year", "Illiquid"];

export interface EditableHolding {
  id: string;
  name: string;
  value: number;
  assetClass: string;
  strategy: string;
  liquidity: string;
}

export function EditHolding({ holding }: { holding: EditableHolding }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateHoldingAction(formData);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not update the holding.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-ink-muted/50 transition-colors hover:text-brand"
        aria-label={`Edit ${holding.name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Edit holding</p>
            <h3 className="mt-1 font-serif text-[16px] font-medium leading-snug text-ink">
              {holding.name}
            </h3>
          </div>
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

        <form action={onSubmit} className="space-y-3.5">
          <input type="hidden" name="id" value={holding.id} />

          <Field label="Market value (USD)">
            <input
              name="value"
              inputMode="decimal"
              defaultValue={holding.value}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Asset class">
              <select name="assetClass" defaultValue={holding.assetClass} className={inputClass}>
                {!ASSET_CLASSES.includes(holding.assetClass) && (
                  <option value={holding.assetClass}>{holding.assetClass}</option>
                )}
                {ASSET_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Liquidity">
              <select name="liquidity" defaultValue={holding.liquidity} className={inputClass}>
                {LIQUIDITY.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Strategy">
            <input name="strategy" defaultValue={holding.strategy} className={inputClass} />
          </Field>

          {error ? <FormError message={error} /> : null}

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" size="sm" disabled={pending}>
              <Check className="h-3.5 w-3.5" />
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <span className="text-[11px] text-ink-muted">
              Charts and weights update immediately.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
