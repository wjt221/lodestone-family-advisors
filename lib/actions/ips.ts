"use server";

// Server actions backing the Advisor-Led IPS Workbench. Each resolves the active
// client from the session (never a client-supplied id) so an advisor can only
// write the IPS of the client they currently have open. RLS is the backstop.

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/data/session";
import {
  getClientIPS,
  createClientIPS,
  saveIPSSection,
  saveAdvisorSession,
  updateClientIPS,
  generateIPSSummary,
  setIPSStatus,
  approveIPSForInternalUse,
} from "@/lib/data/ips";
import type {
  IPSProfile,
  IPSStatus,
  IPSSectionKey,
  AdvisorSessionData,
  IPSSummaryData,
} from "@/lib/ips/ipsTypes";

async function activeClientId(): Promise<{ cid: string; advisorId: string }> {
  const ctx = await getSessionContext();
  if (ctx.role !== "advisor" && ctx.role !== "admin") {
    throw new Error("Only advisors may edit a client IPS.");
  }
  if (!ctx.clientId) throw new Error("No client selected.");
  return { cid: ctx.clientId, advisorId: ctx.userId ?? "" };
}

/** Start (or resume) an advisor-led strategy session, optionally in meeting mode. */
export async function startStrategySessionAction(meetingMode: boolean): Promise<IPSProfile> {
  const { cid, advisorId } = await activeClientId();
  const ctx = await getSessionContext();
  let profile = await getClientIPS(cid);
  if (!profile) profile = await createClientIPS(cid, advisorId);

  const session: AdvisorSessionData = {
    ...profile.advisorSession,
    meetingModeActive: meetingMode,
    advisorId: advisorId || profile.advisorSession.advisorId,
    advisorName: ctx.displayName ?? ctx.email ?? profile.advisorSession.advisorName,
    sessionDate: profile.advisorSession.sessionDate ?? new Date().toISOString(),
  };
  const updated = await saveAdvisorSession(cid, session);
  revalidatePath("/ips");
  return updated;
}

/** Create a draft IPS record without entering meeting mode. */
export async function createDraftIPSAction(): Promise<IPSProfile> {
  const { cid, advisorId } = await activeClientId();
  const existing = await getClientIPS(cid);
  const profile = existing ?? (await createClientIPS(cid, advisorId));
  revalidatePath("/ips");
  return profile;
}

export async function saveSectionAction(
  sectionKey: IPSSectionKey,
  sectionData: unknown,
): Promise<IPSProfile> {
  const { cid } = await activeClientId();
  const updated = await saveIPSSection(cid, sectionKey, sectionData);
  revalidatePath("/ips");
  return updated;
}

export async function saveAdvisorSessionAction(
  sessionData: AdvisorSessionData,
): Promise<IPSProfile> {
  const { cid } = await activeClientId();
  const updated = await saveAdvisorSession(cid, sessionData);
  revalidatePath("/ips");
  return updated;
}

export async function saveSummaryAction(summary: IPSSummaryData): Promise<IPSProfile> {
  const { cid } = await activeClientId();
  const updated = await updateClientIPS(cid, { summary });
  revalidatePath("/ips");
  return updated;
}

export async function generateSummaryAction(): Promise<IPSProfile> {
  const { cid } = await activeClientId();
  const updated = await generateIPSSummary(cid);
  revalidatePath("/ips");
  return updated;
}

export async function setStatusAction(status: IPSStatus): Promise<IPSProfile> {
  const { cid } = await activeClientId();
  const updated = await setIPSStatus(cid, status);
  revalidatePath("/ips");
  return updated;
}

export async function approveForInternalUseAction(): Promise<IPSProfile> {
  const { cid, advisorId } = await activeClientId();
  const updated = await approveIPSForInternalUse(cid, advisorId);
  revalidatePath("/ips");
  return updated;
}
