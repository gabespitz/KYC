import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative, safeJsonParse } from "@/lib/utils";
import { statusBadge } from "@/lib/badges";

export const dynamic = "force-dynamic";

type FilterKey = "active" | "ready" | "signed" | "all";

export default async function NegotiationQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: FilterKey }>;
}) {
  const { filter = "active" } = await searchParams;

  const statusFilter: string[] =
    filter === "active"
      ? ["LEGAL", "NEGOTIATION"]
      : filter === "ready"
      ? ["LEGAL"]
      : filter === "signed"
      ? ["SIGNED", "HANDED_OFF"]
      : [];

  const prospects = await db.prospect.findMany({
    where: statusFilter.length > 0 ? { status: { in: statusFilter } } : undefined,
    include: {
      events: { orderBy: { createdAt: "desc" }, take: 1 },
      documents: {
        include: { redlines: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div
        className="sec-head"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="sec-title">Negotiation</h1>
          <p className="sec-sub">
            Track document versions and back-and-forth events as we iterate with the client toward signing.
          </p>
        </div>
      </div>

      <FilterTabs current={filter} />

      {prospects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <MessageSquare size={28} />
            </div>
            <h3>No prospects in this state</h3>
            <p>
              {filter === "active"
                ? "No prospects are currently in legal review or negotiation."
                : "Nothing here yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Status</th>
                <th>Docs</th>
                <th>Last event</th>
                <th style={{ textAlign: "right" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => {
                const s = statusBadge(p.status);
                const latest = p.events[0];
                const latestPayload = latest
                  ? safeJsonParse<Record<string, unknown>>(latest.payload, {})
                  : {};
                const openRedlines = p.documents.reduce(
                  (acc, d) =>
                    acc + d.redlines.filter((r) => r.status === "OPEN").length,
                  0
                );
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link
                        href={`/prospects/${p.id}/negotiation`}
                        style={{ color: "var(--text)" }}
                      >
                        {p.legalName}
                      </Link>
                    </td>
                    <td>
                      <span className={s.className}>
                        <span className="badge-dot"></span>
                        {s.label}
                      </span>
                    </td>
                    <td className="num" style={{ fontSize: 13 }}>
                      {p.documents.length}
                      {openRedlines > 0 && (
                        <span
                          className="muted"
                          style={{ fontSize: 12, marginLeft: 6 }}
                        >
                          · {openRedlines} open
                        </span>
                      )}
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {latest ? (
                        <>
                          <div style={{ color: "var(--text)", fontWeight: 500 }}>
                            {labelForEvent(latest.type)}
                          </div>
                          {eventSummary(latestPayload) && (
                            <div
                              className="muted"
                              style={{ fontSize: 12, marginTop: 2 }}
                            >
                              {eventSummary(latestPayload)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span>No events</span>
                      )}
                    </td>
                    <td
                      className="muted"
                      style={{ textAlign: "right", fontSize: 13 }}
                    >
                      {formatRelative(p.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterTabs({ current }: { current: FilterKey }) {
  const tabs: Array<{ key: FilterKey; label: string }> = [
    { key: "active", label: "In progress" },
    { key: "ready", label: "Ready to send" },
    { key: "signed", label: "Signed" },
    { key: "all", label: "All" },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="toggle-group">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/tools/negotiation?filter=${t.key}`}
            className={`toggle-btn ${current === t.key ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function labelForEvent(type: string) {
  switch (type) {
    case "VERSION_SENT": return "Version sent";
    case "VERSION_RECEIVED": return "Version received";
    case "COMMENT": return "Comment";
    case "STATUS_CHANGE": return "Status change";
    case "SIGNED": return "Signed";
    default: return type;
  }
}

function eventSummary(payload: Record<string, unknown>): string | null {
  if (typeof payload.note === "string" && payload.note.length > 0)
    return payload.note;
  if (typeof payload.fileName === "string") return payload.fileName as string;
  return null;
}
