"use server";

import { revalidatePath } from "next/cache";
import { createDocument } from "@/lib/data/documents";

export interface DocumentActionResult {
  ok: boolean;
  error?: string;
}

export async function createDocumentAction(formData: FormData): Promise<DocumentActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Please enter a document name." };

  try {
    await createDocument({
      name,
      category: String(formData.get("category") ?? ""),
      status: String(formData.get("status") ?? "Draft for Advisor Review"),
      owner: String(formData.get("owner") ?? ""),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create the document." };
  }

  revalidatePath("/documents");
  return { ok: true };
}
