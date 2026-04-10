import Link from "next/link";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";
import { DocumentUploader } from "./document-uploader";

export const dynamic = "force-dynamic";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documents = await db.legalDocument.findMany({
    where: { prospectId: id },
    include: {
      versions: { orderBy: { versionNumber: "asc" } },
      redlines: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="stack-6">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
          Phase 2 — Legal review
        </h2>
        <p className="sec-sub" style={{ marginTop: 4 }}>
          Upload the client&apos;s legal documents (MSA, SOW, NDA, DPA). Claude
          will propose protective redlines from In All Media&apos;s vendor-side perspective.
        </p>
      </div>

      <div className="card">
        <div className="overline" style={{ marginBottom: 12 }}>
          Upload a new document
        </div>
        <DocumentUploader prospectId={id} />
      </div>

      <div>
        <div className="section-label">Documents on file</div>
        {documents.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={28} />
              </div>
              <h3>No documents yet</h3>
              <p>Upload a contract to start the redline analysis.</p>
            </div>
          </div>
        ) : (
          <div className="stack-3">
            {documents.map((d) => {
              const open = d.redlines.filter((r) => r.status === "OPEN").length;
              const accepted = d.redlines.filter(
                (r) => r.status === "ACCEPTED"
              ).length;
              const rejected = d.redlines.filter(
                (r) => r.status === "REJECTED"
              ).length;
              return (
                <Link
                  key={d.id}
                  href={`/prospects/${id}/legal/${d.id}`}
                  className="card interactive"
                  style={{ display: "block" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span className="badge badge-gray">{d.kind}</span>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>
                          {d.title}
                        </span>
                      </div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {d.versions.length} version
                        {d.versions.length === 1 ? "" : "s"} ·{" "}
                        {d.redlines.length} redline
                        {d.redlines.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
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
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
