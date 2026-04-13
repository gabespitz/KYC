import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

type FilterKey = "open" | "resolved" | "all";

export default async function LegalQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: FilterKey }>;
}) {
  const { filter = "open" } = await searchParams;

  const docsWhere =
    filter === "open"
      ? { redlines: { some: { status: "OPEN" } } }
      : filter === "resolved"
      ? { redlines: { some: {} }, NOT: { redlines: { some: { status: "OPEN" } } } }
      : undefined;

  const documents = await db.legalDocument.findMany({
    where: docsWhere,
    include: {
      prospect: { select: { id: true, legalName: true, industry: true } },
      versions: { orderBy: { versionNumber: "asc" } },
      redlines: true,
    },
    orderBy: { createdAt: "desc" },
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
          <h1 className="sec-title">Legal redline</h1>
          <p className="sec-sub">
            Upload a client&apos;s legal document and let Claude (Opus) act as outside counsel, flagging risky clauses and proposing protective edits.
          </p>
        </div>
        <Link href="/tools/legal/new" className="btn btn-primary">
          <Plus size={16} />
          Upload new document
        </Link>
      </div>

      <FilterTabs current={filter} />

      {documents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={28} />
            </div>
            <h3>
              {filter === "open"
                ? "No open redlines"
                : filter === "resolved"
                ? "No resolved redlines yet"
                : "No documents yet"}
            </h3>
            <p>
              {filter === "open"
                ? "Every document has had its redlines resolved. Upload a new one to continue."
                : "Upload a contract to start redline analysis."}
            </p>
            <Link href="/tools/legal/new" className="btn btn-primary">
              <Plus size={16} />
              Upload new document
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Prospect</th>
                <th>Versions</th>
                <th>Redlines</th>
                <th style={{ textAlign: "right" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const open = d.redlines.filter((r) => r.status === "OPEN").length;
                const accepted = d.redlines.filter(
                  (r) => r.status === "ACCEPTED"
                ).length;
                const rejected = d.redlines.filter(
                  (r) => r.status === "REJECTED"
                ).length;
                return (
                  <tr key={d.id}>
                    <td>
                      <Link
                        href={`/prospects/${d.prospect.id}/legal/${d.id}`}
                        style={{ color: "var(--text)" }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="badge badge-gray" style={{ fontSize: 10 }}>
                            {d.kind}
                          </span>
                          <strong>{d.title}</strong>
                        </div>
                      </Link>
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      <Link
                        href={`/prospects/${d.prospect.id}`}
                        style={{ color: "var(--muted)" }}
                      >
                        {d.prospect.legalName}
                      </Link>
                    </td>
                    <td className="num" style={{ fontSize: 13 }}>
                      v{d.versions.length}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {open > 0 && (
                          <span className="badge badge-warning">
                            <span className="badge-dot"></span>
                            {open} open
                          </span>
                        )}
                        {accepted > 0 && (
                          <span className="badge badge-success">
                            <span className="badge-dot"></span>
                            {accepted} accepted
                          </span>
                        )}
                        {rejected > 0 && (
                          <span className="badge badge-gray">
                            <span className="badge-dot"></span>
                            {rejected} rejected
                          </span>
                        )}
                        {d.redlines.length === 0 && (
                          <span className="muted" style={{ fontSize: 12 }}>
                            Not analysed
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="muted"
                      style={{ textAlign: "right", fontSize: 13 }}
                    >
                      {formatRelative(d.createdAt)}
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
    { key: "open", label: "Open redlines" },
    { key: "resolved", label: "Resolved" },
    { key: "all", label: "All documents" },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="toggle-group">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/tools/legal?filter=${t.key}`}
            className={`toggle-btn ${current === t.key ? "active" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
