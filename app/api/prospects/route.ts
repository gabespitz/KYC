import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CreateProspectInput } from "@/lib/validators";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const prospects = await db.prospect.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ prospects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = await req.json();
  const parsed = CreateProspectInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const prospect = await db.prospect.create({
    data: {
      legalName: data.legalName,
      website: data.website || null,
      industry: data.industry || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      notes: data.notes || null,
      ownerId: user.id,
    },
  });
  return NextResponse.json({ prospect }, { status: 201 });
}
