import { FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { StatusPill, toneForLabel } from "@/components/status-pill";
import { DOCUMENTS } from "@/lib/mock-data";

const CATEGORY_ORDER = [
  "Policy",
  "Governance",
  "Diligence",
  "Reporting",
  "Planning",
];

export default function DocumentsPage() {
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    docs: DOCUMENTS.filter((d) => d.category === cat),
  })).filter((g) => g.docs.length > 0);

  const drafts = DOCUMENTS.filter(
    (d) => d.status === "Draft for Advisor Review" || d.status === "In Review",
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="Document Vault"
        title="The family's institutional memory"
        lede="Policies, diligence memos, reporting, and governance records in one place — so decisions are documented, reviewable, and never lost between meetings."
        status={{ label: `${drafts} in review`, tone: "caution" }}
      />

      <div className="space-y-8">
        {byCategory.map((group) => (
          <section key={group.cat}>
            <SectionHeading eyebrow="Category" title={group.cat} />
            <Panel inset>
              <ul className="divide-y divide-hairline">
                {group.docs.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-secondary/50 text-brand">
                        <FileText className="h-[18px] w-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {d.name}
                        </p>
                        <p className="text-[12px] text-ink-muted">
                          Updated {d.updated} · {d.owner}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <StatusPill tone={toneForLabel(d.status)} dot={false}>
                        {d.status}
                      </StatusPill>
                      <button
                        className="text-ink-muted/60 transition-colors hover:text-brand"
                        aria-label={`Download ${d.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        The document vault is illustrative and for reference only. Items marked
        &ldquo;Draft for Advisor Review&rdquo; or &ldquo;In Review&rdquo; are not
        final. Nothing here is investment advice — contact your advisor before acting
        on any document.
      </p>
    </div>
  );
}
