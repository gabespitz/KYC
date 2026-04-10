import Link from "next/link";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Phase 2 — Legal review</h2>
        <p className="text-sm text-muted-foreground">
          Upload the client&apos;s legal documents (MSA, SOW, NDA, DPA). Claude
          will analyze them and propose protective redlines from In All
          Media&apos;s vendor-side perspective.
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase text-muted-foreground mb-3">
          Upload a new document
        </h3>
        <DocumentUploader prospectId={id} />
      </div>

      <div>
        <h3 className="text-xs font-medium uppercase text-muted-foreground mb-3">
          Documents on file
        </h3>
        {documents.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No documents yet.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((d) => {
              const open = d.redlines.filter((r) => r.status === "OPEN").length;
              const accepted = d.redlines.filter(
                (r) => r.status === "ACCEPTED"
              ).length;
              return (
                <Link
                  key={d.id}
                  href={`/prospects/${id}/legal/${d.id}`}
                  className="block border rounded-lg p-4 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded mr-2">
                          {d.kind}
                        </span>
                        {d.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {d.versions.length} version
                        {d.versions.length === 1 ? "" : "s"} ·{" "}
                        {d.redlines.length} redline
                        {d.redlines.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      {open > 0 && (
                        <div className="text-amber-700 font-medium">
                          {open} open
                        </div>
                      )}
                      {accepted > 0 && (
                        <div className="text-emerald-700">
                          {accepted} accepted
                        </div>
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
