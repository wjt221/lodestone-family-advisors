import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { MEETINGS } from "@/lib/mock-data";
import { Calendar, Users } from "lucide-react";

export default function MeetingsPage() {
  const upcoming = MEETINGS.filter((m) => m.status === "Scheduled");
  const past = MEETINGS.filter((m) => m.status === "Completed");

  return (
    <div>
      <Header
        title="Meetings"
        subtitle="Advisory meeting schedule and notes"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-semibold uppercase text-slate-500 tracking-wide mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-4">
            {upcoming.map((m) => (
              <Card key={m.id} className="border-0 shadow-sm border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold">
                      {m.title}
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                      {m.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{m.date} · {m.time}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <Users className="w-4 h-4 mt-0.5" />
                    <span>{m.attendees.join(", ")}</span>
                  </div>
                  {m.notes && (
                    <p className="text-slate-500 text-xs mt-2 bg-slate-50 p-2 rounded">
                      {m.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase text-slate-500 tracking-wide mb-3">
            Past Meetings ({past.length})
          </h2>
          <div className="space-y-4">
            {past.map((m) => (
              <Card key={m.id} className="border-0 shadow-sm opacity-75">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold text-slate-700">
                      {m.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-600"
                    >
                      {m.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{m.date} · {m.time}</span>
                  </div>
                  {m.notes && (
                    <p className="text-xs text-slate-500 mt-1">{m.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
