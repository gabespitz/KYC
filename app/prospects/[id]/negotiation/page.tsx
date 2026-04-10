import { MessageSquare } from "lucide-react";
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
    <div className="stack-6">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
          Phase 3 — Negotiation
        </h2>
        <p className="sec-sub" style={{ marginTop: 4 }}>
          Track document versions and back-and-forth through the negotiation loop until signing.
        </p>
      </div>

      <NegotiationControls
        id={id}
        currentStatus={prospect?.status ?? "RESEARCH"}
      />

      <div>
        <div className="section-label">Timeline</div>
        {events.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">
                <MessageSquare size={28} />
              </div>
              <h3>No events yet</h3>
              <p>Upload new document versions or log comments to start the negotiation log.</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <ol className="timeline">
              {events.map((e) => {
                const payload = safeJsonParse<Record<string, unknown>>(
                  e.payload,
                  {}
                );
                return (
                  <li key={e.id} className="timeline-item">
                    <span className={`timeline-dot ${dotClass(e.type)}`} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {labelForType(e.type)}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {e.actor} · {formatRelative(e.createdAt)}
                    </div>
                    {payloadSummary(payload) && (
                      <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                        {payloadSummary(payload)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function labelForType(type: string) {
  switch (type) {
    case "VERSION_SENT": return "Version sent to client";
    case "VERSION_RECEIVED": return "Version received from client";
    case "COMMENT": return "Comment";
    case "STATUS_CHANGE": return "Status change";
    case "SIGNED": return "Document signed";
    default: return type;
  }
}

function dotClass(type: string) {
  switch (type) {
    case "SIGNED": return "success";
    case "VERSION_SENT":
    case "VERSION_RECEIVED": return "";
    case "STATUS_CHANGE": return "warning";
    default: return "gray";
  }
}

function payloadSummary(payload: Record<string, unknown>): string | null {
  if (typeof payload.note === "string" && payload.note.length > 0)
    return payload.note;
  if (typeof payload.fileName === "string") return payload.fileName as string;
  return null;
}
