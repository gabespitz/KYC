import { Search, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/utils";
import type { ResearchReport, Source } from "@/lib/claude/schemas";
import { decisionBadge, riskBadge } from "@/lib/badges";
import { RunResearchButton } from "./run-research-button";

export const dynamic = "force-dynamic";

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await db.researchReport.findFirst({
    where: { prospectId: id },
    orderBy: { createdAt: "desc" },
  });

  const data = report
    ? safeJsonParse<ResearchReport | null>(report.payload, null)
    : null;
  const sources = report ? safeJsonParse<Source[]>(report.sources, []) : [];

  return (
    <div className="stack-6">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            Phase 1 — Research & evaluation
          </h2>
          <p className="sec-sub" style={{ marginTop: 4 }}>
            Run a Claude-powered KYC investigation. Produces a structured report with a GO / NO-GO / HOLD recommendation.
          </p>
        </div>
        <RunResearchButton id={id} hasReport={!!report} />
      </div>

      {!data ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={28} />
            </div>
            <h3>No research report yet</h3>
            <p>Click <strong>Run research</strong> above to start the Claude-powered investigation.</p>
          </div>
        </div>
      ) : (
        <div className="stack-4">
          {/* Prominent recommendation card */}
          <RecommendationCard data={data} />

          <Section title="Company">
            <div className="stack-2">
              <Field label="Legal name" value={data.company.legalName} />
              {data.company.aliases && data.company.aliases.length > 0 && (
                <Field label="Aliases" value={data.company.aliases.join(", ")} />
              )}
              <Field label="HQ" value={data.company.hq ?? "—"} />
              <Field label="Founded" value={data.company.founded ?? "—"} />
              <Field label="Employees" value={data.company.employees ?? "—"} />
              <Field label="Industry" value={data.company.industry ?? "—"} />
            </div>
            <p style={{ fontSize: 14, marginTop: 16, marginBottom: 0, lineHeight: 1.6 }}>
              {data.businessProfile}
            </p>
          </Section>

          <Section title="Creditworthiness">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Score:</span>
              <span className={scoreBadgeClass(data.creditworthiness.score)}>
                <span className="badge-dot"></span>
                {data.creditworthiness.score}
              </span>
            </div>
            {data.creditworthiness.signals.length > 0 && (
              <ul style={{ fontSize: 14, paddingLeft: 20, marginTop: 8, marginBottom: 0 }}>
                {data.creditworthiness.signals.map((s, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{s}</li>
                ))}
              </ul>
            )}
            {data.creditworthiness.notes && (
              <p className="muted" style={{ fontSize: 13, marginTop: 12, marginBottom: 0 }}>
                {data.creditworthiness.notes}
              </p>
            )}
          </Section>

          <Section title="Vendor history">
            {data.vendorHistory.length === 0 ? (
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                No vendor history found.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="stack-3">
                {data.vendorHistory.map((v, i) => (
                  <li key={i} style={{ fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>{v.vendor}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{v.relationship}</div>
                    {v.notes && (
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{v.notes}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Trust & reputation">
            {data.trust.reputationNotes && (
              <p style={{ fontSize: 14, marginBottom: 12 }}>{data.trust.reputationNotes}</p>
            )}
            {data.trust.litigationFlags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div className="overline" style={{ marginBottom: 6 }}>Litigation flags</div>
                <ul style={{ fontSize: 14, paddingLeft: 20, margin: 0 }}>
                  {data.trust.litigationFlags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.trust.sanctionsFlags.length > 0 && (
              <div>
                <div className="overline" style={{ marginBottom: 6 }}>Sanctions / PEP flags</div>
                <ul style={{ fontSize: 14, paddingLeft: 20, margin: 0 }}>
                  {data.trust.sanctionsFlags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {!data.trust.reputationNotes &&
              data.trust.litigationFlags.length === 0 &&
              data.trust.sanctionsFlags.length === 0 && (
                <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                  No reputation concerns flagged.
                </p>
              )}
          </Section>

          <Section title="Risks">
            {data.risks.length === 0 ? (
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>No risks recorded.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="stack-3">
                {data.risks.map((r, i) => {
                  const rb = riskBadge(r.severity);
                  return (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        borderLeft: `3px solid ${riskBorderColor(r.severity)}`,
                        paddingLeft: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className={rb.className}>
                          <span className="badge-dot"></span>
                          {rb.label}
                        </span>
                      </div>
                      <div>{r.description}</div>
                      {r.evidence && (
                        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                          {r.evidence}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title={`Sources (${sources.length})`}>
            {sources.length === 0 ? (
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                No sources cited.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="stack-3">
                {sources.map((s, i) => (
                  <li key={i} style={{ fontSize: 14 }}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 500,
                      }}
                    >
                      {s.title}
                      <ExternalLink size={12} />
                    </a>
                    {s.snippet && (
                      <p className="muted" style={{ fontSize: 13, marginTop: 2, marginBottom: 0 }}>
                        {s.snippet}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ data }: { data: ResearchReport }) {
  const rec = decisionBadge(data.recommendation);
  const bgColor =
    data.recommendation === "GO"
      ? "var(--success-50)"
      : data.recommendation === "NO_GO"
      ? "var(--error-50)"
      : "var(--warning-50)";
  return (
    <div
      className="card"
      style={{ background: bgColor, borderWidth: 1 }}
    >
      <div className="overline" style={{ marginBottom: 12 }}>
        Recommendation
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <span className={`${rec.className} badge-lg`} style={{ fontSize: 16, padding: "8px 16px" }}>
          <span className="badge-dot"></span>
          {rec.label}
        </span>
        <div className="num" style={{ fontSize: 13, color: "var(--muted)" }}>
          Research run · Claude
        </div>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
        {data.summary}
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
        <strong>Rationale: </strong>
        {data.rationale}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="overline" style={{ marginBottom: 12 }}>
        {title}
      </div>
      {children}
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

function scoreBadgeClass(score: string): string {
  switch (score) {
    case "strong": return "badge badge-success";
    case "adequate": return "badge badge-brand";
    case "weak": return "badge badge-error";
    default: return "badge badge-gray";
  }
}

function riskBorderColor(severity: string): string {
  switch (severity) {
    case "CRITICAL": return "var(--error-500)";
    case "HIGH": return "#F97316";
    case "MEDIUM": return "var(--warning-500)";
    default: return "var(--success-500)";
  }
}
