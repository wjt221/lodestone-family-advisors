import { FileText } from "lucide-react";
import { Panel } from "@/components/panel";

/** Calm placeholder for sections whose content is still being prepared by the advisor. */
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Panel className="flex flex-col items-center justify-center px-8 py-14 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-secondary/50 text-brand">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="font-serif text-[17px] font-medium text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
        {description}
      </p>
    </Panel>
  );
}
