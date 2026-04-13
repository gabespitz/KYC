import Link from "next/link";
import { Package } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

type FilterKey = "pending" | "drafted" | "sent" | "all";

export default async function HandoffQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: FilterKey }>;
}) {
  const { filter = "pending" } = await searchParams;

  const where =
    filter === "pending"
      ? { status: "SIGNED", exports: { none: {} } }
      : filter === "drafted"
      ? {
          status: { in: ["SIGNED", "HANDED_OFF"] },
          exports: { some: { status: "DRAFT" } },
        }
      : filter === "sent"
      ? { exports: { some: { status: "SENT" } } }
      : undefined;

  const prospects = await db.prospect.findMany({
    where,
    include: {
      exports: { orderBy: { createdAt: "desc" }, take: 1 },
      research: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { recommendation: true },
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
          <h1 className="sec-title">Handoff</h1>
          <p className="sec-sub">
            Once a client has signed, draft the Coderfull payload and Accounts email, then push them into Coderfull.
          </p>
        </div>
      </div>

      <FilterTabs current={filter} />

      {prospects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={28} />
            </div>
            <h3>Nothing here yet</h3>
            <p>
              {filter === "pending"
                ? "No signed prospects awaiting handoff. Signed prospects will appear here automatically."
                : filter === "drafted"
                ? "No draft handoffs yet."
                : "Nothing in this state."}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Industry</th>
                <th>Handoff status</th>
                <th>Coderfull ID</th>
                <th style={{ textAlign: "right" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => {
                const exp = p.exports[0];
                const exportStatus = exp?.status ?? "Not drafted";
                const badgeClass =
                  exp?.status === "SENT"
                    ? "badge badge-success"
                    : exp?.status === "FAILED"
                    ? "badge badge-error"
                    : exp?.status === "DRAFT"
                    ? "badge badge-warning"
                    : "badge badge-gray";
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link
                        href={`/prospects/${p.id}/handoff`}
                        style={{ color: "var(--text)" }}
                      >
                        {p.legalName}
                      </Link>
                    </td>
                    <td className="muted">{p.industry ?? "—"}</td>
                    <td>
                      <span className={badgeClass}>
                        <span className="badge-dot"></span>
                        {exportStatus}
                      </span>
                    </td>
                    <td
                      className="muted num"
                      style={{ fontSize: 12 }}
                    >
                      {exp?.externalId ?? "—"}
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
    { key: "pending", label: "Pending" },
    { key: "drafted", label: "Drafted" },
    { key: "sent", label: "Sent" },
    { key: "all", label: "All" },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="toggle-group">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/tools/handoff?filter=${t.key}`}
            className={`toggle-btn ${current === t.key ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
