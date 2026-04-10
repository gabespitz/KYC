import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/utils";
import type { ResearchReport, Source } from "@/lib/claude/schemas";
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

  const data = report ? safeJsonParse<ResearchReport | null>(report.payload, null) : null;
  const sources = report ? safeJsonParse<Source[]>(report.sources, []) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Phase 1 — Research & Evaluation</h2>
          <p className="text-sm text-muted-foreground">
            Run a Claude-powered KYC investigation. Produces a structured report
            with a GO / NO_GO / HOLD recommendation.
          </p>
        </div>
        <RunResearchButton id={id} hasReport={!!report} />
      </div>

      {!data ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No research report yet. Click <strong>Run research</strong> above.
        </div>
      ) : (
        <div className="space-y-6">
          <Section title="Summary">
            <p className="text-sm">{data.summary}</p>
            <p className="text-sm mt-3">
              <span className="font-medium">Recommendation: </span>
              <span className={`badge badge-${data.recommendation.toLowerCase()}`}>
                {data.recommendation}
              </span>
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Rationale: </span>
              {data.rationale}
            </p>
          </Section>

          <Section title="Company">
            <Field label="Legal name" value={data.company.legalName} />
            {data.company.aliases.length > 0 && (
              <Field label="Aliases" value={data.company.aliases.join(", ")} />
            )}
            <Field label="HQ" value={data.company.hq ?? "—"} />
            <Field label="Founded" value={data.company.founded ?? "—"} />
            <Field label="Employees" value={data.company.employees ?? "—"} />
            <Field label="Industry" value={data.company.industry ?? "—"} />
            <p className="mt-3 text-sm">{data.businessProfile}</p>
          </Section>

          <Section title="Creditworthiness">
            <p className="text-sm">
              <span className="font-medium">Score:</span>{" "}
              {data.creditworthiness.score}
            </p>
            {data.creditworthiness.signals.length > 0 && (
              <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                {data.creditworthiness.signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            {data.creditworthiness.notes && (
              <p className="text-sm mt-2 text-muted-foreground">
                {data.creditworthiness.notes}
              </p>
            )}
          </Section>

          <Section title="Vendor history">
            {data.vendorHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No vendor history found.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.vendorHistory.map((v, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{v.vendor}</span> —{" "}
                    {v.relationship}
                    {v.notes && (
                      <div className="text-muted-foreground">{v.notes}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Trust & reputation">
            {data.trust.reputationNotes && (
              <p className="text-sm">{data.trust.reputationNotes}</p>
            )}
            {data.trust.litigationFlags.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  Litigation flags
                </div>
                <ul className="list-disc ml-5 text-sm">
                  {data.trust.litigationFlags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.trust.sanctionsFlags.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  Sanctions / PEP flags
                </div>
                <ul className="list-disc ml-5 text-sm">
                  {data.trust.sanctionsFlags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section title="Risks">
            {data.risks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No risks recorded.</p>
            ) : (
              <ul className="space-y-2">
                {data.risks.map((r, i) => (
                  <li
                    key={i}
                    className={`text-sm border-l-4 pl-3 ${riskBorder(r.severity)}`}
                  >
                    <span className="font-medium">[{r.severity}]</span>{" "}
                    {r.description}
                    {r.evidence && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.evidence}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Sources (${sources.length})`}>
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sources cited.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {s.title}
                    </a>
                    {s.snippet && (
                      <p className="text-xs text-muted-foreground mt-0.5">
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-xs font-medium uppercase text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}

function riskBorder(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "border-rose-500";
    case "HIGH":
      return "border-orange-500";
    case "MEDIUM":
      return "border-amber-500";
    default:
      return "border-emerald-500";
  }
}
