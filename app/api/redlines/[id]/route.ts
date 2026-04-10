import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateRedlineInput } from "@/lib/validators";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateRedlineInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const redline = await db.redlineComment.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ redline });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.redlineComment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
