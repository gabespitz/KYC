import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getResearchSource } from "@/lib/research";

export const maxDuration = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await db.researchReport.findFirst({
    where: { prospectId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ report });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const prospect = await db.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  try {
    const source = getResearchSource();
    const result = await source.run({
      legalName: prospect.legalName,
      website: prospect.website,
      industry: prospect.industry,
      contactName: prospect.contactName,
      contactEmail: prospect.contactEmail,
      notes: prospect.notes,
    });

    const report = await db.researchReport.create({
      data: {
        prospectId: id,
        summary: result.report.summary,
        recommendation: result.report.recommendation,
        payload: JSON.stringify(result.report),
        sources: JSON.stringify(result.report.sources),
        modelUsed: result.modelUsed,
        createdById: user.id,
      },
    });

    // Auto-set the prospect's decision from the recommendation if not already set.
    if (!prospect.decision) {
      await db.prospect.update({
        where: { id },
        data: { decision: result.report.recommendation },
      });
    }

    return NextResponse.json({ report });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
