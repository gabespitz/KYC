import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const prospects = await db.prospect.findMany({
    where: q
      ? {
          OR: [
            { legalName: { contains: q } },
            { industry: { contains: q } },
            { contactName: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      legalName: true,
      industry: true,
      status: true,
    },
  });
  return NextResponse.json({ prospects });
}
