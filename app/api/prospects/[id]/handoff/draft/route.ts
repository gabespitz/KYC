import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MODELS, runToolLoop } from "@/lib/claude/client";
import {
  HANDOFF_SYSTEM_PROMPT,
  DRAFT_HANDOFF_TOOL,
  buildHandoffUserMessage,
} from "@/lib/claude/prompts/handoff";
import { HandoffDraftSchema } from "@/lib/claude/schemas";

export const maxDuration = 120;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await db.prospect.findUnique({
    where: { id },
    include: {
      research: { orderBy: { createdAt: "desc" }, take: 1 },
      documents: { include: { versions: true } },
    },
  });
  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const research = prospect.research[0];
  const signedDocs = prospect.documents.map((d) => ({
    kind: d.kind,
    title: d.title,
    signedAt: d.versions[d.versions.length - 1]?.createdAt.toISOString(),
  }));

  try {
    const result = await runToolLoop({
      model: MODELS.handoff,
      system: HANDOFF_SYSTEM_PROMPT,
      userMessage: buildHandoffUserMessage({
        prospect: {
          legalName: prospect.legalName,
          industry: prospect.industry,
          website: prospect.website,
          contactName: prospect.contactName,
          contactEmail: prospect.contactEmail,
          contactPhone: prospect.contactPhone,
          notes: prospect.notes,
        },
        researchSummary: research?.summary ?? null,
        riskRecommendation: research?.recommendation ?? null,
        signedDocuments: signedDocs,
      }),
      tools: [DRAFT_HANDOFF_TOOL],
      terminalTool: "draft_handoff",
      maxIterations: 4,
      toolHandlers: {},
    });

    if (!result.terminalToolInput) {
      return NextResponse.json(
        { error: "Claude did not produce a draft." },
        { status: 502 }
      );
    }
    const parsed = HandoffDraftSchema.safeParse(result.terminalToolInput);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Handoff draft failed validation: " +
            parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
        },
        { status: 502 }
      );
    }

    // Replace any prior DRAFT for this prospect
    await db.coderfullExport.deleteMany({
      where: { prospectId: id, status: "DRAFT" },
    });

    const exp = await db.coderfullExport.create({
      data: {
        prospectId: id,
        payload: JSON.stringify(parsed.data.coderfullPayload),
        draftEmail: JSON.stringify(parsed.data.accountsEmail),
        status: "DRAFT",
      },
    });

    return NextResponse.json({ export: exp });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
