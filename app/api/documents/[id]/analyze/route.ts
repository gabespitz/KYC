import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MODELS, runToolLoop } from "@/lib/claude/client";
import {
  REDLINE_SYSTEM_PROMPT,
  SUBMIT_REDLINES_TOOL,
  buildRedlineUserMessage,
} from "@/lib/claude/prompts/redline";
import { RedlineBatchSchema } from "@/lib/claude/schemas";

export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await db.legalDocument.findUnique({
    where: { id },
    include: {
      prospect: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });
  if (!document || document.versions.length === 0) {
    return NextResponse.json(
      { error: "Document not found or has no versions" },
      { status: 404 }
    );
  }
  const version = document.versions[0];
  if (!version.extractedText || version.extractedText.length < 50) {
    return NextResponse.json(
      {
        error:
          "No extracted text on this version. Re-upload as a text-based PDF/DOCX, or paste text manually.",
      },
      { status: 400 }
    );
  }

  // Cap the document text to a safe length to avoid extreme contexts.
  const text = version.extractedText.slice(0, 200_000);

  try {
    const result = await runToolLoop({
      model: MODELS.redline,
      system: REDLINE_SYSTEM_PROMPT,
      userMessage: buildRedlineUserMessage({
        documentKind: document.kind,
        documentTitle: document.title,
        prospectName: document.prospect.legalName,
        text,
      }),
      tools: [SUBMIT_REDLINES_TOOL],
      terminalTool: "submit_redlines",
      maxIterations: 4,
      toolHandlers: {},
    });

    if (!result.terminalToolInput) {
      return NextResponse.json(
        {
          error:
            "Claude did not return any redlines. Final text: " +
            result.finalText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const parsed = RedlineBatchSchema.safeParse(result.terminalToolInput);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Redline payload failed validation: " +
            parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
        },
        { status: 502 }
      );
    }

    // Replace any prior CLAUDE redlines on this version (to avoid duplicates on re-run)
    await db.redlineComment.deleteMany({
      where: { versionId: version.id, createdBy: "CLAUDE" },
    });

    const created = await db.$transaction(
      parsed.data.redlines.map((r) =>
        db.redlineComment.create({
          data: {
            documentId: id,
            versionId: version.id,
            clauseId: r.clauseId,
            originalText: r.originalText,
            suggestedText: r.suggestedText,
            riskLevel: r.riskLevel,
            category: r.category,
            rationale: r.rationale,
            createdBy: "CLAUDE",
          },
        })
      )
    );

    return NextResponse.json({
      redlines: created,
      modelUsed: result.modelUsed,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
