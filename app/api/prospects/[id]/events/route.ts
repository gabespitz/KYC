import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CreateEventInput } from "@/lib/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const events = await db.negotiationEvent.findMany({
    where: { prospectId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ events });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = CreateEventInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const payload = parsed.data.note
    ? { ...parsed.data.payload, note: parsed.data.note }
    : parsed.data.payload;

  const event = await db.negotiationEvent.create({
    data: {
      prospectId: id,
      type: parsed.data.type,
      payload: JSON.stringify(payload),
      actor: user.name,
    },
  });

  // Auto-advance status when entering NEGOTIATION via VERSION_SENT/RECEIVED
  if (
    parsed.data.type === "VERSION_SENT" ||
    parsed.data.type === "VERSION_RECEIVED"
  ) {
    const prospect = await db.prospect.findUnique({ where: { id } });
    if (prospect && prospect.status === "LEGAL") {
      await db.prospect.update({
        where: { id },
        data: { status: "NEGOTIATION" },
      });
    }
  }

  return NextResponse.json({ event }, { status: 201 });
}
