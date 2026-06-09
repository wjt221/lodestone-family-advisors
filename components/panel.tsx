import { cn } from "@/lib/utils";

interface PanelProps extends React.ComponentProps<"section"> {
  inset?: boolean;
}

/** A calm, hairline-bordered surface — the base container across the app. */
export function Panel({ className, inset, children, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-hairline bg-card",
        inset ? "" : "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

interface PanelHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        description ? "mb-5" : "mb-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="font-serif text-[17px] font-medium leading-tight text-ink">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
