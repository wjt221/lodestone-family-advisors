import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { ComplianceBadge } from "@/components/compliance-badge";

const DILIGENCE_ITEMS = [
  {
    id: "d1",
    investment: "Industrial Services Direct Investment",
    status: "Approved",
    date: "2023-08-15",
    analyst: "Sarah Chen, CFA",
    stage: "Completed",
    notes: "Full operational and financial review completed.",
  },
  {
    id: "d2",
    investment: "Roofing Platform Investment",
    status: "Approved",
    date: "2024-01-22",
    analyst: "Sarah Chen, CFA",
    stage: "Completed",
    notes: "Site visit, management interviews, financial model review.",
  },
  {
    id: "d3",
    investment: "Private Credit Fund I",
    status: "Approved",
    date: "2022-05-10",
    analyst: "Sarah Chen, CFA",
    stage: "Completed",
    notes: "Fund terms, track record, and manager diligence.",
  },
  {
    id: "d4",
    investment: "Venture Fund II",
    status: "Draft for Advisor Review",
    date: "2023-11-01",
    analyst: "Sarah Chen, CFA",
    stage: "In Review",
    notes: "Manager track record under review. Awaiting final advisor sign-off.",
  },
];

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-green-100 text-green-800",
  "Draft for Advisor Review": "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
};

export default function DiligencePage() {
  return (
    <div>
      <Header
        title="Due Diligence Tracker"
        subtitle="Investment diligence records and status"
        showCompliance
        complianceVariant="draft"
      />

      <div className="space-y-4">
        {DILIGENCE_ITEMS.map((d) => (
          <Card key={d.id} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {d.investment}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      STATUS_STYLES[d.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Diligence Date</p>
                <p className="text-slate-900">{d.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Lead Analyst</p>
                <p className="text-slate-900">{d.analyst}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Stage</p>
                <p className="text-slate-900">{d.stage}</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-slate-400 mb-0.5">Notes</p>
                <p className="text-slate-700">{d.notes}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <ComplianceBadge variant="requires-approval" />
        <p className="text-xs text-slate-400">
          All diligence memos require advisor sign-off before investment commitment.
        </p>
      </div>
    </div>
  );
}
