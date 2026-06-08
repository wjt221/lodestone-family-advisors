"use client";

import { Badge } from "@/components/ui/badge";

type ComplianceVariant =
  | "draft"
  | "discussion"
  | "proposed"
  | "requires-approval"
  | "approved";

interface ComplianceBadgeProps {
  variant?: ComplianceVariant;
  label?: string;
  className?: string;
}

const LABELS: Record<ComplianceVariant, string> = {
  draft: "Draft for Advisor Review",
  discussion: "Discussion Point",
  proposed: "Proposed Framework",
  "requires-approval": "Requires Advisor Approval",
  approved: "Advisor Approved",
};

const STYLES: Record<ComplianceVariant, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-300",
  discussion: "bg-blue-100 text-blue-800 border-blue-300",
  proposed: "bg-purple-100 text-purple-800 border-purple-300",
  "requires-approval": "bg-red-100 text-red-800 border-red-300",
  approved: "bg-green-100 text-green-800 border-green-300",
};

export function ComplianceBadge({
  variant = "draft",
  label,
  className = "",
}: ComplianceBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium border ${STYLES[variant]} ${className}`}
    >
      {label ?? LABELS[variant]}
    </Badge>
  );
}
