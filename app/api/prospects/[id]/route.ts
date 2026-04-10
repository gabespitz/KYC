import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateProspectInput } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await db.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ prospect });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateProspectInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const prospect = await db.prospect.update({
    where: { id },
    data: {
      ...(data.legalName !== undefined && { legalName: data.legalName }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.industry !== undefined && { industry: data.industry || null }),
      ...(data.contactName !== undefined && { contactName: data.contactName || null }),
      ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail || null }),
      ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.decision !== undefined && { decision: data.decision }),
    },
  });
  return NextResponse.json({ prospect });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.prospect.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
