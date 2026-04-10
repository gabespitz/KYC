import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProspectStatusControls } from "./status-controls";

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

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Contact">
          <Field label="Name" value={prospect.contactName ?? "—"} />
          <Field label="Email" value={prospect.contactEmail ?? "—"} />
          <Field label="Phone" value={prospect.contactPhone ?? "—"} />
        </Card>
        <Card title="Notes">
          <p className="text-sm whitespace-pre-wrap">
            {prospect.notes || (
              <span className="text-muted-foreground">No notes</span>
            )}
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Research">
          {latestResearch ? (
            <>
              <p className="text-sm">{latestResearch.summary}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Recommendation:{" "}
                <span className="font-medium">
                  {latestResearch.recommendation}
                </span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No research report yet.
            </p>
          )}
        </Card>
        <Card title="Legal">
          <p className="text-sm">
            {docCount} document{docCount === 1 ? "" : "s"} on file
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {openRedlines} open redline{openRedlines === 1 ? "" : "s"}
          </p>
        </Card>
        <Card title="Handoff">
          {prospect.exports[0] ? (
            <>
              <p className="text-sm">
                Status:{" "}
                <span className="font-medium">{prospect.exports[0].status}</span>
              </p>
              {prospect.exports[0].externalId && (
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {prospect.exports[0].externalId}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Not yet handed off.</p>
          )}
        </Card>
      </div>

      <Card title="Pipeline controls">
        <ProspectStatusControls
          id={prospect.id}
          status={prospect.status}
          decision={prospect.decision}
        />
      </Card>
    </div>
  );
}

function Card({
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
