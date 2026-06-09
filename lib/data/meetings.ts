import "server-only";

// Meetings reads. Returns the shape the meetings UI expects.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getSessionContext } from "./session";
import type { MeetingRow } from "@/lib/supabase/types";
import { MEETINGS as MOCK_MEETINGS } from "@/lib/mock-data";

export interface MeetingView {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  attendees: string[];
  status: string;
  agenda: string[];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function getMeetings(): Promise<MeetingView[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_MEETINGS.map((m) => ({ ...m, attendees: [...m.attendees], agenda: [...m.agenda] }));
  }

  const ctx = await getSessionContext();
  if (!ctx.clientId) {
    return MOCK_MEETINGS.map((m) => ({ ...m, attendees: [...m.attendees], agenda: [...m.agenda] }));
  }

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("meetings")
    .select("id, title, meeting_date, meeting_time, type, attendees, status, agenda")
    .eq("client_id", ctx.clientId)
    .order("meeting_date", { ascending: true });
  const rows = (res.data ?? []) as MeetingRow[];

  return rows.map((m) => ({
    id: m.id,
    title: m.title,
    date: m.meeting_date ?? "",
    time: m.meeting_time ?? "",
    type: m.type ?? "",
    attendees: asStringArray(m.attendees),
    status: m.status,
    agenda: asStringArray(m.agenda),
  }));
}
