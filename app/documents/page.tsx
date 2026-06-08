import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { DOCUMENTS } from "@/lib/mock-data";
import { FileText, Download } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-green-100 text-green-800",
  Final: "bg-blue-100 text-blue-800",
  "Draft for Advisor Review": "bg-amber-100 text-amber-800",
};

const TYPE_ICONS: Record<string, string> = {
  IPS: "📋",
  Report: "📊",
  Diligence: "🔍",
  Planning: "📌",
};

export default function DocumentsPage() {
  return (
    <div>
      <Header
        title="Document Vault"
        subtitle="Secure document library for the Atwater Family Office"
      />

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Documents</CardTitle>
          <p className="text-xs text-slate-400">Illustrative document list only</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {DOCUMENTS.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                    {TYPE_ICONS[d.type] ?? "📄"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {d.type} · {d.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      STATUS_STYLES[d.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {d.status}
                  </span>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Document vault is for reference only. All documents labeled &quot;Draft for Advisor Review&quot; have not been finalized. Please contact your advisor before acting on any document contents.
          </p>
        </div>
      </div>
    </div>
  );
}
