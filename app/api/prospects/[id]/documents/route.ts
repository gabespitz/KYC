import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getStorage } from "@/lib/storage";
import { parseDocument } from "@/lib/docs/parse";
import { DocumentKindEnum } from "@/lib/validators";

export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const documents = await db.legalDocument.findMany({
    where: { prospectId: id },
    include: {
      versions: { orderBy: { versionNumber: "asc" } },
      redlines: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ documents });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const prospect = await db.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const title = (formData.get("title") as string | null) ?? "Untitled document";
  const kindRaw = (formData.get("kind") as string | null) ?? "OTHER";
  const sourceRaw = (formData.get("source") as string | null) ?? "CLIENT";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const kindParsed = DocumentKindEnum.safeParse(kindRaw);
  if (!kindParsed.success) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorage();
  const storageKey = `${id}/${nanoid(12)}-${file.name}`;
  await storage.put(storageKey, buffer, file.type || "application/octet-stream");

  let extractedText: string | null = null;
  try {
    const parsed = await parseDocument(buffer, file.type, file.name);
    extractedText = parsed.text || null;
  } catch (e) {
    console.error("parse error", e);
  }

  const document = await db.legalDocument.create({
    data: {
      prospectId: id,
      kind: kindParsed.data,
      title,
      versions: {
        create: {
          versionNumber: 1,
          source: sourceRaw === "US" ? "US" : "CLIENT",
          storageKey,
          mimeType: file.type || "application/octet-stream",
          fileName: file.name,
          extractedText,
          uploadedById: user.id,
        },
      },
    },
    include: { versions: true },
  });

  await db.legalDocument.update({
    where: { id: document.id },
    data: { currentVersionId: document.versions[0].id },
  });

  // Auto-advance to LEGAL if still in RESEARCH
  if (prospect.status === "RESEARCH") {
    await db.prospect.update({
      where: { id },
      data: { status: "LEGAL" },
    });
  }

  return NextResponse.json({ document }, { status: 201 });
}
