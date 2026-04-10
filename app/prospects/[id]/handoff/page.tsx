import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/utils";
import type { CoderfullClientInput, HandoffEmail } from "@/lib/claude/schemas";
import { HandoffControls } from "./handoff-controls";

export const dynamic = "force-dynamic";

export default async function HandoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await db.prospect.findUnique({ where: { id } });
  const exp = await db.coderfullExport.findFirst({
    where: { prospectId: id },
    orderBy: { createdAt: "desc" },
  });

  const payload = exp
    ? safeJsonParse<CoderfullClientInput | null>(exp.payload, null)
    : null;
  const email = exp
    ? safeJsonParse<HandoffEmail | null>(exp.draftEmail, null)
    : null;

  return (
    <div className="stack-6">
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
          Phase 4 — Coderfull handoff
        </h2>
        <p className="sec-sub" style={{ marginTop: 4 }}>
          Once the client has signed, generate a Coderfull payload and a
          notification email for the Accounts team. Sending pushes the client
          into Coderfull (mock implementation writes to{" "}
          <code className="num" style={{ fontSize: 12, background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>
            ./uploads/coderfull-outbox/
          </code>
          ).
        </p>
      </div>

      <HandoffControls
        id={id}
        canSend={
          prospect?.status === "SIGNED" || prospect?.status === "HANDED_OFF"
        }
        export={
          exp
            ? {
                id: exp.id,
                status: exp.status,
                externalId: exp.externalId,
                error: exp.error,
                payload,
                email,
              }
            : null
        }
      />
    </div>
  );
}
