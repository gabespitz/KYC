import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { LegalDocumentView } from "./legal-document-view";

export const dynamic = "force-dynamic";

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = await params;
  const document = await db.legalDocument.findUnique({
    where: { id: docId },
    include: {
      versions: { orderBy: { versionNumber: "asc" } },
      redlines: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!document || document.prospectId !== id) notFound();

  const currentVersion =
    document.versions.find((v) => v.id === document.currentVersionId) ??
    document.versions[document.versions.length - 1];

  const redlines = document.redlines.filter(
    (r) => r.versionId === currentVersion.id
  );

  return (
    <LegalDocumentView
      prospectId={id}
      document={{
        id: document.id,
        kind: document.kind,
        title: document.title,
      }}
      versions={document.versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        source: v.source,
        fileName: v.fileName,
        createdAt: v.createdAt.toISOString(),
        hasText: !!v.extractedText,
      }))}
      currentVersion={{
        id: currentVersion.id,
        versionNumber: currentVersion.versionNumber,
        fileName: currentVersion.fileName,
        extractedText: currentVersion.extractedText ?? "",
        storageKey: currentVersion.storageKey,
      }}
      initialRedlines={redlines.map((r) => ({
        id: r.id,
        clauseId: r.clauseId,
        originalText: r.originalText,
        suggestedText: r.suggestedText,
        riskLevel: r.riskLevel,
        category: r.category,
        rationale: r.rationale,
        status: r.status,
        humanNote: r.humanNote,
        createdBy: r.createdBy,
      }))}
    />
  );
}
