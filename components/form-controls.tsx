import { AlertCircle } from "lucide-react";

// Shared presentational form controls for in-app data-entry forms. No hooks, so
// these are safe to use inside client components without their own boundary.

export const inputClass =
  "w-full rounded-md border border-hairline bg-card px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export function Field({
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

export function FormError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-critical/30 bg-critical/5 px-3 py-2 text-[12.5px] text-critical">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
