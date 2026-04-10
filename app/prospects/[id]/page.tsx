import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProspectStatusControls } from "./status-controls";
import { decisionBadge } from "@/lib/badges";

export const dynamic = "force-dynamic";

export default async function ProspectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await db.prospect.findUnique({
    where: { id },
    include: {
      research: { orderBy: { createdAt: "desc" }, take: 1 },
      documents: { include: { redlines: true } },
      events: { orderBy: { createdAt: "desc" }, take: 1 },
      exports: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!prospect) notFound();

  const latestResearch = prospect.research[0];
  const docCount = prospect.documents.length;
  const openRedlines = prospect.documents.reduce(
    (acc, d) => acc + d.redlines.filter((r) => r.status === "OPEN").length,
    0
  );
  const rec = decisionBadge(latestResearch?.recommendation ?? null);

  return (
    <div className="stack-6">
      <div className="action-grid">
        <div className="card">
          <div className="overline" style={{ marginBottom: 12 }}>
            Contact
          </div>
          <div className="stack-2">
            <Field label="Name" value={prospect.contactName ?? "—"} />
            <Field label="Email" value={prospect.contactEmail ?? "—"} />
            <Field label="Phone" value={prospect.contactPhone ?? "—"} />
          </div>
        </div>
        <div className="card">
          <div className="overline" style={{ marginBottom: 12 }}>
            Internal notes
          </div>
          <p style={{ fontSize: 14, whiteSpace: "pre-wrap", margin: 0 }}>
            {prospect.notes || (
              <span className="muted">No notes recorded.</span>
            )}
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="card">
          <div className="overline" style={{ marginBottom: 10 }}>
            Phase 1 — Research
          </div>
          {latestResearch ? (
            <>
              <div style={{ marginBottom: 10 }}>
                <span className={`${rec.className} badge-lg`}>
                  <span className="badge-dot"></span>
                  {rec.label}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                {latestResearch.summary}
              </p>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              No research report yet.
            </p>
          )}
        </div>
        <div className="card">
          <div className="overline" style={{ marginBottom: 10 }}>
            Phase 2 — Legal
          </div>
          <div className="num" style={{ fontSize: 28, fontWeight: 600, color: "var(--text)", lineHeight: 1 }}>
            {docCount}
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 0 }}>
            document{docCount === 1 ? "" : "s"} on file · {openRedlines} open redline{openRedlines === 1 ? "" : "s"}
          </p>
        </div>
        <div className="card">
          <div className="overline" style={{ marginBottom: 10 }}>
            Phase 4 — Handoff
          </div>
          {prospect.exports[0] ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {prospect.exports[0].status}
              </div>
              {prospect.exports[0].externalId && (
                <p className="muted num" style={{ fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                  {prospect.exports[0].externalId}
                </p>
              )}
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              Not yet handed off.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="overline" style={{ marginBottom: 12 }}>
          Pipeline controls
        </div>
        <ProspectStatusControls
          id={prospect.id}
          status={prospect.status}
          decision={prospect.decision}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: 14 }}>
      <span className="muted">{label}:</span>{" "}
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
