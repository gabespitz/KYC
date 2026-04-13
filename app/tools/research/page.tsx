import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";
import { decisionBadge } from "@/lib/badges";

export const dynamic = "force-dynamic";

type FilterKey = "pending" | "done" | "all";

export default async function ResearchQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: FilterKey }>;
}) {
  const { filter = "pending" } = await searchParams;

  const where =
    filter === "pending"
      ? { research: { none: {} } }
      : filter === "done"
      ? { research: { some: {} } }
      : undefined;

  const prospects = await db.prospect.findMany({
    where,
    include: {
      research: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          summary: true,
          recommendation: true,
          createdAt: true,
        },
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
          <h1 className="sec-title">Research</h1>
          <p className="sec-sub">
            Investigate a prospect&apos;s business, creditworthiness, vendor history, and reputation — then get a GO / HOLD / NO-GO recommendation.
          </p>
        </div>
        <Link href="/tools/research/new" className="btn btn-primary">
          <Plus size={16} />
          Run new research
        </Link>
      </div>

      <FilterTabs current={filter} />

      {prospects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={28} />
            </div>
            <h3>
              {filter === "pending"
                ? "No prospects waiting for research"
                : filter === "done"
                ? "No research reports yet"
                : "No prospects in the system"}
            </h3>
            <p>
              {filter === "pending"
                ? "Every prospect has at least one research report. Start a new one below."
                : "Run a KYC research on a prospect to see reports here."}
            </p>
            <Link href="/tools/research/new" className="btn btn-primary">
              <Plus size={16} />
              Run new research
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Industry</th>
                <th>Latest report</th>
                <th>Recommendation</th>
                <th style={{ textAlign: "right" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => {
                const latest = p.research[0];
                const d = decisionBadge(latest?.recommendation ?? null);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link
                        href={`/prospects/${p.id}/research`}
                        style={{ color: "var(--text)" }}
                      >
                        {p.legalName}
                      </Link>
                    </td>
                    <td className="muted">{p.industry ?? "—"}</td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {latest ? (
                        <span>
                          {formatRelative(latest.createdAt)}
                          {latest.summary && (
                            <span
                              className="muted"
                              style={{
                                display: "block",
                                fontSize: 12,
                                marginTop: 2,
                                maxWidth: 420,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {latest.summary}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>Never</span>
                      )}
                    </td>
                    <td>
                      <span className={d.className}>
                        <span className="badge-dot"></span>
                        {d.label}
                      </span>
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
    { key: "done", label: "Researched" },
    { key: "all", label: "All" },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="toggle-group">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/tools/research?filter=${t.key}`}
            className={`toggle-btn ${current === t.key ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
