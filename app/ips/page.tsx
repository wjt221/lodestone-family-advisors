import { Check, StickyNote } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";
import { cn } from "@/lib/utils";
import { IPS, POLICY_RANGES, LIQUIDITY_RESERVE_POLICY } from "@/lib/mock-data";

export default function IpsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Investment Policy Statement"
        title="Atwater Family Office — Investment Policy"
        lede="The governing framework for how the family's capital is managed, reviewed, and decided. Prepared for discussion with Lodestone Family Advisors — a draft, not a final or binding document."
        status={{ label: "Draft for Advisor Review", tone: "caution" }}
      />

      {/* Document meta */}
      <Panel className="mb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {[
            { k: "Version", v: IPS.version },
            { k: "Prepared by", v: IPS.preparedBy },
            { k: "Prepared", v: IPS.preparedDate },
            { k: "Review cadence", v: IPS.reviewCadence },
          ].map((m) => (
            <div key={m.k}>
              <p className="eyebrow">{m.k}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-ink">{m.v}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Document body */}
        <article className="rounded-xl border border-hairline bg-card px-8 py-10 lg:px-12">
          <div className="mb-10 border-b border-hairline pb-8 text-center">
            <p className="eyebrow">Lodestone Family Advisors</p>
            <h2 className="mt-3 font-serif text-[26px] font-medium leading-tight text-ink">
              Investment Policy Statement
            </h2>
            <p className="mt-2 text-[13px] italic text-ink-muted">
              Draft prepared for discussion — {IPS.preparedDate}
            </p>
          </div>

          <div className="space-y-9">
            {IPS.sections.map((s, i) => (
              <section key={s.id} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
                <span className="tnum pt-0.5 font-serif text-[15px] font-medium text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-[18px] font-medium text-ink">
                    {s.heading}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.7] text-ink/85">
                    {s.body}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {/* Sign-off block */}
          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-hairline pt-8 sm:grid-cols-2">
            {["Family / Trustee", "Lodestone Family Advisors"].map((role) => (
              <div key={role}>
                <div className="h-10 border-b border-ink/30" />
                <p className="mt-2 text-[12px] text-ink-muted">{role}</p>
                <p className="text-[11px] text-ink-muted/70">
                  Signature pending IPS adoption
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Sidebar rail */}
        <aside className="space-y-4 lg:sticky lg:top-10 lg:self-start">
          <Panel className="p-5">
            <p className="eyebrow mb-4">Approval workflow</p>
            <ol className="space-y-3.5">
              {IPS.approvalWorkflow.map((w) => (
                <li key={w.step} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                      w.state === "complete" && "bg-positive/15 text-positive",
                      w.state === "current" && "bg-ink text-white",
                      w.state === "pending" && "border border-hairline text-ink-muted",
                    )}
                  >
                    {w.state === "complete" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      "•"
                    )}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "text-[13px]",
                        w.state === "pending"
                          ? "text-ink-muted"
                          : "font-medium text-ink",
                      )}
                    >
                      {w.step}
                    </p>
                    {w.state === "current" && (
                      <span className="mt-1 inline-block">
                        <StatusPill tone="caution" dot={false}>
                          Current step
                        </StatusPill>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-hairline pt-3 text-[12px] leading-relaxed text-ink-muted">
              {IPS.nextReview}
            </p>
          </Panel>

          <Panel className="p-5">
            <p className="eyebrow mb-3">Policy ranges at a glance</p>
            <ul className="space-y-2">
              {POLICY_RANGES.map((p) => (
                <li
                  key={p.assetClass}
                  className="flex items-center justify-between gap-3 text-[12.5px]"
                >
                  <span className="truncate text-ink-muted">{p.assetClass}</span>
                  <span className="tnum shrink-0 font-medium text-ink">
                    {p.min}–{p.max}%
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-hairline pt-2 text-[12.5px]">
                <span className="text-ink-muted">Liquidity reserve</span>
                <span className="tnum shrink-0 font-medium text-ink">
                  {LIQUIDITY_RESERVE_POLICY.min}–{LIQUIDITY_RESERVE_POLICY.max}%
                </span>
              </li>
            </ul>
          </Panel>

          <Panel className="p-5">
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-brand" />
              Advisor notes
            </p>
            <ul className="space-y-3">
              {IPS.advisorNotes.map((n) => (
                <li
                  key={n}
                  className="border-l-2 border-brand/40 pl-3 text-[12.5px] leading-relaxed text-ink/80"
                >
                  {n}
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        This Investment Policy Statement is an illustrative draft for discussion only.
        It is not investment advice and is not binding until reviewed and adopted by
        the family and the Investment Committee.
      </p>
    </div>
  );
}
