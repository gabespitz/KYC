import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

// The storage key may contain slashes; the dynamic segment is base64-encoded
// from the client to avoid Next.js routing collisions.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  let decoded: string;
  try {
    decoded = Buffer.from(key, "base64url").toString("utf8");
  } catch {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  try {
    const file = await getStorage().get(decoded);
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: { "Content-Type": file.mimeType },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
