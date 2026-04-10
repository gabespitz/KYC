import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { getCoderfullClient } from "@/lib/coderfull";
import { getCurrentUser } from "@/lib/session";
import {
  CoderfullClientInputSchema,
  HandoffEmailSchema,
} from "@/lib/claude/schemas";

export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Allow the client to override the draft (after manual edits)
  let body: { coderfullPayload?: unknown; accountsEmail?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const draft = await db.coderfullExport.findFirst({
    where: { prospectId: id, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });
  if (!draft && (!body.coderfullPayload || !body.accountsEmail)) {
    return NextResponse.json(
      { error: "No draft to send. Generate one first." },
      { status: 400 }
    );
  }

  const payloadInput =
    body.coderfullPayload ?? JSON.parse(draft!.payload);
  const emailInput = body.accountsEmail ?? JSON.parse(draft!.draftEmail);

  const payloadParsed = CoderfullClientInputSchema.safeParse(payloadInput);
  const emailParsed = HandoffEmailSchema.safeParse(emailInput);
  if (!payloadParsed.success || !emailParsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload or email",
        payloadIssues: payloadParsed.success ? [] : payloadParsed.error.issues,
        emailIssues: emailParsed.success ? [] : emailParsed.error.issues,
      },
      { status: 400 }
    );
  }

  try {
    const coderfull = getCoderfullClient();
    const { externalId } = await coderfull.createClient(payloadParsed.data);

    // Upload all signed documents to Coderfull
    const documents = await db.legalDocument.findMany({
      where: { prospectId: id },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });
    const storage = getStorage();
    for (const d of documents) {
      const v = d.versions[0];
      if (!v) continue;
      try {
        const file = await storage.get(v.storageKey);
        await coderfull.uploadDocument(externalId, {
          name: `${d.kind}-${v.fileName}`,
          buffer: file.buffer,
          mimeType: file.mimeType,
        });
      } catch (e) {
        console.error("upload to coderfull failed", e);
      }
    }

    await coderfull.notifyAccounts(emailParsed.data);

    const exp = await db.coderfullExport.update({
      where: { id: draft!.id },
      data: {
        status: "SENT",
        externalId,
        payload: JSON.stringify(payloadParsed.data),
        draftEmail: JSON.stringify(emailParsed.data),
      },
    });

    await db.prospect.update({
      where: { id },
      data: { status: "HANDED_OFF" },
    });

    await db.negotiationEvent.create({
      data: {
        prospectId: id,
        type: "STATUS_CHANGE",
        payload: JSON.stringify({
          to: "HANDED_OFF",
          coderfullExternalId: externalId,
        }),
        actor: user.name,
      },
    });

    return NextResponse.json({ export: exp });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (draft) {
      await db.coderfullExport.update({
        where: { id: draft.id },
        data: { status: "FAILED", error: message },
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
