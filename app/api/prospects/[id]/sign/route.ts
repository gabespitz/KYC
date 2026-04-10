import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const prospect = await db.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.prospect.update({
    where: { id },
    data: { status: "SIGNED" },
  });
  await db.negotiationEvent.create({
    data: {
      prospectId: id,
      type: "SIGNED",
      payload: JSON.stringify({ at: new Date().toISOString() }),
      actor: user.name,
    },
  });
  return NextResponse.json({ ok: true });
}
