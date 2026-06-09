import { CalendarDays, Users, Gavel } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";
import { DECISION_LOG } from "@/lib/mock-data";
import { getMeetings, canWriteMeetings } from "@/lib/data/meetings";
import { isDemoMode } from "@/lib/data/session";
import { NewMeetingForm } from "./new-meeting-form";

export default async function MeetingsPage() {
  const [meetings, canWrite] = await Promise.all([getMeetings(), canWriteMeetings()]);
  // The decision log has no live data model yet — demo only, never shown to clients.
  const decisions = isDemoMode() ? DECISION_LOG : [];
  const upcoming = meetings.filter((m) => m.status === "Scheduled");
  const past = meetings.filter((m) => m.status === "Completed");

  return (
    <div>
      <PageHeader
        eyebrow="Governance Cadence"
        title="Decisions, made and documented"
        lede="A standing meeting rhythm and a written record of every decision is how a family avoids ad-hoc, reactive choices. This is the cadence that turns analysis into disciplined action."
        status={{ label: "Governance Improvement", tone: "info" }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Meetings */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <SectionHeading eyebrow="Schedule" title="Meetings" />
            {canWrite ? <NewMeetingForm /> : null}
          </div>
          <div className="space-y-3">
            {upcoming.map((m) => (
              <Panel key={m.id} className="p-5 pl-6 relative overflow-hidden">
                <span className="absolute inset-y-4 left-0 w-[3px] rounded-full bg-brand" />
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-[16px] font-medium text-ink">
                      {m.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-[12.5px] text-ink-muted">
                      <CalendarDays className="h-3.5 w-3.5 text-brand" />
                      {m.date} · {m.time}
                    </div>
                  </div>
                  <StatusPill tone="info" dot={false}>
                    {m.type}
                  </StatusPill>
                </div>
                <div className="mb-3 flex items-start gap-2 text-[12.5px] text-ink-muted">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {m.attendees.join(" · ")}
                </div>
                <div className="border-t border-hairline pt-3">
                  <p className="eyebrow mb-2">Agenda</p>
                  <ul className="space-y-1">
                    {m.agenda.map((a) => (
                      <li
                        key={a}
                        className="flex items-start gap-2 text-[13px] text-ink"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
            ))}
          </div>

          <p className="eyebrow mb-3 mt-6">Past</p>
          <div className="space-y-3">
            {past.map((m) => (
              <Panel key={m.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[14px] font-medium text-ink">{m.title}</h3>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {m.date} · {m.type}
                    </p>
                  </div>
                  <StatusPill tone="neutral" dot={false}>
                    Completed
                  </StatusPill>
                </div>
                <ul className="mt-2 space-y-1">
                  {m.agenda.map((a) => (
                    <li key={a} className="text-[12.5px] text-ink-muted">
                      • {a}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </div>

        {/* Decision log */}
        <div>
          <SectionHeading eyebrow="Record" title="Decision log" />
          <Panel inset className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Gavel className="h-4 w-4 text-brand" />
              <p className="text-[13px] text-ink-muted">
                Documented Investment Committee and advisor decisions.
              </p>
            </div>
            {decisions.length === 0 && (
              <p className="text-[13px] leading-relaxed text-ink-muted">
                No documented decisions yet. As the family makes decisions with
                Lodestone, each one is recorded here with its rationale.
              </p>
            )}
            <ol className="relative space-y-5 border-l border-hairline pl-5">
              {decisions.map((d) => (
                <li key={d.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-brand" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-wide text-ink-muted">
                      {d.date} · {d.body}
                    </p>
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-ink">{d.topic}</p>
                  <p className="mt-0.5 text-[12.5px] font-medium text-brand">
                    {d.decision}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {d.rationale}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      <p className="mt-10 border-t border-hairline pt-5 text-[11px] leading-relaxed text-ink-muted">
        Meetings and decisions shown are illustrative. Nothing here is investment
        advice. The decision log is a governance record, not a recommendation.
      </p>
    </div>
  );
}
