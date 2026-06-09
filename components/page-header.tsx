import { CLIENT } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { StatusPill, type Tone } from "@/components/status-pill";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
  status?: { label: string; tone?: Tone };
  actions?: React.ReactNode;
  /** Real client identity from the data layer; falls back to the demo client in demo mode. */
  client?: { name: string; asOf: string };
}

/** Editorial page header: small-caps eyebrow, serif title, supporting lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  status,
  actions,
  client,
}: PageHeaderProps) {
  const identity = client ?? (isSupabaseConfigured() ? null : { name: CLIENT.name, asOf: CLIENT.asOf });
  return (
    <header className="mb-8 border-b border-hairline pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-[28px] font-medium leading-[1.15] tracking-tight text-ink">
            {title}
          </h1>
          {lede && (
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">
              {lede}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          {status && <StatusPill tone={status.tone}>{status.label}</StatusPill>}
          {actions}
          {identity && (
            <div className="text-right">
              <p className="text-[12px] font-medium text-ink">{identity.name}</p>
              <p className="text-[11px] text-ink-muted">As of {identity.asOf}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
