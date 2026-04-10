import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";
import { statusBadge, decisionBadge } from "@/lib/badges";

export const dynamic = "force-dynamic";

export default async function ProspectsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const prospects = await db.prospect.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
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
        }}
      >
        <div>
          <h1 className="sec-title">Prospects</h1>
          {status ? (
            <p className="sec-sub">
              Filtered by status:{" "}
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                {status.replace("_", " ")}
              </span>{" "}
              ·{" "}
              <Link href="/prospects" style={{ textDecoration: "underline" }}>
                clear
              </Link>
            </p>
          ) : (
            <p className="sec-sub">
              All prospects across every lifecycle stage.
            </p>
          )}
        </div>
        <Link href="/prospects/new" className="btn btn-primary">
          <Plus size={16} />
          New prospect
        </Link>
      </div>

      {prospects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={28} />
            </div>
            <h3>No prospects found</h3>
            <p>
              {status
                ? "Try clearing the filter or create a new prospect."
                : "Create your first prospect to start the KYC process."}
            </p>
            <Link href="/prospects/new" className="btn btn-primary">
              <Plus size={16} />
              New prospect
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Legal name</th>
                <th>Industry</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Decision</th>
                <th style={{ textAlign: "right" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => {
                const s = statusBadge(p.status);
                const d = decisionBadge(p.decision);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link
                        href={`/prospects/${p.id}`}
                        style={{ color: "var(--text)" }}
                      >
                        {p.legalName}
                      </Link>
                    </td>
                    <td className="muted">{p.industry ?? "—"}</td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {p.contactName ?? "—"}
                    </td>
                    <td>
                      <span className={s.className}>
                        <span className="badge-dot"></span>
                        {s.label}
                      </span>
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
