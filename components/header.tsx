import { ComplianceBadge } from "@/components/compliance-badge";
import { CLIENT } from "@/lib/mock-data";

interface HeaderProps {
  title: string;
  subtitle?: string;
  complianceVariant?: "draft" | "discussion" | "proposed" | "requires-approval" | "approved";
  showCompliance?: boolean;
}

export function Header({
  title,
  subtitle,
  complianceVariant = "draft",
  showCompliance = false,
}: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{CLIENT.name}</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showCompliance && (
          <ComplianceBadge variant={complianceVariant} />
        )}
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{CLIENT.advisor}</p>
          <p className="text-xs text-slate-500">{CLIENT.advisorTitle}</p>
        </div>
      </div>
    </div>
  );
}
