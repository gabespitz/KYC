import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getStorage } from "@/lib/storage";
import { parseDocument } from "@/lib/docs/parse";

export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const document = await db.legalDocument.findUnique({
    where: { id },
    include: { versions: true },
  });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const sourceRaw = (formData.get("source") as string | null) ?? "CLIENT";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorage();
  const storageKey = `${document.prospectId}/${nanoid(12)}-${file.name}`;
  await storage.put(storageKey, buffer, file.type || "application/octet-stream");

  let extractedText: string | null = null;
  try {
    const parsed = await parseDocument(buffer, file.type, file.name);
    extractedText = parsed.text || null;
  } catch (e) {
    console.error("parse error", e);
  }

  const nextNumber =
    Math.max(0, ...document.versions.map((v) => v.versionNumber)) + 1;

  const version = await db.documentVersion.create({
    data: {
      documentId: id,
      versionNumber: nextNumber,
      source: sourceRaw === "US" ? "US" : "CLIENT",
      storageKey,
      mimeType: file.type || "application/octet-stream",
      fileName: file.name,
      extractedText,
      uploadedById: user.id,
    },
  });

  await db.legalDocument.update({
    where: { id },
    data: { currentVersionId: version.id },
  });

  // Log a negotiation event for traceability
  await db.negotiationEvent.create({
    data: {
      prospectId: document.prospectId,
      type: sourceRaw === "US" ? "VERSION_SENT" : "VERSION_RECEIVED",
      payload: JSON.stringify({
        documentId: id,
        versionId: version.id,
        versionNumber: nextNumber,
        fileName: file.name,
      }),
      actor: user.name,
    },
  });

  return NextResponse.json({ version }, { status: 201 });
}
