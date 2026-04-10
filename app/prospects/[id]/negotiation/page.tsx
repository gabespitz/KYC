import { db } from "@/lib/db";
import { safeJsonParse, formatRelative } from "@/lib/utils";
import { NegotiationControls } from "./negotiation-controls";

export const dynamic = "force-dynamic";

export default async function NegotiationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await db.prospect.findUnique({ where: { id } });
  const events = await db.negotiationEvent.findMany({
    where: { prospectId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Phase 3 — Negotiation</h2>
        <p className="text-sm text-muted-foreground">
          Track document versions and back-and-forth comments through the
          negotiation loop until signing.
        </p>
      </div>

      <NegotiationControls
        id={id}
        currentStatus={prospect?.status ?? "RESEARCH"}
      />

      <div>
        <h3 className="text-xs font-medium uppercase text-muted-foreground mb-3">
          Timeline
        </h3>
        {events.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No events yet. Upload new document versions or log a comment.
          </div>
        ) : (
          <ol className="border-l ml-3 space-y-4">
            {events.map((e) => {
              const payload = safeJsonParse<Record<string, unknown>>(
                e.payload,
                {}
              );
              return (
                <li key={e.id} className="ml-4 relative">
                  <span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-primary" />
                  <div className="text-sm font-medium">
                    {labelForType(e.type)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.actor} · {formatRelative(e.createdAt)}
                  </div>
                  {payloadSummary(payload) && (
                    <div className="text-xs mt-1 text-muted-foreground">
                      {payloadSummary(payload)}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

function labelForType(type: string) {
  switch (type) {
    case "VERSION_SENT":
      return "Version sent to client";
    case "VERSION_RECEIVED":
      return "Version received from client";
    case "COMMENT":
      return "Comment";
    case "STATUS_CHANGE":
      return "Status change";
    case "SIGNED":
      return "Document signed";
    default:
      return type;
  }
}

function payloadSummary(payload: Record<string, unknown>): string | null {
  if (typeof payload.note === "string") return payload.note;
  if (typeof payload.fileName === "string") return payload.fileName as string;
  return null;
}
