import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Section divider used to give pages editorial rhythm between groups of panels. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-end justify-between gap-4 border-b border-hairline pb-2.5",
        className,
      )}
    >
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="font-serif text-[19px] font-medium leading-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}
