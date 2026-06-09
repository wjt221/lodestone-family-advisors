"use server";

import { revalidatePath } from "next/cache";
import { createMeeting } from "@/lib/data/meetings";

export interface MeetingActionResult {
  ok: boolean;
  error?: string;
}

/** Splits a textarea value into a trimmed, non-empty list (one item per line). */
function toList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createMeetingAction(formData: FormData): Promise<MeetingActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Please enter a meeting title." };

  try {
    await createMeeting({
      title,
      date: String(formData.get("date") ?? ""),
      time: String(formData.get("time") ?? ""),
      type: String(formData.get("type") ?? ""),
      status: String(formData.get("status") ?? "Scheduled"),
      attendees: toList(formData.get("attendees")),
      agenda: toList(formData.get("agenda")),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create the meeting." };
  }

  revalidatePath("/meetings");
  return { ok: true };
}
