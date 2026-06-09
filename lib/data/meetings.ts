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

  // Secure mode never falls back to demo data.
  const ctx = await getSessionContext();
  if (!ctx.clientId) return [];

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

export interface NewMeetingInput {
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
  attendees: string[];
  agenda: string[];
}

/**
 * Whether the current session may create/edit meetings: secure mode + an
 * advisor or admin role scoped to an accessible client. Clients are read-only.
 */
export async function canWriteMeetings(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const ctx = await getSessionContext();
  return Boolean(ctx.clientId) && (ctx.role === "advisor" || ctx.role === "admin");
}

/**
 * Creates a meeting for the session's active client. Write authority is enforced
 * twice: here (defensive) and by Row-Level Security (`can_write_client`) in the
 * database — RLS is the real boundary.
 */
export async function createMeeting(input: NewMeetingInput): Promise<{ id: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Adding meetings requires secure mode (Supabase is not configured).");
  }

  const ctx = await getSessionContext();
  const clientId = ctx.clientId;
  if (!clientId) {
    throw new Error("No accessible client to attach this meeting to.");
  }
  if (ctx.role !== "advisor" && ctx.role !== "admin") {
    throw new Error("Only advisors or admins may add meetings.");
  }

  const title = input.title.trim();
  if (!title) throw new Error("A meeting title is required.");

  const supabase = await createServerSupabase();
  const res = await supabase
    .from("meetings")
    .insert({
      client_id: clientId,
      title,
      meeting_date: input.date.trim() || null,
      meeting_time: input.time.trim() || null,
      type: input.type.trim() || null,
      status: input.status.trim() || "Scheduled",
      attendees: input.attendees,
      agenda: input.agenda,
    })
    .select("id")
    .single();

  if (res.error) throw new Error(res.error.message);
  return { id: (res.data as { id: string }).id };
}
